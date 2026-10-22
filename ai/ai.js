// ===== AI 学习助手 =====
// 后端地址:部署 Cloudflare Worker 后如果 URL 不同,改这里即可
const API_BASE = "https://ai-study.fina1wish.workers.dev";

const chat = document.getElementById("chat");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("send-btn");
const levelBtns = document.querySelectorAll(".level-btn");

let currentLevel = "大学";
let busy = false;

// ===== 暗色模式(和首页同一套逻辑) =====
const themeBtn = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  document.body.dataset.theme = savedTheme;
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.body.dataset.theme = "dark";
}
updateThemeBtn();

themeBtn.addEventListener("click", () => {
  const next = document.body.dataset.theme === "dark" ? "light" : "dark";
  document.body.dataset.theme = next;
  localStorage.setItem("theme", next);
  updateThemeBtn();
});

function updateThemeBtn() {
  themeBtn.textContent = document.body.dataset.theme === "dark" ? "☀️" : "🌙";
}

// ===== 页脚年份 =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== 难度切换 =====
levelBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    levelBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
  });
});

// ===== 对话气泡 =====
function addBubble(role, text) {
  const div = document.createElement("div");
  div.className = `bubble bubble-${role}`;
  div.textContent = text;
  // AI 的回答带一个复制按钮
  if (role === "ai") {
    const actions = document.createElement("div");
    actions.className = "bubble-actions";
    const copy = document.createElement("button");
    copy.className = "copy-btn";
    copy.textContent = "复制";
    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(text).then(() => {
        copy.textContent = "已复制 ✓";
        setTimeout(() => (copy.textContent = "复制"), 1500);
      });
    });
    actions.appendChild(copy);
    div.appendChild(actions);
  }
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

function addThinkingBubble() {
  const div = document.createElement("div");
  div.className = "bubble bubble-ai";
  const span = document.createElement("span");
  span.className = "thinking-dots";
  span.textContent = "AI 思考中";
  div.appendChild(span);
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  return div;
}

// ===== 发送问题 =====
async function ask() {
  const question = questionInput.value.trim();
  if (!question || busy) return;

  busy = true;
  sendBtn.disabled = true;
  addBubble("user", question);
  questionInput.value = "";
  const thinking = addThinkingBubble();

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, level: currentLevel })
    });
    const data = await res.json();
    thinking.remove();

    if (res.ok) {
      addBubble("ai", data.answer);
    } else {
      addBubble("error", data.error || "出错了,稍后再试");
    }
  } catch {
    thinking.remove();
    addBubble("error", "网络连接失败,请检查网络后重试");
  }

  busy = false;
  sendBtn.disabled = false;
  questionInput.focus();
}

sendBtn.addEventListener("click", ask);

// Ctrl + Enter 发送,Enter 换行
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    ask();
  }
});
