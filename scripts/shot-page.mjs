// Скриншоты всей страницы по секциям: node scripts/_page.mjs <out> [w h]
import { chromium } from "playwright";
const [out, w, h] = [process.argv[2], +(process.argv[3] || 1440), +(process.argv[4] || 900)];
const b = await chromium.launch({ executablePath: process.env.PW_CHROME, args: ["--use-angle=d3d11", "--enable-gpu"] });
const p = await b.newPage({ viewport: { width: w, height: h }, ...(w < 800 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
const errs = []; p.on("pageerror", (e) => errs.push(String(e))); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:3600/", { waitUntil: "networkidle" });
await p.waitForTimeout(1500);
for (const id of ["friends", "adopt", "help", "stories", "faq", "contacts"]) {
  const y = await p.evaluate((id) => { const e = id === "stories" ? document.querySelector("section:nth-of-type(5)") : id === "faq" ? document.querySelector("section:nth-of-type(6)") : document.getElementById(id); return e ? e.getBoundingClientRect().top + scrollY - 40 : null; }, id);
  if (y == null) { console.log("no", id); continue; }
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(1600);
  await p.screenshot({ path: `${out}-${id}.jpg`, type: "jpeg", quality: 80 });
}
// окно знакомства
await p.evaluate((y) => window.scrollTo(0, y), await p.evaluate(() => document.getElementById("friends").getBoundingClientRect().top + scrollY));
await p.waitForTimeout(800);
await p.locator("#friends ul button").first().click();
await p.waitForTimeout(800);
await p.screenshot({ path: `${out}-modal.jpg`, type: "jpeg", quality: 80 });
const sw = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log("hscroll", sw, errs);
await b.close();
