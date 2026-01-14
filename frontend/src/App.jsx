import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import RFPList from './pages/RFPList';
import RFPDetail from './pages/RFPDetail';
import VendorList from './pages/VendorList';
import ProposalComparison from './pages/ProposalComparison';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rfps" element={<RFPList />} />
              <Route path="/rfps/create" element={<CreateRFP />} />
              <Route path="/rfps/:id" element={<RFPDetail />} />
              <Route path="/rfps/:id/compare" element={<ProposalComparison />} />
              <Route path="/vendors" element={<VendorList />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
