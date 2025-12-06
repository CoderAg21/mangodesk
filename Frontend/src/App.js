import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Routes/Dashboard";
import Notfound from "./Routes/Notfound";
import Homepage from "./Routes/Homepage";
import LandingPage from "./Routes/LandingPage";
import Login from "./Routes/Login";
import Team from "./Routes/Team";
import Signup from "./Routes/Signup";
// import SignUpPage from "./Routes/SignUp";
// import Login from "./Routes/Login";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/home" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/team" element={<Team/>} />

      </Routes>
    </Router>
  );
}

export default App;
