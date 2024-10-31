import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Typography, Paper } from '@mui/material';

function MatchDetails() {
  const { matchId } = useParams();
  
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5">Match Details</Typography>
          {/* Add detailed match information here */}
        </Paper>
      </Box>
    </Container>
  );
}

export default MatchDetails; 