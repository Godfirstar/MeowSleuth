<script setup>
import { computed, ref } from 'vue'

const activeTab = ref('victim')
const role = ref('elderly')
const inputMode = ref('chat')
const riskScore = ref(86)
const showPopup = ref(false)

const roleThreshold = {
  elderly: 55,
  student: 65,
  finance: 75,
}

const roleName = {
  elderly: '老人模式',
  student: '学生模式',
  finance: '财会模式',
}

const riskLevel = computed(() => {
  const threshold = roleThreshold[role.value]
  if (riskScore.value >= threshold + 20) return '高风险 / 红色'
  if (riskScore.value >= threshold) return '中风险 / 黄色'
  return '低风险 / 绿色'
})

const riskColor = computed(() => {
  if (riskLevel.value.includes('红色')) return 'red'
  if (riskLevel.value.includes('黄色')) return 'yellow'
  return 'green'
})

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
  const reportContent = `RiskCat 安全监测报告\n\n时间：${new Date().toLocaleString()}\n角色：${roleName[role.value]}\n风险分：${riskScore.value}\n风险等级：${riskLevel.value}\n\n命中诈骗套路点：\n1. 冒充公检法施压\n2. 要求转账到“安全账户”\n3. 索要验证码并强调保密\n\n建议动作：\n- 立即停止转账\n- 通过官方电话核验身份\n- 及时拨打 110 / 96110\n\n证据摘要：\n- ${evidence.screenshot}\n- ${evidence.transcript}\n`

  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'RiskCat-安全监测报告.txt'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <h1>RiskCat · 反诈智能前端演示</h1>
      <div class="tabs">
        <button :class="{ active: activeTab === 'victim' }" @click="activeTab = 'victim'">用户端（受害者）</button>
        <button :class="{ active: activeTab === 'guardian' }" @click="activeTab = 'guardian'">监护人端</button>
        <button :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">后台看板</button>
      </div>
    </header>

    <main v-if="activeTab === 'victim'" class="panel">
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

        <h2>角色设置（阈值差异化）</h2>
        <select v-model="role">
          <option value="elderly">老人（低阈值，更敏感）</option>
          <option value="student">学生（中阈值）</option>
          <option value="finance">财会（高阈值，结合业务场景）</option>
        </select>
      </section>

      <section class="right">
        <div class="risk-card" :class="riskColor">
          <h3>风险等级大卡片</h3>
          <p class="score">风险分：{{ riskScore }}</p>
          <p>{{ riskLevel }}</p>
          <small>当前策略：{{ roleName[role] }}（阈值 {{ roleThreshold[role] }}）</small>
        </div>

        <div class="explain-card">
          <h3>解释型输出（Explainable AI）</h3>
          <h4>命中的诈骗套路点</h4>
          <ul>
            <li>冒充公检法制造紧迫感</li>
            <li>引导转账到所谓“安全账户”</li>
            <li>要求提供验证码并强调“保密”</li>
          </ul>

          <h4>检索到的相似案例 / 法规依据（RAG）</h4>
          <ul>
            <li>案例A：某地“公检法”诈骗，受害人转账 23 万元（话术高度相似）</li>
            <li>依据1：《反电信网络诈骗法》关于涉诈资金止付与预警条款</li>
            <li>依据2：公安部反诈中心公开案例库（近 30 天相似语义命中）</li>
          </ul>

          <h4>建议动作</h4>
          <ul>
            <li>立即停止转账，不进行任何验证码操作</li>
            <li>通过官方渠道核验身份（回拨官方电话）</li>
            <li>立刻拨打 110 / 96110 并保留证据</li>
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

    <main v-else-if="activeTab === 'guardian'" class="panel single">
      <section class="full">
        <h2>监护人端（家属视角）</h2>
        <div class="guardian-grid">
          <div class="card">
            <h3>风险摘要</h3>
            <p>对象：母亲（老人模式）</p>
            <p>当前风险：<strong class="danger">高风险（86）</strong></p>
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
          <div class="card">
            <h3>案例入库（自适应进化）</h3>
            <ol>
              <li>导入新诈骗样本（文本/截图/音频）</li>
              <li>自动清洗与结构化</li>
              <li>向量化入库（Embedding）</li>
              <li>即时可检索（RAG 更新）</li>
            </ol>
            <button>导入样本（模拟）</button>
          </div>
        </div>
      </section>
    </main>

    <div v-if="showPopup" class="modal-mask" @click.self="showPopup = false">
      <div class="modal">
        <h3>高危提醒</h3>
        <p>检测到高风险诈骗话术，请立即停止转账并联系家属核验！</p>
        <button @click="showPopup = false">我知道了</button>
      </div>
    </div>
  </div>
</template>