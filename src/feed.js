// feed.js

import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { FaSearch, FaPlus } from 'react-icons/fa';
import NavBar from './NavBar';

function Feed() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const itemsRef = collection(db, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedItems = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(fetchedItems);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterType === 'all' || item.type === filterType)
  );

  const handleClaim = (itemId) => {
    // Implement claim functionality here
    console.log(`Claiming item with id: ${itemId}`);
  };

  return (
    <>
      <NavBar />
      <Container fluid className="mt-4">
        <Row className="mb-4">
          <Col xs="auto">
            <Button variant="success" onClick={() => navigate('/report')}>
              <FaPlus /> Report Item
            </Button>
          </Col>
        </Row>
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col md={6}>
            <Form.Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </Form.Select>
          </Col>
        </Row>
        <Row xs={1} md={2} lg={3} className="g-4">
          {filteredItems.map(item => (
            <Col key={item.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  {item.type && (
                    <Card.Text>
                      <Badge bg={item.type === 'lost' ? 'danger' : 'success'}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                    </Card.Text>
                  )}
                  <Card.Text>
                    <small className="text-muted">Location: {item.location}</small>
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white border-top-0 d-flex justify-content-between">
                  <Button variant="outline-primary" onClick={() => navigate(`/item/${item.id}`)}>
                    View Details
                  </Button>
                  {item.type === 'found' && (
                    <Button variant="outline-success" onClick={() => handleClaim(item.id)}>
                      Claim
                    </Button>
                  )}
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

export default Feed;
