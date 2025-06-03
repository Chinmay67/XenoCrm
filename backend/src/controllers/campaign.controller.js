// controllers/campaignController.js
import mongoose from 'mongoose';
import { Customer,Campaign , Segment,SegmentRule  , CommunicationLog} from '../models/index.js';
import { connectRabbitMQ } from '../config/rabbitMQ.js';
import { buildMongoQuery } from './audience.controller.js';

// Helper to simulate message sending
const sendMessageToVendor = async () => {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 100));
  // 90% chance success, 10% fail
  const isSuccess = Math.random() < 0.9;
  return {
    success: isSuccess,
    failureReason: isSuccess ? null : 'Simulated vendor failure',
  };
};


export const simulateCampaignDelivery = async (campaign, messageTemplate, rules) => {
  try {
    // Build Mongo query filter from rules
    const mongoFilter = buildMongoQuery(rules);

    // Fetch matching customers (_id and name only)
    const matchingCustomers = await Customer.find(mongoFilter, { _id: 1, name: 1 });

    console.log(`Audience size for campaign ${campaign._id}:`, matchingCustomers.length);

    // Batch insert communication logs
    const batchSize = 50;
    let logsToInsert = [];

    for (let i = 0; i < matchingCustomers.length; i++) {
      const customer = matchingCustomers[i];

      logsToInsert.push({
        campaign_id: campaign._id,
        customer_id: customer._id,
        message_sent: personalizeMessage(messageTemplate, customer),
        delivery_status: 'PENDING',
        sent_at: new Date(),
      });

      if (logsToInsert.length === batchSize || i === matchingCustomers.length - 1) {
        await CommunicationLog.insertMany(logsToInsert);
        logsToInsert = [];
      }
    }

    // Connect to RabbitMQ channel
    const channel = await connectRabbitMQ();

    // Iterate communication logs and publish delivery receipt messages to RabbitMQ
    const logsCursor = CommunicationLog.find({ campaign_id: campaign._id }).cursor();

    for await (const log of logsCursor) {
      const vendorResult = await sendMessageToVendor();

      const receiptMessage = {
        communicationLogId: log._id.toString(),
        success: vendorResult.success,
        failureReason: vendorResult.failureReason,
      };

      channel.sendToQueue(
        'delivery_receipts',
        Buffer.from(JSON.stringify(receiptMessage)),
        { persistent: true }
      );
    }

    // Update campaign status to completed after queueing all messages
    await Campaign.findByIdAndUpdate(campaign._id, { status: 'completed' });

  } catch (error) {
    console.error('Error in campaign delivery with RabbitMQ:', error);
  }
};


// Simple message personalization helper
const personalizeMessage = (template, customer) => {
  return template.replace(/\{\{name\}\}/g, customer.name || 'Customer');
};
// Create a new campaign
export const createCampaign = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, message, rules } = req.body;

    // Validate required fields
    if (!name || !message || !rules || !Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: 'Name, message, and rules are required'
      });
    }

    // Create segment for this campaign
    const segment = new Segment({
      name: `${name} - Segment`,
      description: `Auto-generated segment for campaign: ${name}`,
      created_by: req.user?.id // Assuming you have user authentication
    });

    const savedSegment = await segment.save({ session });

    // Create segment rules
    const segmentRules = [];
    
    rules.forEach((ruleGroup, groupIndex) => {
      if (ruleGroup.conditions && Array.isArray(ruleGroup.conditions)) {
        ruleGroup.conditions.forEach((condition, conditionIndex) => {
          const segmentRule = new SegmentRule({
            segment_id: savedSegment._id,
            field: condition.field,
            operator: condition.operator,
            value: condition.value,
            logical_group: groupIndex + 1, // Groups start from 1
            logical_op: condition.logic || 'AND'
          });
          segmentRules.push(segmentRule);
        });
      }
    });

    // Save all segment rules
    await SegmentRule.insertMany(segmentRules, { session });

    // Create campaign
    const campaign = new Campaign({
      segment_id: savedSegment._id,
      name: name,
      message_template: message,
      status: 'pending'
    });

    const savedCampaign = await campaign.save({ session });

    await session.commitTransaction();
    try {
      await simulateCampaignDelivery(savedCampaign, message, rules);
    } catch (deliveryError) {
      console.error('Error in campaign delivery simulation:', deliveryError);
      // Campaign was created successfully, but delivery simulation failed
      // This is logged but doesn't affect the response since the campaign was created
    }
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: {
        campaign: savedCampaign,
        segment: savedSegment,
        rulesCount: segmentRules.length
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// Get all campaigns (name and message only)
export const getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .select('name message_template createdAt status _id') // Added status field
      .sort({ createdAt: -1 })
      .lean();

    if (campaigns.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        count: 0
      });
    }

    const campaignIds = campaigns.map(c => c._id);

    // Updated aggregation to count all messages but unique customers
    const deliveryStats = await CommunicationLog.aggregate([
      {
        $match: {
          campaign_id: { $in: campaignIds }
        }
      },
      {
        $facet: {
          // Count all messages (sent/failed)
          messageStats: [
            {
              $group: {
                _id: '$campaign_id',
                sent: {
                  $sum: {
                    $cond: [{ $eq: ['$delivery_status', 'SENT'] }, 1, 0]
                  }
                },
                failed: {
                  $sum: {
                    $cond: [{ $eq: ['$delivery_status', 'FAILED'] }, 1, 0]
                  }
                }
              }
            }
          ],
          // Count unique customers
          uniqueCustomers: [
            {
              $group: {
                _id: {
                  campaign_id: '$campaign_id',
                  customer_id: '$customer_id'
                }
              }
            },
            {
              $group: {
                _id: '$_id.campaign_id',
                audienceSize: { $sum: 1 }
              }
            }
          ]
        }
      },
      {
        // Combine message stats and unique customers
        $project: {
          combined: {
            $map: {
              input: '$messageStats',
              as: 'stat',
              in: {
                _id: '$$stat._id',
                sent: '$$stat.sent',
                failed: '$$stat.failed',
                audienceSize: {
                  $let: {
                    vars: {
                      audienceStat: {
                        $first: {
                          $filter: {
                            input: '$uniqueCustomers',
                            as: 'a',
                            cond: { $eq: ['$$a._id', '$$stat._id'] }
                          }
                        }
                      }
                    },
                    in: { $ifNull: ['$$audienceStat.audienceSize', 0] }
                  }
                }
              }
            }
          }
        }
      },
      { $unwind: '$combined' },
      { $replaceRoot: { newRoot: '$combined' } }
    ]);

    // Create a map for quick lookup of stats by campaign ID
    const statsMap = new Map();
    deliveryStats.forEach(stat => {
      statsMap.set(stat._id.toString(), {
        sent: stat.sent,
        failed: stat.failed,
        audienceSize: stat.audienceSize
      });
    });

    // Merge delivery stats into campaigns
    const transformedCampaigns = campaigns.map(campaign => {
      const stats = statsMap.get(campaign._id.toString()) || { sent: 0, failed: 0, audienceSize: 0 };
      return {
        _id: campaign._id,
        name: campaign.name,
        message: campaign.message_template,
        status: campaign.status, // Added status field
        createdAt: campaign.createdAt,
        deliveryStats: stats
      };
    });

    res.status(200).json({
      success: true,
      data: transformedCampaigns,
      count: transformedCampaigns.length
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns',
      error: error.message
    });
  }
};


// Get campaign by ID with transformed rules
export const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;

    const campaign = await Campaign.findById(id).populate('segment_id');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Get segment rules for this campaign
    const segmentRules = await SegmentRule.find({
      segment_id: campaign.segment_id._id
    }).sort({ logical_group: 1 });

    // Transform rules to frontend format
    const rulesMap = new Map();
    
    segmentRules.forEach(rule => {
      const groupKey = rule.logical_group;
      if (!rulesMap.has(groupKey)) {
        rulesMap.set(groupKey, []);
      }
      
      rulesMap.get(groupKey).push({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        logic: rule.logical_op
      });
    });

    // Convert map to array format
    const rules = Array.from(rulesMap.values()).map(conditions => ({
      conditions
    }));

    const transformedCampaign = {
      name: campaign.name,
      message: campaign.message_template,
      rules: rules,
      createdAt: campaign.createdAt,
      status: campaign.status,
      _id: campaign._id,
      segment_id: campaign.segment_id._id
    };

    res.status(200).json({
      success: true,
      data: transformedCampaign
    });

  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message
    });
  }
};

// Update campaign status
export const updateCampaignStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'running', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, running, or completed'
      });
    }

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Campaign status updated successfully',
      data: campaign
    });

  } catch (error) {
    console.error('Error updating campaign status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign status',
      error: error.message
    });
  }
};


export const updateCampaign = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { name, message, rules } = req.body;

    // Validate required fields
    if (!name || !message || !rules || !Array.isArray(rules)) {
      return res.status(400).json({
        success: false,
        message: 'Name, message, and rules are required'
      });
    }

    // Find existing campaign
    const existingCampaign = await Campaign.findById(id).populate('segment_id');
    if (!existingCampaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Update campaign basic info
    existingCampaign.name = name;
    existingCampaign.message_template = message;
    await existingCampaign.save({ session });

    // Update segment name
    existingCampaign.segment_id.name = `${name} - Segment`;
    existingCampaign.segment_id.description = `Auto-generated segment for campaign: ${name}`;
    await existingCampaign.segment_id.save({ session });

    // Delete existing segment rules
    await SegmentRule.deleteMany({
      segment_id: existingCampaign.segment_id._id
    }, { session });

    // Create new segment rules
    const segmentRules = [];
    
    rules.forEach((ruleGroup, groupIndex) => {
      if (ruleGroup.conditions && Array.isArray(ruleGroup.conditions)) {
        ruleGroup.conditions.forEach((condition, conditionIndex) => {
          const segmentRule = new SegmentRule({
            segment_id: existingCampaign.segment_id._id,
            field: condition.field,
            operator: condition.operator,
            value: condition.value,
            logical_group: groupIndex + 1,
            logical_op: condition.logic || 'AND'
          });
          segmentRules.push(segmentRule);
        });
      }
    });

    // Save all new segment rules
    await SegmentRule.insertMany(segmentRules, { session });

    await session.commitTransaction();

     try {
      await simulateCampaignDelivery(existingCampaign, message, rules);
    } catch (deliveryError) {
      console.error('Error in campaign delivery simulation:', deliveryError);
      // Campaign was created successfully, but delivery simulation failed
      // This is logged but doesn't affect the response since the campaign was created
    }

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: {
        campaign: existingCampaign,
        rulesCount: segmentRules.length
      }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating campaign:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};