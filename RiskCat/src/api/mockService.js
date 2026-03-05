import {
  defaultEvidence,
  defaultExplainPoints,
  defaultRiskScoreByRole,
  defaultTimelineEvents,
  dashboardDistribution,
} from './mockData'

const USERS_KEY = 'riskcat_users'
const SESSION_KEY = 'riskcat_session'

const wait = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

function readJSON(key, fallback) {
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export async function registerUser({ username, password, role }) {
  await wait()
  const users = readJSON(USERS_KEY, [])

  if (!username || !password) {
    throw new Error('用户名和密码不能为空')
  }

  if (users.some((u) => u.username === username)) {
    throw new Error('用户名已存在，请直接登录')
  }

  users.push({ username, password, role })
  writeJSON(USERS_KEY, users)
  return { ok: true }
}

export async function loginUser({ username, password }) {
  await wait(350)
  const users = readJSON(USERS_KEY, [])
  const matched = users.find((u) => u.username === username && u.password === password)

  if (!matched) {
    throw new Error('账号或密码错误')
  }

  const session = { username: matched.username, role: matched.role }
  writeJSON(SESSION_KEY, session)
  return {
    user: session,
    riskScore: defaultRiskScoreByRole[matched.role],
  }
}

export async function getSession() {
  await wait(120)
  const session = readJSON(SESSION_KEY, null)
  if (!session) return null
  return {
    user: session,
    riskScore: defaultRiskScoreByRole[session.role],
  }
}

export async function logoutUser() {
  await wait(80)
  localStorage.removeItem(SESSION_KEY)
  return { ok: true }
}

export async function analyzeRisk(payload) {
  await wait(500)
  const base = 78
  const bonus = payload?.text?.includes('转账') ? 8 : 0
  return {
    score: Math.min(base + bonus, 95),
    explain: defaultExplainPoints,
    evidence: defaultEvidence,
  }
}

export async function getGuardianData() {
  await wait(260)
  return {
    targetName: '母亲（老人模式）',
    riskScore: 89,
    advice: '立即电话确认，暂停一切转账行为',
    evidence: defaultEvidence,
    actions: ['5分钟内电话联系本人', '指导其关闭共享软件并断开通话', '必要时协助报警并前往就近派出所'],
  }
}

export async function getDashboardData() {
  await wait(260)
  return {
    timelineEvents: defaultTimelineEvents,
    distribution: dashboardDistribution,
  }
}
