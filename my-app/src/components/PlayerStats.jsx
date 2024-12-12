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

  const fetchPlayerAverages = async (normalizedPlayerName) => {
    try {
      const { data: playerAverages } = await supabase
        .from("player_averages")
        .select("*")
        .ilike("player_name", `%${normalizedPlayerName}%`);
  
      if (!playerAverages || playerAverages.length === 0) {
        throw new Error("No average data available for the selected player.");
      }
  
      const averages = {};
      playerAverages.forEach((stat) => {
        Object.keys(stat).forEach((key) => {
          if (typeof stat[key] === "number") {
            averages[key] = stat[key];
          }
        });
      });
  
      setAverages(averages); // Update the state with the fetched averages
    } catch (err) {
      console.error("Error fetching player averages:", err.message);
      setError("Unable to fetch player averages.");
    }
  };  

  const fetchPlayerStats = async () => {
    setLoading(true);
    setError("");

    try {
      const normalizedPlayerName = normalizeString(playerName);
  
      await fetchPlayerAverages(normalizedPlayerName); // Fetch player averages
  
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

      if (sortedStats[0].position_id === "QB") {
        const qbChartData = sortedStats.map((stat) => ({
          week: `Week ${stat.week}`,
          completions: stat.completions || 0,
          passing_yards: stat.passing_yards || 0,
        }));
        setChartData(qbChartData);
      }

      if (sortedStats[0].position_id === "RB") {
      const rbChartData = sortedStats.map((stat) => ({
        week: `Week ${stat.week}`,
        rushing_attempts: stat.rushing_attempts || 0,
        rushing_yards: stat.rushing_yards || 0,
      }));
      setChartData(rbChartData);
    }

      if (sortedStats[0].position_id === "WR" || sortedStats[0].position_id === "TE") {
      const wrChartData = sortedStats.map((stat) => ({
        week: `Week ${stat.week}`,
        receptions: stat.receptions || 0,
        receiving_yards: stat.receiving_yards || 0,
      }));
      setChartData(wrChartData);
    }
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
        backgroundColor: "#1b2735", // Dark blue background
        color: "#f1f1f1", // Light text
      }}
    >
      <header>
        <Typography variant="h4" sx={{ color: "#f1f1f1" }}>
          Stats X
        </Typography>
        <nav>
          <div className="nav-links">
            <Link to="/" style={{ color: "#f1f1f1" }}>
              Home
            </Link>
            <span style={{ color: "#d1d1d1" }}> | </span>
            <Link to="/defense" style={{ color: "#f1f1f1" }}>
              Defense v.s. Position
            </Link>
            <span style={{ color: "#d1d1d1" }}> | </span>
            <Link to="/player-stats" style={{ color: "#f1f1f1" }}>
              Player Stats
            </Link>
            <span style={{ color: "#d1d1d1" }}> | </span>
            <Link to="/player-projections" style={{ color: "#f1f1f1" }}>
              Player Projections
            </Link>
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
          padding: 2,
        }}
      >
        <Typography variant="h5" sx={{ color: "#f1f1f1" }}>
          Player Stats
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ color: "#d1d1d1" }}>
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
                  backgroundColor: "#2a3f54", // Darker input field
                  borderRadius: "5px",
                  input: { color: "#f1f1f1" }, // White input text
                  label: { color: "#f1f1f1" }, // White label text
                }}
              />
            )}
          />
          <Button
            variant="contained"
            sx={{
              width: 400, // Match the button width to 600px
              backgroundColor: "#3e4e6a",
              color: "#fff",
              "&:hover": { backgroundColor: "#2c3d57" }, // Darker on hover
            }}
            type="submit"
          >
            Get Stats
          </Button>
        </Box>

        {loading && <Typography sx={{ color: "#d1d1d1" }}>Loading stats...</Typography>}
        {error && <Typography sx={{ color: "#ff4c4c" }}>{error}</Typography>}

        {position === "QB" && chartData.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6" sx={{ color: "#f1f1f1" }}>
              Player Passing Stats
            </Typography>
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid stroke="#2a3f54" />
              <XAxis dataKey="week" stroke="#f1f1f1" />
              <Tooltip />
              <Bar dataKey="completions" fill="#3e4e6a" />
              <Bar dataKey="passing_yards" fill="#82ca9d" />
            </BarChart>
          </Box>
        )}
        {position === "RB" && chartData.length > 0 && (
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
        {(position === "WR" || position === "TE") && chartData.length > 0 && (
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h6">Player Receiving Stats</Typography>
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <Tooltip />
              <Bar dataKey="receptions" fill="#8884d8" />
              <Bar dataKey="receiving_yards" fill="#82ca9d" />
            </BarChart>
          </Box>
        )}
        {stats.length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 4, backgroundColor: "#1b2735" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#f1f1f1" }}>Week</TableCell>
                  {getColumns().map((col) => (
                    <TableCell key={col.key} sx={{ color: "#f1f1f1" }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
  {stats.map((row, index) => (
    <TableRow key={index} sx={{ backgroundColor: index % 2 === 0 ? "#2a3f54" : "transparent" }}>
      <TableCell sx={{ color: "#f1f1f1" }}>{row.week}</TableCell>
      {getColumns().map((col) => {
        const value = parseFloat(row[col.key]);
        const average = parseFloat(averages[col.key]);
        let color = "#f1f1f1"; // Default white

        if (!isNaN(value)) {
          // Specific conditions for certain stats
          if (col.key === "rushing_tds" || col.key === "receiving_tds") {
            color = value > 0 ? "#00c853" : "#d32f2f"; // Green if > 0, Red otherwise
          } else if (col.key === "interceptions") {
            if (value === 0) color = "#00c853"; // Green
            else if (value === 1) color = "#ffea00"; // Yellow
            else if (value > 1) color = "#d32f2f"; // Red
          } else if (col.key === "passing_tds") {
            if (value === 0) color = "#d32f2f"; // Red
            else if (value === 1) color = "#ffea00"; // Yellow
            else if (value > 1) color = "#00c853"; // Green
          }
          // Fallback to average-based comparison for other stats
          else if (!isNaN(average)) {
            if (value > average + 1.5) {
              color = "#00c853"; // Green
            } else if (value >= average - 1.5 && value <= average + 1.5) {
              color = "#ffea00"; // Yellow
            } else if (value < average - 1.5) {
              color = "#d32f2f"; // Red
            }
          }
        }

        return (
          <TableCell key={col.key} sx={{ color }}>
            {isNaN(value) ? "N/A" : value}
          </TableCell>
        );
      })}
    </TableRow>
  ))}
</TableBody>


            </Table>
          </TableContainer>
        )}
      </Box>
      <Box
  sx={{
    marginTop: 4,
    padding: 2,
    backgroundColor: "#2a3f54",
    color: "#f1f1f1",
    borderRadius: "5px",
    textAlign: "center",
    width: "100%", // Take full width
    display: "flex",
    flexDirection: "column", // Stack the title and content vertically
    alignItems: "center", // Center all content
  }}
>
  {/* Title */}
  <Typography
    variant="h5"
    sx={{
      marginBottom: 3,
      fontWeight: "bold",
      textAlign: "center",
    }}
  >
    Stats Key
  </Typography>

  <Box
    sx={{
      maxWidth: "1200px", // Match table's max width
      width: "100%",
      display: "flex", // Create flex container
      justifyContent: "space-between", // Distribute columns evenly
      gap: 4,
    }}
  >
    {/* Column 1: Averages */}
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Averages
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Stack vertically
          gap: 1,
          alignItems: "center", // Center align items
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#ffea00",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Within 1.5 of the player's average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>At least 1.5 more than the player's average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#d32f2f",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>At least 1.5 less than the player's average</Typography>
        </Box>
      </Box>
    </Box>

    {/* Column 2: Touchdowns */}
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Touchdowns
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Stack vertically
          gap: 1,
          alignItems: "center", // Center align items
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Rushing/Receiving TDs > 0</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#d32f2f",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Passing TDs = 0</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#ffea00",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Passing TDs = 1</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Passing TDs > 1</Typography>
        </Box>
      </Box>
    </Box>

    {/* Column 3: Interceptions */}
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Interceptions
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Stack vertically
          gap: 1,
          alignItems: "center", // Center align items
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>0 Interceptions</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#ffea00",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>1 Interception</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#d32f2f",
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>More than 1 Interception</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
</Box>


      <footer>
        <Box sx={{ backgroundColor: "#2a3f54", color: "#f1f1f1", textAlign: "center", padding: 2 }}>
          <Typography>&copy; 2024 Stats X. All rights reserved.</Typography>
        </Box>
      </footer>
    </Box>
  );
};

export default PlayerStats;
