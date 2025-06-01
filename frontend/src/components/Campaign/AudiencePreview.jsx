import React, { useState, useEffect } from 'react';
import { Paper, Typography, Box, CircularProgress, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import api from '../../utils/api';

const AudiencePreview = ({ rules }) => {
  const [audienceSize, setAudienceSize] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const previewAudience = async () => {
      // Only preview if we have valid rules
      const hasValidRules = rules && rules.some(group => 
        group.conditions.some(c => c.field && c.operator && c.value)
      );

      if (!hasValidRules) {
        setAudienceSize(0);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.post('/campaigns/preview', { rules });
        setAudienceSize(response.data.audienceSize || 0);
      } catch (err) {
          setError('Failed to preview audience');
          console.error('Preview error:', err);
        setAudienceSize(0);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(previewAudience, 500);
    return () => clearTimeout(debounceTimer);
  }, [rules]);

  return (
    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.50' }}>
      <Typography variant="h6" gutterBottom>
        Audience Preview
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <PeopleIcon color="primary" />
        {loading ? (
          <CircularProgress size={20} />
        ) : error ? (
          <Chip label="Error loading preview" color="error" size="small" />
        ) : (
          <Typography variant="h4" color="primary">
            {audienceSize.toLocaleString()}
          </Typography>
        )}
      </Box>
      
      <Typography variant="body2" color="textSecondary">
        customers will receive this campaign
      </Typography>
    </Paper>
  );
};

export default AudiencePreview;