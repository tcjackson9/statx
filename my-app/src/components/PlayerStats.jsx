import React, { useState } from "react";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";
import { BarChart, Bar, CartesianGrid, XAxis, Tooltip } from "recharts";
import {
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Autocomplete,
  Card,
  CardContent,
} from "@mui/material";
import "./header.css";
import "./Home.css";

const PlayerStats = () => {
  const [playerName, setPlayerName] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [averages, setAverages] = useState({});
  const [last3Averages, setLast3Averages] = useState({});
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizeString = (str) => str.toLowerCase().replace(/[-.`']/g, "").trim();

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: players } = await supabase.from("player_list").select("player_name");

      const normalizedQuery = normalizeString(query);
      const matchingPlayers = players.filter((player) =>
        normalizeString(player.player_name).includes(normalizedQuery)
      );

      setSuggestions(matchingPlayers.map((p) => p.player_name));
    } catch (err) {
      console.error("Error fetching suggestions:", err.message);
    }
  };

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError("");

    try {
      const normalizedPlayerName = normalizeString(playerName);

      const { data: weeklyStats } = await supabase
        .from("player_stats")
        .select("*")
        .ilike("player_name", `%${normalizedPlayerName}%`);

      if (!weeklyStats || weeklyStats.length === 0) {
        throw new Error("No data available for the selected player.");
      }

      const sortedStats = weeklyStats.sort((a, b) => a.week - b.week);
      setStats(sortedStats);
      setPosition(sortedStats[0]?.position_id || "");

      const totalStats = sortedStats.reduce((totals, stat) => {
        Object.keys(stat).forEach((key) => {
          if (typeof stat[key] === "number") {
            totals[key] = (totals[key] || 0) + stat[key];
          }
        });
        return totals;
      }, {});

      const averages = {};
      Object.keys(totalStats).forEach((key) => {
        averages[key] = (totalStats[key] / sortedStats.length).toFixed(1);
      });
      setAverages(averages);

      const last3Weeks = sortedStats.slice(-3);
      const last3Stats = last3Weeks.reduce((totals, stat) => {
        Object.keys(stat).forEach((key) => {
          if (typeof stat[key] === "number") {
            totals[key] = (totals[key] || 0) + stat[key];
          }
        });
        return totals;
      }, {});

      const last3Averages = {};
      Object.keys(last3Stats).forEach((key) => {
        last3Averages[key] = (last3Stats[key] / last3Weeks.length).toFixed(1);
      });
      setLast3Averages(last3Averages);

      const barChartData = sortedStats.map((stat) => ({
        week: `Week ${stat.week}`,
        rushing_attempts: stat.rushing_attempts || 0,
        rushing_yards: stat.rushing_yards || 0,
      }));

      setChartData(barChartData);
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        textAlign: "center",
        padding: { xs: 2, sm: 3, md: 4 }, // Adjust padding based on screen size
      }}
    >
      <header>
        <Typography variant="h4">Stats X</Typography>
        <nav>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <span>|</span>
            <Link to="/defense">Defense v.s. Position</Link>
            <span>|</span>
            <Link to="/player-stats">Player Stats</Link>
            <span>|</span>
            <Link to="/player-projections">Player Projections</Link>
          </div>
        </nav>
      </header>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: 2, sm: 3 }, // Responsive padding for form
          padding: 2,
        }}
      >
        <Typography variant="h5">Player Stats</Typography>
        <Typography variant="body1" gutterBottom>
          Enter a player's name to view their stats and projections.
        </Typography>

        <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 400, 
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Autocomplete
          freeSolo
          options={suggestions}
          onInputChange={(event, value) => {
            setPlayerName(value);
            fetchSuggestions(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search Player"
              fullWidth
              sx={{
                width: "400px", // Set the width
              }}
            />
          )}
        />
        <Button variant="contained" color="primary" type="submit">
          Get Stats
        </Button>
      </Box>


        {loading && <Typography>Loading stats...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {chartData.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Player Rushing Stats</Typography>
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <Tooltip />
              <Bar dataKey="rushing_attempts" fill="#8884d8" />
              <Bar dataKey="rushing_yards" fill="#82ca9d" />
            </BarChart>
          </Box>
        )}

        {stats.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Week</TableCell>
                  {getColumns().map((col) => (
                    <TableCell key={col.key}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.week}</TableCell>
                    {getColumns().map((col) => (
                      <TableCell key={col.key}>{row[col.key]}</TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>Last 3 Averages</TableCell>
                  {getColumns().map((col) => (
                    <TableCell key={col.key}>{last3Averages[col.key]}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell>Averages</TableCell>
                  {getColumns().map((col) => (
                    <TableCell key={col.key}>{averages[col.key]}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <footer>
        <Box sx={{ backgroundColor: "#2a3f54", color: "#fff", textAlign: "center", padding: 2 }}>
          <Typography>&copy; 2024 Stats X. All rights reserved.</Typography>
        </Box>
      </footer>
    </Box>
  );
};

export default PlayerStats;
