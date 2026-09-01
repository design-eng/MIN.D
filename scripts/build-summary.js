/**
 * 주차별 수업 요약 생성기 — 덱을 펼치지 않고 한 장으로 훑는 문서.
 *   node scripts/build-summary.js [--portfolio|--design|--phd] [주차번호 ...]
 *
 * 대본(build-script.js)이 "말할 내용"이라면 이쪽은 "무엇을 다루는가"다.
 * 수업 직전 3분 안에 그 주차 전체를 파악하는 것이 목적이므로 A4 1~2쪽을 넘기지 않는다.
 */
const fs = require("fs");
const path = require("path");

const CONTENT = process.argv.includes("--portfolio") ? "./portfolio-content"
  : process.argv.includes("--design") ? "./design-content"
  : process.argv.includes("--phd") ? "./phd-content"
  : "./week-content";
const { COURSE, WEEK_CONTENT } = require(CONTENT);

const esc = (t) => String(t == null ? "" : t)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const oneline = (t) => esc(String(t || "").replace(/\n/g, " ").trim());

// 장표 한 줄 — 부제가 있으면 부제, 없으면 그 블록이 실제로 하는 말.
// 요약 문서이므로 한 줄을 넘기지 않게 자른다. statement 의 body 처럼 긴 문단이
// 그대로 들어가면 다섯 줄까지 늘어나 한 장에 안 들어간다.
function gist(b) {
  const raw = b.sub || (b.type === "divider" ? b.desc
            : b.type === "statement" ? b.body
            : b.foot) || "";
  const t = String(raw).replace(/\s+/g, " ").trim();
  if (t.length <= 86) return t;
  const cut = t.slice(0, 86);
  const stop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("다 "), cut.lastIndexOf("· "));
  return (stop > 46 ? cut.slice(0, stop + 1) : cut.trimEnd()) + "…";
}

// 블록 유형을 사람 말로
const KIND = {
  divider: "구간", statement: "핵심", steps: "실습", checklist: "점검",
  compare: "비교", cols: "정리", cards3: "정리", rows: "정리",
  twocol: "정리", casebox: "사례",
};

function build(wk) {
  const n = wk.n.padStart(2, "0");

  const sched = wk.schedule.map(([t, w, h]) =>
    `<tr class="${h ? "" : "rest"}"><td>${esc(t)}</td>` +
    `<td>${esc(w)}${h ? `<em>${esc(h)}</em>` : ""}</td></tr>`).join("");

  // 본문 장표 — 표지·시간표·과제 3장을 뺀 나머지가 3번 장표부터다
  const flow = wk.blocks.map((b, i) => {
    const g = oneline(gist(b));
    return `<tr>
      <td class="p">${String(i + 3).padStart(2, "0")}</td>
      <td class="k">${esc(KIND[b.type] || b.type)}</td>
      <td class="t">${oneline(b.title)}${g ? `<em>${g}</em>` : ""}</td>
    </tr>`;
  }).join("");

  const works = wk.blocks.filter((b) => b.type === "steps").map((b) => `
    <div class="work">
      <b>${oneline(b.title)}</b>
      <span>${oneline(b.sub)}</span>
      <p>${b.items.map((it) => `${esc(it.min)} ${esc(it.t)}`).join("  ·  ")}</p>
    </div>`).join("");

  const hw = wk.homework.map((h, i) =>
    `<li><b>${esc(h.t)}</b><span>${oneline(h.d)}</span></li>`).join("");

  const nextTopics = wk.next.topics.map((t) => esc(t)).join(" · ");

  const html = `<html><head><meta charset="utf-8"><title>${esc(COURSE.name)} ${esc(wk.n)}주차 수업 요약</title>
<style>
  @page { size: A4; margin: 13mm 13mm; }
  body { font-family:"Pretendard","Noto Sans KR",sans-serif; color:#111; font-size:9.1pt; line-height:1.48; }
  .rail { display:flex; justify-content:space-between; font-size:7.5pt; letter-spacing:1.8px;
          color:#8A8A8A; text-transform:uppercase; padding-bottom:5px; }
  .rule { border-bottom:1.4px solid #111; }
  h1 { font-size:18pt; font-weight:900; margin:9px 0 5px; letter-spacing:-.3px; }
  .goal { font-size:10pt; color:#111; margin:0 0 9px; max-width:135mm; }
  .meta { display:flex; flex-wrap:wrap; gap:3px 22px; font-size:8.4pt; color:#6E6E6E;
          border-top:1px solid #DCDCDC; border-bottom:1px solid #DCDCDC; padding:5px 0; margin-bottom:11px; }
  .meta b { color:#111; font-weight:500; }
  h2 { font-size:7.5pt; letter-spacing:1.8px; text-transform:uppercase; color:#8A8A8A;
       font-weight:400; margin:0 0 4px; }
  section { margin-bottom:9px; }
  .cols { display:flex; gap:8mm; align-items:flex-start; }
  .cols .left { width:57mm; flex:none; }
  .cols .right { flex:1; min-width:0; }
  tr { break-inside:avoid; }
  table { width:100%; border-collapse:collapse; }
  td { padding:2.4px 6px 2.4px 0; border-bottom:1px solid #EDEDED; vertical-align:top; }
  .sch td:first-child { width:20mm; font-variant-numeric:tabular-nums; font-weight:500; }
  .sch td em { display:block; font-style:normal; color:#8A8A8A; font-size:7.8pt; margin-top:1px; }
  .sch tr.rest td { color:#9B9B9B; font-weight:400; }
  .flow td.p { width:7mm; color:#9B9B9B; font-variant-numeric:tabular-nums; font-size:8.4pt; }
  .flow td.k { width:12mm; font-size:7.5pt; letter-spacing:1px; color:#8A8A8A; padding-top:5px; }
  .flow td.t { font-weight:700; }
  .flow td.t em { display:block; font-style:normal; font-weight:400; color:#6E6E6E;
                  font-size:8.3pt; margin-top:0; line-height:1.4; }
  .work { background:#F2F2F2; padding:6px 9px; margin-bottom:4px; }
  .work b { font-size:10pt; } .work span { color:#6E6E6E; font-size:8.4pt; margin-left:7px; }
  .work p { margin:3px 0 0; font-size:8.6pt; color:#111; }
  ol { margin:0; padding:0; list-style:none; counter-reset:h; }
  ol li { counter-increment:h; padding:3px 0 3px 16px; position:relative; border-bottom:1px solid #EDEDED; }
  ol li::before { content:counter(h); position:absolute; left:0; top:4px;
                  font-size:8pt; color:#9B9B9B; font-variant-numeric:tabular-nums; }
  ol li b { font-weight:700; } ol li span { display:block; color:#6E6E6E; font-size:8.6pt; }
  .due { margin-top:5px; padding-top:5px; border-top:1.4px solid #111; font-weight:700; font-size:9.6pt; }
  .next { background:#111; color:#fff; padding:8px 11px; }
  .next b { font-size:10.5pt; } .next p { margin:3px 0 0; color:#B8B8B8; font-size:8.6pt; }
  /* 본문 장표가 14장을 넘으면 우측 열이 한 장을 넘긴다. 그 주차만 조판을 조인다. */
  body.dense { font-size:8.7pt; line-height:1.4; }
  body.dense .flow td { padding:1.8px 6px 1.8px 0; }
  body.dense .flow td.t em { font-size:7.8pt; line-height:1.32; }
  body.dense .sch td { padding:1.9px 6px 1.9px 0; }
  body.dense h1 { font-size:16.5pt; }
  body.dense .goal { font-size:9.4pt; }
  body.dense section { margin-bottom:7px; }
  body.dense .work { padding:5px 8px; }
  .two { display:flex; gap:9mm; align-items:flex-start; break-inside:avoid; }
  .two > * { flex:1; min-width:0; }
</style></head><body class="${wk.blocks.length >= 14 ? "dense" : ""}">
  <div class="rail"><span>${esc(COURSE.name)} · ${esc(COURSE.audience)}</span><span>WEEK ${n} · 수업 요약</span></div>
  <div class="rule"></div>
  <h1>${oneline(wk.title)}</h1>
  <p class="goal">${oneline(wk.goal)}</p>
  <div class="meta">
    <span><b>진행</b> ${esc(COURSE.session)} · ${oneline(wk.ratio)}</span>
    <span><b>산출물</b> ${oneline(wk.output)}</span>
  </div>

  <div class="cols">
    <div class="left">
      <section><h2>진행</h2><table class="sch">${sched}</table></section>
      ${works ? `<section><h2>실습</h2>${works}</section>` : ""}
    </div>
    <div class="right">
      <section><h2>오늘 다루는 것 — 본문 ${wk.blocks.length}장 (표지·시간표·과제 포함 ${wk.blocks.length + 3}장)</h2>
        <table class="flow">${flow}</table></section>
    </div>
  </div>
  <section class="two">
    <div><h2>과제</h2><ol>${hw}</ol>
      <div class="due">제출 — ${oneline(wk.deadline)}</div></div>
    <div><h2>다음</h2><div class="next">
      <b>${esc(wk.next.label || wk.next.n + "주차")} ${oneline(wk.next.title)}</b>
      <p>${nextTopics}</p>
      <p>미리 준비 — ${oneline(wk.next.prepare)}</p>
    </div></div>
  </section>
</body></html>`;

  const dir = path.join(__dirname, "..", "dist", COURSE.outDir + "-요약");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${COURSE.filePrefix}_${n}주차_수업요약.html`);
  fs.writeFileSync(out, html);
  return out;
}

const want = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const targets = want.length ? WEEK_CONTENT.filter((w) => want.includes(Number(w.n))) : WEEK_CONTENT;
targets.forEach((w) => console.log("생성 완료:", build(w)));
