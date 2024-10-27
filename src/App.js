// App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './AuthProvider';
import Home from "./home";
import Signup from "./signup";
import Login from "./login";
import Feed from "./feed";
import ReportItem from "./reportitem";
import Matches from "./matches"; 
import PrivateRoute from "./privateroute";
import Profile from './profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ThemeProvider } from 'styled-components';
import darkTheme, { getThemeStyles } from './theme';
import GlobalStyles from './GlobalStyles';  // Import GlobalStyles

function App() {
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
