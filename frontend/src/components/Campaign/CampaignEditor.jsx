import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Stepper, 
  Step, 
  StepLabel,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import RuleBuilder from './RuleBuilder';
import AudiencePreview from './AudiencePreview';
import api from '../../utils/api';

const steps = ['Edit Audience', 'Campaign Details', 'Review & Update'];

const CampaignEditor = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [rules, setRules] = useState([{ conditions: [{ field: '', operator: '', value: '' }] }]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [originalCampaign, setOriginalCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Load campaign data
  useEffect(() => {
    const fetchCampaign = async () => {
      if (!campaignId) {
        setError('Campaign ID not provided');
        setInitialLoading(false);
        return;
      }

      try {
        const response = await api.get(`/api/campaigns/${campaignId}`);
        const campaign = response.data.data;
        
        setOriginalCampaign(campaign);
        setCampaignName(campaign.name || '');
        setCampaignMessage(campaign.message || '');
        setRules(campaign.rules || [{ conditions: [{ field: '', operator: '', value: '' }] }]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load campaign');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  // Check for changes
  useEffect(() => {
    if (!originalCampaign) return;

    const hasNameChanged = campaignName !== (originalCampaign.name || '');
    const hasMessageChanged = campaignMessage !== (originalCampaign.message || '');
    const hasRulesChanged = JSON.stringify(rules) !== JSON.stringify(originalCampaign.rules || []);

    setHasChanges(hasNameChanged || hasMessageChanged || hasRulesChanged);
  }, [campaignName, campaignMessage, rules, originalCampaign]);

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate rules
      const hasValidRules = rules.some(group => 
        group.conditions.some(c => c.field && c.operator && c.value)
      );
      if (!hasValidRules) {
        setError('Please define at least one valid rule');
        return;
      }
    } else if (activeStep === 1) {
      // Validate campaign details
      if (!campaignName.trim() || !campaignMessage.trim()) {
        setError('Please fill in all campaign details');
        return;
      }
    }
    
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSaveCampaign = async () => {
    setLoading(true);
    setError('');

    try {
      const campaignData = {
        name: campaignName,
        message: campaignMessage,
        rules: rules,
        updatedAt: new Date()
      };

      await api.put(`/api/campaigns/${campaignId}`, campaignData);
      
      // Redirect to campaign history
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHistory = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) return;
    }
    navigate('/history');
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <RuleBuilder rules={rules} onChange={setRules} />
            <Box sx={{ mt: 3 }}>
              <AudiencePreview rules={rules} />
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <TextField
              fullWidth
              label="Campaign Name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Campaign Message"
              value={campaignMessage}
              onChange={(e) => setCampaignMessage(e.target.value)}
              margin="normal"
              multiline
              rows={4}
              required
              placeholder="Hi {name}, here's 10% off on your next order!"
              helperText="Use {name} to personalize with customer name"
            />
          </Box>
        );
      case 2:
        return (
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Campaign Summary
            </Typography>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1">Name:</Typography>
              <Typography variant="body1" gutterBottom>{campaignName}</Typography>
              
              <Typography variant="subtitle1">Message:</Typography>
              <Typography variant="body1" gutterBottom>{campaignMessage}</Typography>
            </Paper>
            
            <AudiencePreview rules={rules} />

            {hasChanges && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You have made changes to this campaign. Click "Save Changes" to update the campaign.
              </Alert>
            )}
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !originalCampaign) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button onClick={() => navigate('/history')} variant="contained">
            Back to Campaign History
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBackToHistory} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Edit Campaign
            </Typography>
            {originalCampaign && (
              <Typography variant="subtitle1" color="textSecondary">
                {originalCampaign.name}
              </Typography>
            )}
          </Box>
          {hasChanges && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="warning.main">
                Unsaved changes
              </Typography>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                bgcolor: 'warning.main' 
              }} />
            </Box>
          )}
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          <Button
            onClick={handleBackToHistory}
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Cancel
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleSaveCampaign} 
              variant="contained"
              disabled={loading || !hasChanges}
              startIcon={<SaveIcon />}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          ) : (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CampaignEditor;