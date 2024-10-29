// Login.js

import React, { useState } from "react";
import { auth, db } from '../../config/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import NavBar from '../layout/NavBar';
import darkTheme from '../../config/theme';
import { collection, query, where, getDocs } from "firebase/firestore";

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      let email = emailOrUsername;
      
      // Check if input is a username
      if (!emailOrUsername.includes('@')) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", emailOrUsername));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error("No user found with this username.");
        }
        
        email = querySnapshot.docs[0].data().email;
      }
      
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/feed');
    } catch (error) {
      setError('Failed to log in. Please check your credentials.');
      console.error(error);
    }
  };

  return (
    <div style={{ backgroundColor: darkTheme.colors.background, minHeight: '100vh' }}>
      <NavBar />
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Card style={{ backgroundColor: darkTheme.colors.surface }}>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4" style={{ color: darkTheme.text.primary }}>Log In</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group id="emailOrUsername" className="mb-3">
                  <Form.Label style={{ color: darkTheme.text.primary }}>Email or Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    required 
                    value={emailOrUsername} 
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    style={{
                      backgroundColor: darkTheme.colors.background,
                      color: darkTheme.text.primary,
                      border: `1px solid ${darkTheme.colors.primary}40`
                    }}
                  />
                </Form.Group>
                <Form.Group id="password" className="mb-4">
                  <Form.Label style={{ color: darkTheme.text.primary }}>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      backgroundColor: darkTheme.colors.background,
                      color: darkTheme.text.primary,
                      border: `1px solid ${darkTheme.colors.primary}40`
                    }}
                  />
                </Form.Group>
                <Button className="w-100 mb-3" type="submit" style={{
                  backgroundColor: darkTheme.colors.primary,
                  borderColor: darkTheme.colors.primary
                }}>
                  Log In
                </Button>
              </Form>
              <div className="text-center mt-3" style={{ color: darkTheme.text.secondary }}>
                Need an account? <Link to="/signup" style={{ color: darkTheme.colors.primary }}>Sign Up</Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default Login;
