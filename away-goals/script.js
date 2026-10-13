import { csv } from "https://esm.sh/d3-fetch";
import { select } from "https://esm.sh/d3-selection";
import "https://esm.sh/d3-transition";

const soccerData = await csv(
  "https://cristiansanchez17.github.io/epl-soccer-analytics/combined_football_data.csv"
);

console.log(soccerData.columns);
console.log(soccerData[0]);

const awayGoalsByClub = new Map();

for (const row of soccerData) {
  const club = row.AwayTeam;
  const goals = Number(row.FTAG);

  if (club && Number.isFinite(goals)) {
    awayGoalsByClub.set(
      club,
      (awayGoalsByClub.get(club) || 0) + goals
    );
  }
}

const topFive = Array.from(
  awayGoalsByClub,
  ([club, goals]) => ({ club, goals })
)
  .sort((a, b) => b.goals - a.goals)
  .slice(0, 5);

const svg = select("svg");
const rowCount = topFive.length;
const bottomY = 300;

const clubColors = {
  "Arsenal": "#EF0107",
  "Chelsea": "#034694",
  "Liverpool": "#C8102E",
  "Manchester City": "#6CABDD",
  "Manchester United": "#DA291C",
  "Tottenham": "#132257"
};

svg.attr("width", 800).attr("height", 340);

// Title
svg.selectAll(".chart-title")
  .data([null])
  .join("text")
  .attr("class", "chart-title")
  .attr("x", 20)
  .attr("y", 30)
  .style("font", "bold 20px sans-serif")
  .style("fill", "black")
  .text("Top 5 Clubs by Away Goals");

// Circles move up from the bottom and change to each club's color.
svg.selectAll(".top-away-goal-circle")
  .data(topFive)
  .join("circle")
  .attr("class", "top-away-goal-circle")
  .attr("cx", 35)
  .attr("cy", bottomY)
  .attr("r", (d, i) => 18 - i * 2)
  .style("fill", "yellow")
  .transition()
  .delay((d, i) => (rowCount - 1 - i) * 250)
  .duration(1200)
  .attr("cy", (d, i) => 65 + i * 45)
  .style("fill", d => clubColors[d.club] || "#4169E1");

// Labels move from right to left and change from red to black.
svg.selectAll(".top-away-goal-label")
  .data(topFive)
  .join("text")
  .attr("class", "top-away-goal-label")
  .attr("x", 600)
  .attr("y", (d, i) => 70 + i * 45)
  .style("fill", "red")
  .style("font", "16px sans-serif")
  .text((d, i) => `${i + 1}. ${d.club}: ${d.goals} away goals`)
  .transition()
  .delay((d, i) => (rowCount - 1 - i) * 250)
  .duration(1200)
  .attr("x", 65)
  .style("fill", "black");