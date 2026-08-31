/**
 * 주차별 발표 대본 생성기 — 인쇄해서 손에 들고 진행할 수 있는 한 장짜리 문서.
 *   node scripts/build-script.js [--portfolio|--design] [주차번호 ...]
 *
 * 덱의 스피커 노트와 같은 내용을 쓰되, 슬라이드 번호·제목·시간표를 함께 실어
 * 발표자 보기를 못 쓰는 상황(온라인 화면 공유, 인쇄 진행표)에서도 쓸 수 있게 한다.
 */
const fs = require("fs");
const path = require("path");

const CONTENT = process.argv.includes("--portfolio") ? "./portfolio-content"
  : process.argv.includes("--design") ? "./design-content"
  : "./week-content";
const { COURSE, WEEK_CONTENT } = require(CONTENT);

const esc = (t) => String(t == null ? "" : t)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const para = (t) => esc(t).split(/\n{2,}/).map((s) => `<p>${s.replace(/\n/g, "<br>")}</p>`).join("");

// 덱과 같은 순서로 장표 목록을 만든다 — 표지 · 오늘의 진행 · 본문 · 과제
function slides(wk) {
  const out = [
    { t: wk.title, k: "표지", script: wk.coverScript, note: wk.coverNote },
    { t: "오늘의 " + COURSE.session, k: "TODAY", script: wk.flowScript, note: wk.flowNote,
      table: wk.schedule },
  ];
  wk.blocks.forEach((b) => out.push({
    t: (b.title || "").replace(/\n/g, " "), k: b.kicker || b.type,
    script: b.script, note: b.note,
  }));
  out.push({ t: "과제와 다음 주", k: "HOMEWORK", script: wk.homeworkScript, note: wk.homeworkNote });
  return out;
}

function build(wk) {
  const rows = slides(wk).map((s, i) => `
    <section>
      <div class="no">${String(i + 1).padStart(2, "0")}</div>
      <div class="body">
        <div class="kick">${esc(s.k)}</div>
        <h2>${esc(s.t)}</h2>
        ${s.table ? `<table>${s.table.map(([a, b, c]) =>
          `<tr class="${c ? "" : "rest"}"><td>${esc(a)}</td><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</table>` : ""}
        ${s.script ? `<div class="say">${para(s.script)}</div>`
                   : `<div class="say empty">— 대본 미작성 —</div>`}
        ${s.note ? `<div class="memo"><span>운영 메모</span>${para(s.note)}</div>` : ""}
      </div>
    </section>`).join("");

  const html = `<html><head><meta charset="utf-8"><title>${esc(COURSE.name)} ${esc(wk.n)}주차 발표 대본</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: "Pretendard", sans-serif; color: #111; font-size: 10pt; line-height: 1.65; }
  .head { border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 18px; }
  .head .c { font-size: 8.5pt; letter-spacing: 2px; color: #8A8A8A; }
  .head h1 { font-size: 20pt; margin: 4px 0 6px; }
  .head .m { font-size: 9pt; color: #6E6E6E; }
  section { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #DCDCDC;
            page-break-inside: avoid; }
  .no { width: 30px; flex: none; font-size: 15pt; color: #C0C0C0; }
  .body { flex: 1; }
  .kick { font-size: 7.5pt; letter-spacing: 2px; color: #8A8A8A; }
  h2 { font-size: 13pt; margin: 2px 0 8px; }
  .say p { margin: 0 0 7px; }
  .say.empty { color: #9B9B9B; }
  .memo { margin-top: 8px; padding: 8px 10px; background: #F2F2F2; font-size: 8.5pt; color: #4A4A4A; }
  .memo span { display: block; font-size: 7.5pt; letter-spacing: 1.6px; color: #8A8A8A; margin-bottom: 3px; }
  .memo p { margin: 0 0 5px; }
  table { border-collapse: collapse; margin: 0 0 10px; width: 100%; font-size: 8.5pt; }
  td { border-bottom: 1px solid #E4E4E4; padding: 3px 6px 3px 0; }
  td:first-child { width: 78px; color: #111; }
  td:last-child { width: 90px; color: #6E6E6E; text-align: right; }
  tr.rest td { color: #9B9B9B; }
</style></head><body>
  <div class="head">
    <div class="c">${esc(COURSE.name.toUpperCase())} · WEEK ${esc(wk.n.padStart(2, "0"))}</div>
    <h1>${esc(wk.title)} — 발표 대본</h1>
    <div class="m">${esc(COURSE.audience)} · ${esc(COURSE.session)} · ${esc(wk.ratio)}</div>
  </div>${rows}
</body></html>`;

  const dir = path.join(__dirname, "..", "dist", COURSE.outDir + "-대본");
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${COURSE.filePrefix}_${wk.n.padStart(2, "0")}주차_발표대본.html`);
  fs.writeFileSync(out, html);
  return out;
}

const want = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const targets = want.length ? WEEK_CONTENT.filter((w) => want.includes(Number(w.n))) : WEEK_CONTENT;
targets.forEach((w) => console.log("생성 완료:", build(w)));
