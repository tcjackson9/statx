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

  const fetchDefenseData = async () => {
    if (!selectedTeam || !selectedPosition) {
        alert("Please select both a team and a position.");
        return;
    }

    const url = `https://www.cbssports.com/fantasy/football/stats/posvsdef/${selectedPosition}/${selectedTeam}/teambreakdown/standard`;

    try {
        const response = await fetch(url);
        const html = await response.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // Find the table
        const table = doc.querySelector("table");
        if (!table) {
            console.error("Table not found.");
            alert("No table found on the page.");
            return;
        }

        // Locate the correct header row
        const headerRow = Array.from(table.querySelectorAll("tr.label")).find((row) => {
            const cells = row.querySelectorAll("td");
            return Array.from(cells).every((cell) => !cell.hasAttribute("colspan")); // Exclude category rows
        });

        if (!headerRow) {
            console.error("Correct header row not found.");
            alert("No headers found in the table.");
            return;
        }

        // Map original headers to desired names
        const headerMap = {
            "Att": "Rush Atts.",
            "Yd": ["Rush Yds.", "Rec. Yds"], // Differentiate between rushing and receiving yards
            "Avg": ["Avg Yds/Rush", "Avg Yds/Rec"], // Differentiate averages
            "TD": ["Rush TDs", "Rec. TDs"], // Differentiate touchdowns
            "TARGT": "Targets",
            "RECPT": "Receptions",
            "FPTS": "FPTS",
        };

        // Extract and map headers
        const rawHeaders = Array.from(headerRow.querySelectorAll("td"))
            .map((cell) => cell.textContent.trim())
            .filter((header) => header); // Remove empty headers

        let mappedHeaders = [];
        rawHeaders.forEach((header, index) => {
            if (headerMap[header]) {
                const mapped = Array.isArray(headerMap[header])
                    ? headerMap[header][index % 2] // Alternate between Rush/Rec for duplicate headers
                    : headerMap[header];
                mappedHeaders.push(mapped);
            } else {
                mappedHeaders.push(header); // Keep unmatched headers as-is
            }
        });

        console.log("Mapped Headers:", mappedHeaders);

        // Extract rows
        const rows = Array.from(table.querySelectorAll("tr.row1, tr.row2")).map((row) => {
            const cells = row.querySelectorAll("td");
            return mappedHeaders.reduce((acc, header, index) => {
                let value = cells[index]?.textContent.trim() || "";
                if (header === "Team") {
                    // Remove [+] from the Team field
                    value = value.replace(/\s*\[\+\]$/, "").trim();
                }
                acc[header] = value;
                return acc;
            }, {});
        });

        // Add hidden row functionality and setup toggle symbols
        const processedRows = [];
        rows.forEach((row, index) => {
            const hasWeekValue = row["Week"] !== "";

            // Add an additional field to track visibility
            row.isHidden = !hasWeekValue;

            if (hasWeekValue && row["Week"] !== "Average" && row["Week"] !== "Season") {
                row.rowType = "parent"; // Rows with week values are parent rows
                row.Team = `${row["Team"]} ▼`; // Add ▼ for parent rows
            } else {
                row.rowType = row["Week"] ? "footer" : "child"; // Footer rows or child rows
            }

            processedRows.push(row);
        });

        console.log("Processed Rows:", processedRows);

        setTableHeaders(mappedHeaders);
        setTableRows(processedRows);
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to fetch data. Please try again.");
    }
};

const handleRowClick = (rowIndex) => {
    const updatedRows = [...tableRows];

    // Locate the parent row using the exact index
    const parentRow = updatedRows[rowIndex];

    if (parentRow.rowType !== "parent") return;

    // Toggle child row visibility
    let i = rowIndex + 1;
    while (i < updatedRows.length && updatedRows[i].rowType === "child") {
        updatedRows[i].isHidden = !updatedRows[i].isHidden;
        i++;
    }

    // Update the toggle symbol in the Team column
    parentRow.Team = parentRow.Team.includes("▼")
        ? parentRow.Team.replace("▼", "▲")
        : parentRow.Team.replace("▲", "▼");

    setTableRows(updatedRows);
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
      {/* Header */}
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
        <Typography variant="h5">Compare Defense Stats</Typography>
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
          <TextField
            id="selectedTeam"
            select
            label="Select Team"
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            sx={{ width: "250px" }}
          >
            {teams.map((team) => (
              <MenuItem key={team.value} value={team.value}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>

          {/* V.S. Text */}
          <Typography variant="h6">V.S.</Typography>

          {/* Position Selection Dropdown */}
          <TextField
            id="selectedPosition"
            select
            label="Select Position"
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            sx={{ width: "250px" }}
          >
            {positions.map((position) => (
              <MenuItem key={position.value} value={position.value}>
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
            paddingX: 4, // Adds padding to the sides
            width: "fit-content", // Button width adjusts to its content
            alignSelf: "center", // Center aligns the button in the flex box
        }}
        >
        Compare
        </Button>
      </Box>

      {/* Table of Results */}
      {tableHeaders.length > 0 && tableRows.length > 0 && (
        <TableContainer component={Paper} sx={{ marginTop: 4, maxWidth: "90%", margin: "auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                {tableHeaders.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
                {tableRows
                    .filter((row) => !row.isHidden) // Filter visible rows
                    .map((row, visibleIndex) => {
                    // Get the actual row index from tableRows
                    const actualRowIndex = tableRows.findIndex((r) => r === row);

                    return (
                        <TableRow
                        key={visibleIndex}
                        sx={{
                            backgroundColor:
                            visibleIndex % 2 === 0 ? "rgba(0, 0, 0, 0.04)" : "transparent",
                            cursor: row.rowType === "parent" ? "pointer" : "default",
                        }}
                        onClick={() => row.rowType === "parent" && handleRowClick(actualRowIndex)}
                        >
                        {tableHeaders.map((header, idx) => (
                            <TableCell key={idx}>
                            {header === "Matchup" && row.rowType === "parent"
                                ? row.matchup
                                : row[header]}
                            </TableCell>
                        ))}
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

export default DefenseStats;
