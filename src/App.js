// App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home";  // Note the lowercase 'h'
import Signup from "./signup";
import Login from "./login";
import Feed from "./feed";
import ReportItem from "./reportitem";
import Matches from "./matches"; 
import PrivateRoute from "./privateroute";
import Profile from './profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from './AuthProvider';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route
            path="/report"
            element={
              <PrivateRoute>
                <ReportItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/matches" 
            element={
              <PrivateRoute>
                <Matches />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
