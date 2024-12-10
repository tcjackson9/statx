import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip } from "recharts";
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
  MenuItem,
} from "@mui/material";
import Papa from "papaparse";

const relevantStats = {
  QB: [
    { label: "Passing Attempts", key: "passing_attempts" },
    { label: "Completions", key: "completions" },
    { label: "Passing Yards", key: "passing_yards" },
    { label: "Passing TDs", key: "passing_tds" },
    { label: "Interceptions", key: "interceptions" },
    { label: "Rushing Attempts", key: "qb_rushing_attempts" },
    { label: "Rushing Yards", key: "qb_rushing_yards" },
    { label: "Rushing TDs", key: "qb_rushing_tds" },
  ],
  RB: [
    { label: "Rushing Attempts", key: "rushing_attempts" },
    { label: "Rushing Yards", key: "rushing_yards" },
    { label: "Rushing TDs", key: "rushing_tds" },
    { label: "Targets", key: "targets" },
    { label: "Receptions", key: "receptions" },
    { label: "Receiving Yards", key: "receiving_yards" },
    { label: "Receiving TDs", key: "receiving_tds" },
  ],
  WR: [
    { label: "Targets", key: "targets" },
    { label: "Receptions", key: "receptions" },
    { label: "Receiving Yards", key: "receiving_yards" },
    { label: "Receiving TDs", key: "receiving_tds" },
    { label: "Rushing Attempts", key: "rushing_attempts" },
    { label: "Rushing Yards", key: "rushing_yards" },
    { label: "Rushing TDs", key: "rushing_tds" },
  ],
  TE: [
    { label: "Targets", key: "targets" },
    { label: "Receptions", key: "receptions" },
    { label: "Receiving Yards", key: "receiving_yards" },
    { label: "Receiving TDs", key: "receiving_tds" },
    { label: "Rushing Attempts", key: "rushing_attempts" },
    { label: "Rushing Yards", key: "rushing_yards" },
    { label: "Rushing TDs", key: "rushing_tds" },
  ],
};

const PlayerProjections = () => {
  const [chartDataQBPrimary, setChartDataQBPrimary] = useState([]);
  const [chartDataQBSecondary, setChartDataQBSecondary] = useState([]);
  const [chartDataPrimary, setChartDataPrimary] = useState([]);
  const [chartDataSecondary, setChartDataSecondary] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [defenseTeam, setDefenseTeam] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [projections, setProjections] = useState({});
  const [position, setPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [playerLines, setPlayerLines] = useState({});

  const normalizeString = (str) => str.toLowerCase().replace(/[-.`']/g, "").trim();

  useEffect(() => {
    const fetchPlayerLines = async () => {
      try {
        const response = await fetch("/PlayerProps.csv");
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            const lines = {};
            result.data.forEach((row) => {
              const player = row.description.trim().toLowerCase();
              const stat = row.market.trim();
              const line = row.point || "N/A";

              if (!lines[player]) lines[player] = {};
              if (!lines[player][stat]) {
                lines[player][stat] = line;
              }
            });
            setPlayerLines(lines);
          },
        });
      } catch (error) {
        console.error("Error fetching player lines:", error.message);
      }
    };

    fetchPlayerLines();
  }, []);

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const { data: players } = await supabase.from("player_list").select("player_name");
      if (players) {
        const normalizedQuery = normalizeString(query);
        const matchingPlayers = players.filter((player) =>
          normalizeString(player.player_name).includes(normalizedQuery)
        );
        setSuggestions(matchingPlayers.map((p) => p.player_name));
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err.message);
    }
  };

  const fetchProjections = async () => {
    if (!playerName || !defenseTeam) {
      setError("Please provide both a player name and defense team.");
      return;
    }
  
    setLoading(true);
    setError("");
    setProjections({});
    setChartDataPrimary([]);
    setChartDataSecondary([]);
    setChartDataQBPrimary([]);
    setChartDataQBSecondary([]);
  
    try {
      // Fetch player stats
      const { data: playerStats, error: playerStatsError } = await supabase
        .from("player_stats")
        .select("*")
        .eq("player_name", playerName);
  
      if (playerStatsError) {
        console.error("Error fetching playerStats:", playerStatsError.message);
      }
      if (!playerStats || playerStats.length === 0) {
        console.warn("No playerStats found for the selected player:", playerName);
        setError("No stats found for the selected player.");
        return;
      }
      console.log("Player Stats:", playerStats);
  
      const positionId = playerStats[0].position_id;
      setPosition(positionId);
  
      // Fetch defense stats
      const defenseTable = positionId === "QB" ? "defense_averages_qb" : "defense_averages";
      const defenseQuery = supabase.from(defenseTable).select("*").eq("team_id", defenseTeam);
      if (positionId !== "QB") {
        defenseQuery.eq("position_id", positionId); // Only include position_id for non-QB positions
      }
  
      const { data: defenseStats, error: defenseStatsError } = await defenseQuery;
      if (defenseStatsError) {
        console.error("Error fetching defenseStats:", defenseStatsError.message);
      }
      if (!defenseStats || defenseStats.length === 0) {
        console.warn("No defenseStats found for team:", defenseTeam);
        setError("No stats found for the selected defense team.");
        return;
      }
      console.log("Defense Stats:", defenseStats);
  
      // Fetch league stats
      const leagueTable = positionId === "QB" ? "all_defense_averages_qb" : "all_defense_averages";
      const leagueQuery = supabase.from(leagueTable).select("*");
      if (positionId !== "QB") {
        leagueQuery.eq("position_id", positionId); // Only include position_id for non-QB positions
      }
  
      const { data: leagueStatsData, error: leagueStatsError } = await leagueQuery.maybeSingle();
      if (leagueStatsError) {
        console.error("Error fetching leagueStats:", leagueStatsError.message);
      }
      if (!leagueStatsData) {
        console.warn("No leagueStats data found in table:", leagueTable);
        setError("No league-wide stats available.");
        return;
      }
      console.log("League Stats Data:", leagueStatsData);
  
      const leagueStats = leagueStatsData;
  
      // Calculate projections
      const playerWeight = 0.7;
      const defenseWeight = 0.3;
      const projection = {};
  
      for (const stat of relevantStats[positionId] || []) {
        const playerStatKey = stat.key;
        const defenseKey = `avg_${stat.key}`;
        const leagueKey = `avg_${stat.key}`;
  
        const playerAvg =
          playerStats.reduce((sum, statEntry) => sum + (statEntry[playerStatKey] || 0), 0) /
          playerStats.length;
  
        const defenseAvg = defenseStats[0]?.[defenseKey];
        const leagueAvg = leagueStats[leagueKey];
  
        console.log(`Key: ${stat.key}, Player Avg: ${playerAvg}, Defense Avg: ${defenseAvg}, League Avg: ${leagueAvg}`);
  
        if (playerAvg && defenseAvg && leagueAvg) {
          const defenseImpact = playerAvg * (defenseAvg / leagueAvg);
          projection[stat.key] = playerAvg * playerWeight + defenseImpact * defenseWeight;
        } else {
          console.warn(`Missing data for stat: ${stat.key}`);
          projection[stat.key] = 0; // Default to 0 if data is missing
        }
      }
  
      setProjections(projection);
  
      // Generate chart data
      if (positionId === "QB") {
        setChartDataQBPrimary([
          {
            category: "Passing Yards",
            Projected: Math.round(projection["passing_yards"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_pass_yds"] || 0,
          },
          {
            category: "Rushing Yards",
            Projected: Math.round(projection["qb_rushing_yards"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_rush_yds"] || 0,
          },
        ]);
  
        setChartDataQBSecondary([
          {
            category: "Passing Attempts",
            Projected: Math.round(projection["passing_attempts"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_pass_attempts"] || 0,
          },
          {
            category: "Completions",
            Projected: Math.round(projection["completions"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_pass_completions"] || 0,
          },
        ]);
      } else {
        setChartDataPrimary([
          {
            category: "Rushing Yards",
            Projected: Math.round(projection["rushing_yards"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_rush_yds"] || 0,
          },
          {
            category: "Receiving Yards",
            Projected: Math.round(projection["receiving_yards"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_reception_yds"] || 0,
          },
        ]);
  
        setChartDataSecondary([
          {
            category: "Receptions",
            Projected: Math.round(projection["receptions"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_receptions"] || 0,
          },
          {
            category: "Rushing Attempts",
            Projected: Math.round(projection["rushing_attempts"] || 0),
            Line: playerLines[playerName.toLowerCase()]?.["player_rush_attempts"] || 0,
          },
        ]);
      }
    } catch (err) {
      console.error("Error during fetchProjections:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const getColumns = () =>
    relevantStats[position]?.map((stat) => ({
      label: stat.label,
      key: stat.key,
      market: mapStatToMarket(stat.label, position), // Map market keys
    })) || [];

  const mapStatToMarket = (label, positionId) => {
    const mapping = {
      "Passing Attempts": "player_pass_attempts",
      "Completions": "player_pass_completions",
      "Passing Yards": "player_pass_yds",
      "Passing TDs": "player_pass_tds",
      "Interceptions": "player_interceptions",
      "Rushing Attempts": positionId === "QB" ? "qb_rushing_attempts" : "player_rush_attempts",
      "Rushing Yards": positionId === "QB" ? "qb_rushing_yards" : "player_rush_yds",
      "Rushing TDs": positionId === "QB" ? "qb_rushing_tds" : "player_rush_tds",
      "Receptions": "player_receptions",
      "Receiving Yards": "player_reception_yds",
      "Receiving TDs": "player_receiving_tds",
    };
    return mapping[label.trim()] || label.toLowerCase();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        textAlign: "center",
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
          padding: 2,
        }}
      >
        <Typography variant="h5">Player Projections</Typography>
        <form
  onSubmit={(e) => {
    e.preventDefault();
    fetchProjections();
  }}
  style={{
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }}
>
  <Box
    sx={{
      display: "flex",
      gap: "20px",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    {/* Search Player Field */}
    <Autocomplete
      freeSolo
      options={suggestions}
      onInputChange={(event, value) => {
        setPlayerName(value);
        fetchSuggestions(value);
      }}
      renderInput={(params) => (
        <TextField {...params} label="Search Player" fullWidth />
      )}
      sx={{ flex: 1, width: '400px' }}
    />

    {/* Defense Team Dropdown */}
    <TextField
      id="defenseTeam"
      select
      label="Defense Team"
      value={defenseTeam}
      onChange={(e) => setDefenseTeam(e.target.value)}
      fullWidth
      sx={{ flex: 1 }}
    >
      {[ // Team list
        { id: "ARI", name: "Cardinals" },
        { id: "ATL", name: "Falcons" },
        { id: "BAL", name: "Ravens" },
        { id: "BUF", name: "Bills" },
        { id: "CAR", name: "Panthers" },
        { id: "CHI", name: "Bears" },
        { id: "CIN", name: "Bengals" },
        { id: "CLE", name: "Browns" },
        { id: "DAL", name: "Cowboys" },
        { id: "DEN", name: "Broncos" },
        { id: "DET", name: "Lions" },
        { id: "GB", name: "Packers" },
        { id: "HOU", name: "Texans" },
        { id: "IND", name: "Colts" },
        { id: "JAC", name: "Jaguars" },
        { id: "KC", name: "Chiefs" },
        { id: "LV", name: "Raiders" },
        { id: "LAC", name: "Chargers" },
        { id: "LAR", name: "Rams" },
        { id: "MIA", name: "Dolphins" },
        { id: "MIN", name: "Vikings" },
        { id: "NE", name: "Patriots" },
        { id: "NO", name: "Saints" },
        { id: "NYG", name: "Giants" },
        { id: "NYJ", name: "Jets" },
        { id: "PHI", name: "Eagles" },
        { id: "PIT", name: "Steelers" },
        { id: "SF", name: "49ers" },
        { id: "SEA", name: "Seahawks" },
        { id: "TB", name: "Buccaneers" },
        { id: "TEN", name: "Titans" },
        { id: "WAS", name: "Commanders" },
      ]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((team) => (
          <MenuItem key={team.id} value={team.id}>
            {team.name}
          </MenuItem>
        ))}
    </TextField>
  </Box>

  {/* Submit Button */}
  <Button type="submit" variant="contained" fullWidth>
    Generate Projections
  </Button>
</form>
      </Box>

      {position === "QB" && chartDataQBPrimary.length > 0 && chartDataQBSecondary.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            margin: "20px auto",
            maxWidth: 1200,
          }}
        >
          <Box sx={{ width: "45%" }}>
            <Typography variant="h6" gutterBottom>
              QB Yards Comparison
            </Typography>
            <BarChart width={500} height={300} data={chartDataQBPrimary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <Tooltip />
              <Bar dataKey="Projected" fill="#28a745" name="Projected" />
              <Bar dataKey="Line" fill="#dc3545" name="Line" />
            </BarChart>
          </Box>

          <Box sx={{ width: "45%" }}>
            <Typography variant="h6" gutterBottom>
              QB Attempts and Completions Comparison
            </Typography>
            <BarChart width={500} height={300} data={chartDataQBSecondary}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <Tooltip />
              <Bar dataKey="Projected" fill="#28a745" name="Projected" />
              <Bar dataKey="Line" fill="#dc3545" name="Line" />
            </BarChart>
          </Box>
        </Box>
      ) : (
        chartDataPrimary.length > 0 &&
        chartDataSecondary.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              margin: "20px auto",
              maxWidth: 1200,
            }}
          >
            <Box sx={{ width: "45%" }}>
              <Typography variant="h6" gutterBottom>
                Yards Comparison
              </Typography>
              <BarChart width={500} height={300} data={chartDataPrimary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <Tooltip />
                <Bar dataKey="Projected" fill="#28a745" name="Projected" />
                <Bar dataKey="Line" fill="#dc3545" name="Line" />
              </BarChart>
            </Box>

            <Box sx={{ width: "45%" }}>
              <Typography variant="h6" gutterBottom>
                Attempts and Receptions Comparison
              </Typography>
              <BarChart width={500} height={300} data={chartDataSecondary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <Tooltip />
                <Bar dataKey="Projected" fill="#28a745" name="Projected" />
                <Bar dataKey="Line" fill="#dc3545" name="Line" />
              </BarChart>
            </Box>
          </Box>
        )
      )}

{Object.keys(projections).length > 0 && (
      <TableContainer component={Paper} sx={{ marginTop: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              <TableCell>Projection</TableCell>
              <TableCell>Player Line</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getColumns().map((col) => {
              const normalizedPlayerName = playerName.trim().toLowerCase();
              let playerLine = playerLines[normalizedPlayerName]?.[col.market] || "N/A";

              // Assign default value of 0.5 for TD rows if the playerLine is "N/A"
              if (
                (col.label === "Rushing TDs" || col.label === "Receiving TDs") &&
                playerLine === "N/A"
              ) {
                playerLine = "0.5";
              }

              return (
                <TableRow key={col.key}>
                  <TableCell>{col.label}</TableCell>
                  <TableCell>{projections[col.key]?.toFixed(2) || "N/A"}</TableCell>
                  <TableCell>{playerLine}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )}

    {/* Footer */}
    <footer>
      <Box
        sx={{
          backgroundColor: "#2a3f54",
          color: "#fff",
          textAlign: "center",
          padding: 2,
          marginTop: "auto",
        }}
      >
        <Typography variant="body2">&copy; 2024 Stats X. All rights reserved.</Typography>
      </Box>
    </footer>
  </Box>
  );
};

export default PlayerProjections;
