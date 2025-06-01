import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RuleBuilder from './RuleBuilder';
import AudiencePreview from './AudiencePreview';
import api from '../../utils/api';

const steps = ['Define Audience', 'Campaign Details', 'Review & Launch'];

const CampaignCreator = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [rules, setRules] = useState([{ conditions: [{ field: '', operator: '', value: '' }], logic: 'AND' }]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignMessage, setCampaignMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleLaunchCampaign = async () => {
    setLoading(true);
    setError('');

    try {
      const campaignData = {
        name: campaignName,
        message: campaignMessage,
        rules: rules,
        createdAt: new Date()
      };

      await api.post('/campaigns', campaignData);
      
      // Redirect to campaign history
      navigate('/history');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
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
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom textAlign="center">
          Create New Campaign
        </Typography>

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
          {activeStep === steps.length - 1 ? (
            <Button 
              onClick={handleLaunchCampaign} 
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Launching...' : 'Launch Campaign'}
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

export default CampaignCreator;
