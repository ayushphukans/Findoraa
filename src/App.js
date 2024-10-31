// App.js

import React, { useState, useEffect } from 'react';
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
import { findPotentialMatches } from './services/matchingService';
import { openai, testConnection } from './config/openai';
import { ensureCategoriesExist } from './services/categoryService';



function App() {
  const [currentItem, setCurrentItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log('App.js env check:', {
    openaiKey: process.env.REACT_APP_OPENAI_API_KEY,
    hasKey: !!process.env.REACT_APP_OPENAI_API_KEY
  });

  useEffect(() => {
    console.log('Environment variables:', {
      hasKey: !!process.env.REACT_APP_OPENAI_API_KEY,
      keyLength: process.env.REACT_APP_OPENAI_API_KEY?.length
    });
  }, []);

  useEffect(() => {
    // Initialize categories when app starts
    ensureCategoriesExist();
  }, []);

  useEffect(() => {
    const findMatches = async () => {
      if (!currentItem) {
        console.log('No current item to find matches for');
        return;
      }

      try {
        setLoading(true);
        const foundMatches = await findPotentialMatches(currentItem);
        setMatches(foundMatches);
      } catch (error) {
        console.error('Error finding matches:', error);
      } finally {
        setLoading(false);
      }
    };

    findMatches();
  }, [currentItem]); // Only run when currentItem changes

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
