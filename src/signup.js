// Signup.js

import React, { useState } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { doc, setDoc } from "firebase/firestore";
import NavBar from './NavBar';
import darkTheme from './theme';

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: email,
        username: username,
        profilePic: null,
      });

      await setDoc(doc(db, "usernames", username), {
        uid: user.uid
      });

      console.log("User created successfully");
      navigate('/profile');
    } catch (error) {
      console.error("Error during signup:", error);
      setError(error.message);
    }
  };

  return (
    <div style={{ backgroundColor: darkTheme.colors.background, minHeight: '100vh' }}>
      <NavBar />
      <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Card style={{ backgroundColor: darkTheme.colors.surface }}>
            <Card.Body className="p-4">
              <h2 className="text-center mb-4" style={{ color: darkTheme.text.primary }}>Sign Up</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleSignup}>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: darkTheme.text.primary }}>Email address</Form.Label>
                  <Form.Control 
                    type="email" 
                    placeholder="Enter email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      backgroundColor: darkTheme.colors.background,
                      color: darkTheme.text.primary,
                      border: `1px solid ${darkTheme.colors.primary}40`
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label style={{ color: darkTheme.text.primary }}>Username</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Choose a username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      backgroundColor: darkTheme.colors.background,
                      color: darkTheme.text.primary,
                      border: `1px solid ${darkTheme.colors.primary}40`
                    }}
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label style={{ color: darkTheme.text.primary }}>Password</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                  Sign Up
                </Button>
              </Form>
              <div className="text-center mt-3" style={{ color: darkTheme.text.secondary }}>
                Already have an account? <Link to="/login" style={{ color: darkTheme.colors.primary }}>Login here</Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
}

export default Signup;
