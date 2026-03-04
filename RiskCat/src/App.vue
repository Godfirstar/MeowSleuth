<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'

const roleThreshold = {
  victim: 55,
  guardian: 65,
  dashboard: 75,
}

const roleName = {
  victim: '用户端（受害者）',
  guardian: '监护人端',
  dashboard: '后台看板',
}

const users = ref([])
const currentUser = ref(null)

const authMode = ref('login')
const authForm = ref({
  username: '',
  password: '',
  role: 'victim',
})
const authError = ref('')
const authOk = ref('')

const inputMode = ref('chat')
const riskScore = ref(86)
const animatedScore = ref(22)
const showPopup = ref(false)
const showIntro = ref(true)

let scoreTimer = null
let introTimer = null

const timelineEvents = [
  { time: '19:23', event: '收到“公检法”恐吓电话并要求转账自证清白', score: 91 },
  { time: '18:40', event: '仿冒客服引导屏幕共享并索要验证码', score: 82 },
  { time: '17:12', event: '兼职刷单返利话术，先返后骗', score: 68 },
  { time: '16:55', event: '短链接钓鱼页面，诱导输入银行卡信息', score: 74 },
]

const evidence = {
  screenshot: '截图证据：对方头像伪装为“警方”，要求下载会议软件并开启录屏。',
  transcript: '转写证据："你涉嫌洗钱，现在把资金转入安全账户核查。"',
}

const currentRole = computed(() => currentUser.value?.role || 'victim')

const riskLevel = computed(() => {
  const threshold = roleThreshold[currentRole.value]
  if (riskScore.value >= threshold + 20) return '高风险 / 红色'
  if (riskScore.value >= threshold) return '中风险 / 黄色'
  return '低风险 / 绿色'
})

const riskColor = computed(() => {
  if (riskLevel.value.includes('红色')) return 'red'
  if (riskLevel.value.includes('黄色')) return 'yellow'
  return 'green'
})

function saveUsers() {
  localStorage.setItem('riskcat_users', JSON.stringify(users.value))
}

function saveSession() {
  localStorage.setItem('riskcat_session', JSON.stringify(currentUser.value))
}

function loadLocalData() {
  const rawUsers = localStorage.getItem('riskcat_users')
  const rawSession = localStorage.getItem('riskcat_session')

  users.value = rawUsers ? JSON.parse(rawUsers) : []
  currentUser.value = rawSession ? JSON.parse(rawSession) : null
}

function switchAuthMode(mode) {
  authMode.value = mode
  authError.value = ''
  authOk.value = ''
}

function register() {
  authError.value = ''
  authOk.value = ''

  const { username, password, role } = authForm.value
  if (!username || !password) {
    authError.value = '用户名和密码不能为空'
    return
  }

  if (users.value.some((u) => u.username === username)) {
    authError.value = '用户名已存在，请直接登录'
    return
  }

  users.value.push({ username, password, role })
  saveUsers()
  authOk.value = '注册成功，请登录'
  switchAuthMode('login')
}

function login() {
  authError.value = ''
  authOk.value = ''

  const { username, password } = authForm.value
  const matched = users.value.find((u) => u.username === username && u.password === password)

  if (!matched) {
    authError.value = '账号或密码错误'
    return
  }

  currentUser.value = { username: matched.username, role: matched.role }
  saveSession()
  showIntro.value = true
  introTimer = setTimeout(() => {
    showIntro.value = false
  }, 3000)

  const roleScore = matched.role === 'victim' ? 86 : matched.role === 'guardian' ? 71 : 63
  const prev = animatedScore.value
  riskScore.value = roleScore
  animateScore(prev, roleScore)
}

function logout() {
  currentUser.value = null
  localStorage.removeItem('riskcat_session')
  showIntro.value = false
  authForm.value.password = ''
}

function animateScore(from, to, duration = 900) {
  if (scoreTimer) clearInterval(scoreTimer)
  const start = performance.now()
  const delta = to - from

  scoreTimer = setInterval(() => {
    const progress = Math.min((performance.now() - start) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    animatedScore.value = Math.round(from + delta * eased)

    if (progress >= 1) {
      clearInterval(scoreTimer)
      scoreTimer = null
      animatedScore.value = to
    }
  }, 16)
}

function closeIntro() {
  showIntro.value = false
}

function triggerPopup() {
  showPopup.value = true
}

function mockVoiceBlock() {
  alert('已触发模拟语音阻断：正在播放反诈语音提醒。')
}

function contactGuardian() {
  alert('已发送一键通知给监护人端。')
}

function exportReport() {
  const reportContent = `RiskCat 安全监测报告\n\n时间：${new Date().toLocaleString()}\n身份：${roleName[currentRole.value]}\n风险分：${riskScore.value}\n风险等级：${riskLevel.value}\n\n命中诈骗套路点：\n1. 冒充公检法施压\n2. 要求转账到“安全账户”\n3. 索要验证码并强调保密\n\n建议动作：\n- 立即停止转账\n- 通过官方电话核验身份\n- 及时拨打 110 / 96110\n\n证据摘要：\n- ${evidence.screenshot}\n- ${evidence.transcript}\n`

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'RiskCat-安全监测报告.txt'
  a.click()
  URL.revokeObjectURL(url)
}

watch(
  () => currentRole.value,
  (newRole) => {
    if (!currentUser.value) return
    const nextScore = newRole === 'victim' ? 86 : newRole === 'guardian' ? 71 : 63
    const prev = riskScore.value
    riskScore.value = nextScore
    animateScore(prev, nextScore)
  },
)

onMounted(() => {
  loadLocalData()
  if (currentUser.value) {
    const base = currentRole.value === 'victim' ? 86 : currentRole.value === 'guardian' ? 71 : 63
    riskScore.value = base
    animateScore(22, base, 1200)
    introTimer = setTimeout(() => {
      showIntro.value = false
    }, 3000)
  } else {
    showIntro.value = false
  }
})

onBeforeUnmount(() => {
  if (scoreTimer) clearInterval(scoreTimer)
  if (introTimer) clearTimeout(introTimer)
})
</script>

<template>
  <div class="page">
    <Transition name="intro-fade">
      <div v-if="currentUser && showIntro" class="intro-screen" @click="closeIntro">
        <div class="intro-radar"></div>
        <div class="intro-ring"></div>
        <h1>RiskCat</h1>
        <p>{{ roleName[currentRole] }}</p>
        <small>点击跳过</small>
      </div>
    </Transition>

    <div class="aurora aurora-a"></div>
    <div class="aurora aurora-b"></div>

    <template v-if="!currentUser">
      <section class="auth-wrap">
        <div class="auth-card">
          <h1>RiskCat</h1>
          <p>按身份登录，进入对应端页面</p>

          <div class="auth-tabs">
            <button :class="{ active: authMode === 'login' }" @click="switchAuthMode('login')">登录</button>
            <button :class="{ active: authMode === 'register' }" @click="switchAuthMode('register')">注册</button>
          </div>

          <div class="auth-form">
            <input v-model="authForm.username" placeholder="用户名" />
            <input v-model="authForm.password" type="password" placeholder="密码" />

            <select v-if="authMode === 'register'" v-model="authForm.role">
              <option value="victim">用户端（受害者）</option>
              <option value="guardian">监护人端</option>
              <option value="dashboard">后台看板</option>
            </select>

            <button v-if="authMode === 'login'" class="primary" @click="login">进入系统</button>
            <button v-else class="primary" @click="register">创建账号</button>

            <p v-if="authError" class="msg error">{{ authError }}</p>
            <p v-if="authOk" class="msg ok">{{ authOk }}</p>
          </div>
        </div>
      </section>
    </template>

    <template v-else>
      <header class="topbar float-in">
        <h1>RiskCat · {{ roleName[currentRole] }}</h1>
        <div class="session-box">
          <span>{{ currentUser.username }}</span>
          <button @click="logout">退出登录</button>
        </div>
      </header>

      <main v-if="currentRole === 'victim'" class="panel">
        <section class="left chat-like">
          <h2>多模态输入入口</h2>
          <div class="mode-switch">
            <button :class="{ active: inputMode === 'chat' }" @click="inputMode = 'chat'">粘贴聊天</button>
            <button :class="{ active: inputMode === 'image' }" @click="inputMode = 'image'">上传截图</button>
            <button :class="{ active: inputMode === 'audio' }" @click="inputMode = 'audio'">上传/录制语音</button>
          </div>

          <div class="input-card" v-if="inputMode === 'chat'">
            <textarea rows="6" placeholder="把聊天记录粘贴到这里..."></textarea>
            <button>提交分析</button>
          </div>
          <div class="input-card" v-else-if="inputMode === 'image'">
            <input type="file" accept="image/*" />
            <button>上传并识别截图</button>
          </div>
          <div class="input-card" v-else>
            <input type="file" accept="audio/*" />
            <button>开始录音（模拟）</button>
            <button>上传通话录音</button>
          </div>
        </section>

        <section class="right">
          <div class="risk-card" :class="riskColor">
            <h3>风险等级大卡片</h3>
            <p class="score">风险分：{{ animatedScore }}</p>
            <p>{{ riskLevel }}</p>
            <small>当前身份：{{ roleName[currentRole] }}（阈值 {{ roleThreshold[currentRole] }}）</small>
          </div>

          <div class="explain-card">
            <h3>解释型输出（Explainable AI）</h3>
            <ul>
              <li>冒充公检法制造紧迫感</li>
              <li>引导转账到所谓“安全账户”</li>
              <li>要求提供验证码并强调“保密”</li>
            </ul>
          </div>

          <div class="action-card">
            <h3>分级干预</h3>
            <div class="actions">
              <button @click="triggerPopup">弹窗提醒</button>
              <button @click="mockVoiceBlock">（模拟）语音阻断</button>
              <button @click="contactGuardian">一键联系监护人</button>
            </div>
          </div>
        </section>
      </main>

      <main v-else-if="currentRole === 'guardian'" class="panel single">
        <section class="full">
          <h2>监护人端（家属视角）</h2>
          <div class="guardian-grid">
            <div class="card">
              <h3>风险摘要</h3>
              <p>对象：母亲（老人模式）</p>
              <p>当前风险：<strong class="danger">高风险（{{ animatedScore }}）</strong></p>
              <p>建议：立即电话确认，暂停一切转账行为</p>
            </div>
            <div class="card">
              <h3>证据</h3>
              <p>{{ evidence.screenshot }}</p>
              <p>{{ evidence.transcript }}</p>
            </div>
            <div class="card">
              <h3>建议操作</h3>
              <ul>
                <li>5分钟内电话联系本人</li>
                <li>指导其关闭共享软件并断开通话</li>
                <li>必要时协助报警并前往就近派出所</li>
              </ul>
            </div>
          </div>

          <div class="actions">
            <button>远程弹窗干预</button>
            <button>发起视频确认</button>
            <button>一键拨打 96110</button>
          </div>
        </section>
      </main>

      <main v-else class="panel single">
        <section class="full">
          <h2>后台看板（可控性 / 可运营）</h2>
          <div class="dashboard-grid">
            <div class="card">
              <h3>事件时间线</h3>
              <ul>
                <li v-for="item in timelineEvents" :key="item.time + item.event">
                  {{ item.time }} ｜ {{ item.event }}（{{ item.score }}分）
                </li>
              </ul>
            </div>
            <div class="card">
              <h3>风险分布</h3>
              <p>高风险：42%</p>
              <p>中风险：37%</p>
              <p>低风险：21%</p>
            </div>
            <div class="card">
              <h3>报告中心</h3>
              <p>一键生成《安全监测报告》并下载。</p>
              <button @click="exportReport">下载报告</button>
            </div>
          </div>
        </section>
      </main>

      <Transition name="pop">
        <div v-if="showPopup" class="modal-mask" @click.self="showPopup = false">
          <div class="modal danger-pulse">
            <h3>高危提醒</h3>
            <p>检测到高风险诈骗话术，请立即停止转账并联系家属核验！</p>
            <button @click="showPopup = false">我知道了</button>
          </div>
        </div>
      </Transition>
    </template>
  </div>
</template>
