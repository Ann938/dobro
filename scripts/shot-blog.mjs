// Скриншоты блога: блок на главной (лента + статья), страница блога, одна статья: node scripts/shot-blog.mjs <out> [w h]
import { chromium } from "playwright";
const [out, w, h] = [process.argv[2], +(process.argv[3] || 1440), +(process.argv[4] || 900)];
const b = await chromium.launch({ executablePath: process.env.PW_CHROME });
const p = await b.newPage({ viewport: { width: w, height: h }, ...(w < 800 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3600/", { waitUntil: "networkidle" });
const top = await p.evaluate(() => document.getElementById("blog").getBoundingClientRect().top + scrollY);
// листаем страницу до блока постепенно, чтобы сработали появления
for (let y = 0; y < top; y += 600) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(60); }
await p.evaluate((t) => window.scrollTo(0, t - 40), top);
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-home1.jpg`, type: "jpeg", quality: 80 });
await p.evaluate((t) => window.scrollTo(0, t + (innerWidth < 800 ? 700 : 760)), top);
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}-home2.jpg`, type: "jpeg", quality: 80 });
const sw1 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
await p.goto("http://localhost:3600/blog/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}-all.jpg`, type: "jpeg", quality: 75, fullPage: true });
await p.goto("http://localhost:3600/blog/first-week/", { waitUntil: "networkidle" });
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}-post.jpg`, type: "jpeg", quality: 75, fullPage: true });
const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log("hscroll", sw1, sw, errs);
await b.close();
