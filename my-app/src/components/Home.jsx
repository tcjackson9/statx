import React, { useState } from "react";
import supabase from "./supabaseClient";
import { Link } from "react-router-dom";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import "./header.css"; // Import the reusable CSS

const Home = () => {
  const [matchupResults, setMatchupResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatchups = async () => {
    setLoading(true);
    setError("");
    setMatchupResults([]);

    try {
      const positionQueries = {
        QB: {
          table: "defense_averages_qb",
          stats: ["avg_passing_yards", "avg_qb_rushing_yards"],
          labels: ["Passing Yards", "Rushing Yards"],
        },
        WR: {
          table: "defense_averages",
          stats: ["avg_receiving_yards", "avg_receptions"],
          labels: ["Receiving Yards (WR)", "Receptions (WR)"],
        },
        RB: {
          table: "defense_averages",
          stats: ["avg_rushing_yards", "avg_receiving_yards"],
          labels: ["Rushing Yards (RB)", "Receiving Yards (RB)"],
        },
        TE: {
          table: "defense_averages",
          stats: ["avg_receiving_yards", "avg_receptions"],
          labels: ["Receiving Yards (TE)", "Receptions (TE)"],
        },
      };

      const results = [];

      for (const position in positionQueries) {
        const { table, stats, labels } = positionQueries[position];
        const positionResults = [];

        for (let i = 0; i < stats.length; i++) {
          const stat = stats[i];
          const label = labels[i];

          const { data, error } = await supabase
            .from(table)
            .select(`team_id, ${stat}`)
            .order(stat, { ascending: false })
            .limit(1);

          if (error || !data || data.length === 0) {
            positionResults.push({ label, error: "Error loading data" });
          } else {
            const team = data[0].team_id;
            const value = data[0][stat].toFixed(1);
            positionResults.push({ label, team, value });
          }
        }

        results.push({ position, results: positionResults });
      }

      setMatchupResults(results);
    } catch (err) {
      console.error("Error fetching matchups:", err.message);
      setError("Error loading matchups. Please try again later.");
    } finally {
      setLoading(false);
    }
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
          textAlign: "center",
          padding: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Welcome to StatsX!
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your go-to destination for NFL statistical analysis.
        </Typography>

        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6">Best Matchups This Week</Typography>
          <Button
            onClick={fetchMatchups}
            variant="contained"
            color="primary"
            sx={{ marginTop: 2 }}
          >
            Show Best Matchups
          </Button>

          {loading && <Typography sx={{ marginTop: 2 }}>Loading matchups...</Typography>}
          {error && <Typography sx={{ color: "red", marginTop: 2 }}>{error}</Typography>}

          <Box sx={{ marginTop: 4, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {matchupResults.map((matchup, index) => (
              <Card
                key={index}
                sx={{
                  width: 300,
                  margin: 2,
                  padding: 2,
                  boxShadow: 3,
                  textAlign: "center",
                }}
              >
                <CardContent>
                  <Typography variant="h6">{matchup.position}</Typography>
                  {matchup.results.map((result, idx) => (
                    <Typography key={idx} sx={{ marginTop: 1 }}>
                      {result.label}:{" "}
                      {result.error ? (
                        <span style={{ color: "red" }}>{result.error}</span>
                      ) : (
                        <strong>
                          {result.team} ({result.value}{" "}
                          {result.label.includes("Receptions")
                            ? "rec/game"
                            : "yds/game"}
                          )
                        </strong>
                      )}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>

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

export default Home;
