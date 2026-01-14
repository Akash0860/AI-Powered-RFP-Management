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
} from '@mui/material';
import { Send as SendIcon, AutoAwesome as AIIcon } from '@mui/icons-material';
import { rfpApi } from '../services/api';

export default function CreateRFP() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [parsedRFP, setParsedRFP] = useState(null);

  const createMutation = useMutation({
    mutationFn: (data) => rfpApi.create(data),
    onSuccess: (response) => {
      setParsedRFP(response.data.rfp);
    },
  });

  const handleSubmit = () => {
    if (!input.trim()) return;
    createMutation.mutate({ naturalLanguageInput: input });
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
                <Typography variant="h6" gutterBottom color="success.main">
                  ✓ RFP Created Successfully!
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Title</Typography>
                  <Typography variant="body1" fontWeight={600}>{parsedRFP.title}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{parsedRFP.description}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Budget</Typography>
                  <Typography variant="body1">${parsedRFP.budget}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Items</Typography>
                  {JSON.parse(parsedRFP.items).map((item, idx) => (
                    <Box key={idx} sx={{ ml: 2, mb: 1 }}>
                      <Typography variant="body2">
                        • {item.name} (Qty: {item.quantity})
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.specifications}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Delivery Deadline</Typography>
                  <Typography variant="body2">{parsedRFP.delivery_deadline || 'Not specified'}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Payment Terms</Typography>
                  <Typography variant="body2">{parsedRFP.payment_terms || 'Not specified'}</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Warranty</Typography>
                  <Typography variant="body2">{parsedRFP.warranty_period || 'Not specified'}</Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSaveAndContinue}
                >
                  Continue to RFP Details
                </Button>
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
