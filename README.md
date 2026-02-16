# NBA Fantasy Player Comparison Template

A zero-installation, AI-powered tool for comparing NBA players for fantasy basketball. Works instantly in Claude or ChatGPT with beautiful, interactive visualizations.

## 🎯 How It Works

No setup required! Just paste a prompt into Claude or ChatGPT, and the AI will:
1. Fetch current NBA stats from Basketball Reference or other sources
2. Use this template to render a beautiful comparison dashboard
3. Show you exactly who's better for fantasy basketball

## 🚀 Quick Start

Copy and paste this prompt into **Claude** or **ChatGPT**:

---

### Prompt Template

```
I want to compare [PLAYER 1] and [PLAYER 2] for fantasy basketball.

Please:
1. Fetch their current season stats from Basketball Reference (or latest available data)
2. Get these stats for each player: PPG, RPG, APG, SPG, BPG, FG%, FT%, 3PM, TOV, Games Played
3. Use the PlayerComparisonTemplate.jsx component from this GitHub repo to visualize the comparison: [YOUR GITHUB URL]
4. Format the data exactly as specified in the component's JSDoc comment
5. Render the interactive comparison dashboard

If you can't access the GitHub file, here's the component structure you should create:
- Radar chart showing PPG, RPG, APG, SPG, BPG, 3PM
- Head-to-head bar chart for all categories
- Detailed stat cards with winner highlighting
- Fantasy score calculation (weighted: PPG×1, RPG×1.2, APG×1.5, STL×3, BLK×3, 3PM×1, TO×-1)
- Visual winner banner based on total fantasy value
```

---

### Example Usage

**In Claude:**
```
Compare Nikola Jokic and Joel Embiid for fantasy basketball using the format above.
```

**In ChatGPT:**
```
Use the NBA comparison template to compare Luka Doncic and Shai Gilgeous-Alexander.
```

## 📊 What You Get

The template generates a professional dashboard with:

### 1. Player Cards
- Player name, team, position
- Games played
- Calculated fantasy score (weighted algorithm)

### 2. Radar Chart
- Visual comparison across 6 key categories
- Hoverable tooltips with exact values
- Color-coded for each player

### 3. Bar Chart
- Head-to-head stat comparison
- Per-game averages
- Easy to see who dominates each category

### 4. Detailed Stat Breakdown
- 9 stat categories with winner highlighting
- Points, Rebounds, Assists, Steals, Blocks
- 3-Pointers, FG%, FT%, Turnovers

### 5. Winner Declaration
- Overall fantasy value winner
- Based on weighted scoring system

## 🎨 Customization

The template is fully customizable. You can modify:

### Fantasy Scoring Weights
Edit the `calculateFantasyScore` function:
```javascript
const calculateFantasyScore = (player) => {
  return (
    player.ppg * 1.0 +      // Points weight
    player.rpg * 1.2 +      // Rebounds weight
    player.apg * 1.5 +      // Assists weight
    player.spg * 3.0 +      // Steals weight
    player.bpg * 3.0 +      // Blocks weight
    player.three_pm * 1.0 - // 3-pointers weight
    player.tov * 1.0        // Turnovers penalty
  ).toFixed(1);
};
```

### Categories Displayed
Add or remove stats in the data structure and visualization sections.

### Color Scheme
Change player colors in the gradient classes:
- Player 1: `from-blue-500 to-blue-600`
- Player 2: `from-purple-500 to-purple-600`

## 📝 Data Format

The AI should fetch and format data like this:

```javascript
{
  player1: {
    name: "Nikola Jokic",
    team: "DEN",
    position: "C",
    ppg: 26.4,
    rpg: 12.4,
    apg: 9.0,
    spg: 1.4,
    bpg: 0.9,
    fg_pct: 58.3,
    ft_pct: 81.7,
    three_pm: 0.9,
    tov: 3.0,
    gp: 79
  },
  player2: {
    name: "Joel Embiid",
    team: "PHI",
    position: "C",
    ppg: 34.7,
    rpg: 11.0,
    apg: 5.6,
    spg: 1.2,
    bpg: 1.7,
    fg_pct: 52.9,
    ft_pct: 88.3,
    three_pm: 1.3,
    tov: 3.4,
    gp: 66
  },
  season: "2023-24"
}
```

## 🔗 Data Sources

The AI can fetch stats from:
- **Basketball Reference** - Most comprehensive historical data
- **ESPN Stats** - Current season data
- **NBA.com** - Official stats
- **StatMuse** - Natural language stat queries

## 💡 Pro Tips

1. **Specify the season** if comparing historical players
   - "Compare 2015-16 Curry vs 2012-13 LeBron"

2. **Ask for specific scoring formats**
   - "Use points league scoring" vs "Use 9-cat scoring"

3. **Compare multiple players**
   - Modify the template or ask AI to run multiple comparisons

4. **Get injury-adjusted stats**
   - "Compare per-36 minutes" or "Show per-game when healthy"

5. **Export the visualization**
   - Ask AI to provide a shareable link or download option

## 🛠 Advanced: Self-Hosting

If you want even faster performance, you can:

1. Fork this repo
2. Host the `.jsx` file on GitHub Pages or your own domain
3. Update your prompt to reference your hosted URL
4. The AI will fetch directly from your URL

## 📦 Tech Stack

- **React** - Component framework
- **Recharts** - Chart library
- **Tailwind CSS** - Styling (core utilities only)
- Works in both Claude Artifacts and ChatGPT Canvas

## 🤝 Contributing

Want to improve the template? Ideas:
- Add more stat categories (PER, TS%, USG%)
- Include playoff stats
- Add historical trend lines
- Support 3+ player comparisons
- Add different chart types (scatter plots, line graphs)

## 📄 License

MIT - Feel free to use and modify for any purpose!

## 🎯 Why This Approach?

**Zero friction** - No installation, no API keys, no hosting. Just paste a prompt and get instant results.

**AI-powered** - The AI handles data fetching, formatting, and rendering. You just provide the template.

**Universal** - Works in Claude, ChatGPT, and any AI that can render React components.

**Shareable** - Send someone the prompt and they can use it immediately.

---

Made with 🏀 for fantasy basketball enthusiasts
