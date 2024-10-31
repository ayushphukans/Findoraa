import React, { useState, useEffect } from 'react';
import { Box, Alert } from '@mui/material';
import MatchList from '../matches/MatchList';
import { runMatchingService } from '../../services/matchingService';

const ItemDetails = ({ item }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const potentialMatches = await runMatchingService(item);
        setMatches(potentialMatches);
      } catch (err) {
        setError('Failed to find matches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (item) {
      fetchMatches();
    }
  }, [item]);

  const handleConfirmMatch = async (matchId) => {
    try {
      // TODO: Implement match confirmation logic
      console.log('Confirming match:', matchId);
    } catch (error) {
      console.error('Error confirming match:', error);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      // TODO: Implement match rejection logic
      console.log('Rejecting match:', matchId);
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  if (loading) {
    return <Box>Loading potential matches...</Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <MatchList
      matches={matches}
      onConfirmMatch={handleConfirmMatch}
      onRejectMatch={handleRejectMatch}
    />
  );
};

export default ItemDetails; 