// matches.js

import React, { useState, useEffect } from 'react';
import { Container, Box } from '@mui/material';
import MatchList from './MatchList';
import { findPotentialMatches } from '../../services/matchingService';

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load matches when component mounts
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      // Get matches for the current user's items
      const potentialMatches = await findPotentialMatches();
      setMatches(potentialMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmMatch = async (matchId) => {
    // Handle match confirmation
    console.log('Confirming match:', matchId);
  };

  const handleRejectMatch = async (matchId) => {
    // Handle match rejection
    console.log('Rejecting match:', matchId);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        {loading ? (
          <div>Loading matches...</div>
        ) : (
          <MatchList 
            matches={matches}
            onConfirmMatch={handleConfirmMatch}
            onRejectMatch={handleRejectMatch}
          />
        )}
      </Box>
    </Container>
  );
}

export default Matches;