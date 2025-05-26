import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Profile from "./Profile";
import AgentsList from "./AgentList";
import AuthProvider from "./contexts/AuthProvider";
import PrivateRoute from "./PrivateRoute"; 
import NetworkMap from "./host";
import Home from "./Home";
import Welcome from "./welcome";
import Map from "./Map";

import Chat from "./Chat";



const App = () => {

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/host"  element={< NetworkMap/>} />
          <Route path="/Map" element={< Map/>} />
          
          
 
          {/* Protected Routes */}
          <Route path="/welcome" element={
            <PrivateRoute>
              <Welcome/>
            </PrivateRoute>
          } />
          
    
          
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/agentList" element={
            <PrivateRoute>
              <AgentsList />
            </PrivateRoute>
          } />
          
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat/>
            </PrivateRoute>
          } />
          <Route path="/graph-view" element={
            <PrivateRoute>
              <Map />
           </PrivateRoute>
         } />

          <Route path="/network-status" element={
           <PrivateRoute>
             <NetworkMap />
           </PrivateRoute>
         } />

          
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

