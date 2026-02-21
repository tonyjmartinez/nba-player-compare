#!/usr/bin/env node
/**
 * NBA Player Compare MCP Server
 *
 * Exposes a single tool: compare_nba_players
 * Returns a Claude artifact (application/vnd.ant.react) with an interactive
 * side-by-side player comparison dashboard (radar chart, bar chart, stat
 * breakdown, and fantasy score).
 *
 * Usage in claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "nba-player-compare": {
 *         "command": "node",
 *         "args": ["/absolute/path/to/nba-player-compare/src/index.js"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// ─── Schema helpers ──────────────────────────────────────────────────────────

const PLAYER_PROPERTIES = {
  name:      { type: 'string',  description: 'Player full name (e.g. "Nikola Jokic")' },
  team:      { type: 'string',  description: 'Team abbreviation (e.g. "DEN", "LAL")' },
  position:  { type: 'string',  description: 'Position (PG, SG, SF, PF, C)' },
  ppg:       { type: 'number',  description: 'Points per game' },
  rpg:       { type: 'number',  description: 'Rebounds per game' },
  apg:       { type: 'number',  description: 'Assists per game' },
  spg:       { type: 'number',  description: 'Steals per game' },
  bpg:       { type: 'number',  description: 'Blocks per game' },
  fg_pct:    { type: 'number',  description: 'Field goal percentage (0–100, e.g. 58.3)' },
  ft_pct:    { type: 'number',  description: 'Free throw percentage (0–100, e.g. 81.7)' },
  three_pm:  { type: 'number',  description: 'Three-pointers made per game' },
  tov:       { type: 'number',  description: 'Turnovers per game' },
  gp:        { type: 'number',  description: 'Games played' },
};

const REQUIRED_PLAYER_FIELDS = [
  'name', 'ppg', 'rpg', 'apg', 'spg', 'bpg',
  'fg_pct', 'ft_pct', 'three_pm', 'tov', 'gp',
];

// ─── Artifact generator ───────────────────────────────────────────────────────

/**
 * Builds a self-contained React component string (Claude artifact) that
 * renders the full comparison dashboard for the two supplied players.
 * The player data is embedded as JSON literals so the artifact has zero
 * external data dependencies.
 */
function buildArtifact(player1, player2, season) {
  const p1 = JSON.stringify(player1);
  const p2 = JSON.stringify(player2);

  return `
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ── Embedded player data (injected by MCP server) ────────────────────────────
const player1 = ${p1};
const player2 = ${p2};
const season  = ${JSON.stringify(season)};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeStats(p1, p2) {
  const stats = ['ppg', 'rpg', 'apg', 'spg', 'bpg', 'three_pm'];
  return stats.map((stat) => {
    const max = Math.max(p1[stat], p2[stat]) * 1.2;
    return {
      category: stat.toUpperCase().replace('_', ' '),
      [p1.name]: max > 0 ? (p1[stat] / max) * 100 : 0,
      [p2.name]: max > 0 ? (p2[stat] / max) * 100 : 0,
      p1Raw: p1[stat],
      p2Raw: p2[stat],
    };
  });
}

function calculateFantasyScore(p) {
  return (
    p.ppg     * 1.0 +
    p.rpg     * 1.2 +
    p.apg     * 1.5 +
    p.spg     * 3.0 +
    p.bpg     * 3.0 +
    p.three_pm * 1.0 -
    p.tov     * 1.0
  ).toFixed(1);
}

function compareCategory(stat, p1, p2) {
  if (stat === 'tov') return p1[stat] < p2[stat] ? 'p1' : p2[stat] < p1[stat] ? 'p2' : 'tie';
  return p1[stat] > p2[stat] ? 'p1' : p2[stat] > p1[stat] ? 'p2' : 'tie';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, p1Val, p2Val, stat, suffix = '' }) {
  const winner = compareCategory(stat, player1, player2);
  return (
    <div style={{ background: '#f9fafb', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: winner === 'p1' ? '#2563eb' : '#374151' }}>
          {p1Val}{suffix}
        </div>
        <div style={{ color: '#9ca3af', fontSize: 14 }}>vs</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: winner === 'p2' ? '#9333ea' : '#374151' }}>
          {p2Val}{suffix}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ player, score, side }) {
  const isP1 = side === 'p1';
  const bg = isP1
    ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
    : 'linear-gradient(135deg, #9333ea, #7c3aed)';
  const sub = isP1 ? '#bfdbfe' : '#e9d5ff';
  return (
    <div style={{ background: bg, borderRadius: 12, padding: 24, color: '#fff', flex: 1 }}>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{player.name}</div>
      <div style={{ color: sub, fontSize: 14 }}>
        {player.team || '—'} · {player.position || '—'}
      </div>
      <div style={{ marginTop: 12, fontSize: 13, opacity: 0.85 }}>
        {player.gp} games played
      </div>
      <div style={{ marginTop: 8 }}>
        <div style={{ fontSize: 11, color: sub }}>Fantasy Score</div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>{score}</div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function App() {
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
  const p1Wins  = parseFloat(p1Score) >= parseFloat(p2Score);
  const winnerName  = p1Wins ? player1.name : player2.name;
  const winnerGrad  = p1Wins
    ? 'linear-gradient(90deg, #3b82f6, #2563eb)'
    : 'linear-gradient(90deg, #9333ea, #7c3aed)';

  const RadarTooltip = ({ payload }) => {
    if (!payload || !payload.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.category}</div>
        <div style={{ color: '#2563eb' }}>{player1.name}: {d.p1Raw}</div>
        <div style={{ color: '#9333ea' }}>{player2.name}: {d.p2Raw}</div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      {/* Title */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', margin: 0 }}>
          Fantasy Basketball Comparison
        </h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>{season} Season Stats</p>
      </div>

      {/* Player cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        <PlayerCard player={player1} score={p1Score} side="p1" />
        <PlayerCard player={player2} score={p2Score} side="p2" />
      </div>

      {/* Radar chart */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 0, marginBottom: 16 }}>
          Category Comparison
        </h2>
        <ResponsiveContainer width="100%" height={380}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
            <Radar name={player1.name} dataKey={player1.name} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.45} />
            <Radar name={player2.name} dataKey={player2.name} stroke="#9333ea" fill="#9333ea" fillOpacity={0.45} />
            <Legend />
            <Tooltip content={<RadarTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar chart */}
      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginTop: 0, marginBottom: 16 }}>
          Per Game Stats
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={h2hData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stat" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={player1.name} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey={player2.name} fill="#9333ea" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stat breakdown grid */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
          Detailed Breakdown
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <StatCard label="Points"     p1Val={player1.ppg}      p2Val={player2.ppg}      stat="ppg" />
          <StatCard label="Rebounds"   p1Val={player1.rpg}      p2Val={player2.rpg}      stat="rpg" />
          <StatCard label="Assists"    p1Val={player1.apg}      p2Val={player2.apg}      stat="apg" />
          <StatCard label="Steals"     p1Val={player1.spg}      p2Val={player2.spg}      stat="spg" />
          <StatCard label="Blocks"     p1Val={player1.bpg}      p2Val={player2.bpg}      stat="bpg" />
          <StatCard label="3-Pointers" p1Val={player1.three_pm} p2Val={player2.three_pm} stat="three_pm" />
          <StatCard label="FG%"        p1Val={player1.fg_pct}   p2Val={player2.fg_pct}   stat="fg_pct"  suffix="%" />
          <StatCard label="FT%"        p1Val={player1.ft_pct}   p2Val={player2.ft_pct}   stat="ft_pct"  suffix="%" />
          <StatCard label="Turnovers"  p1Val={player1.tov}      p2Val={player2.tov}      stat="tov" />
        </div>
      </div>

      {/* Winner banner */}
      <div style={{
        background: winnerGrad,
        borderRadius: 12,
        padding: 24,
        color: '#fff',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
          {winnerName} wins!
        </div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          Better overall fantasy value · weighted: PTS×1 | REB×1.2 | AST×1.5 | STL×3 | BLK×3 | 3PM×1 | TOV×−1
        </div>
      </div>
    </div>
  );
}
`.trim();
}

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'nba-player-compare', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'compare_nba_players',
      description:
        'Generate an interactive NBA player comparison dashboard as a Claude artifact. ' +
        'Accepts per-game stats for two players and returns a React artifact with a radar chart, ' +
        'bar chart, stat breakdown cards, fantasy scores, and a winner declaration. ' +
        'Ideal for fantasy basketball analysis.',
      inputSchema: {
        type: 'object',
        properties: {
          player1: {
            type: 'object',
            description: 'First player stats',
            properties: PLAYER_PROPERTIES,
            required: REQUIRED_PLAYER_FIELDS,
          },
          player2: {
            type: 'object',
            description: 'Second player stats',
            properties: PLAYER_PROPERTIES,
            required: REQUIRED_PLAYER_FIELDS,
          },
          season: {
            type: 'string',
            description: 'Season label shown in the header, e.g. "2024-25"',
            default: '2024-25',
          },
        },
        required: ['player1', 'player2'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name !== 'compare_nba_players') {
    throw new Error(`Unknown tool: ${name}`);
  }

  const { player1, player2, season = '2024-25' } = args;

  // Basic validation
  for (const field of REQUIRED_PLAYER_FIELDS) {
    if (player1[field] === undefined || player1[field] === null) {
      throw new Error(`player1 is missing required field: ${field}`);
    }
    if (player2[field] === undefined || player2[field] === null) {
      throw new Error(`player2 is missing required field: ${field}`);
    }
  }

  const artifactCode = buildArtifact(player1, player2, season);

  return {
    content: [
      {
        type: 'text',
        text: artifactCode,
        // Claude renders this MIME type as an interactive React artifact
        mimeType: 'application/vnd.ant.react',
      },
    ],
  };
});

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
