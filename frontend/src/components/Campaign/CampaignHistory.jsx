import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import api from '../../utils/api';

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/campaigns');
      setCampaigns(response.data.campaigns || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateDeliveryRate = (sent, failed) => {
    const total = sent + failed;
    return total > 0 ? ((sent / total) * 100).toFixed(1) : '0';
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Campaign History
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              startIcon={<RefreshIcon />}
              onClick={fetchCampaigns}
              variant="outlined"
            >
              Refresh
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={() => navigate('/')}
              variant="contained"
            >
              New Campaign
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {campaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No campaigns found
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Create your first campaign to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/')}
            >
              Create Campaign
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Campaign Name</strong></TableCell>
                  <TableCell><strong>Created Date</strong></TableCell>
                  <TableCell><strong>Audience Size</strong></TableCell>
                  <TableCell><strong>Sent</strong></TableCell>
                  <TableCell><strong>Failed</strong></TableCell>
                  <TableCell><strong>Delivery Rate</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign._id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {campaign.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {campaign.message?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {formatDate(campaign.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {campaign.audienceSize?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {campaign.stats?.sent || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {campaign.stats?.failed || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {calculateDeliveryRate(campaign.stats?.sent || 0, campaign.stats?.failed || 0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status || 'Pending'}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default CampaignHistory;