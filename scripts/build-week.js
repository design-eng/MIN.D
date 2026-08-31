/**
 * 원광대학교 2026-2 · 주차별 강의자료 생성기
 *   node scripts/build-week.js [--portfolio] [주차번호 ...]
 *   인자가 없으면 콘텐츠 파일에 정의된 모든 주차를 생성한다.
 *
 * 장표 스타일 — 흑백 에디토리얼.
 *   · 컬러 없음. 강조는 색이 아니라 무게·대문자·자간·괘선으로 만든다.
 *   · 상단 레일(작은 대문자 라벨 + 헤어라인), 하단 헤어라인.
 *   · 디스플레이 타입은 Pretendard Black, 본문은 Regular/Light.
 *   · 모서리는 각지게, 면은 흰색·연회색·먹색 세 단계만 쓴다.
 */
const pptxgen = require("pptxgenjs");
const path = require("path");
// 과목 선택: --portfolio 를 주면 포트폴리오제작, 없으면 서비스디자인
const USE_PORTFOLIO = process.argv.includes("--portfolio");
const { COURSE, WEEK_CONTENT } = require(USE_PORTFOLIO ? "./portfolio-content" : "./week-content");

/* ── 디자인 토큰 ─────────────────────────────────────────── */
const INK = "111111";      // 먹 — 헤드라인·다크 면
const INK_SOFT = "1F1F1F"; // 본문 먹
const GRAPHITE = "6E6E6E"; // 보조 텍스트
const MUTED = "9B9B9B";    // 3차 텍스트
const LINE = "DCDCDC";     // 헤어라인
const LINE_D = "333333";   // 다크 면 위 헤어라인
const SURFACE = "F2F2F2";  // 연회색 면
const WHITE = "FFFFFF";
const GHOST = "1B1B1B";    // 다크 면 위 대형 숫자(거의 안 보이는 고스트)
const KICK_L = "8A8A8A";   // 라이트 슬라이드 키커
const KICK_D = "9A9A9A";   // 다크 슬라이드 키커
const BODY_D = "B8B8B8";   // 다크 면 위 본문

const F = "Pretendard";
const FL = "Pretendard Light";
const FT = "Pretendard Thin";
const FB = "Pretendard Black";   // 디스플레이 전용

const SW = 13.333, SH = 7.5, M = 0.7, CW = SW - M * 2, BODY_TOP = 1.72;
const RAIL_Y = 0.30, RAIL_RULE = 0.60, FOOT_RULE = 6.88;

function buildWeek(wk) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "MIN.D";
  pres.company = "MIN.D";
  pres.title = `${COURSE.name} · ${wk.n}주차 ${wk.title}`;
  pres.subject = COURSE.subject;

  const DECK_TITLE = `${COURSE.name} · ${wk.n}주차 ${wk.title}`;
  const SESSION = COURSE.session;
  const WEEK_TAG = "WEEK " + wk.n.padStart(2, "0");
  let pageNo = 0;

  /* ── 원시 요소 ──────────────────────────────────────────── */
  const light = () => { const s = pres.addSlide(); s.background = { color: WHITE }; return s; };
  const dark  = () => { const s = pres.addSlide(); s.background = { color: INK };   return s; };

  function rule(s, x, y, w, c) {
    s.addShape(pres.ShapeType.rect, {
      x, y, w, h: 0.008,
      fill: { color: c || LINE }, line: { color: c || LINE, width: 0 },
    });
  }

  // 참고 덱의 시그니처 — 가는 선으로 그린 아래 방향 화살표
  function arrow(s, x, y, size, color) {
    const c = color || INK, lw = 1.25, cx = x + size / 2, hy = y + size * 0.6;
    s.addShape(pres.ShapeType.line, { x: cx, y, w: 0, h: size, line: { color: c, width: lw } });
    s.addShape(pres.ShapeType.line, { x, y: hy, w: size / 2, h: size * 0.4, line: { color: c, width: lw } });
    s.addShape(pres.ShapeType.line, { x: cx, y: hy, w: size / 2, h: size * 0.4, line: { color: c, width: lw }, flipV: true });
  }

  // 오른쪽 가장자리 세로 캡션 — 참고 덱 1의 시그니처
  function edgeCaption(s, txt, c) {
    s.addText(txt, {
      x: SW - 1.92, y: 3.6, w: 3.0, h: 0.3, rotate: 270,
      fontSize: 8.5, color: c || MUTED, fontFace: F, charSpacing: 2.6,
      align: "center", valign: "middle", margin: 0,
    });
  }

  // 상단 레일 — 작은 대문자 라벨 세 개와 헤어라인
  function rail(s, onDark) {
    const c = onDark ? KICK_D : KICK_L;
    s.addText(COURSE.name, {
      x: M, y: RAIL_Y, w: 4.0, h: 0.24,
      fontSize: 9, color: c, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
    });
    s.addText("PHASE " + wk.phase + " " + wk.phaseName, {
      x: M + 4.2, y: RAIL_Y, w: 5.0, h: 0.24,
      fontSize: 9, color: c, fontFace: F, charSpacing: 1.2, align: "center", margin: 0, valign: "middle",
    });
    s.addText(WEEK_TAG, {
      x: SW - M - 3.0, y: RAIL_Y, w: 3.0, h: 0.24,
      fontSize: 9, color: c, fontFace: F, charSpacing: 2.0, align: "right", margin: 0, valign: "middle",
    });
    rule(s, M, RAIL_RULE, CW, onDark ? LINE_D : LINE);
  }

  function head(s, kicker, title, sub) {
    rail(s);
    s.addText(kicker, {
      x: M, y: 0.70, w: CW, h: 0.24,
      fontSize: 9.5, color: KICK_L, fontFace: F, charSpacing: 2.6, margin: 0, valign: "middle",
    });
    s.addText(title, {
      x: M, y: 0.94, w: CW, h: 0.52,
      fontSize: 30, color: INK, fontFace: FB, margin: 0, valign: "middle",
    });
    if (sub) s.addText(sub, {
      x: M, y: 1.50, w: CW, h: 0.24,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  }

  function foot(s) {
    pageNo += 1;
    rule(s, M, FOOT_RULE, CW);
    s.addText(DECK_TITLE, {
      x: M, y: 6.98, w: 8.5, h: 0.26,
      fontSize: 8.5, color: MUTED, fontFace: F, charSpacing: 0.4, margin: 0, valign: "middle",
    });
    s.addText("P." + String(pageNo).padStart(2, "0"), {
      x: SW - M - 1.4, y: 6.98, w: 1.4, h: 0.26,
      fontSize: 8.5, color: MUTED, fontFace: F, charSpacing: 1.4, align: "right", margin: 0, valign: "middle",
    });
  }

  // 번호 표식 — 기본은 참고 덱 2의 아웃라인 원, solid를 주면 채운 원
  function chip(s, x, y, label, o = {}) {
    const size = o.size || 0.34;
    const onDark = !!o.onDark;
    const stroke = onDark ? WHITE : INK;
    s.addShape(pres.ShapeType.ellipse, {
      x, y, w: size, h: size,
      fill: o.solid ? { color: stroke } : { color: o.bg || (onDark ? INK : WHITE) },
      line: { color: stroke, width: 1 },
    });
    s.addText(label, {
      x, y, w: size, h: size,
      fontSize: o.fontSize || 10.5,
      color: o.solid ? (onDark ? INK : WHITE) : stroke,
      fontFace: F, bold: true, align: "center", valign: "middle", margin: 0,
    });
  }

  function card(s, x, y, w, h, o = {}) {
    const fill = o.fill || SURFACE;
    s.addShape(pres.ShapeType.rect, {
      x, y, w, h,
      fill: { color: fill },
      line: { color: o.line || (fill === INK ? INK : LINE), width: 1 },
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

  /* ── 1. 표지 — 흰 바탕, 대형 숫자와 볼드 디스플레이 ────── */
  {
    const s = light();
    rail(s);
    s.addText(wk.n.padStart(2, "0"), {
      x: SW - M - 4.0, y: 0.78, w: 4.0, h: 1.66,
      fontSize: 132, color: INK, fontFace: FB, align: "right", valign: "middle", margin: 0,
    });
    arrow(s, M, 0.96, 0.66);
    s.addText(WEEK_TAG + "  ·  PHASE " + wk.phase + " " + wk.phaseName, {
      x: M, y: 2.08, w: 8.2, h: 0.26,
      fontSize: 9.5, color: KICK_L, fontFace: F, charSpacing: 2.6, margin: 0, valign: "middle",
    });
    s.addText(wk.title, {
      x: M, y: 2.40, w: 9.4, h: 1.34,
      fontSize: wk.title.length > 13 ? 40 : 48,
      color: INK, fontFace: FB, margin: 0, lineSpacingMultiple: 1.12, valign: "top",
    });
    s.addText(wk.goal, {
      x: M, y: 3.88, w: 8.6, h: 0.76,
      fontSize: 16, color: GRAPHITE, fontFace: FL, margin: 0, lineSpacingMultiple: 1.3, valign: "top",
    });
    rule(s, M, 4.86, 3.0, INK);
    [["과목", COURSE.name + " · " + COURSE.audience], ["오늘", SESSION + " — " + wk.ratio], ["제출물", wk.output]]
      .forEach(([k, v], i) => {
        const y = 5.08 + i * 0.42;
        s.addText(k, {
          x: M, y, w: 1.0, h: 0.32,
          fontSize: 9.5, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
        });
        s.addText(v, {
          x: M + 1.1, y, w: 8.4, h: 0.32,
          fontSize: 12, color: INK_SOFT, fontFace: F, margin: 0, valign: "middle",
        });
      });
    edgeCaption(s, "WONKWANG UNIV · 2026-2");
    rule(s, M, FOOT_RULE, CW);
    s.addNotes(wk.coverNote);
  }

  /* ── 2. 오늘의 진행 (실제 시각 시간표) ─────────────────── */
  {
    const s = light();
    head(s, "TODAY", "오늘의 " + SESSION, wk.ratio);
    const n = wk.schedule.length;
    // 행이 적은 주차(90분 과목)에서 표가 위에만 몰리지 않도록 높이를 가변으로 둔다
    const rowH = Math.min(1.02, (6.42 - BODY_TOP - 0.16) / n);
    const rowsEnd = BODY_TOP + 0.16 + n * rowH;
    rule(s, M, BODY_TOP + 0.12, CW, INK);
    wk.schedule.forEach(([time, what, how], i) => {
      const y = BODY_TOP + 0.16 + i * rowH;
      const rest = !how;
      s.addText(time, {
        x: M, y, w: 1.75, h: rowH,
        fontSize: 10.5, bold: !rest, color: rest ? MUTED : INK, fontFace: F,
        charSpacing: 0.6, margin: 0, valign: "middle",
      });
      s.addText(what, {
        x: M + 1.9, y, w: CW - 1.9 - 2.5, h: rowH,
        fontSize: rest ? 11 : 13, bold: !rest, color: rest ? MUTED : INK, fontFace: F, margin: 0, valign: "middle",
      });
      if (how) s.addText(how, {
        x: SW - M - 2.5, y, w: 2.5, h: rowH,
        fontSize: 10.5, color: GRAPHITE, fontFace: F, align: "right", margin: 0, valign: "middle",
      });
      if (i < n - 1) rule(s, M, y + rowH - 0.02, CW, rest ? "EFEFEF" : LINE);
    });
    // 표가 짧게 끝나면 남는 자리에 오늘의 도달점을 둔다
    if (wk.todayEnd && rowsEnd < 5.2) {
      const cy = rowsEnd + 0.34;
      card(s, M, cy, CW, 6.34 - cy, { fill: INK });
      s.addText("오늘 끝나면", {
        x: M + 0.5, y: cy + 0.2, w: 3.0, h: 0.28,
        fontSize: 9.5, color: KICK_D, fontFace: F, charSpacing: 2.4, margin: 0, valign: "middle",
      });
      s.addText(wk.todayEnd, {
        x: M + 0.5, y: cy + 0.5, w: CW - 1.0, h: 6.34 - cy - 0.66,
        fontSize: 16, color: WHITE, fontFace: FB, margin: 0,
        lineSpacingMultiple: 1.26, valign: "middle",
      });
    } else {
      rule(s, M, rowsEnd - 0.02, CW, INK);
    }
    foot(s);
    s.addNotes(wk.flowNote);
  }

  /* ── 3~. 본문 — 콘텐츠 타입별 렌더 ──────────────────────── */
  const R = {
    divider(b) {
      const s = dark();
      rail(s, true);
      s.addText(b.num, {
        x: SW - M - 4.6, y: 1.90, w: 4.6, h: 3.6,
        fontSize: 200, color: GHOST, fontFace: FB, align: "right", valign: "middle", margin: 0,
      });
      arrow(s, M, 1.5, 0.66, WHITE);
      s.addText(b.kicker, {
        x: M, y: 2.86, w: 8.6, h: 0.28,
        fontSize: 9.5, color: KICK_D, fontFace: F, charSpacing: 2.8, margin: 0, valign: "middle",
      });
      s.addText(b.title, {
        x: M, y: 3.16, w: 8.6, h: 0.86,
        fontSize: 46, color: WHITE, fontFace: FB, margin: 0, valign: "middle",
      });
      rule(s, M, 4.16, 2.4, WHITE);
      s.addText(b.desc, {
        x: M, y: 4.38, w: 7.6, h: 0.8,
        fontSize: 13.5, color: BODY_D, fontFace: FL, margin: 0, lineSpacingMultiple: 1.34, valign: "top",
      });
      edgeCaption(s, "SECTION " + b.num, "7A7A7A");
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
        card(s, x, BODY_TOP + 0.18, cw, 3.32, isDark ? { fill: INK } : { fill: WHITE, line: LINE });
        chip(s, x + 0.42, BODY_TOP + 0.48, it.n, { size: 0.4, fontSize: 11.5, onDark: isDark });
        s.addText(it.t, {
          x: x + 0.42, y: BODY_TOP + 1.02, w: cw - 0.84, h: 0.5,
          fontSize: 17, color: isDark ? WHITE : INK, fontFace: FB, margin: 0, lineSpacingMultiple: 1.14, valign: "top",
        });
        s.addText(it.d, {
          x: x + 0.42, y: BODY_TOP + 1.56, w: cw - 0.84, h: 1.8,
          fontSize: 11.5, color: isDark ? BODY_D : GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.3, valign: "top",
        });
      });
      if (b.foot) {
        rule(s, M, 5.56, CW, INK);
        s.addText(b.foot, {
          x: M, y: 5.68, w: CW, h: 0.48,
          fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
        });
      }
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    rows(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length;
      // 하단 강조문이 있으면 행 영역을 더 위에서 끊어 겹침을 막는다
      const rowsBottom = b.foot ? 6.02 : 6.5;
      const rowH = Math.min(1.12, (rowsBottom - BODY_TOP - 0.14) / n);
      const footY = BODY_TOP + 0.14 + n * rowH + 0.14;
      rule(s, M, BODY_TOP + 0.1, CW, INK);
      b.items.forEach((it, i) => {
        const y = BODY_TOP + 0.14 + i * rowH;
        chip(s, M, y + 0.12, it.n, { size: 0.34, fontSize: 10 });
        s.addText(it.t, {
          x: M + 0.6, y: y + 0.02, w: it.tag ? 8.2 : 10.8, h: 0.34,
          fontSize: 14.5, color: INK, fontFace: FB, margin: 0, valign: "middle",
        });
        s.addText(it.d, {
          x: M + 0.6, y: y + 0.36, w: it.tag ? 8.2 : 10.8, h: 0.32,
          fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
        });
        if (it.tag) s.addText(it.tag, {
          x: SW - M - 2.4, y: y + 0.12, w: 2.4, h: 0.34,
          fontSize: 10.5, bold: true, color: INK, fontFace: F, charSpacing: 1.2,
          align: "right", margin: 0, valign: "middle",
        });
        if (i < n - 1) rule(s, M, y + rowH - 0.06, CW);
      });
      if (b.foot) {
        rule(s, M, footY - 0.12, CW, INK);
        s.addText(b.foot, {
          x: M, y: footY, w: CW, h: 0.44,
          fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
        });
      }
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
      s.addText(b.leftTitle, {
        x: M + 0.44, y: top + 0.3, w: colW - 0.88, h: 0.4,
        fontSize: 17, color: INK, fontFace: FB, margin: 0, valign: "middle",
      });
      card(s, M + colW + 0.44, top, colW, h, { fill: WHITE, line: LINE });
      s.addText(b.rightTitle, {
        x: M + colW + 0.88, y: top + 0.3, w: colW - 0.88, h: 0.4,
        fontSize: 17, color: MUTED, fontFace: FB, margin: 0, valign: "middle",
      });
      b.rows.forEach(([k, good, bad], i) => {
        const y = top + 0.9 + i * 0.72;
        s.addText(k, {
          x: M + 0.44, y, w: 2.2, h: 0.3,
          fontSize: 9, bold: true, color: INK, fontFace: F, charSpacing: 1.6, margin: 0, valign: "middle",
        });
        s.addText(good, {
          x: M + 0.44, y: y + 0.26, w: colW - 0.88, h: 0.42,
          fontSize: 11.5, color: INK_SOFT, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
        });
        s.addText(k, {
          x: M + colW + 0.88, y, w: 2.2, h: 0.3,
          fontSize: 9, bold: true, color: MUTED, fontFace: F, charSpacing: 1.6, margin: 0, valign: "middle",
        });
        s.addText(bad, {
          x: M + colW + 0.88, y: y + 0.26, w: colW - 0.88, h: 0.42,
          fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
        });
        if (i < n - 1) { rule(s, M + 0.44, y + 0.66, colW - 0.88, "D2D2D2"); rule(s, M + colW + 0.88, y + 0.66, colW - 0.88, LINE); }
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
      s.addText(b.leftTitle, {
        x: M + 0.46, y: BODY_TOP + 0.46, w: colW - 0.92, h: 0.4,
        fontSize: 17, color: INK, fontFace: FB, margin: 0, valign: "middle",
      });
      rule(s, M + 0.46, BODY_TOP + 0.92, colW - 0.92, INK);
      bullets(s, b.left, { x: M + 0.46, y: BODY_TOP + 1.04, w: colW - 0.92, h: 2.96, fontSize: 12, gap: 11 });
      card(s, M + colW + 0.44, BODY_TOP + 0.1, colW, h, { fill: SURFACE });
      s.addText(b.rightTitle, {
        x: M + colW + 0.9, y: BODY_TOP + 0.46, w: colW - 0.92, h: 0.4,
        fontSize: 17, color: INK, fontFace: FB, margin: 0, valign: "middle",
      });
      rule(s, M + colW + 0.9, BODY_TOP + 0.92, colW - 0.92, INK);
      bullets(s, b.right, { x: M + colW + 0.9, y: BODY_TOP + 1.04, w: colW - 0.92, h: 2.96, fontSize: 12, gap: 11 });
      if (b.foot) s.addText(b.foot, {
        x: M, y: 6.06, w: CW, h: 0.44,
        fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
      });
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    statement(b) {
      const s = dark();
      rail(s, true);
      s.addText(b.kicker, {
        x: M, y: 2.30, w: 10.0, h: 0.28,
        fontSize: 9.5, color: KICK_D, fontFace: F, charSpacing: 2.8, margin: 0, valign: "middle",
      });
      rule(s, M, 2.62, 2.4, WHITE);
      s.addText(b.title, {
        x: M, y: 2.84, w: 11.2, h: 1.5,
        fontSize: 34, color: WHITE, fontFace: FB, margin: 0, lineSpacingMultiple: 1.22, valign: "top",
      });
      if (b.body) s.addText(b.body, {
        x: M, y: 4.46, w: 10.4, h: 1.0,
        fontSize: 14, color: BODY_D, fontFace: FL, margin: 0, lineSpacingMultiple: 1.36, valign: "top",
      });
      edgeCaption(s, COURSE.name.toUpperCase() + " · " + WEEK_TAG, "7A7A7A");
      if (b.note) s.addNotes(b.note);
    },

    steps(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const n = b.items.length;
      const rowH = Math.min(1.06, (6.2 - BODY_TOP) / n);
      b.items.forEach((it, i) => {
        const y = BODY_TOP + 0.16 + i * rowH;
        const isDark = i === n - 1;
        card(s, M, y, CW, rowH - 0.16, isDark ? { fill: INK } : { fill: WHITE, line: LINE });
        s.addText(it.min, {
          x: M + 0.4, y: y + 0.1, w: 1.3, h: rowH - 0.36,
          fontSize: 22, color: isDark ? WHITE : INK, fontFace: FL, margin: 0, valign: "middle",
        });
        s.addText(it.t, {
          x: M + 1.8, y: y + 0.1, w: 3.6, h: rowH - 0.36,
          fontSize: 14.5, color: isDark ? WHITE : INK, fontFace: FB, margin: 0, valign: "middle",
        });
        s.addText(it.d, {
          x: M + 5.5, y: y + 0.1, w: CW - 5.9, h: rowH - 0.36,
          fontSize: 11.5, color: isDark ? BODY_D : GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.24, valign: "middle",
        });
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
        card(s, x, BODY_TOP + 0.14, cw, ch, isDark ? { fill: INK } : { fill: WHITE, line: LINE });
        s.addText(it.t, {
          x: x + 0.38, y: BODY_TOP + 0.42, w: cw - 0.76, h: 0.46,
          fontSize: 17, color: isDark ? WHITE : INK, fontFace: FB, margin: 0, valign: "middle",
        });
        s.addText(it.sub, {
          x: x + 0.38, y: BODY_TOP + 0.9, w: cw - 0.76, h: 0.34,
          fontSize: 10, bold: true, color: isDark ? KICK_D : GRAPHITE, fontFace: F,
          charSpacing: 1.4, margin: 0, lineSpacingMultiple: 1.15, valign: "top",
        });
        rule(s, x + 0.38, BODY_TOP + 1.34, cw - 0.76, isDark ? LINE_D : INK);
        bullets(s, it.items, {
          x: x + 0.38, y: BODY_TOP + 1.5, w: cw - 0.76, h: ch - 1.7,
          fontSize: 11.5, gap: 9, color: isDark ? WHITE : INK_SOFT,
        });
      });
      if (b.foot) {
        rule(s, M, 6.02, CW, INK);
        s.addText(b.foot, {
          x: M, y: 6.14, w: CW, h: 0.46,
          fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
        });
      }
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    casebox(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      card(s, M, BODY_TOP + 0.14, CW, 1.12, { fill: INK });
      s.addText("여정", {
        x: M + 0.44, y: BODY_TOP + 0.32, w: 1.4, h: 0.28,
        fontSize: 9.5, color: KICK_D, fontFace: F, charSpacing: 2.4, margin: 0, valign: "middle",
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
        chip(s, x + 0.36, cy + 0.34, String(i + 1), { size: 0.32, fontSize: 10 });
        s.addText(it.t, {
          x: x + 0.78, y: cy + 0.34, w: cw - 1.14, h: 0.32,
          fontSize: 13.5, color: INK, fontFace: FB, margin: 0, valign: "middle",
        });
        s.addText(it.d, {
          x: x + 0.36, y: cy + 0.86, w: cw - 0.72, h: 1.8,
          fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.3, valign: "top",
        });
      });
      if (b.foot) {
        rule(s, M, 6.38, CW, INK);
        s.addText(b.foot, {
          x: M, y: 6.5, w: CW, h: 0.4,
          fontSize: 12, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
        });
      }
      foot(s);
      if (b.note) s.addNotes(b.note);
    },

    checklist(b) {
      const s = light();
      head(s, b.kicker, b.title, b.sub);
      const colW = (CW - 0.44) / 2;
      const half = Math.ceil(b.items.length / 2);
      // 항목이 많은 주차(16개까지)에서 행이 지면을 넘지 않도록 높이를 가변으로 둔다
      const bottom = b.foot ? 6.02 : 6.55;
      const step = Math.min(0.8, (bottom - BODY_TOP - 0.2) / half);
      const rowH = step - 0.16;
      const tight = step < 0.62;
      const chipSize = tight ? 0.28 : 0.34;
      b.items.forEach((it, i) => {
        const col = i < half ? 0 : 1;
        const idx = i < half ? i : i - half;
        const x = M + col * (colW + 0.44);
        const y = BODY_TOP + 0.2 + idx * step;
        s.addShape(pres.ShapeType.rect, {
          x, y, w: colW, h: rowH,
          fill: { color: SURFACE }, line: { color: SURFACE, width: 0 },
        });
        chip(s, x + 0.3, y + (rowH - chipSize) / 2, String(i + 1).padStart(2, "0"),
          { size: chipSize, fontSize: tight ? 8 : 9, bg: SURFACE });
        s.addText(it, {
          x: x + 0.3 + chipSize + 0.14, y, w: colW - (0.3 + chipSize + 0.14) - 0.3, h: rowH,
          fontSize: tight ? 10.5 : 12, color: INK, fontFace: F, margin: 0, valign: "middle",
        });
      });
      if (b.foot) {
        const footY = BODY_TOP + 0.2 + half * step + 0.06;
        rule(s, M, footY, CW, INK);
        s.addText(b.foot, {
          x: M, y: footY + 0.12, w: CW, h: 0.44,
          fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
        });
      }
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
      card(s, M, y, lw, 0.98, { fill: WHITE, line: LINE });
      chip(s, M + 0.36, y + 0.3, String(i + 1), { size: 0.36, fontSize: 11, solid: true });
      s.addText(h.t, {
        x: M + 0.86, y: y + 0.1, w: lw - 1.24, h: 0.36,
        fontSize: 14, color: INK, fontFace: FB, margin: 0, valign: "middle",
      });
      s.addText(h.d, {
        x: M + 0.86, y: y + 0.44, w: lw - 1.24, h: 0.46,
        fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.22, valign: "top",
      });
    });
    const subY = BODY_TOP + 0.16 + wk.homework.length * 1.12;
    rule(s, M, subY + 0.02, lw, INK);
    s.addText("제출 — " + wk.deadline, {
      x: M, y: subY + 0.12, w: lw, h: 0.36,
      fontSize: 12, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
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
    // 마지막 주차는 다음 주가 없으므로 콘텐츠가 kicker/label 로 문구를 덮어쓸 수 있다
    s.addText(wk.next.kicker || "NEXT WEEK", {
      x: rx + 0.42, y: BODY_TOP + 0.46, w: rw - 0.84, h: 0.28,
      fontSize: 9.5, color: KICK_D, fontFace: F, charSpacing: 2.6, margin: 0, valign: "middle",
    });
    s.addText(wk.next.label || wk.next.n + "주차", {
      x: rx + 0.42, y: BODY_TOP + 0.78, w: rw - 0.84, h: 0.44,
      fontSize: 26, color: WHITE, fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText(wk.next.title, {
      x: rx + 0.42, y: BODY_TOP + 1.28, w: rw - 0.84, h: 0.56,
      fontSize: 17, color: WHITE, fontFace: FB, margin: 0, lineSpacingMultiple: 1.16, valign: "top",
    });
    rule(s, rx + 0.42, BODY_TOP + 1.94, rw - 0.84, LINE_D);
    bullets(s, wk.next.topics, {
      x: rx + 0.42, y: BODY_TOP + 2.1, w: rw - 0.84, h: nT * perItem,
      fontSize: tFont, gap: tGap, color: "DDDDDD",
    });
    rule(s, rx + 0.42, ruleY, rw - 0.84, LINE_D);
    s.addText("미리 준비할 것", {
      x: rx + 0.42, y: ruleY + 0.12, w: rw - 0.84, h: 0.26,
      fontSize: 9, color: MUTED, fontFace: F, charSpacing: 1.6, margin: 0, valign: "middle",
    });
    s.addText(wk.next.prepare, {
      x: rx + 0.42, y: ruleY + 0.4, w: rw - 0.84, h: 0.5,
      fontSize: 11, bold: true, color: WHITE, fontFace: F, margin: 0, lineSpacingMultiple: 1.2, valign: "top",
    });
    foot(s);
    s.addNotes(wk.homeworkNote);
  }

  const out = path.join(__dirname, "..", "dist", COURSE.outDir, `${COURSE.filePrefix}_${wk.n.padStart(2, "0")}주차_${wk.file}.pptx`);
  return pres.writeFile({ fileName: out }).then(() => out);
}

const want = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);
const targets = want.length ? WEEK_CONTENT.filter((w) => want.includes(Number(w.n))) : WEEK_CONTENT;
if (!targets.length) { console.error("해당 주차 콘텐츠가 없습니다:", want.join(", ")); process.exit(1); }
Promise.all(targets.map(buildWeek)).then((outs) => outs.forEach((o) => console.log("생성 완료:", o)));
