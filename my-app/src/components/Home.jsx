import React, { useState } from "react";
import supabase from "../supabaseClient";
import "./Home.css";
import { Link } from "react-router-dom";



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
    <div>
      <header>
        <div className="logo">
          <h1>Stats X</h1>
        </div>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/player-projections">Player Stats</Link>
        </nav>
      </header>

      <div className="Title">
        <h1>Welcome to StatsX!</h1>
        <p>Your go-to destination for NFL statistical analysis.</p>
      </div>

      <div id="bestMatchups">
        <h2>Best Matchups This Week</h2>
        <button onClick={fetchMatchups} className="button">
          Show Best Matchups
        </button>
        {loading && <p>Loading matchups...</p>}
        {error && <p className="error">{error}</p>}
        <div id="matchupResults">
          {matchupResults.map((matchup, index) => (
            <div key={index} className="matchup-card">
              <h3>{matchup.position}</h3>
              {matchup.results.map((result, idx) => (
                <p key={idx}>
                  {result.label}:{" "}
                  {result.error ? (
                    <span className="error">{result.error}</span>
                  ) : (
                    <strong>
                      {result.team} ({result.value}{" "}
                      {result.label.includes("Receptions")
                        ? "rec/game"
                        : "yds/game"}
                      )
                    </strong>
                  )}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
