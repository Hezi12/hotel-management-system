import { useState } from 'react';
import { Container, Typography, Button, TextField, Box, Paper, Grid } from '@mui/material';
import { testApiEndpoint } from '../lib/api';

export default function TestApi() {
  const [endpoint, setEndpoint] = useState('/api/test-login');
  const [method, setMethod] = useState('POST');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const predefinedEndpoints = [
    '/api/test-login',
    '/api/login',
    '/api/create-admin'
  ];

  const handleTest = async () => {
    setLoading(true);
    try {
      const data = await testApiEndpoint(endpoint);
      setResult(data);
    } catch (error) {
      setResult({
        error: true,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, direction: 'rtl' }}>
      <Typography variant="h4" gutterBottom align="center">
        בדיקת נקודות קצה API
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="endpoint"
            label="נתיב נקודת קצה"
            name="endpoint"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          />
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              נקודות קצה מוגדרות מראש:
            </Typography>
            <Grid container spacing={1}>
              {predefinedEndpoints.map((ep) => (
                <Grid item key={ep}>
                  <Button 
                    variant={endpoint === ep ? "contained" : "outlined"}
                    onClick={() => setEndpoint(ep)}
                    size="small"
                  >
                    {ep}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Button
            fullWidth
            variant="contained"
            onClick={handleTest}
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'בודק...' : 'בדוק נקודת קצה'}
          </Button>
        </Box>
      </Paper>
      
      {result && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            תוצאת בדיקה:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 1,
              overflow: 'auto',
              direction: 'ltr'
            }}
          >
            {JSON.stringify(result, null, 2)}
          </Box>
        </Paper>
      )}
    </Container>
  );
} 