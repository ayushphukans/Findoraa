  // feed.js

  import React, { useState, useEffect } from 'react';
  import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
  import { db } from '../../config/firebase';
  // import { useNavigate } from 'react-router-dom';
  import { Container, Row, Col, Card, Form, InputGroup, Badge, Button } from 'react-bootstrap';
  import { FaSearch, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
  import NavBar from '../layout/NavBar';
  import darkTheme from '../../config/theme';
  import styled from 'styled-components';

  // Update the StyledFormControl
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

  // Add a styled component for Form.Select
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

  function Feed() {
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    // const navigate = useNavigate();

    useEffect(() => {
      const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const itemsArray = [];
        querySnapshot.forEach((doc) => {
          const item = { id: doc.id, ...doc.data() };
          console.log('Fetched item:', item);
          itemsArray.push(item);
        });
        setItems(itemsArray);
        console.log('All fetched items:', itemsArray);
      });

      return () => unsubscribe();
    }, []);

    const filteredItems = items.filter(item => {
      console.log('Filtering item:', item);
      const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = 
        filterType === 'all' || 
        item.lostOrFound.toLowerCase() === filterType.toLowerCase();
      console.log('Matches search:', matchesSearch, 'Matches type:', matchesType);
      return matchesSearch && matchesType;
    });

    console.log('Filtered items:', filteredItems);

    const handleButtonClick = (item) => {
      console.log(`${item.lostOrFound === 'Lost' ? 'Found' : 'Claimed'} item:`, item);
      // Implement claim/found logic here
    };

    const formatDate = (dateString, timeString) => {
      if (!dateString) return 'Unknown';
      
      const [year, month, day] = dateString.split('-');
      const [hour, minute] = timeString ? timeString.split(':') : ['00', '00'];
      
      const date = new Date(year, month - 1, day, hour, minute);
      
      return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    };

    return (
      <div style={{ backgroundColor: darkTheme.colors.background, minHeight: '100vh' }}>
        <NavBar />
        <Container fluid className="mt-4 px-4">
          <Card style={{ backgroundColor: darkTheme.colors.surface, marginBottom: '2rem' }}>
            <Card.Body className="p-4">
              <Row className="g-3">
                <Col md={6}>
                  <InputGroup>
                    <StyledFormControl
                      placeholder="Search items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <InputGroup.Text className="btn btn-primary">
                      <FaSearch />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>
                <Col md={6}>
                  <StyledFormSelect
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Items</option>
                    <option value="found">Found Items</option>
                    <option value="lost">Lost Items</option>
                  </StyledFormSelect>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {filteredItems.map((item) => (
              <Col key={item.id}>
                <Card style={{ backgroundColor: darkTheme.colors.surface, height: '100%' }}>
                  <Card.Body className="d-flex flex-column p-4">
                    <Card.Title style={{ 
                      color: darkTheme.text.primary, 
                      fontSize: '1.25rem', 
                      marginBottom: '0.75rem',
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      height: '3rem',  // Fixed height for title
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {item.title}
                    </Card.Title>
                    <div style={{ marginBottom: '0.75rem', height: '1.5rem' }}>
                      <Badge bg={item.lostOrFound === 'Lost' ? 'danger' : 'success'}>
                        {item.lostOrFound}
                      </Badge>
                    </div>
                    <Card.Text style={{ 
                      color: darkTheme.text.secondary, 
                      marginBottom: '0.5rem',
                      fontSize: '0.85rem',
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      height: '1.5rem',  // Fixed height for location
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      <FaMapMarkerAlt className="me-2" />
                      {item.location}
                    </Card.Text>
                    <Card.Text style={{ 
                      color: darkTheme.text.secondary, 
                      marginBottom: '1rem',
                      fontSize: '0.85rem',
                      fontFamily: "'Helvetica Neue', Arial, sans-serif",
                      height: '1.5rem',  // Fixed height for date/time
                    }}>
                      <FaClock className="me-2" />
                      {formatDate(item.date, item.time)}
                    </Card.Text>
                    <Button 
                      variant="light" 
                      className="mt-auto w-100"
                      onClick={() => handleButtonClick(item)}
                      style={{ 
                        backgroundColor: darkTheme.colors.primary, 
                        color: darkTheme.colors.onPrimary,
                        borderColor: darkTheme.colors.primary,
                        padding: '0.75rem',
                        fontFamily: "'Helvetica Neue', Arial, sans-serif"
                      }}
                    >
                      {item.lostOrFound === 'Lost' ? 'Found it' : 'Claim'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    );
  }

  export default Feed;
