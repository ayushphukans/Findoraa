// Home.js

import React from "react";
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import NavBar from './NavBar';

function Home() {
  return (
    <>
      <NavBar />
      <Container className="mt-5 text-center">
        <h1>Welcome to Lost and Found</h1>
        <p>Help reunite lost items with their owners or find your lost belongings.</p>
        <div className="mt-4">
          <Link to="/login">
            <Button variant="primary" className="me-3">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline-primary">Sign Up</Button>
          </Link>
        </div>
      </Container>
    </>
  );
}

export default Home;
