// controllers/customerController.js
import { Customer } from "../models/index.js";
// Helper function to build MongoDB query from rules
export const buildMongoQuery = (rules) => {
  if (!rules || !Array.isArray(rules) || rules.length === 0) {
    return {};
  }

  // Each rule in the rules array is connected by OR
  const orConditions = rules.map(rule => {
    if (!rule.conditions || !Array.isArray(rule.conditions)) {
      return {};
    }

    // Within each rule, conditions are connected by AND
    const andConditions = rule.conditions.map(condition => {
      const { field, operator, value } = condition;
      
      // Convert value to appropriate type based on field
      let convertedValue = value;
      if (field === 'total_spend' || field === 'visits_count') {
        convertedValue = Number(value);
      } else if (field === 'last_active_at') {
        // Assuming the value is days ago, convert to date
        const daysAgo = Number(value);
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - daysAgo);
        convertedValue = dateThreshold;
      }

      // Build MongoDB condition based on operator
      switch (operator) {
        case '>':
          return { [field]: { $gt: convertedValue } };
        case '<':
          return { [field]: { $lt: convertedValue } };
        case '>=':
          return { [field]: { $gte: convertedValue } };
        case '<=':
          return { [field]: { $lte: convertedValue } };
        case '=':
        case '==':
          return { [field]: convertedValue };
        case '!=':
          return { [field]: { $ne: convertedValue } };
        default:
          return {};
      }
    }).filter(condition => Object.keys(condition).length > 0);

    // Return AND conditions for this rule
    return andConditions.length > 0 ? { $and: andConditions } : {};
  }).filter(condition => Object.keys(condition).length > 0);

  // Return OR of all rules
  return orConditions.length > 0 ? { $or: orConditions } : {};
};

export const getCustomerCount = async (req, res) => {
  try {
    const { rules } = req.body;

    if (!rules) {
      return res.status(400).json({
        success: false,
        message: 'Rules are required'
      });
    }

    // Build MongoDB query from rules
    const query = buildMongoQuery(rules);
    
    // Count customers matching the query
    const count = await Customer.countDocuments(query);

    return res.status(200).json({
      success: true,
      count,
      query: query // Include query for debugging (remove in production)
    });

  } catch (error) {
    console.error('Error counting customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Alternative version for GET request with query parameters
export const getCustomerCountByQuery = async (req, res) => {
  try {
    const rulesParam = req.query.rules;
    
    if (!rulesParam) {
      return res.status(400).json({
        success: false,
        message: 'Rules query parameter is required'
      });
    }

    let rules;
    try {
      rules = JSON.parse(rulesParam);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format for rules parameter'
      });
    }

    // Build MongoDB query from rules
    const query = buildMongoQuery(rules);
    
    // Count customers matching the query
    const count = await Customer.countDocuments(query);

    return res.status(200).json({
      success: true,
      count,
      query: query // Include query for debugging (remove in production)
    });

  } catch (error) {
    console.error('Error counting customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};