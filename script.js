// ===== 暗色模式切换 =====
const themeBtn = document.getElementById("theme-toggle");

// 页面打开时,优先读取本地保存的偏好
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.dataset.theme = savedTheme;
  updateThemeBtn();
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  // 没保存过偏好时,跟随系统
  document.body.dataset.theme = "dark";
  updateThemeBtn();
}

themeBtn.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = next;
  localStorage.setItem("theme", next);
  updateThemeBtn();
});

function updateThemeBtn() {
  themeBtn.textContent = document.body.dataset.theme === "dark" ? "☀️" : "🌙";
}

// ===== 页脚年份自动更新 =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== 今日运势抽签 =====
const fortuneBtn = document.getElementById("fortune-btn");
const fortuneTube = document.getElementById("fortune-tube");
const fortuneResult = document.getElementById("fortune-result");
const fortuneLevel = document.getElementById("fortune-level");
const fortuneVerse = document.getElementById("fortune-verse");
const fortuneAdvice = document.getElementById("fortune-advice");
const fortuneSwatch = document.getElementById("fortune-swatch");
const fortuneColorName = document.getElementById("fortune-color-name");
const fortuneNumber = document.getElementById("fortune-number");
const fortuneHint = document.getElementById("fortune-hint");

// 签文池:每支签有等级、签文、幸运色和今日建议
const FORTUNES = [
  { level: "大吉", verse: "鸿运当头,万事顺遂。", color: { name: "金色", hex: "#fbbf24" }, advice: "想做的事今天就去做,大胆一点!" },
  { level: "大吉", verse: "春风得意马蹄疾,好运连连。", color: { name: "红色", hex: "#ef4444" }, advice: "适合开始新计划,抓住机会。" },
  { level: "中吉", verse: "福星高照,付出会有回报。", color: { name: "橙色", hex: "#f97316" }, advice: "保持耐心,好事多磨。" },
  { level: "中吉", verse: "柳暗花明,前路渐入佳境。", color: { name: "蓝色", hex: "#3b82f6" }, advice: "遇到困难多换角度想想。" },
  { level: "小吉", verse: "小小的幸运正在路上。", color: { name: "粉色", hex: "#ec4899" }, advice: "保持好心情,好运自然来。" },
  { level: "小吉", verse: "万事开头难,坚持下去就有光。", color: { name: "青色", hex: "#06b6d4" }, advice: "今天适合整理计划,稳步推进。" },
  { level: "小吉", verse: "无心插柳柳成荫,惊喜总在不经意间。", color: { name: "绿色", hex: "#10b981" }, advice: "多留意身边的小机会。" },
  { level: "吉", verse: "诸事平稳,心境安然。", color: { name: "紫色", hex: "#8b5cf6" }, advice: "适合专注学习和积累。" },
  { level: "吉", verse: "云开见日,一切刚刚好。", color: { name: "天蓝", hex: "#0ea5e9" }, advice: "按自己的节奏来,不必着急。" },
  { level: "中平", verse: "平淡是真,细水长流。", color: { name: "灰色", hex: "#94a3b8" }, advice: "今天的努力,是为明天铺路。" },
  { level: "中平", verse: "不慌不忙,稳步前行。", color: { name: "米色", hex: "#e7d8b0" }, advice: "适合复盘最近的学习和生活。" },
  { level: "小凶", verse: "今日宜低调,不宜冲动。", color: { name: "银色", hex: "#cbd5e1" }, advice: "吃点好的,睡个好觉,明天转运!" }
];

// 今天的日期,用作抽签记录的 key(一天只能抽一次)
const todayKey = `fortune-${todayStr()}`;

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function drawFortune() {
  const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  return { ...f, number: Math.floor(Math.random() * 99) + 1 };
}

function showFortune(f) {
  fortuneLevel.textContent = f.level;
  fortuneLevel.dataset.level = f.level;
  fortuneVerse.textContent = `「${f.verse}」`;
  fortuneAdvice.textContent = `今日建议:${f.advice}`;
  fortuneSwatch.style.background = f.color.hex;
  fortuneColorName.textContent = f.color.name;
  fortuneNumber.textContent = f.number;
  fortuneResult.hidden = false;
}

function lockFortune() {
  fortuneBtn.textContent = "明天再来";
  fortuneBtn.disabled = true;
  fortuneHint.textContent = "一天一签,明天再来试试手气吧!";
}

// 打开页面时,如果今天已经抽过,直接展示今天的结果
const saved = localStorage.getItem(todayKey);
if (saved) {
  showFortune(JSON.parse(saved));
  lockFortune();
}

fortuneBtn.addEventListener("click", () => {
  fortuneBtn.disabled = true;
  fortuneTube.classList.add("shaking");
  // 摇一摇之后出签
  setTimeout(() => {
    fortuneTube.classList.remove("shaking");
    const f = drawFortune();
    localStorage.setItem(todayKey, JSON.stringify(f));
    showFortune(f);
    lockFortune();
  }, 1200);
});

// ===== 像素宠物 =====
const petEmoji = document.getElementById("pet-emoji");
const petReaction = document.getElementById("pet-reaction");
const petStatus = document.getElementById("pet-status");
const petHungerBar = document.getElementById("pet-hunger-bar");
const petMoodBar = document.getElementById("pet-mood-bar");
const petNameInput = document.getElementById("pet-name");
const petNameBtn = document.getElementById("pet-name-btn");
const petFeedBtn = document.getElementById("pet-feed");
const petPlayBtn = document.getElementById("pet-play");

const PET_KEY = "pet-state";

// 成长阶段:按领养天数进化
const PET_STAGES = [
  { days: 0, emoji: "🐣" },
  { days: 1, emoji: "🐥" },
  { days: 3, emoji: "🐤" },
  { days: 7, emoji: "🐔" },
  { days: 30, emoji: "🦚" }
];

let pet = loadPet();

function loadPet() {
  const saved = localStorage.getItem(PET_KEY);
  if (saved) return JSON.parse(saved);
  // 第一次来:自动领养一只小宠物
  const now = Date.now();
  return { name: "", adopted: now, hunger: 90, mood: 90, lastSeen: now };
}

function savePet() {
  localStorage.setItem(PET_KEY, JSON.stringify(pet));
}

// 按离线时长结算:每小时饿一点、无聊一点
function applyDecay() {
  const hours = (Date.now() - pet.lastSeen) / 36e5;
  pet.hunger = Math.max(0, pet.hunger - hours * 3);
  pet.mood = Math.max(0, pet.mood - hours * 2);
  pet.lastSeen = Date.now();
  savePet();
}

function petStage() {
  const days = (Date.now() - pet.adopted) / 864e5;
  let stage = PET_STAGES[0];
  for (const s of PET_STAGES) {
    if (days >= s.days) stage = s;
  }
  return { ...stage, days };
}

function updatePet() {
  petEmoji.textContent = petStage().emoji;
  petHungerBar.style.width = pet.hunger + "%";
  petMoodBar.style.width = pet.mood + "%";
  petHungerBar.classList.toggle("low", pet.hunger < 20);
  petMoodBar.classList.toggle("low", pet.mood < 20);
  petNameInput.value = pet.name;

  const ageDays = Math.floor(petStage().days) + 1;
  const name = pet.name || "小宠物";
  if (pet.hunger < 20) {
    petStatus.textContent = `${name}肚子好饿,快喂喂它!`;
    petEmoji.classList.add("hungry");
  } else if (pet.mood < 20) {
    petStatus.textContent = `${name}有点无聊,陪它玩玩吧。`;
    petEmoji.classList.remove("hungry");
  } else {
    petStatus.textContent = `${name} · 来到你家第 ${ageDays} 天,状态不错!`;
    petEmoji.classList.remove("hungry");
  }
}

// 宠物冒泡反应
function react(text) {
  petReaction.textContent = text;
  petReaction.classList.add("show");
  petEmoji.classList.add("bounce");
  setTimeout(() => {
    petReaction.classList.remove("show");
    petEmoji.classList.remove("bounce");
  }, 1400);
}

petFeedBtn.addEventListener("click", () => {
  if (pet.hunger >= 100) {
    react("🍚 已经吃撑啦!");
    return;
  }
  pet.hunger = Math.min(100, pet.hunger + 30);
  savePet();
  updatePet();
  react("🍚 好吃! +❤");
});

petPlayBtn.addEventListener("click", () => {
  if (pet.mood >= 100) {
    react("🎾 玩累啦,休息一下~");
    return;
  }
  pet.mood = Math.min(100, pet.mood + 25);
  savePet();
  updatePet();
  react("🎾 开心! ⭐");
});

petNameBtn.addEventListener("click", () => {
  const name = petNameInput.value.trim();
  if (name) {
    pet.name = name;
    savePet();
    updatePet();
    react(`你好呀,${name}!`);
  }
});

// 开局:结算离线衰减并刷新界面;挂机时每分钟结算一次
applyDecay();
updatePet();
setInterval(() => {
  applyDecay();
  updatePet();
}, 60000);
