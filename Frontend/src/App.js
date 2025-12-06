import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Routes/Dashboard";
import Notfound from "./Routes/Notfound";
import Homepage from "./Routes/Homepage";
import LandingPage from "./Routes/LandingPage";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/home" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/" element={<LandingPage />} />

      </Routes>
    </Router>
  );
}

export default App;
