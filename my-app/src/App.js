import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import PlayerStats from "./components/PlayerStats";
import PlayerProjections from "./components/playerProjections"; // Import the new component

function App() {
  return (
    <Router>
      <Routes>
        {/* Define the homepage */}
        <Route path="/" element={<Home />} />

        {/* Define the player stats page */}
        <Route path="/player-stats" element={<PlayerStats />} />

        {/* Define the player props checker page */}
        <Route path="/player-projections" element={<PlayerProjections />} />
      </Routes>
    </Router>
  );
}

export default App;
