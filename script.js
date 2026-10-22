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
