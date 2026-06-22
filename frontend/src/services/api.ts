import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const SCORE_SALT = import.meta.env.VITE_SCORE_SALT || 'synapse-local-salt';

const api = axios.create({
  baseURL: API_BASE,
});

export type LeaderboardEntry = {
  id: number
  name: string
  level: number
  score: number
  playtime: number
  deflects: number
  nutrients: number
  createdAt: string
}

export type SubmitScorePayload = {
  name: string
  level: number
  score: number
  playtime: number
  deflects: number
  nutrients: number
}

export type SubmitState = {
  status: 'idle' | 'saving' | 'saved' | 'error'
  message: string
}

export async function getStatus() {
  const res = await api.get('/status');
  return res.data;
}

async function hashScore(payload: SubmitScorePayload): Promise<string> {
  const source = `${payload.name}:${payload.level}:${payload.score}:${payload.playtime.toFixed(2)}:${payload.deflects}:${payload.nutrients}:${SCORE_SALT}`
  const data = new TextEncoder().encode(source)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export async function getLeaderboard(level: number = 1): Promise<LeaderboardEntry[]> {
  const res = await api.get<{ leaderboard: LeaderboardEntry[] }>(`/leaderboard?level=${level}`)
  return res.data.leaderboard
}

export async function submitScore(payload: SubmitScorePayload): Promise<LeaderboardEntry> {
  const hash = await hashScore(payload)
  const res = await api.post<{ entry: LeaderboardEntry }>('/leaderboard', { ...payload, hash })
  return res.data.entry
}

export default api;
