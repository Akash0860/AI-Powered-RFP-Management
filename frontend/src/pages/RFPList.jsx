import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { rfpApi } from '../services/api';
import { format } from 'date-fns';

export default function RFPList() {
  const navigate = useNavigate();

  const { data: rfps, isLoading } = useQuery({
    queryKey: ['rfps'],
    queryFn: async () => {
      const response = await rfpApi.getAll();
      return response.data;
    },
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'default',
      sent: 'primary',
      completed: 'success',
    };
    return colors[status] || 'default';
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">RFPs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/rfps/create')}
        >
          Create New RFP
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Budget</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Delivery Deadline</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rfps && rfps.length > 0 ? (
              rfps.map((rfp) => (
                <TableRow
                  key={rfp.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/rfps/${rfp.id}`)}
                >
                  <TableCell>{rfp.title}</TableCell>
                  <TableCell>${rfp.budget?.toLocaleString() || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip label={rfp.status} color={getStatusColor(rfp.status)} size="small" />
                  </TableCell>
                  <TableCell>{rfp.delivery_deadline || 'N/A'}</TableCell>
                  <TableCell>
                    {format(new Date(rfp.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary">No RFPs found. Create your first RFP!</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
