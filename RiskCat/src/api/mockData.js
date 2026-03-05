export const roleThreshold = {
  victim: 55,
  guardian: 65,
  dashboard: 75,
}

export const roleName = {
  victim: '用户端（受害者）',
  guardian: '监护人端',
  dashboard: '后台看板',
}

export const defaultRiskScoreByRole = {
  victim: 86,
  guardian: 71,
  dashboard: 63,
}

export const defaultExplainPoints = [
  '冒充公检法制造紧迫感',
  '引导转账到所谓“安全账户”',
  '要求提供验证码并强调“保密”',
]

export const defaultTimelineEvents = [
  { time: '19:23', event: '收到“公检法”恐吓电话并要求转账自证清白', score: 91 },
  { time: '18:40', event: '仿冒客服引导屏幕共享并索要验证码', score: 82 },
  { time: '17:12', event: '兼职刷单返利话术，先返后骗', score: 68 },
  { time: '16:55', event: '短链接钓鱼页面，诱导输入银行卡信息', score: 74 },
]

export const defaultEvidence = {
  screenshot: '截图证据：对方头像伪装为“警方”，要求下载会议软件并开启录屏。',
  transcript: '转写证据："你涉嫌洗钱，现在把资金转入安全账户核查。"',
}

export const dashboardDistribution = {
  high: 42,
  mid: 37,
  low: 21,
}
