import React, { useState, useEffect } from 'react';
import { auth, db, storage } from './firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Container, Row, Col, Image, Form, Button, Card, Alert } from 'react-bootstrap';
import NavBar from './NavBar';

function Profile() {
  const [user, setUser] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [newProfilePic, setNewProfilePic] = useState(null);
  const [items, setItems] = useState([]);
  const [returnedCount, setReturnedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
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
          setProfilePic(userData.profilePic);

          // Fetch user's reported items
          const itemsQuery = query(collection(db, 'items'), where('userId', '==', auth.currentUser.uid));
          const itemsSnapshot = await getDocs(itemsQuery);
          const fetchedItems = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setItems(fetchedItems);

          // Count returned items
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

    fetchUserData();
  }, []);

  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setNewProfilePic(e.target.files[0]);
    }
  };

  const handleProfilePicUpload = async () => {
    if (!newProfilePic) return;

    try {
      const fileRef = ref(storage, `profilePics/${auth.currentUser.uid}`);
      await uploadBytes(fileRef, newProfilePic);
      const downloadURL = await getDownloadURL(fileRef);

      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        profilePic: downloadURL
      });

      setProfilePic(downloadURL);
      setNewProfilePic(null);
      setSuccess("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setError("Failed to upload profile picture. Please try again.");
    }
  };

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
      <Container className="mt-4">
        <Row>
          <Col md={4}>
            <Card>
              <Card.Body>
                <div className="text-center mb-3">
                  <Image 
                    src={profilePic || 'https://via.placeholder.com/150'} 
                    roundedCircle 
                    fluid 
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                </div>
                <Form.Group controlId="profilePic" className="mb-3">
                  <Form.Label>Change Profile Picture</Form.Label>
                  <Form.Control 
                    type="file" 
                    onChange={handleProfilePicChange} 
                    accept="image/*"
                  />
                </Form.Group>
                <Button 
                  variant="primary" 
                  onClick={handleProfilePicUpload} 
                  disabled={!newProfilePic}
                  className="w-100"
                >
                  Upload New Picture
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card>
              <Card.Body>
                <Card.Title as="h2">{user.displayName || 'User'}</Card.Title>
                <Card.Text>Email: {user.email}</Card.Text>
                <Card.Text>Username: {user.username}</Card.Text>
                <Card.Text>Items Returned to Owner: {returnedCount}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        {success && (
          <Alert variant="success" className="mt-3">
            {success}
          </Alert>
        )}
        <Row className="mt-4">
          <Col>
            <h3>Reported Items</h3>
            {items.length > 0 ? (
              items.map(item => (
                <Card key={item.id} className="mb-3">
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{item.lostOrFound}</Card.Subtitle>
                    <Card.Text>
                      Location: {item.location}<br />
                      Date: {item.date} {item.time}<br />
                      Status: {item.status || 'Pending'}
                    </Card.Text>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <Alert variant="info">You haven't reported any items yet.</Alert>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Profile;
