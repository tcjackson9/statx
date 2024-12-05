import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import PlayerProjections from "./components/PlayerStats";

function App() {
  return (
    <Router>
      <Routes>
        {/* Define the homepage */}
        <Route path="/" element={<Home />} />

        {/* Define the subpage */}
        <Route path="/player-projections" element={<PlayerProjections />} />
      </Routes>
    </Router>
  );
}

export default App;
