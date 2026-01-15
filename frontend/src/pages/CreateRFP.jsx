import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Stack,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Send as SendIcon, AutoAwesome as AIIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { rfpApi } from '../services/api';

export default function CreateRFP() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [parsedRFP, setParsedRFP] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedRFP, setEditedRFP] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => rfpApi.create(data),
    onSuccess: (response) => {
      setParsedRFP(response.data.rfp);
      setEditedRFP(response.data.rfp);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => rfpApi.update(id, data),
    onSuccess: (response) => {
      setParsedRFP(response.data.rfp);
      setEditedRFP(response.data.rfp);
      setEditMode(false);
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    createMutation.mutate({ naturalLanguageInput: input });
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditedRFP({ ...parsedRFP });
    setEditMode(false);
  };

  const handleUpdateRFP = () => {
    if (!editedRFP) return;
    updateMutation.mutate({ id: parsedRFP.id, data: editedRFP });
  };

  const handleFieldChange = (field, value) => {
    setEditedRFP(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const items = typeof editedRFP.items === 'string' 
      ? JSON.parse(editedRFP.items) 
      : editedRFP.items;
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditedRFP(prev => ({ ...prev, items: updatedItems }));
  };

  const handleSaveAndContinue = () => {
    navigate(`/rfps/${parsedRFP.id}`);
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Create New RFP
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Describe your procurement needs in natural language, and AI will create a structured RFP
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <AIIcon color="primary" />
              <Typography variant="h6">Describe Your Requirements</Typography>
            </Box>
            
            <TextField
              fullWidth
              multiline
              rows={12}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
              disabled={createMutation.isPending}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              size="large"
              startIcon={createMutation.isPending ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={!input.trim() || createMutation.isPending}
              fullWidth
            >
              {createMutation.isPending ? 'Processing with AI...' : 'Generate RFP'}
            </Button>

            {createMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Failed to create RFP. Please try again.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          {parsedRFP ? (
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" color="success.main">
                    ✓ RFP Created Successfully!
                  </Typography>
                  {!editMode && (
                    <IconButton onClick={handleEdit} color="primary" size="small">
                      <EditIcon />
                    </IconButton>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />

                {updateMutation.isError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Failed to update RFP. Please try again.
                  </Alert>
                )}
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Title</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedRFP.title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                    />
                  ) : (
                    <Typography variant="body1" fontWeight={600}>{parsedRFP.title}</Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Description</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                      value={editedRFP.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                    />
                  ) : (
                    <Typography variant="body2">{parsedRFP.description}</Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Budget</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editedRFP.budget}
                      onChange={(e) => handleFieldChange('budget', e.target.value)}
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                      }}
                    />
                  ) : (
                    <Typography variant="body1">${parsedRFP.budget}</Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Items</Typography>
                  {editMode ? (
                    (typeof editedRFP.items === 'string' ? JSON.parse(editedRFP.items) : editedRFP.items).map((item, idx) => (
                      <Box key={idx} sx={{ ml: 2, mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Item Name"
                          value={item.name}
                          onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          sx={{ mb: 1 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Specifications"
                          multiline
                          rows={2}
                          value={item.specifications}
                          onChange={(e) => handleItemChange(idx, 'specifications', e.target.value)}
                        />
                      </Box>
                    ))
                  ) : (
                    (typeof parsedRFP.items === 'string' ? JSON.parse(parsedRFP.items) : parsedRFP.items).map((item, idx) => (
                      <Box key={idx} sx={{ ml: 2, mb: 1 }}>
                        <Typography variant="body2">
                          • {item.name} (Qty: {item.quantity})
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.specifications}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Delivery Deadline</Typography>
                  {editMode ? (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        value={editedRFP.delivery_deadline ? dayjs(editedRFP.delivery_deadline) : null}
                        onChange={(newValue) => handleFieldChange('delivery_deadline', newValue ? newValue.format('YYYY-MM-DD') : '')}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                          }
                        }}
                      />
                    </LocalizationProvider>
                  ) : (
                    <Typography variant="body2">{parsedRFP.delivery_deadline || 'Not specified'}</Typography>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Payment Terms</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedRFP.payment_terms || ''}
                      onChange={(e) => handleFieldChange('payment_terms', e.target.value)}
                    />
                  ) : (
                    <Typography variant="body2">{parsedRFP.payment_terms || 'Not specified'}</Typography>
                  )}
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Warranty</Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedRFP.warranty_period || ''}
                      onChange={(e) => handleFieldChange('warranty_period', e.target.value)}
                    />
                  ) : (
                    <Typography variant="body2">{parsedRFP.warranty_period || 'Not specified'}</Typography>
                  )}
                </Box>

                {editMode ? (
                  <Stack spacing={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={updateMutation.isPending ? <CircularProgress size={20} /> : <SaveIcon />}
                      onClick={handleUpdateRFP}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? 'Updating...' : 'Update RFP'}
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleCancelEdit}
                      disabled={updateMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSaveAndContinue}
                  >
                    Continue to RFP Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
              <AIIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Your AI-generated RFP will appear here
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}
