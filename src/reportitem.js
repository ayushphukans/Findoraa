// reportitem.js

import React, { useState } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import darkTheme from './theme';
import NavBar from './NavBar';  // Import NavBar component
import styled from 'styled-components';

const StyledFormControl = styled(Form.Control)`
  background-color: ${darkTheme.colors.surface} !important;
  color: ${darkTheme.text.primary} !important;
  border: 1px solid ${darkTheme.colors.primary}40 !important;

  &::placeholder {
    color: ${darkTheme.text.secondary} !important;
  }

  &:focus {
    background-color: ${darkTheme.colors.surface} !important;
    color: ${darkTheme.text.primary} !important;
    box-shadow: 0 0 0 0.2rem ${darkTheme.colors.primary}40 !important;
  }
`;

const StyledFormSelect = styled(Form.Select)`
  background-color: ${darkTheme.colors.surface} !important;
  color: ${darkTheme.text.primary} !important;
  border: 1px solid ${darkTheme.colors.primary}40 !important;

  &:focus {
    background-color: ${darkTheme.colors.surface} !important;
    color: ${darkTheme.text.primary} !important;
    box-shadow: 0 0 0 0.2rem ${darkTheme.colors.primary}40 !important;
  }
`;

const StyledLabel = styled(Form.Label)`
  color: ${darkTheme.text.primary};
  margin-bottom: 0.5rem;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 2px solid ${darkTheme.colors.primary}40;
  border-radius: 8px;
  background-color: ${darkTheme.colors.surface};
  color: ${darkTheme.text.primary};
  font-size: 16px;
  line-height: 1.5;
  resize: vertical;

  &::placeholder {
    color: ${darkTheme.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${darkTheme.colors.primary};
    box-shadow: 0 0 0 2px ${darkTheme.colors.primary}40;
  }
`;

function ReportItem() {
  const [lostOrFound, setLostOrFound] = useState('Lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState(new Date());

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'items'), {
        lostOrFound,
        title,
        description,
        location,
        date: dateTime.toISOString().split('T')[0],
        time: dateTime.toTimeString().split(' ')[0],
        userId: auth.currentUser.uid,
        createdAt: Timestamp.now(),
      });
      alert('Item reported successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error reporting item. Please try again.');
    }
  };

  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <Button
      onClick={onClick}
      ref={ref}
      variant="outline-light"
      style={{
        backgroundColor: darkTheme.colors.surface,
        color: darkTheme.text.primary,
        borderColor: `${darkTheme.colors.primary}40`,
        width: '100%',
        textAlign: 'left'
      }}
    >
      {value}
    </Button>
  ));

  const getDescriptionPlaceholder = () => {
    if (lostOrFound === 'Lost') {
      return "Example: I lost a blue North Face backpack with a small tear on the front pocket. Inside, there's a silver MacBook Air (with a sticker of a mountain on the cover), a black notebook, and some personal documents. The backpack is medium-sized and also has a keychain with a mini compass attached to the zipper. If found, please reach out as it contains important items.";
    } else {
      return "Example: I found a brown leather wallet with the initials 'R.T.' embossed on the front. Inside, there are several credit cards, a driver's license, and a couple of euros. It was found on a bus in Berlin around 3:00 PM. The wallet is in good condition but has a small scratch on the back. If this sounds like your wallet, please contact me and confirm some of the items inside.";
    }
  };

  return (
    <>
      <NavBar />
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card style={{ backgroundColor: darkTheme.colors.surface }}>
              <Card.Body className="p-4">
                <Card.Title style={{ color: darkTheme.text.primary, marginBottom: '1.5rem' }}>Report Lost or Found Item</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formLostOrFound" className="mb-4">
                    <StyledLabel>Have you lost or found an item?</StyledLabel>
                    <StyledFormSelect 
                      value={lostOrFound} 
                      onChange={(e) => setLostOrFound(e.target.value)}
                    >
                      <option value="Lost">Lost</option>
                      <option value="Found">Found</option>
                    </StyledFormSelect>
                  </Form.Group>

                  <Form.Group controlId="formTitle" className="mb-4">
                    <StyledLabel>Title</StyledLabel>
                    <StyledFormControl 
                      type="text" 
                      placeholder="Brief title (do not completely describe item here to avoid false claims)" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formDescription" className="mb-4">
                    <StyledLabel>Description</StyledLabel>
                    <StyledTextArea 
                      placeholder={getDescriptionPlaceholder()}
                      value={description} 
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group controlId="formLocation" className="mb-4">
                    <StyledLabel>
                      <FaMapMarkerAlt className="me-2" />
                      Location
                    </StyledLabel>
                    <StyledFormControl
                      type="text"
                      placeholder="Where was the item lost or found?"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group controlId="formDateTime" className="mb-4">
                    <StyledLabel style={{ marginBottom: '0.5rem', display: 'block' }}>
                      <FaCalendarAlt className="me-2" />
                      Date and Time
                    </StyledLabel>
                    <DatePicker
                      selected={dateTime}
                      onChange={(date) => setDateTime(date)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      customInput={<CustomInput />}
                      popperClassName="themed-datepicker"
                      calendarClassName="themed-calendar"
                    />
                  </Form.Group>

                  <div className="d-grid mt-4">
                    <Button variant="primary" type="submit" style={{
                      backgroundColor: darkTheme.colors.primary,
                      color: darkTheme.colors.onPrimary,
                      borderColor: darkTheme.colors.primary,
                      padding: '0.75rem'
                    }}>
                      Submit
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ReportItem;
