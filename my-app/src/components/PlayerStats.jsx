import React, { useState } from "react";
import supabase from "../supabaseClient";
import { Link } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const PlayerProjections = () => {
  const [playerName, setPlayerName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState([]);
  const [averages, setAverages] = useState(null);
  const [position, setPosition] = useState(""); // Track player's position
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeString = (str) =>
    str.toLowerCase().replace(/[-.`']/g, "").trim();

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: players, error } = await supabase
        .from("player_list")
        .select("player_name");

      if (error) {
        console.error("Error fetching suggestions:", error.message);
        return;
      }

      const normalizedQuery = normalizeString(query);
      const matchingPlayers = players.filter((player) =>
        normalizeString(player.player_name).includes(normalizedQuery)
      );

      setSuggestions(matchingPlayers.map((p) => p.player_name));
    } catch (err) {
      console.error("Unexpected error fetching suggestions:", err.message);
    }
  };

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError("");

    try {
      const normalizedPlayerName = normalizeString(playerName);

      // Fetch player stats
      const { data: weeklyStats, error: statsError } = await supabase
        .from("player_stats")
        .select("*")
        .ilike("player_name", `%${normalizedPlayerName}%`);

      if (statsError || !weeklyStats || weeklyStats.length === 0) {
        throw new Error(`No stats found for player "${playerName}".`);
      }

      // Fetch player averages
      const { data: averagesData, error: averagesError } = await supabase
        .from("player_averages")
        .select("*")
        .ilike("player_name", `%${normalizedPlayerName}%`);

      if (averagesError) {
        throw new Error("Failed to fetch player averages.");
      }

      // Set position dynamically from stats data
      const playerPosition = weeklyStats[0]?.position_id || "";
      setPosition(playerPosition);

      const sortedStats = weeklyStats.sort((a, b) => a.week - b.week);
      setStats(sortedStats);
      setAverages(averagesData[0] || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPlayerStats();
  };

  // Define columns dynamically based on position
  const getColumns = () => {
    if (position === "QB") {
      return [
        { label: "Passing Attempts", key: "passing_attempts" },
        { label: "Completions", key: "completions" },
        { label: "Passing Yards", key: "passing_yards" },
        { label: "Passing TDs", key: "passing_tds" },
        { label: "Interceptions", key: "interceptions" },
        { label: "Rushing Attempts", key: "rushing_attempts" },
        { label: "Rushing Yards", key: "rushing_yards" },
        { label: "Rushing TDs", key: "rushing_tds" },
      ];
    } else if (position === "WR" || position === "TE") {
      return [
        { label: "Targets", key: "targets" },
        { label: "Receptions", key: "receptions" },
        { label: "Receiving Yards", key: "receiving_yards" },
        { label: "Receiving TDs", key: "receiving_tds" },
        { label: "Rushing Attempts", key: "rushing_attempts" },
        { label: "Rushing Yards", key: "rushing_yards" },
        { label: "Rushing TDs", key: "rushing_tds" },
      ];
    } else if (position === "RB") {
      return [
        { label: "Rushing Attempts", key: "rushing_attempts" },
        { label: "Rushing Yards", key: "rushing_yards" },
        { label: "Rushing TDs", key: "rushing_tds" },
        { label: "Targets", key: "targets" },
        { label: "Receptions", key: "receptions" },
        { label: "Receiving Yards", key: "receiving_yards" },
        { label: "Receiving TDs", key: "receiving_tds" },
      ];
    }
    return [];
  };

  return (
    <div>
      <header>
        <div className="logo">
          <h1>Stats X</h1>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/defense">Defense v.s. Position</Link>
          <Link to="/player-stats">Player Stats</Link>
          <Link to="/player-projections">Player Projections</Link>
        </nav>
      </header>

      <main className="right_col" role="main" style={{ marginBottom: "500px" }}>
        <div className="container">
          <h1>Player Stats</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="playerName">
              Enter NFL Player Name: (e.g. Saquon Barkley)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => {
                  setPlayerName(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                required
                autoComplete="off"
              />
              <div className="suggestions">
                {suggestions.map((name, index) => (
                  <div
                    key={index}
                    className="suggestion-item"
                    onClick={() => {
                      setPlayerName(name);
                      setSuggestions([]);
                    }}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
            <button type="submit">Show Stats</button>
          </form>

          {loading && <p className="loading">Loading stats...</p>}
          {error && <p className="error">{error}</p>}

          {/* Material-UI Table */}
          {stats.length > 0 && (
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="player stats table">
                <TableHead>
                  <TableRow>
                    <TableCell>Week</TableCell>
                    <TableCell>Opponent</TableCell>
                    {getColumns().map((col) => (
                      <TableCell key={col.key} align="right">
                        {col.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.map((row, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        Week {row.week}
                      </TableCell>
                      <TableCell>{row.opponent}</TableCell>
                      {getColumns().map((col) => (
                        <TableCell key={col.key} align="right">
                          {row[col.key] || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {averages && (
                    <TableRow
                      sx={{
                        backgroundColor: "#f1f1f1",
                        fontWeight: "bold",
                      }}
                    >
                      <TableCell>Averages</TableCell>
                      <TableCell>-</TableCell>
                      {getColumns().map((col) => (
                        <TableCell key={col.key} align="right">
                          {averages[`avg_${col.key}`]
                            ? averages[`avg_${col.key}`].toFixed(1)
                            : "0.0"}
                        </TableCell>
                      ))}
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </div>
      </main>

      <footer>
        <p>&copy; 2024 Stats X. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PlayerProjections;
