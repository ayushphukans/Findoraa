// Login.js

import React, { useState } from "react";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      let email = usernameOrEmail;

      // Check if input is a username
      if (!usernameOrEmail.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", usernameOrEmail));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError("No user found with this username.");
          return;
        }

        email = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in successfully");
      navigate("/feed");
    } catch (error) {
      console.error("Error during login:", error);
      setError(error.message);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
          <Form.Label>Username or Email</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Enter username or email" 
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
      <p className="mt-3">
        Don't have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </Container>
  );
}

export default Login;
