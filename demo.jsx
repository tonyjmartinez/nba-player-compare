import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * LIVE DEMO: Jokic vs Embiid Comparison
 * This shows what users will see when they use the prompt
 */

export default function JokicVsEmbiidDemo() {
  // Real 2023-24 season data
  const player1 = {
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
  };

  const player2 = {
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
  };

  // Normalize stats to 0-100 scale for radar chart
  const normalizeStats = (p1, p2) => {
    const stats = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'three_pm'];
    return stats.map(stat => {
      const max = Math.max(p1[stat], p2[stat]) * 1.2;
      return {
        category: stat.toUpperCase().replace('_', ' '),
        [p1.name]: (p1[stat] / max) * 100,
        [p2.name]: (p2[stat] / max) * 100,
        p1Raw: p1[stat],
        p2Raw: p2[stat]
      };
    });
  };

  // Calculate fantasy value score
  const calculateFantasyScore = (player) => {
    return (
      player.ppg * 1.0 +
      player.rpg * 1.2 +
      player.apg * 1.5 +
      player.spg * 3.0 +
      player.bpg * 3.0 +
      player.three_pm * 1.0 -
      player.tov * 1.0
    ).toFixed(1);
  };

  const radarData = normalizeStats(player1, player2);

  const h2hData = [
    { stat: 'PTS', [player1.name]: player1.ppg, [player2.name]: player2.ppg },
    { stat: 'REB', [player1.name]: player1.rpg, [player2.name]: player2.rpg },
    { stat: 'AST', [player1.name]: player1.apg, [player2.name]: player2.apg },
    { stat: 'STL', [player1.name]: player1.spg, [player2.name]: player2.spg },
    { stat: 'BLK', [player1.name]: player1.bpg, [player2.name]: player2.bpg },
    { stat: '3PM', [player1.name]: player1.three_pm, [player2.name]: player2.three_pm },
  ];

  const p1Score = calculateFantasyScore(player1);
  const p2Score = calculateFantasyScore(player2);

  const compareCategory = (stat) => {
    const p1Val = player1[stat];
    const p2Val = player2[stat];
    if (stat === 'tov') return p1Val < p2Val ? 'p1' : p2Val < p1Val ? 'p2' : 'tie';
    return p1Val > p2Val ? 'p1' : p2Val > p1Val ? 'p2' : 'tie';
  };

  const StatCard = ({ label, p1Val, p2Val, stat, suffix = "" }) => {
    const winner = compareCategory(stat);
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
        <div className="flex justify-between items-center">
          <div className={`text-2xl font-bold ${winner === 'p1' ? 'text-blue-600' : 'text-gray-700'}`}>
            {p1Val}{suffix}
          </div>
          <div className="text-gray-400">vs</div>
          <div className={`text-2xl font-bold ${winner === 'p2' ? 'text-purple-600' : 'text-gray-700'}`}>
            {p2Val}{suffix}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fantasy Basketball Comparison</h1>
        <p className="text-gray-600">2023-24 Season Stats</p>
      </div>

      {/* Player Headers */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold mb-1">{player1.name}</div>
          <div className="text-blue-100">{player1.team} · {player1.position}</div>
          <div className="mt-4 text-sm opacity-90">{player1.gp} Games Played</div>
          <div className="mt-2">
            <div className="text-xs text-blue-200">Fantasy Score</div>
            <div className="text-4xl font-bold">{p1Score}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-3xl font-bold mb-1">{player2.name}</div>
          <div className="text-purple-100">{player2.team} · {player2.position}</div>
          <div className="mt-4 text-sm opacity-90">{player2.gp} Games Played</div>
          <div className="mt-2">
            <div className="text-xs text-purple-200">Fantasy Score</div>
            <div className="text-4xl font-bold">{p2Score}</div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Category Comparison</h2>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name={player1.name} dataKey={player1.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
            <Radar name={player2.name} dataKey={player2.name} stroke="#9333ea" fill="#9333ea" fillOpacity={0.5} />
            <Legend />
            <Tooltip content={({ payload }) => {
              if (!payload || payload.length === 0) return null;
              const data = payload[0].payload;
              return (
                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                  <div className="font-semibold mb-1">{data.category}</div>
                  <div className="text-blue-600">{player1.name}: {data.p1Raw}</div>
                  <div className="text-purple-600">{player2.name}: {data.p2Raw}</div>
                </div>
              );
            }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Head-to-Head Bar Chart */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Per Game Stats</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={h2hData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stat" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={player1.name} fill="#3b82f6" />
            <Bar dataKey={player2.name} fill="#9333ea" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Stats Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Detailed Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard label="Points" p1Val={player1.ppg} p2Val={player2.ppg} stat="ppg" />
          <StatCard label="Rebounds" p1Val={player1.rpg} p2Val={player2.rpg} stat="rpg" />
          <StatCard label="Assists" p1Val={player1.apg} p2Val={player2.apg} stat="apg" />
          <StatCard label="Steals" p1Val={player1.spg} p2Val={player2.spg} stat="spg" />
          <StatCard label="Blocks" p1Val={player1.bpg} p2Val={player2.bpg} stat="bpg" />
          <StatCard label="3-Pointers" p1Val={player1.three_pm} p2Val={player2.three_pm} stat="three_pm" />
          <StatCard label="FG%" p1Val={player1.fg_pct} p2Val={player2.fg_pct} stat="fg_pct" suffix="%" />
          <StatCard label="FT%" p1Val={player1.ft_pct} p2Val={player2.ft_pct} stat="ft_pct" suffix="%" />
          <StatCard label="Turnovers" p1Val={player1.tov} p2Val={player2.tov} stat="tov" />
        </div>
      </div>

      {/* Winner Banner */}
      <div className={`rounded-xl p-6 text-white text-center ${
        parseFloat(p1Score) > parseFloat(p2Score) ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
      }`}>
        <div className="text-2xl font-bold mb-2">
          {parseFloat(p1Score) > parseFloat(p2Score) ? player1.name : player2.name} Wins!
        </div>
        <div className="text-sm opacity-90">
          Better overall fantasy value based on weighted scoring
        </div>
      </div>
    </div>
  );
}
