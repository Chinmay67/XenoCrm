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
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../utils/api';

const CampaignHistory = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/api/campaigns/history');
      setCampaigns(response.data.data || []);
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
      case 'draft':
        return 'warning';
      case 'paused':
        return 'default';
      default:
        return 'default';
    }
  };

  const calculateDeliveryRate = (sent, failed) => {
    const total = sent + failed;
    return total > 0 ? ((sent / total) * 100).toFixed(1) : '0';
  };

  const handleMenuOpen = (event, campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleEditCampaign = () => {
    if (selectedCampaign) {
      navigate(`/campaigns/edit/${selectedCampaign._id}`);
    }
    handleMenuClose();
  };

  const handleDuplicateCampaign = async () => {
    if (!selectedCampaign) return;
    
    setActionLoading(selectedCampaign._id);
    try {
      const duplicateData = {
        name: `${selectedCampaign.name} (Copy)`,
        message: selectedCampaign.message,
        rules: selectedCampaign.rules,
        status: 'draft'
      };

      await api.post('/campaigns/create', duplicateData);
      await fetchCampaigns(); // Refresh the list
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to duplicate campaign');
    } finally {
      setActionLoading(null);
    }
    handleMenuClose();
  };

  // const handleDeleteCampaign = async () => {
  //   if (!selectedCampaign) return;

  //   const confirmDelete = window.confirm(
  //     `Are you sure you want to delete "${selectedCampaign.name}"? This action cannot be undone.`
  //   );
    
  //   if (!confirmDelete) {
  //     handleMenuClose();
  //     return;
  //   }

  //   setActionLoading(selectedCampaign._id);
  //   try {
  //     await api.delete(`/campaigns/${selectedCampaign._id}`);
  //     await fetchCampaigns(); // Refresh the list
  //     setError('');
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to delete campaign');
  //   } finally {
  //     setActionLoading(null);
  //   }
  //   handleMenuClose();
  // };

  // const handleViewDetails = () => {
  //   if (selectedCampaign) {
  //     navigate(`/campaigns/view/${selectedCampaign._id}`);
  //   }
  //   handleMenuClose();
  // };

  // const canEdit = (campaign) => {
  //   // Allow editing for draft, failed, or completed campaigns
  //   const editableStatuses = ['draft', 'failed', 'completed', 'paused'];
  //   return editableStatuses.includes(campaign.status?.toLowerCase());
  // };

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
              disabled={loading}
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
                  <TableCell align="center"><strong>Actions</strong></TableCell>
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
                        {campaign.deliveryStats.audienceSize?.toLocaleString() || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main" fontWeight="bold">
                        {campaign.deliveryStats?.sent || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="error.main" fontWeight="bold">
                        {campaign.deliveryStats?.failed || 0}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {calculateDeliveryRate(campaign.deliveryStats?.sent || 0, campaign.deliveryStats?.failed || 0)}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status || 'Pending'}
                        color={getStatusColor(campaign.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        {campaign && (
                          <Tooltip title="Edit Campaign">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/campaigns/edit/${campaign._id}`)}
                              color="primary"
                              disabled={actionLoading === campaign._id}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        <Tooltip title="More Actions">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, campaign)}
                            disabled={actionLoading === campaign._id}
                          >
                            {actionLoading === campaign._id ? (
                              <CircularProgress size={16} />
                            ) : (
                              <MoreVertIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { minWidth: 180 }
          }}
        >
          {/* <MenuItem onClick={handleViewDetails}>
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem> */}
          
          {selectedCampaign && (
            <MenuItem onClick={handleEditCampaign}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit Campaign</ListItemText>
            </MenuItem>
          )}
          
          {/* <MenuItem onClick={handleDuplicateCampaign}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Duplicate</ListItemText>
          </MenuItem> */}
          
          {/* <MenuItem 
            onClick={handleDeleteCampaign}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem> */}
        </Menu>
      </Paper>
    </Container>
  );
};

export default CampaignHistory;