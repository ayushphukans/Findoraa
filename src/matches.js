// matches.js

import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';

function Matches() {
  const location = useLocation();
  const { matches } = location.state || { matches: 'No matches found.' };

  return (
    <Container className="mt-5">
      <h2>Potential Matches</h2>
      <p>{matches}</p>
    </Container>
  );
}

export default Matches;