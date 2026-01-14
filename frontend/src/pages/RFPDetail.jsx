import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert,
} from '@mui/material';
import {
  Email as EmailIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { rfpApi, vendorApi, emailApi } from '../services/api';

export default function RFPDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);

  const { data: rfp, isLoading: rfpLoading } = useQuery({
    queryKey: ['rfp', id],
    queryFn: async () => {
      const response = await rfpApi.getById(id);
      return response.data;
    },
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await vendorApi.getAll();
      return response.data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: (data) => emailApi.sendRfp(data),
    onSuccess: () => {
      setSendDialogOpen(false);
      setSelectedVendors([]);
      alert('RFP sent successfully!');
    },
  });

  const fetchResponsesMutation = useMutation({
    mutationFn: (data) => emailApi.fetchResponses(data),
    onSuccess: (response) => {
      alert(`Fetched ${response.data.count} vendor responses!`);
    },
  });

  const handleSend = () => {
    if (selectedVendors.length === 0) return;
    sendMutation.mutate({
      rfpId: id,
      vendorIds: selectedVendors,
    });
  };

  const handleFetchResponses = () => {
    fetchResponsesMutation.mutate({ rfpId: id });
  };

  if (rfpLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!rfp) {
    return (
      <Container>
        <Alert severity="error">RFP not found</Alert>
      </Container>
    );
  }

  const items = typeof rfp.items === 'string' ? JSON.parse(rfp.items) : rfp.items;

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">{rfp.title}</Typography>
          <Chip label={rfp.status} color="primary" sx={{ mt: 1 }} />
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={() => setSendDialogOpen(true)}
          >
            Send to Vendors
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleFetchResponses}
            disabled={fetchResponsesMutation.isPending}
          >
            Fetch Responses
          </Button>
          <Button
            variant="outlined"
            startIcon={<AssessmentIcon />}
            onClick={() => navigate(`/rfps/${id}/compare`)}
          >
            Compare Proposals
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Description</Typography>
            <Typography variant="body1" paragraph>{rfp.description}</Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Items</Typography>
            {items && items.map((item, idx) => (
              <Box key={idx} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {item.name} (Quantity: {item.quantity})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.specifications}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Details</Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
              <Typography variant="body1" fontWeight={600}>
                ${rfp.budget?.toLocaleString() || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Delivery Deadline</Typography>
              <Typography variant="body1">{rfp.delivery_deadline || 'Not specified'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Payment Terms</Typography>
              <Typography variant="body1">{rfp.payment_terms || 'Not specified'}</Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Warranty</Typography>
              <Typography variant="body1">{rfp.warranty_period || 'Not specified'}</Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={sendDialogOpen} onClose={() => setSendDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send RFP to Vendors</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Vendors</InputLabel>
            <Select
              multiple
              value={selectedVendors}
              onChange={(e) => setSelectedVendors(e.target.value)}
              input={<OutlinedInput label="Select Vendors" />}
            >
              {vendors && vendors.map((vendor) => (
                <MenuItem key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={selectedVendors.length === 0 || sendMutation.isPending}
          >
            {sendMutation.isPending ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
