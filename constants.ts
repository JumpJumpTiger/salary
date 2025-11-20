
import { Quote } from "./types";

export const DEFAULT_SETTINGS = {
  monthlySalary: 10000,
  restDays: [0, 6], // Sunday (0) and Saturday (6)
  workStartHour: "09:00",
  workEndHour: "18:00",
  hasCompletedOnboarding: false,
  privacyMode: false,
  history: [],
};

export const WEEKDAYS = [
  { id: 1, label: '周一', short: 'Mon' },
  { id: 2, label: '周二', short: 'Tue' },
  { id: 3, label: '周三', short: 'Wed' },
  { id: 4, label: '周四', short: 'Thu' },
  { id: 5, label: '周五', short: 'Fri' },
  { id: 6, label: '周六', short: 'Sat' },
  { id: 0, label: '周日', short: 'Sun' },
];

export const FALLBACK_QUOTES: Quote[] = [
  { text: "早上好！新的一天，新的'钱'程！", author: "存钱罐", type: "fun" },
  { text: "午餐时间到，你已赚到一顿大餐！🍔", author: "干饭人", type: "fun" },
  { text: "下午加油！距离下班又近了一步！", author: "时钟", type: "serious" },
  { text: "今日任务完成！为自己点赞！👍", author: "打工人", type: "serious" },
  { text: "每一秒都在变现，你的时间很值钱！", author: "华尔街之狼(伪)", type: "serious" },
  { text: "坚持住，这一秒的工资刚够买颗糖🍬", author: "理财助手", type: "fun" },
];

export const REST_DAY_QUOTES: Quote[] = [
  { text: "今天没有闹钟，只有自由！好好享受休息日~", author: "枕头", type: "rest" },
  { text: "充电中... 🔋 快乐+100", author: "电池", type: "rest" },
  { text: "休息是为了走更远的'钱'途！", author: "哲学家", type: "rest" },
  { text: "今天不谈工作，只谈风月（和美食）。", author: "生活家", type: "rest" },
  { text: "躺平也是一种生产力！", author: "沙发", type: "rest" },
];
