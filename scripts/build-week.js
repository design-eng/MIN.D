/**
 * 원광대학교 2026-2 · 학부 3학년「서비스디자인」— 주차별 강의자료 생성기
 *   node scripts/build-week.js [주차번호 ...]      예) node scripts/build-week.js 1 2 3
 *   인자가 없으면 week-content.js에 정의된 모든 주차를 생성한다.
 *
 * 개요 덱(build-deck.js)과 동일한 디자인 토큰을 쓰되, 한 주차 180분 수업을
 * 그대로 진행할 수 있는 분량으로 구성한다.
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
const { COURSE, WEEK_CONTENT } = require("./week-content");

/* ── 디자인 토큰 (개요 덱과 동일) ─────────────────────────── */
const INK = "14161B", INK_SOFT = "262A33", GRAPHITE = "6B7280", MUTED = "9AA0AA";
const LINE = "E4E6EB", SURFACE = "F4F5F7", WHITE = "FFFFFF", ACCENT = "FF4A1C";
const F = "Pretendard", FL = "Pretendard Light", FT = "Pretendard Thin";
const SW = 13.333, M = 0.7, CW = SW - M * 2, BODY_TOP = 1.72;

function buildWeek(wk) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "MIN.D";
  pres.company = "MIN.D";
  pres.title = `${COURSE.name} · ${wk.n}주차 ${wk.title}`;
  pres.subject = COURSE.subject;

  const DECK_TITLE = `${COURSE.name} · ${wk.n}주차 ${wk.title}`;
  let pageNo = 0;

  /* ── 헬퍼 ───────────────────────────────────────────────── */
  const light = () => { const s = pres.addSlide(); s.background = { color: WHITE }; return s; };
  const dark  = () => { const s = pres.addSlide(); s.background = { color: INK };   return s; };

  function head(s, kicker, title, sub) {
    s.addText(kicker, {
      x: M, y: 0.62, w: CW, h: 0.26,
      fontSize: 11, bold: true, color: ACCENT, fontFace: F,
      charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(title, {
      x: M, y: 0.94, w: CW, h: 0.56,
      fontSize: 28, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    if (sub) s.addText(sub, {
      x: M, y: 1.50, w: CW, h: 0.26,
      fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  }
  function foot(s) {
    pageNo += 1;
    s.addText(DECK_TITLE, {
      x: M, y: 6.94, w: 8.5, h: 0.28,
      fontSize: 9, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(String(pageNo).padStart(2, "0"), {
      x: SW - M - 1.2, y: 6.94, w: 1.2, h: 0.28,
      fontSize: 9, color: MUTED, fontFace: F, margin: 0, align: "right", valign: "middle",
    });
  }
  function chip(s, x, y, label, o = {}) {
    const size = o.size || 0.34;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: size, h: size,
      fill: { color: o.fill || INK }, line: { color: o.fill || INK, width: 0.5 }, rectRadius: 0.06,
    });
    s.addText(label, {
      x, y, w: size, h: size,
      fontSize: o.fontSize || 11, bold: true, color: o.color || WHITE, fontFace: F,
      align: "center", valign: "middle", margin: 0,
    });
  }
  function card(s, x, y, w, h, o = {}) {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w, h,
      fill: { color: o.fill || SURFACE },
      line: { color: o.line || (o.fill === INK ? INK : LINE), width: 1 },
      rectRadius: 0.08,
    });
  }
  function bullets(s, items, o) {
    const runs = items.map((t, i) => ({
      text: t,
      options: { bullet: { indent: 14 }, breakLine: i < items.length - 1, paraSpaceAfter: o.gap === undefined ? 8 : o.gap },
    }));
    s.addText(runs, {
      x: o.x, y: o.y, w: o.w, h: o.h,
      fontSize: o.fontSize || 11.5, color: o.color || INK_SOFT, fontFace: F,
      lineSpacingMultiple: 1.2, margin: 0, valign: "top",
    });
  }
  function rule(s, x, y, w, c) {
    s.addShape(pres.ShapeType.rect, { x, y, w, h: 0.01, fill: { color: c || LINE }, line: { color: c || LINE, width: 0 } });
  }

  /* ── 1. 표지 ────────────────────────────────────────────── */
  {
    const s = dark();
    s.addText(wk.n.padStart(2, "0"), {
      x: 7.9, y: 0.55, w: 5.0, h: 6.4,
      fontSize: 255, color: INK_SOFT, fontFace: FT, align: "right", valign: "middle", margin: 0,
    });
    s.addText(`WEEK ${wk.n.padStart(2, "0")}  ·  PHASE ${wk.phase} ${wk.phaseName}`, {
      x: M, y: 1.62, w: 7.6, h: 0.3,
      fontSize: 12, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.6, margin: 0,
    });
    s.addText(wk.title, {
      x: M, y: 1.90, w: 8.0, h: 1.34,
      fontSize: wk.title.length > 13 ? 34 : 42,
      bold: true, color: WHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.16, valign: "middle",
    });
    s.addText(wk.goal, {
      x: M, y: 3.32, w: 7.8, h: 0.7,
      fontSize: 17, color: "C9CDD6", fontFace: FL, margin: 0, lineSpacingMultiple: 1.24, valign: "top",
    });
    rule(s, M, 4.2, 3.2, "3A3F4B");
    [["과목", COURSE.name + " · 학부 3학년"], ["오늘", "3시간 — " + wk.ratio], ["제출물", wk.output]]
      .forEach(([k, v], i) => {
        const y = 4.44 + i * 0.42;
        s.addText(k, { x: M, y, w: 1.0, h: 0.34, fontSize: 11, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle" });
        s.addText(v, { x: M + 1.1, y, w: 7.0, h: 0.34, fontSize: 12.5, color: "DDE0E6", fontFace: F, margin: 0, valign: "middle" });
      });
    s.addNotes(wk.coverNote);
  }

  /* ── 2. 오늘의 3시간 (실제 시각 시간표) ─────────────────── */
  {
    const s = light();
    head(s, "TODAY", "오늘의 3시간", wk.ratio);
    const n = wk.schedule.length;
    const rowH = Math.min(0.62, (6.42 - BODY_TOP - 0.16) / n);
    wk.schedule.forEach(([time, what, how], i) => {
      const y = BODY_TOP + 0.16 + i * rowH;
      const rest = !how;
      s.addText(time, {
        x: M, y, w: 1.75, h: rowH,
        fontSize: 11, bold: !rest, color: rest ? MUTED : ACCENT, fontFace: F, margin: 0, valign: "middle",
      });
      s.addText(what, {
        x: M + 1.9, y, w: CW - 1.9 - 2.5, h: rowH,
        fontSize: rest ? 11 : 13, bold: !rest, color: rest ? MUTED : INK, fontFace: F, margin: 0, valign: "middle",
      });
      if (how) s.addText(how, {
        x: SW - M - 2.5, y, w: 2.5, h: rowH,
        fontSize: 11, color: GRAPHITE, fontFace: F, align: "right", margin: 0, valign: "middle",
      });
      if (i < n - 1) rule(s, M, y + rowH - 0.02, CW, rest ? "F0F1F4" : LINE);
    });
    foot(s);
    s.addNotes(wk.flowNote);
  }

  /* ── 3~. 본문 — 콘텐츠 타입별 렌더 ──────────────────────── */
  const R = {
    divider(b) {
      const s = dark();
      s.addText(b.num, { x: SW - M - 4.2, y: 1.0, w: 4.2, h: 5.5, fontSize: 255, color: INK_SOFT, fontFace: FT, align: "right", valign: "middle", margin: 0 });
      s.addText(b.kicker, { x: M, y: 2.72, w: 8.0, h: 0.3, fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0, valign: "middle" });
      s.addText(b.title, { x: M, y: 3.1, w: 8.0, h: 0.8, fontSize: 42, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle" });
      s.addText(b.desc, { x: M, y: 4.0, w: 7.4, h: 0.7, fontSize: 13.5, color: "AEB4BF", fontFace: F, margin: 0, lineSpacingMultiple: 1.3, valign: "top" });
      if (b.note) s.addNotes(b.note);
    },

    cards3(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length, g = 0.4;
      const cw = (CW - g * (n - 1)) / n;
      b.items.forEach((it, i) => {
        const x = M + i * (cw + g);
        const isDark = b.dark === i;
        card(s, x, BODY_TOP + 0.18, cw, 3.32, isDark ? { fill: INK } : {});
        chip(s, x + 0.42, BODY_TOP + 0.48, it.n, { fill: isDark ? ACCENT : INK, size: 0.4, fontSize: 12 });
        s.addText(it.t, { x: x + 0.42, y: BODY_TOP + 1.02, w: cw - 0.84, h: 0.5, fontSize: 17, bold: true, color: isDark ? WHITE : INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.14, valign: "top" });
        s.addText(it.d, { x: x + 0.42, y: BODY_TOP + 1.56, w: cw - 0.84, h: 1.8, fontSize: 11.5, color: isDark ? "AEB4BF" : GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.3, valign: "top" });
      });
      if (b.foot) s.addText(b.foot, { x: M, y: 5.62, w: CW, h: 0.48, fontSize: 13, bold: true, color: ACCENT, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top" });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    rows(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length;
      // 하단 강조문이 있으면 행 영역을 더 위에서 끊어 겹침을 막는다
      const rowsBottom = b.foot ? 6.02 : 6.5;
      const rowH = Math.min(0.94, (rowsBottom - BODY_TOP - 0.14) / n);
      const footY = BODY_TOP + 0.14 + n * rowH + 0.14;
      b.items.forEach((it, i) => {
        const y = BODY_TOP + 0.14 + i * rowH;
        chip(s, M, y + 0.12, it.n, { size: 0.34, fontSize: 10.5 });
        s.addText(it.t, { x: M + 0.6, y: y + 0.02, w: it.tag ? 8.2 : 10.8, h: 0.34, fontSize: 14.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
        s.addText(it.d, { x: M + 0.6, y: y + 0.36, w: it.tag ? 8.2 : 10.8, h: 0.32, fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle" });
        if (it.tag) s.addText(it.tag, { x: SW - M - 2.4, y: y + 0.12, w: 2.4, h: 0.34, fontSize: 11, bold: true, color: ACCENT, fontFace: F, align: "right", margin: 0, valign: "middle" });
        if (i < n - 1) rule(s, M, y + rowH - 0.06, CW);
      });
      if (b.foot) s.addText(b.foot, { x: M, y: footY, w: CW, h: 0.44, fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top" });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    compare(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const colW = (CW - 0.44) / 2;
      const top = BODY_TOP + (b.sub ? 0.06 : -0.1);
      const n = b.rows.length;
      const h = 0.86 + n * 0.72;
      card(s, M, top, colW, h, { fill: SURFACE });
      s.addText(b.leftTitle, { x: M + 0.44, y: top + 0.3, w: colW - 0.88, h: 0.4, fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
      card(s, M + colW + 0.44, top, colW, h, { fill: WHITE, line: LINE });
      s.addText(b.rightTitle, { x: M + colW + 0.88, y: top + 0.3, w: colW - 0.88, h: 0.4, fontSize: 17, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle" });
      b.rows.forEach(([k, good, bad], i) => {
        const y = top + 0.9 + i * 0.72;
        s.addText(k, { x: M + 0.44, y, w: 2.2, h: 0.3, fontSize: 10, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle" });
        s.addText(good, { x: M + 0.44, y: y + 0.26, w: colW - 0.88, h: 0.42, fontSize: 11.5, color: INK_SOFT, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top" });
        s.addText(k, { x: M + colW + 0.88, y, w: 2.2, h: 0.3, fontSize: 10, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle" });
        s.addText(bad, { x: M + colW + 0.88, y: y + 0.26, w: colW - 0.88, h: 0.42, fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top" });
        if (i < n - 1) { rule(s, M + 0.44, y + 0.66, colW - 0.88, "DCDEE3"); rule(s, M + colW + 0.88, y + 0.66, colW - 0.88, LINE); }
      });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    twocol(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const colW = (CW - 0.44) / 2;
      const h = 4.1;
      card(s, M, BODY_TOP + 0.1, colW, h, { fill: WHITE, line: LINE });
      s.addText(b.leftTitle, { x: M + 0.46, y: BODY_TOP + 0.46, w: colW - 0.92, h: 0.4, fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
      bullets(s, b.left, { x: M + 0.46, y: BODY_TOP + 1.0, w: colW - 0.92, h: 3.0, fontSize: 12, gap: 11 });
      card(s, M + colW + 0.44, BODY_TOP + 0.1, colW, h, { fill: SURFACE });
      s.addText(b.rightTitle, { x: M + colW + 0.9, y: BODY_TOP + 0.46, w: colW - 0.92, h: 0.4, fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
      bullets(s, b.right, { x: M + colW + 0.9, y: BODY_TOP + 1.0, w: colW - 0.92, h: 3.0, fontSize: 12, gap: 11 });
      if (b.foot) s.addText(b.foot, { x: M, y: 6.06, w: CW, h: 0.44, fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle" });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    statement(b) {
      const s = dark();
      s.addText(b.kicker, { x: M, y: 2.36, w: 10.0, h: 0.3, fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0, valign: "middle" });
      s.addText(b.title, { x: M, y: 2.78, w: 11.0, h: 1.5, fontSize: 34, bold: true, color: WHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.22, valign: "top" });
      if (b.body) s.addText(b.body, { x: M, y: 4.42, w: 10.4, h: 1.0, fontSize: 14, color: "AEB4BF", fontFace: F, margin: 0, lineSpacingMultiple: 1.34, valign: "top" });
      if (b.note) s.addNotes(b.note);
    },

    steps(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length;
      const rowH = Math.min(1.06, (6.2 - BODY_TOP) / n);
      b.items.forEach((it, i) => {
        const y = BODY_TOP + 0.16 + i * rowH;
        card(s, M, y, CW, rowH - 0.16, i === n - 1 ? { fill: INK } : {});
        const isDark = i === n - 1;
        s.addText(it.min, { x: M + 0.4, y: y + 0.1, w: 1.2, h: rowH - 0.36, fontSize: 20, color: ACCENT, fontFace: FL, margin: 0, valign: "middle" });
        s.addText(it.t, { x: M + 1.7, y: y + 0.1, w: 3.6, h: rowH - 0.36, fontSize: 14.5, bold: true, color: isDark ? WHITE : INK, fontFace: F, margin: 0, valign: "middle" });
        s.addText(it.d, { x: M + 5.5, y: y + 0.1, w: CW - 5.9, h: rowH - 0.36, fontSize: 11.5, color: isDark ? "AEB4BF" : GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.24, valign: "middle" });
      });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    cols(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length, g = 0.36;
      const cw = (CW - g * (n - 1)) / n;
      const ch = b.foot ? 3.86 : 4.24;
      b.items.forEach((it, i) => {
        const x = M + i * (cw + g);
        const isDark = b.dark === i;
        card(s, x, BODY_TOP + 0.14, cw, ch, isDark ? { fill: INK } : {});
        s.addText(it.t, {
          x: x + 0.38, y: BODY_TOP + 0.42, w: cw - 0.76, h: 0.46,
          fontSize: 17, bold: true, color: isDark ? WHITE : INK, fontFace: F, margin: 0, valign: "middle",
        });
        s.addText(it.sub, {
          x: x + 0.38, y: BODY_TOP + 0.9, w: cw - 0.76, h: 0.34,
          fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, lineSpacingMultiple: 1.15, valign: "top",
        });
        rule(s, x + 0.38, BODY_TOP + 1.34, cw - 0.76, isDark ? "3A3F4B" : "DCDEE3");
        bullets(s, it.items, {
          x: x + 0.38, y: BODY_TOP + 1.5, w: cw - 0.76, h: ch - 1.7,
          fontSize: 11.5, gap: 9, color: isDark ? WHITE : INK_SOFT,
        });
      });
      if (b.foot) s.addText(b.foot, {
        x: M, y: 6.14, w: CW, h: 0.46,
        fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
      });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    casebox(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      card(s, M, BODY_TOP + 0.14, CW, 1.12, { fill: INK });
      s.addText("여정", {
        x: M + 0.44, y: BODY_TOP + 0.32, w: 1.4, h: 0.28,
        fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
      });
      s.addText(b.journey, {
        x: M + 0.44, y: BODY_TOP + 0.62, w: CW - 0.88, h: 0.5,
        fontSize: 12, color: WHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
      });
      const n = b.items.length, g = 0.36;
      const cw = (CW - g * (n - 1)) / n;
      const cy = BODY_TOP + 1.5;
      b.items.forEach((it, i) => {
        const x = M + i * (cw + g);
        card(s, x, cy, cw, 2.86, { fill: WHITE, line: LINE });
        chip(s, x + 0.36, cy + 0.34, String(i + 1), { size: 0.32, fontSize: 10.5 });
        s.addText(it.t, {
          x: x + 0.78, y: cy + 0.34, w: cw - 1.14, h: 0.32,
          fontSize: 13.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
        });
        s.addText(it.d, {
          x: x + 0.36, y: cy + 0.86, w: cw - 0.72, h: 1.8,
          fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.3, valign: "top",
        });
      });
      if (b.foot) s.addText(b.foot, {
        x: M, y: 6.5, w: CW, h: 0.4,
        fontSize: 12, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
      });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    checklist(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const colW = (CW - 0.44) / 2;
      const half = Math.ceil(b.items.length / 2);
      b.items.forEach((it, i) => {
        const col = i < half ? 0 : 1;
        const idx = i < half ? i : i - half;
        const x = M + col * (colW + 0.44);
        const y = BODY_TOP + 0.2 + idx * 0.8;
        s.addShape(pres.ShapeType.roundRect, { x, y, w: colW, h: 0.64, fill: { color: SURFACE }, line: { color: SURFACE, width: 0 }, rectRadius: 0.08 });
        chip(s, x + 0.3, y + 0.15, String(i + 1).padStart(2, "0"), { size: 0.34, fontSize: 10, fill: ACCENT });
        s.addText(it, { x: x + 0.78, y, w: colW - 1.1, h: 0.64, fontSize: 12, color: INK, fontFace: F, margin: 0, valign: "middle" });
      });
      if (b.foot) s.addText(b.foot, { x: M, y: 6.1, w: CW, h: 0.44, fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle" });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },
  };

  wk.blocks.forEach((b) => R[b.type](b));

  /* ── 마지막. 과제와 다음 주 ─────────────────────────────── */
  {
    const s = light();
    head(s, "HOMEWORK", "과제와 다음 주", wk.homeworkSub);
    const lw = 6.9;
    wk.homework.forEach((h, i) => {
      const y = BODY_TOP + 0.16 + i * 1.12;
      card(s, M, y, lw, 0.98, {});
      chip(s, M + 0.36, y + 0.3, String(i + 1), { size: 0.36, fontSize: 11, fill: ACCENT });
      s.addText(h.t, {
        x: M + 0.86, y: y + 0.1, w: lw - 1.24, h: 0.36,
        fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
      });
      s.addText(h.d, {
        x: M + 0.86, y: y + 0.44, w: lw - 1.24, h: 0.46,
        fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.22, valign: "top",
      });
    });
    const subY = BODY_TOP + 0.16 + wk.homework.length * 1.12;
    s.addText("제출 — " + wk.deadline, {
      x: M, y: subY + 0.06, w: lw, h: 0.36,
      fontSize: 12, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });

    const rx = M + lw + 0.44;
    const rw = CW - lw - 0.44;
    // 다음 주 항목 수에 따라 카드 높이와 구분선 위치를 계산한다 (6개까지 안전)
    const nT = wk.next.topics.length;
    const tFont = nT >= 6 ? 11 : 11.5;
    const tGap = nT >= 6 ? 4 : 6;
    const perItem = nT >= 6 ? 0.28 : 0.32;
    const ruleY = BODY_TOP + 2.06 + nT * perItem + 0.08;
    card(s, rx, BODY_TOP + 0.16, rw, ruleY + 0.9 - (BODY_TOP + 0.16), { fill: INK });
    s.addText("NEXT WEEK", {
      x: rx + 0.42, y: BODY_TOP + 0.46, w: rw - 0.84, h: 0.28,
      fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(wk.next.n + "주차", {
      x: rx + 0.42, y: BODY_TOP + 0.78, w: rw - 0.84, h: 0.44,
      fontSize: 26, color: WHITE, fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText(wk.next.title, {
      x: rx + 0.42, y: BODY_TOP + 1.28, w: rw - 0.84, h: 0.56,
      fontSize: 17, bold: true, color: WHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.16, valign: "top",
    });
    rule(s, rx + 0.42, BODY_TOP + 1.94, rw - 0.84, "3A3F4B");
    bullets(s, wk.next.topics, {
      x: rx + 0.42, y: BODY_TOP + 2.1, w: rw - 0.84, h: nT * perItem,
      fontSize: tFont, gap: tGap, color: "DDE0E6",
    });
    rule(s, rx + 0.42, ruleY, rw - 0.84, "3A3F4B");
    s.addText("미리 준비할 것", {
      x: rx + 0.42, y: ruleY + 0.12, w: rw - 0.84, h: 0.26,
      fontSize: 9.5, bold: true, color: MUTED, fontFace: F, charSpacing: 1, margin: 0, valign: "middle",
    });
    s.addText(wk.next.prepare, {
      x: rx + 0.42, y: ruleY + 0.4, w: rw - 0.84, h: 0.5,
      fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
    });
    foot(s);
    s.addNotes(wk.homeworkNote);
  }

  const out = path.join(__dirname, "..", "dist", "weeks", `서비스디자인_${wk.n.padStart(2, "0")}주차_${wk.file}.pptx`);
  return pres.writeFile({ fileName: out }).then(() => out);
}

const want = process.argv.slice(2).map(Number);
const targets = want.length ? WEEK_CONTENT.filter((w) => want.includes(Number(w.n))) : WEEK_CONTENT;
if (!targets.length) { console.error("해당 주차 콘텐츠가 없습니다:", want.join(", ")); process.exit(1); }
Promise.all(targets.map(buildWeek)).then((outs) => outs.forEach((o) => console.log("생성 완료:", o)));
