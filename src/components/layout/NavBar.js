import React, { useState } from 'react';
import useMatchNotifications from '../../hooks/useMatchNotifications';
import { Navbar, Nav, Button, Container, Dropdown, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaPlus, FaSignOutAlt, FaBell } from 'react-icons/fa';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import darkTheme from '../../config/theme';

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // subscribe to match notifications
  const { notifications, unreadCount } = useMatchNotifications(currentUser?.uid);

  const [showNotifications, setShowNotifications] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const isHomePage = location.pathname === '/';
  const showBackButton = !isHomePage && location.pathname !== '/feed';

  const navbarStyle = {
    backgroundColor: darkTheme.colors.surface,
    borderBottom: `1px solid ${darkTheme.colors.primary}40`,
    padding: '0.5rem 1rem',
  };

  const buttonStyle = {
    backgroundColor: 'transparent',
    color: darkTheme.colors.primary,
    border: 'none',
    padding: '0.4rem 0.6rem',
    fontSize: '0.9rem',
    marginLeft: '0.5rem',
  };

  const iconStyle = {
    marginRight: '0.3rem',
  };

  const dropdownStyle = {
    backgroundColor: darkTheme.colors.surface,
    border: `1px solid ${darkTheme.colors.primary}40`,
    borderRadius: '0.25rem',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    padding: '1rem',
    minWidth: '250px',
  };

  return (
    <Navbar style={navbarStyle} expand="lg">
      <Container fluid>
        {showBackButton && (
          <Button onClick={handleBack} style={buttonStyle}>
            <FaArrowLeft style={iconStyle} />
          </Button>
        )}
        <Navbar.Brand as={Link} to="/" style={{ color: darkTheme.colors.primary, fontWeight: 'bold' }}>
          Lost and Found
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser && !isHomePage && (
            <Nav className="ms-auto">
              <Button as={Link} to="/report" style={buttonStyle}>
                <FaPlus style={iconStyle} /> Report
              </Button>
              <Dropdown show={showNotifications} onToggle={toggleNotifications}>
                <Dropdown.Toggle as={Button} style={buttonStyle} className="position-relative">
                  <FaBell style={iconStyle} />
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="position-absolute" style={{ top: '0.2rem', right: '0.2rem' }}>
                      {unreadCount}
                    </Badge>
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu align="end" style={dropdownStyle}>
                  {notifications.length === 0 ? (
                    <Dropdown.Item style={{ color: darkTheme.text.primary }}>
                      All notifications up to date
                    </Dropdown.Item>
                  ) : (
                    notifications.map(n => (
                      <Dropdown.Item key={n.id} as={Link} to={`/matches/${n.id}`} style={{ color: darkTheme.text.primary }}>
                        Potential match (score: {n.similarity})
                      </Dropdown.Item>
                    ))
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <Button as={Link} to="/profile" style={buttonStyle}>
                <FaUser style={iconStyle} />
              </Button>
              <Button onClick={handleLogout} style={buttonStyle}>
                <FaSignOutAlt style={iconStyle} />
              </Button>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavBar;
