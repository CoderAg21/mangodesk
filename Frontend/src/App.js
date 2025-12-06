import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Routes/Dashboard";
import Notfound from "./Routes/Notfound";
import Homepage from "./Routes/Homepage";
import LandingPage from "./Routes/LandingPage";
import LoginPage from "./Routes/LoginPage";
import Team from "./Routes/Team";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/home" element={<Homepage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Notfound />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/loginpage" element={<LoginPage />} />
        <Route path="/team" element={<Team/>} />

      </Routes>
    </Router>
  );
}

export default App;
