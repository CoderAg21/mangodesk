import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Routes/Dashboard";
import Notfound from "./Routes/Notfound";
import Homepage from "./Routes/Homepage";

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/" element={<Dashboard />} />
        {/* <Route path="*" element={<Notfound />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
