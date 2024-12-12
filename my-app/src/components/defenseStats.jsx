import React, { useState } from "react";
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import "./header.css";
import supabase from "./supabaseClient";

const DefenseStats = () => {
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableRows, setTableRows] = useState([]);

  const teams = [
    { name: "49ers", value: "SF" },
    { name: "Bears", value: "CHI" },
    { name: "Bengals", value: "CIN" },
    { name: "Bills", value: "BUF" },
    { name: "Broncos", value: "DEN" },
    { name: "Browns", value: "CLE" },
    { name: "Buccaneers", value: "TB" },
    { name: "Cardinals", value: "ARI" },
    { name: "Chargers", value: "LAC" },
    { name: "Chiefs", value: "KC" },
    { name: "Colts", value: "IND" },
    { name: "Commanders", value: "WAS" },
    { name: "Cowboys", value: "DAL" },
    { name: "Dolphins", value: "MIA" },
    { name: "Eagles", value: "PHI" },
    { name: "Falcons", value: "ATL" },
    { name: "Giants", value: "NYG" },
    { name: "Jaguars", value: "JAC" },
    { name: "Jets", value: "NYJ" },
    { name: "Lions", value: "DET" },
    { name: "Packers", value: "GB" },
    { name: "Panthers", value: "CAR" },
    { name: "Patriots", value: "NE" },
    { name: "Raiders", value: "LV" },
    { name: "Rams", value: "LAR" },
    { name: "Ravens", value: "BAL" },
    { name: "Saints", value: "NO" },
    { name: "Seahawks", value: "SEA" },
    { name: "Steelers", value: "PIT" },
    { name: "Texans", value: "HOU" },
    { name: "Titans", value: "TEN" },
    { name: "Vikings", value: "MIN" },
  ];

  const positions = [
    { name: "Running Back", value: "RB" },
    { name: "Wide Receiver", value: "WR" },
    { name: "Tight End", value: "TE" },
    { name: "Quarterback", value: "QB" },
  ];

  const fetchPlayerStats = async (week) => {
    const { data: playerStats, error: playerStatsError } = await supabase
      .from("player_stats")
      .select("*")
      .eq("opponent", selectedTeam)
      .eq("position_id", selectedPosition)
      .eq("week", week);
  
    if (playerStatsError) {
      console.error("Error fetching player stats:", playerStatsError.message);
      return [];
    }
  
    // Map to store player averages for comparison
    const playerAveragesMap = {};
  
    // Fetch averages for each player
    for (const player of playerStats) {
      const { data: playerAverage, error: avgError } = await supabase
        .from("player_averages")
        .select("*")
        .eq("player_name", player.player_name)
        .single();
  
      if (avgError) {
        console.error(`Error fetching averages for ${player.player_name}:`, avgError.message);
        continue;
      }
  
      playerAveragesMap[player.player_name] = playerAverage;
    }
  
    // Map stats with colors and position-specific logic
    return playerStats.map((player) => {
      const playerAverage = playerAveragesMap[player.player_name];
      const getComparisonColor = (value, avgValue) => {
        if (avgValue === 0) return "red"; // Default color if no average is available
        if (value > avgValue) return "green";
        if (Math.abs(value - avgValue) <= avgValue * 0.15) return "yellow"; // Within 15% of the average
        return "red";
      };
  
      if (selectedPosition === "QB") {
        return {
          Week: week,
          Matchup: player.player_name,
          "PASSING ATTEMPTS": (
            <span
              style={{
                color: getComparisonColor(
                  player.passing_attempts,
                  playerAverage?.avg_passing_attempts ?? 0
                ),
              }}
            >
              {player.passing_attempts ?? "N/A"}
            </span>
          ),
          "COMPLETIONS": (
            <span
              style={{
                color: getComparisonColor(
                  player.completions,
                  playerAverage?.avg_completions ?? 0
                ),
              }}
            >
              {player.completions ?? "N/A"}
            </span>
          ),
          "PASSING YARDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.passing_yards,
                  playerAverage?.avg_passing_yards ?? 0
                ),
              }}
            >
              {player.passing_yards ?? "N/A"}
            </span>
          ),
          "PASSING TDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.passing_tds,
                  playerAverage?.avg_passing_tds ?? 0
                ),
              }}
            >
              {player.passing_tds ?? "N/A"}
            </span>
          ),
          "INTERCEPTIONS": (
            <span
              style={{
                color: getComparisonColor(
                  player.interceptions,
                  playerAverage?.avg_interceptions ?? 0
                ),
              }}
            >
              {player.interceptions ?? "N/A"}
            </span>
          ),
          "RATE": (
            <span
              style={{
                color: getComparisonColor(
                  player.rate,
                  playerAverage?.avg_rate ?? 0
                ),
              }}
            >
              {player.rate ?? "N/A"}
            </span>
          ),
          "RUSHING ATTEMPTS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_attempts,
                  playerAverage?.avg_qb_rushing_attempts ?? 0
                ),
              }}
            >
              {player.rushing_attempts ?? "N/A"}
            </span>
          ),
          "RUSHING YARDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_yards,
                  playerAverage?.avg_qb_rushing_yards ?? 0
                ),
              }}
            >
              {player.rushing_yards ?? "N/A"}
            </span>
          ),
          "AVG RUSHING YARDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.avg_rushing_yards,
                  playerAverage?.avg_qb_avg_rushing_yards ?? 0
                ),
              }}
            >
              {player.avg_rushing_yards ?? "N/A"}
            </span>
          ),
          "RUSHING TDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_tds,
                  playerAverage?.avg_qb_rushing_tds ?? 0
                ),
              }}
            >
              {player.rushing_tds ?? "N/A"}
            </span>
          ),
          rowType: "child",
          isHidden: true, // Hidden by default
        };
      } else {
        return {
          Week: week,
          Matchup: player.player_name,
          "RUSHING ATTEMPTS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_attempts,
                  playerAverage?.avg_rushing_attempts ?? 0
                ),
              }}
            >
              {player.rushing_attempts ?? 0}
            </span>
          ),
          "TOTAL RUSHING YARDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_yards,
                  playerAverage?.avg_rushing_yards ?? 0
                ),
              }}
            >
              {player.rushing_yards ?? 0}
            </span>
          ),
          "RUSHING TDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.rushing_tds,
                  playerAverage?.avg_rushing_tds ?? 0
                ),
              }}
            >
              {player.rushing_tds ?? 0}
            </span>
          ),
          "TARGETS": (
            <span
              style={{
                color: getComparisonColor(
                  player.targets,
                  playerAverage?.avg_targets ?? 0
                ),
              }}
            >
              {player.targets ?? 0}
            </span>
          ),
          "RECEPTIONS": (
            <span
              style={{
                color: getComparisonColor(
                  player.receptions,
                  playerAverage?.avg_receptions ?? 0
                ),
              }}
            >
              {player.receptions ?? 0}
            </span>
          ),
          "TOTAL RECEIVING YARDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.receiving_yards,
                  playerAverage?.avg_receiving_yards ?? 0
                ),
              }}
            >
              {player.receiving_yards ?? 0}
            </span>
          ),
          "RECEIVING TDS": (
            <span
              style={{
                color: getComparisonColor(
                  player.receiving_tds,
                  playerAverage?.avg_receiving_tds ?? 0
                ),
              }}
            >
              {player.receiving_tds ?? 0}
            </span>
          ),
          "AVG YARDS PER CARRY": (
            <span style={{ fontWeight: "bold" }}>N/A</span>
          ),
          "AVG YARDS PER CATCH": (
            <span style={{ fontWeight: "bold" }}>N/A</span>
          ),
          rowType: "child",
          isHidden: true, // Hidden by default
        };
      }
    });
  };
  
  const fetchDefenseData = async () => {
    if (!selectedTeam || !selectedPosition) {
      alert("Please select both a team and a position.");
      return;
    }
  
    try {
      const leagueTableName =
        selectedPosition === "QB"
          ? "all_defense_averages_qb"
          : "all_defense_averages";
  
      const { data: leagueAverages, error: leagueAvgError } = await supabase
        .from(leagueTableName)
        .select("*");
  
      if (leagueAvgError) {
        console.error("Error fetching league averages:", leagueAvgError.message);
        alert("Failed to fetch league averages.");
        return;
      }
  
      const avgData = leagueAverages[0]; // League-wide averages
      console.log("League-wide averages:", avgData);
  
      const teamStatsTable =
        selectedPosition === "QB" ? "qb_defensive_stats" : "general_defensive_stats";
  
      const { data: teamStats, error: teamStatsError } = await supabase
        .from(teamStatsTable)
        .select("*")
        .eq("team_id", selectedTeam);
  
      if (teamStatsError) {
        console.error("Error fetching team stats:", teamStatsError.message);
        alert("Failed to fetch team stats.");
        return;
      }
  
      const filteredStats =
        selectedPosition === "QB"
          ? teamStats
          : teamStats.filter((stat) => stat.position_id === selectedPosition);
  
      if (!filteredStats || filteredStats.length === 0) {
        alert(`No stats found for ${selectedPosition} position.`);
        return;
      }
  
      const headers = ["Week", "Matchup"];
      const sampleRow = filteredStats[0];
  
      Object.keys(sampleRow).forEach((key) => {
        if (
          key !== "team_id" &&
          key !== "week" &&
          key !== "matchup" &&
          key !== "defensive_stat_id" &&
          key !== "position_id"
        ) {
          headers.push(key.replace(/_/g, " ").toUpperCase());
        }
      });
  
      const allRows = [];
  
      for (let week = 1; week <= 17; week++) {
        const weekStats = filteredStats.filter((row) => row.week === week);
  
        const teamRows = weekStats.map((row) => {
          const rowData = {
            Week: row.week,
            Matchup: `${row.matchup} ▼`, // Add toggle symbol
            rowType: "parent",
            isHidden: false,
          };
  
          headers.slice(2).forEach((header) => {
            const statKey = header.replace(/ /g, "_").toLowerCase();
            const leagueStatKey = `avg_${statKey}`; // Map to league-wide average key
            const teamValue = row[statKey] ?? 0; // Default to 0 for missing stats
            const avgValue = avgData[leagueStatKey] ?? 0; // Use mapped key for league averages
          
            // Debug logs
            console.log(
              `Stat: ${header}, Team Key: ${statKey}, League Key: ${leagueStatKey}, Team Value: ${teamValue}, League Avg: ${avgValue}`
            );
          
            let comparisonColor = "#fff"; // Default color
          
            if (typeof teamValue === "number" && typeof avgValue === "number") {
              if (teamValue > avgValue) {
                comparisonColor = "green";
              } else if (Math.abs(teamValue - avgValue) <= 1.5) {
                comparisonColor = "yellow";
              } else {
                comparisonColor = "red";
              }
            }
          
            rowData[header] = (
              <span style={{ color: comparisonColor, fontWeight: "bold" }}>
                {teamValue}
              </span>
            );
          });
          
  
          return rowData;
        });
  
        const playerStats = await fetchPlayerStats(week);
  
        const playerRows = playerStats.map((player) => ({
          ...player, // Spread player properties first
          Matchup: player.Matchup,
          rowType: "child",
          isHidden: true, // Hidden by default
          Week: "", // Remove or set Week to an empty string
        }));
  
        allRows.push(...teamRows, ...playerRows);
      }
  
      setTableHeaders(headers);
      setTableRows(allRows);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      alert("Failed to fetch data. Please try again.");
    }
  };
  
  const handleRowClick = (actualRowIndex) => {
    const updatedRows = [...tableRows];
    const parentRow = updatedRows[actualRowIndex];
  
    // Ensure the clicked row is a parent row
    if (parentRow.rowType !== "parent") return;
  
    // Toggle visibility of child rows
    let i = actualRowIndex + 1;
    while (i < updatedRows.length && updatedRows[i].rowType === "child") {
      updatedRows[i].isHidden = !updatedRows[i].isHidden;
      i++;
    }
  
    // Update the toggle symbol in the Matchup column
    parentRow.Matchup = parentRow.Matchup.includes("▼")
      ? parentRow.Matchup.replace("▼", "▲")
      : parentRow.Matchup.replace("▲", "▼");
  
    setTableRows(updatedRows);
  };
  
  
  return (
    <Box
  sx={{
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    textAlign: "center",
    backgroundColor: "#1b2735", // Dark blue background
    color: "#d1d1d1", // Light grey text
  }}
>
  {/* Header */}
  <header>
    <Typography variant="h4" sx={{ color: "#f1f1f1" }}>
      Stats X
    </Typography>
    <nav>
      <div className="nav-links">
        <Link to="/" style={{ color: "#f1f1f1" }}>
          Home
        </Link>
        <span style={{ color: "#d1d1d1" }}>|</span>
        <Link to="/defense" style={{ color: "#f1f1f1" }}>
          Defense v.s. Position
        </Link>
        <span style={{ color: "#d1d1d1" }}>|</span>
        <Link to="/player-stats" style={{ color: "#f1f1f1" }}>
          Player Stats
        </Link>
        <span style={{ color: "#d1d1d1" }}>|</span>
        <Link to="/player-projections" style={{ color: "#f1f1f1" }}>
          Player Projections
        </Link>
      </div>
    </nav>
  </header>

  {/* Main Content */}
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
      Compare Defense Stats
    </Typography>
    <Box
      sx={{
        display: "flex",
        gap: "20px",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
      }}
    >
      {/* Team Selection Dropdown */}
      {/* Team Selection Dropdown */}
<TextField
  id="selectedTeam"
  select
  label="Select Team"
  value={selectedTeam}
  onChange={(e) => setSelectedTeam(e.target.value)}
  InputLabelProps={{
    style: { color: "#fff" }, // White text for placeholder
  }}
  sx={{
    width: "250px",
    backgroundColor: "#2a3f54", // Dark grey dropdown background
    "& .MuiSelect-root": {
      color: "#000", // Black text for selected item
    },
    "& .MuiInputBase-input": {
      color: "#fff", // White placeholder text
    },
  }}
>
  {teams.map((team) => (
    <MenuItem key={team.value} value={team.value} sx={{ color: "#000" }}>
      {team.name}
    </MenuItem>
  ))}
</TextField>

{/* Position Selection Dropdown */}
<TextField
  id="selectedPosition"
  select
  label="Select Position"
  value={selectedPosition}
  onChange={(e) => setSelectedPosition(e.target.value)}
  InputLabelProps={{
    style: { color: "#fff" }, // White text for placeholder
  }}
  sx={{
    width: "250px",
    backgroundColor: "#2a3f54", // Dark grey dropdown background
    "& .MuiSelect-root": {
      color: "#000", // Black text for selected item
    },
    "& .MuiInputBase-input": {
      color: "#fff", // White placeholder text
    },
  }}
>
  {positions.map((position) => (
    <MenuItem key={position.value} value={position.value} sx={{ color: "#000" }}>
      {position.name}
    </MenuItem>
  ))}
</TextField>

    </Box>

    {/* Compare Button */}
    <Button
      onClick={fetchDefenseData}
      variant="contained"
      sx={{
        marginTop: 4,
        paddingX: 4,
        width: "fit-content",
        alignSelf: "center",
        backgroundColor: "#3e4e6a", // Dark blue button
        color: "#fff",
        "&:hover": {
          backgroundColor: "#2c3d57", // Darker blue hover effect
        },
      }}
    >
      Compare
    </Button>
  </Box>

  {/* Table of Results */}
  {tableHeaders.length > 0 && tableRows.length > 0 && (
  <TableContainer
    component={Paper}
    sx={{
      marginTop: 4,
      maxWidth: "90%",
      margin: "auto",
      backgroundColor: "#1e2e40", // Dark blue for the table container
    }}
  >
    <Table>
      <TableHead>
        <TableRow
          sx={{
            backgroundColor: "#2a3f54", // Slightly lighter blue for the header
          }}
        >
          {tableHeaders.map((header, index) => (
            <TableCell
              key={index}
              sx={{
                color: "#fff", // White text
                fontWeight: "bold", // Bold text for headers
              }}
            >
              {header}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
  {tableRows.map((row, actualIndex) => {
    if (!row.isHidden) {
      // Determine alternating color based on visible row index
      const isEvenRow =
        tableRows.slice(0, actualIndex).filter((r) => !r.isHidden).length % 2 === 0;

      return (
        <TableRow
          key={actualIndex}
          sx={{
            backgroundColor: isEvenRow ? "#2a3f54" : "#1e2e40", // Alternating row colors
            "&:hover": {
              backgroundColor: "#3e4e6a", // Hover effect
            },
          }}
          onClick={() => row.rowType === "parent" && handleRowClick(actualIndex)}
          style={{
            cursor: row.rowType === "parent" ? "pointer" : "default",
          }}
        >
          {tableHeaders.map((header, idx) => (
            <TableCell key={idx} sx={{ color: "#fff" }}>
              {row[header] !== undefined ? row[header] : "N/A"}
            </TableCell>
          ))}
        </TableRow>
      );
    }
    return null; // Skip rendering hidden rows
  })}
</TableBody>
    </Table>
  </TableContainer>
)}

<Box
  sx={{
    marginTop: 4,
    padding: 2,
    backgroundColor: "#2a3f54", // Dark grey background
    color: "#f1f1f1", // Light text
    borderRadius: "5px",
    textAlign: "center",
    width: "100%", // Full width
    display: "flex",
    flexDirection: "column", // Stack the title and content vertically
    alignItems: "center", // Center align the content
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
      display: "flex", // Create a flex container
      justifyContent: "space-between", // Distribute columns evenly
      gap: 2, // Reduce space between columns
    }}
  >
    {/* Column for Defense as a Whole */}
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Defense as a Whole
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Stack vertically
          gap: 1,
          alignItems: "center", // Center align the values
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853", // Green
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>1.5 Above League Average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#ffea00", // Yellow
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Within 1.5 of League Average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#d32f2f", // Red
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Below 1.5 of League Average</Typography>
        </Box>
      </Box>
    </Box>

    {/* Column for Individual Players */}
    <Box sx={{ flex: 1, textAlign: "center" }}>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        Individual Players
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column", // Stack vertically
          gap: 1,
          alignItems: "center", // Center align the values
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#00c853", // Green
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>1.5 Above Individual Average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#ffea00", // Yellow
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Within 1.5 of Individual Average</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#d32f2f", // Red
              borderRadius: "50%",
              marginRight: 1,
            }}
          />
          <Typography>Below 1.5 of Individual Average</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
</Box>

  {/* Footer */}
  <footer>
    <Box
      sx={{
        backgroundColor: "#1e2e40", // Darker blue footer
        color: "#d1d1d1",
        textAlign: "center",
        padding: 2,
        marginTop: "auto",
      }}
    >
      <Typography variant="body2">
        &copy; 2024 Stats X. All rights reserved.
      </Typography>
    </Box>
  </footer>
</Box>

  );
};

export default DefenseStats;