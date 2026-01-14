import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  AutoAwesome as AIIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { proposalApi, rfpApi } from '../services/api';

export default function ProposalComparison() {
  const { id } = useParams();

  const { data: rfp } = useQuery({
    queryKey: ['rfp', id],
    queryFn: async () => {
      const response = await rfpApi.getById(id);
      return response.data;
    },
  });

  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ['comparison', id],
    queryFn: async () => {
      const response = await proposalApi.compare(id);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!comparisonData) {
    return (
      <Container>
        <Alert severity="info">No proposals found for this RFP</Alert>
      </Container>
    );
  }

  const { proposals, comparison } = comparisonData;
  const recommendation = comparison?.recommendation;
  const scores = comparison?.proposal_scores || [];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Proposal Comparison
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {rfp?.title}
      </Typography>

      {recommendation && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.50', border: '2px solid', borderColor: 'success.main' }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <AIIcon color="success" />
            <Typography variant="h6" color="success.main">
              AI Recommendation
            </Typography>
          </Box>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {recommendation.recommended_vendor_name}
          </Typography>
          <Typography variant="body1">{recommendation.reasoning}</Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {proposals && proposals.map((proposal) => {
          const proposalScore = scores.find(s => s.proposal_id === proposal.id);
          const isRecommended = recommendation?.recommended_vendor_id === proposal.vendor_id;

          return (
            <Grid item xs={12} md={6} key={proposal.id}>
              <Card
                sx={{
                  height: '100%',
                  border: isRecommended ? '2px solid' : '1px solid',
                  borderColor: isRecommended ? 'success.main' : 'divider',
                  position: 'relative',
                }}
              >
                {isRecommended && (
                  <Chip
                    label="Recommended"
                    color="success"
                    icon={<CheckIcon />}
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {proposal.vendor_name}
                  </Typography>

                  {proposalScore && (
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={`AI Score: ${proposalScore.score}/10`}
                        color={proposalScore.score >= 8 ? 'success' : proposalScore.score >= 6 ? 'primary' : 'warning'}
                        size="small"
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <MoneyIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Total Price</Typography>
                  </Box>
                  <Typography variant="h5" color="primary.main" gutterBottom>
                    ${proposal.total_price?.toLocaleString() || 'N/A'}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={1} mt={2}>
                    <ScheduleIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">Delivery Timeline</Typography>
                  </Box>
                  <Typography variant="body1" gutterBottom>
                    {proposal.delivery_timeline || 'N/A'}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Payment Terms</Typography>
                    <Typography variant="body2">{proposal.payment_terms || 'N/A'}</Typography>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">Warranty</Typography>
                    <Typography variant="body2">{proposal.warranty_period || 'N/A'}</Typography>
                  </Box>

                  {proposalScore && (
                    <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>AI Analysis</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proposalScore.summary}
                      </Typography>
                    </Box>
                  )}

                  {proposal.additional_terms && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">Additional Terms</Typography>
                      <Typography variant="body2">{proposal.additional_terms}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {(!proposals || proposals.length === 0) && (
        <Alert severity="info">
          No proposals have been received yet. Send the RFP to vendors and wait for responses.
        </Alert>
      )}
    </Container>
  );
}
