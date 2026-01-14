import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { rfpApi, vendorApi } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();

  const { data: rfps, isLoading: rfpsLoading } = useQuery({
    queryKey: ['rfps'],
    queryFn: async () => {
      const response = await rfpApi.getAll();
      return response.data;
    },
  });

  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await vendorApi.getAll();
      return response.data;
    },
  });

  const stats = [
    {
      title: 'Total RFPs',
      value: rfps?.length || 0,
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: () => navigate('/rfps'),
    },
    {
      title: 'Active RFPs',
      value: rfps?.filter((r) => r.status === 'sent').length || 0,
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      action: () => navigate('/rfps'),
    },
    {
      title: 'Vendors',
      value: vendors?.length || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => navigate('/vendors'),
    },
    {
      title: 'Draft RFPs',
      value: rfps?.filter((r) => r.status === 'draft').length || 0,
      icon: <DescriptionIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      action: () => navigate('/rfps'),
    },
  ];

  if (rfpsLoading || vendorsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your AI-powered RFP Management System
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ color: stat.color, fontWeight: 700 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/rfps/create')}
                  size="large"
                  fullWidth
                >
                  Create New RFP
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/vendors')}
                  size="large"
                  fullWidth
                >
                  Manage Vendors
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent RFPs
              </Typography>
              {rfps && rfps.length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {rfps.slice(0, 5).map((rfp) => (
                    <Box
                      key={rfp.id}
                      sx={{
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/rfps/${rfp.id}`)}
                    >
                      <Typography variant="subtitle2">{rfp.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {rfp.status} • Budget: ${rfp.budget}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No RFPs yet. Create your first RFP to get started!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
