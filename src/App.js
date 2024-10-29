// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './components/auth/AuthProvider';
import Home from "./components/pages/Home";
import Signup from "./components/auth/Signup";
import Login from "./components/auth/Login";
import Feed from "./components/pages/Feed";
import ReportItem from "./components/items/ReportItem";
import Matches from "./components/items/Matches";
import PrivateRoute from "./components/auth/PrivateRoute";
import Profile from './components/pages/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from 'styled-components';
import darkTheme from './config/theme';
import GlobalStyles from './styles/GlobalStyles';  // Import GlobalStyles
import { useEffect } from 'react';
import { runMatchingService } from './services/matchingService';



function App() {
  useEffect(() => {
    runMatchingService();
  }, []);

  return (
    <>
      <GlobalStyles />
      <AuthProvider>
        <ThemeProvider theme={darkTheme}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
              <Route path="/report" element={<PrivateRoute><ReportItem /></PrivateRoute>} />
              <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
