// reportitem.js

import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';

function ReportItem() {
  const [lostOrFound, setLostOrFound] = useState('Lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const navigate = useNavigate();

  // Function to generate the example description based on lostOrFound
  const getExampleDescription = () => {
    if (lostOrFound === 'Lost') {
      return `Example:
I lost a black leather wallet with a silver buckle. It has my initials "J.D." engraved on the inside. The wallet contains several credit cards and my driver's license. It was in good condition with no scratches.`;
    } else {
      return `Example:
I found a set of car keys with a Toyota key fob attached. They were lying on a bench near the entrance of Central Park. The keychain also has a small Eiffel Tower souvenir. The keys are slightly worn but functional.`;
    }
  };

  useEffect(() => {
    // Clear the description when lostOrFound changes to update the placeholder
    setDescription('');
  }, [lostOrFound]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted'); // Add this line

    try {
      console.log('Adding item to Firestore'); // Add this line
      const docRef = await addDoc(collection(db, 'items'), {
        lostOrFound,
        title,
        description,
        location,
        date,
        time,
        userId: auth.currentUser.uid, // Add this line to use auth
        createdAt: Timestamp.now(),
      });
      console.log('Item added with ID: ', docRef.id); // Add this line

      alert('Item reported successfully!');

      console.log('Attempting to navigate to /feed'); // Add this line
      navigate('/feed');
      console.log('Navigation function called'); // Add this line
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error reporting item. Please try again.');
    }
  };

  return (
    <Container className="mt-5">
      <h2>Report Lost or Found Item</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formLostOrFound">
          <Form.Label>Have you lost or found an item?</Form.Label>
          <Form.Control
            as="select"
            value={lostOrFound}
            onChange={(e) => setLostOrFound(e.target.value)}
          >
            <option>Lost</option>
            <option>Found</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="formTitle" className="mt-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Provide a brief title without full item details to prevent false claims"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Form.Text className="text-muted">
            Do not include complete item details here.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formDescription" className="mt-3">
          <Form.Label>Item Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={5}
            placeholder={getExampleDescription()}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <Form.Text className="text-muted">
            Please provide a detailed description of the item.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formLocation" className="mt-3">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            placeholder="Where was the item lost or found?"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formDate" className="mt-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="formTime" className="mt-3">
          <Form.Label>Time</Form.Label>
          <Form.Control
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="mt-3">
          Submit
        </Button>
      </Form>
    </Container>
  );
}

export default ReportItem;
