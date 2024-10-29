import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Image, Form, Button, Card, Alert, Modal, Spinner, Badge } from 'react-bootstrap';
import NavBar from '../layout/NavBar';
import { FaEdit, FaCamera, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import darkTheme from '../../config/theme';

function Profile() {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [items, setItems] = useState([]);
  const [returnedCount, setReturnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!auth.currentUser) {
      setError("No authenticated user found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        setEditedUser(userData);
        setProfilePic(userData.profilePic);

        const itemsQuery = query(collection(db, 'items'), where('userId', '==', auth.currentUser.uid));
        const itemsSnapshot = await getDocs(itemsQuery);
        const fetchedItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setItems(fetchedItems);

        const returnedItems = fetchedItems.filter(item => item.status === 'returned');
        setReturnedCount(returnedItems.length);
      } else {
        setError("User document not found in Firestore.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("An error occurred while fetching user data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicChange = async (e) => {
    if (e.target.files[0]) {
      setUploadingProfilePic(true);
      try {
        const file = e.target.files[0];
        const fileRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
        await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(fileRef);

        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          profilePic: downloadURL
        });

        setProfilePic(downloadURL);
        setSuccess("Profile picture updated successfully!");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        setError("Failed to upload profile picture. Please try again.");
      } finally {
        setUploadingProfilePic(false);
        setShowProfilePicModal(false);
      }
    }
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditedUser(user);
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), editedUser);
      setUser(editedUser);
      setSuccess("Profile updated successfully!");
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    }
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

  const textStyle = { color: darkTheme.text.primary };
  const secondaryTextStyle = { color: darkTheme.text.secondary };

  if (loading) {
    return (
      <>
        <NavBar />
        <Container className="mt-4">
          <Alert variant="info">Loading user data...</Alert>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <Container className="mt-4">
          <Alert variant="danger">{error}</Alert>
        </Container>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <NavBar />
        <Container className="mt-4">
          <Alert variant="warning">No user data found. Please try logging in again.</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <Container className="mt-5">
        <Row className="g-4">
          <Col md={4}>
            <Card style={{ backgroundColor: darkTheme.colors.surface }}>
              <Card.Body className="text-center p-4">
                <div className="position-relative d-inline-block mb-4">
                  <img
                    src={profilePic || 'https://via.placeholder.com/150'}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0"
                    onClick={() => setShowProfilePicModal(true)}
                  >
                    <FaCamera />
                  </Button>
                </div>
                <Card.Title style={{ ...textStyle, marginBottom: '1rem' }}>{user?.displayName}</Card.Title>
                <Card.Text style={{ ...secondaryTextStyle, marginBottom: '1.5rem' }}>{user?.email}</Card.Text>
                <Button variant="outline-primary" onClick={() => setShowEditModal(true)}>
                  <FaEdit className="me-2" />
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card style={{ backgroundColor: darkTheme.colors.surface, marginBottom: '2rem' }}>
              <Card.Body className="p-4">
                <Card.Title style={{ 
                  ...textStyle, 
                  marginBottom: '1.5rem',
                  fontSize: '1.2rem',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif"
                }}>
                  User Statistics
                </Card.Title>
                <Row className="g-3">
                  <Col sm={6}>
                    <Card.Text style={{
                      ...textStyle,
                      fontSize: '0.9rem',
                      fontFamily: "'Helvetica Neue', Arial, sans-serif"
                    }}>
                      Items Reported: {items.length}
                    </Card.Text>
                  </Col>
                  <Col sm={6}>
                    <Card.Text style={{
                      ...textStyle,
                      fontSize: '0.9rem',
                      fontFamily: "'Helvetica Neue', Arial, sans-serif"
                    }}>
                      Items Returned: {returnedCount}
                    </Card.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <Card style={{ backgroundColor: darkTheme.colors.surface }}>
              <Card.Body className="p-4">
                <Card.Title style={{ 
                  ...textStyle, 
                  marginBottom: '1.5rem',
                  fontSize: '1.2rem',
                  fontFamily: "'Helvetica Neue', Arial, sans-serif"
                }}>
                  Reported Items
                </Card.Title>
                {items.map(item => (
                  <Card key={item.id} className="mb-3" style={{ backgroundColor: darkTheme.colors.background }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Card.Title style={{
                            ...textStyle,
                            fontSize: '1rem',
                            fontFamily: "'Helvetica Neue', Arial, sans-serif"
                          }}>
                            {item.title}
                          </Card.Title>
                          <Card.Subtitle style={{
                            ...secondaryTextStyle,
                            fontSize: '0.85rem',
                            fontFamily: "'Helvetica Neue', Arial, sans-serif"
                          }} className="mb-2">
                            <Badge bg={item.lostOrFound === 'Lost' ? 'danger' : 'success'} className="me-2">
                              {item.lostOrFound}
                            </Badge>
                            <Badge bg={item.status === 'Pending' ? 'warning' : 'success'}>
                              {item.status}
                            </Badge>
                          </Card.Subtitle>
                        </div>
                        <small style={{
                          ...secondaryTextStyle,
                          fontSize: '0.8rem',
                          fontFamily: "'Helvetica Neue', Arial, sans-serif"
                        }}>
                          {formatDate(item.date, item.time)}
                        </small>
                      </div>
                      <Card.Text style={{
                        ...textStyle,
                        fontSize: '0.85rem',
                        fontFamily: "'Helvetica Neue', Arial, sans-serif"
                      }} className="mb-1">
                        <FaMapMarkerAlt className="me-2" />
                        {item.location}
                      </Card.Text>
                      <Card.Text style={{
                        ...textStyle,
                        fontSize: '0.85rem',
                        fontFamily: "'Helvetica Neue', Arial, sans-serif"
                      }}>
                        <FaClock className="me-2" />
                        {formatDate(item.date, item.time)}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Profile Picture Modal */}
      <Modal show={showProfilePicModal} onHide={() => setShowProfilePicModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <Image 
              src={profilePic || 'https://via.placeholder.com/300'} 
              fluid 
              style={{ maxHeight: '300px', width: 'auto' }}
            />
          </div>
          <Form.Group controlId="profilePic" className="mt-3">
            <Form.Label>Change Profile Picture</Form.Label>
            <Form.Control 
              type="file" 
              onChange={handleProfilePicChange} 
              accept="image/*"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfilePicModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Loading Overlay */}
      {uploadingProfilePic && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Display Name</Form.Label>
              <Form.Control 
                type="text" 
                value={editedUser.displayName || ''} 
                onChange={(e) => setEditedUser({...editedUser, displayName: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                value={editedUser.username || ''} 
                onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Profile;
