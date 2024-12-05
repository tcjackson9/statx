import React, { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "./supabaseClient";
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

// Define relevantStats globally
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
  const [playerName, setPlayerName] = useState("");
  const [defenseTeam, setDefenseTeam] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [projections, setProjections] = useState({});
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

  try {
    // Fetch player stats
    const { data: playerStats } = await supabase
      .from("player_stats")
      .select("*")
      .eq("player_name", playerName);

    if (!playerStats || playerStats.length === 0) {
      throw new Error("No stats found for the selected player.");
    }

    console.log("Player Stats:", playerStats);

    const positionId = playerStats[0].position_id;
    setPosition(positionId);

    // Fetch defense stats
    const defenseTable = positionId === "QB" ? "defense_averages_qb" : "defense_averages";
    const { data: defenseStats } = await supabase
      .from(defenseTable)
      .select("*")
      .eq("team_id", defenseTeam);

    if (!defenseStats || defenseStats.length === 0) {
      throw new Error("No stats found for the selected defense team.");
    }

    console.log("Defense Stats:", defenseStats);

    const leagueTable = positionId === "QB" ? "all_defense_averages_qb" : "all_defense_averages";

    let leagueQuery = supabase.from(leagueTable).select("*").limit(1);

    if (positionId !== "QB") {
      leagueQuery = leagueQuery.eq("position_id", positionId); // Add the filter only for non-QB positions
    }
    
    const { data: leagueStats } = await leagueQuery.maybeSingle();
    
    if (!leagueStats) {
      throw new Error(`No league-wide averages found for table: ${leagueTable}`);
    }
    
    console.log("League Stats:", leagueStats);
    
    // Calculate projections
    const playerWeight = 0.7;
    const defenseWeight = 0.3;
    const projection = {};

    console.log("Projection Calculations Start...");

    // Map QB rushing keys to their actual keys in Player Stats
    const keyMapping = {
      qb_rushing_attempts: "rushing_attempts",
      qb_rushing_yards: "rushing_yards",
      qb_rushing_tds: "rushing_tds",
    };

    for (const stat of relevantStats[positionId] || []) {
        const keyPrefix = "avg_"; // Non-QB positions always use "avg_"
        const playerStatKey = stat.key; // Directly use the key from relevantStats
      
        const playerAvg =
          playerStats.reduce((sum, statEntry) => sum + (statEntry[playerStatKey] || 0), 0) /
          playerStats.length;
      
        const defenseAvg = defenseStats.find((d) => d.position_id === positionId)?.[`${keyPrefix}${stat.key}`];
        const leagueAvg = leagueStats[`${keyPrefix}${stat.key}`];
      
        console.log(`Stat: ${stat.key}, PlayerAvg: ${playerAvg}, DefenseAvg: ${defenseAvg}, LeagueAvg: ${leagueAvg}`);
      
        if (playerAvg && defenseAvg && leagueAvg) {
          const defenseImpact = playerAvg * (defenseAvg / leagueAvg);
          projection[stat.key] = playerAvg * playerWeight + defenseImpact * defenseWeight;
        } else {
          console.warn(`Missing data for stat: ${stat.key}, DefenseAvg: ${defenseAvg}, LeagueAvg: ${leagueAvg}`);
        }
      }
      
      console.log("Final Projections:", projection);
      setProjections(projection);
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
    })) || [];

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
          <Link to="/">Home</Link> | <Link to="/defense">Defense v.s. Position</Link> |{" "}
          <Link to="/player-stats">Player Stats</Link> |{" "}
          <Link to="/player-projections">Player Projections</Link>
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
            maxWidth: "400px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
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
              <TextField {...params} label="Search Player" fullWidth />
            )}
          />
          <label htmlFor="defenseTeam">Select Defense Team</label>
          <TextField
            id="defenseTeam"
            select
            label="Defense Team"
            value={defenseTeam}
            onChange={(e) => setDefenseTeam(e.target.value)}
            fullWidth
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 400, // Limit the height of the dropdown for scrolling
                    overflow: "auto", // Enable scrolling
                  },
                },
              },
            }}
          >
            {[
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
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort teams alphabetically by name
              .map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
          </TextField>

          <Button type="submit" variant="contained" fullWidth>
            Generate Projections
          </Button>
        </form>

        {loading && <Typography>Loading projections...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {Object.keys(projections).length > 0 && (
          <TableContainer component={Paper} sx={{ marginTop: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stat</TableCell>
                  <TableCell>Projection</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getColumns().map((col) => (
                  <TableRow key={col.key}>
                    <TableCell>{col.label}</TableCell>
                    <TableCell>{projections[col.key]?.toFixed(2) || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <footer>
        <Box
          sx={{
            backgroundColor: "#2a3f54",
            color: "#fff",
            textAlign: "center",
            padding: 2,
          }}
        >
          <Typography>&copy; 2024 Stats X. All rights reserved.</Typography>
        </Box>
      </footer>
    </Box>
  );
};

export default PlayerProjections;
