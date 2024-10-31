import React from 'react';
import { Box, Typography, Card, CardContent, Stack, Chip, Button } from '@mui/material';
import { CheckCircle, Cancel, CompareArrows } from '@mui/icons-material';

const MatchList = ({ matches, onConfirmMatch, onRejectMatch }) => {
  if (!matches || matches.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No potential matches found</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Potential Matches
      </Typography>

      {matches.map((match, index) => (
        <MatchCard 
          key={match.itemId} 
          match={match} 
          index={index} 
          onConfirm={() => onConfirmMatch(match.itemId)}
          onReject={() => onRejectMatch(match.itemId)}
        />
      ))}
    </Stack>
  );
};

const MatchCard = ({ match, index, onConfirm, onReject }) => {
  const {
    itemData,
    similarityScore,
    matchingAttributes,
    differences,
    confidence,
    justification
  } = match;

  return (
    <Card elevation={3}>
      <CardContent>
        <Stack spacing={2}>
          {/* Match Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Match #{index + 1}
            </Typography>
            <Chip 
              label={`${similarityScore}% Match`}
              color={similarityScore > 80 ? 'success' : similarityScore > 60 ? 'warning' : 'default'}
            />
          </Box>

          {/* Item Details Comparison */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <CompareArrows sx={{ alignSelf: 'center' }} />
            <Stack spacing={1} flex={1}>
              {/* Display matching attributes */}
              <Box>
                <Typography variant="subtitle2" color="success.main">
                  Matching Attributes:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {matchingAttributes.map((attr, i) => (
                    <Chip 
                      key={i} 
                      label={attr} 
                      size="small" 
                      color="success"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              {/* Display differences */}
              <Box>
                <Typography variant="subtitle2" color="error.main">
                  Differences:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {differences.map((diff, i) => (
                    <Chip 
                      key={i} 
                      label={diff} 
                      size="small" 
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Box>

              {/* Justification */}
              <Box>
                <Typography variant="subtitle2">
                  Why this might be a match:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {justification}
                </Typography>
              </Box>

              {/* Item Details */}
              <Box>
                <Typography variant="subtitle2">
                  Item Details:
                </Typography>
                <Typography variant="body2">
                  {itemData.itemType} - {itemData.brandModel}
                  {itemData.color && ` - ${itemData.color}`}
                  {itemData.uniqueIdentifiers && ` (${itemData.uniqueIdentifiers})`}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={onReject}
            >
              Not a Match
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={onConfirm}
            >
              Confirm Match
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MatchList; 