/**
 * 포트폴리오 제작 · 8주 과정 — 강의자료 덱 생성기
 *   node scripts/build-deck.js
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

/* ────────────────────────────────────────────────────────────
   디자인 토큰
   ──────────────────────────────────────────────────────────── */
const INK      = "14161B"; // 지배색 (60~70%)
const INK_SOFT = "262A33";
const GRAPHITE = "6B7280"; // 보조 텍스트
const MUTED    = "9AA0AA";
const LINE     = "E4E6EB";
const SURFACE  = "F4F5F7";
const WHITE    = "FFFFFF";
const ACCENT   = "FF4A1C"; // 단 하나의 강조색

const F   = "Pretendard";
const FL  = "Pretendard Light";
const FT  = "Pretendard Thin";

const SW = 13.333, SH = 7.5;   // LAYOUT_WIDE
const M  = 0.7;                // 좌우 마진
const CW = SW - M * 2;         // 11.933
const BODY_TOP = 1.72;         // 헤더 아래 콘텐츠 시작
const BODY_BOT = 6.78;         // 푸터 위 콘텐츠 한계

const DECK_TITLE = "포트폴리오 제작 · 8주 과정";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "MIN.D";
pres.company = "MIN.D";
pres.title = DECK_TITLE;
pres.subject = "대학 · 아카데미용 포트폴리오 제작 커리큘럼 강의자료";

let pageNo = 0;

/* ────────────────────────────────────────────────────────────
   공통 헬퍼
   ──────────────────────────────────────────────────────────── */
function slideLight() {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  return s;
}
function slideDark() {
  const s = pres.addSlide();
  s.background = { color: INK };
  return s;
}

/** 콘텐츠 슬라이드 헤더: 키커 + 타이틀 (밑줄·색바 없음) */
function head(s, kicker, title, sub) {
  s.addText(kicker, {
    x: M, y: 0.62, w: CW, h: 0.26,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F,
    charSpacing: 1.4, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 0.94, w: CW, h: 0.56,
    fontSize: 28, bold: true, color: INK, fontFace: F,
    margin: 0, valign: "middle",
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.50, w: CW, h: 0.26,
      fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  }
}

/** 하단 푸터 (콘텐츠 슬라이드 전용) */
function foot(s) {
  pageNo += 1;
  s.addText(DECK_TITLE, {
    x: M, y: 6.94, w: 6, h: 0.28,
    fontSize: 9, color: MUTED, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText(String(pageNo).padStart(2, "0"), {
    x: SW - M - 1.2, y: 6.94, w: 1.2, h: 0.28,
    fontSize: 9, color: MUTED, fontFace: F, margin: 0, align: "right", valign: "middle",
  });
}

/** 모티프: 번호 칩 (라운드 사각 + 숫자) */
function chip(s, x, y, label, opts = {}) {
  const size = opts.size || 0.34;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w: size, h: size,
    fill: { color: opts.fill || INK },
    line: { color: opts.fill || INK, width: 0.5 },
    rectRadius: 0.06,
  });
  s.addText(label, {
    x, y, w: size, h: size,
    fontSize: opts.fontSize || 11, bold: true,
    color: opts.color || WHITE, fontFace: F,
    align: "center", valign: "middle", margin: 0,
  });
}

/** 면 카드 (테두리 얇게, 엣지 스트라이프 없음) */
function card(s, x, y, w, h, opts = {}) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h,
    fill: { color: opts.fill || SURFACE },
    line: { color: opts.line || (opts.fill === INK ? INK : LINE), width: 1 },
    rectRadius: 0.08,
  });
}

/** 불릿 리스트 */
function bullets(s, items, o) {
  const runs = items.map((t, i) => ({
    text: t,
    options: {
      bullet: { indent: 14 },
      breakLine: i < items.length - 1,
      paraSpaceAfter: o.gap === undefined ? 7 : o.gap,
    },
  }));
  s.addText(runs, {
    x: o.x, y: o.y, w: o.w, h: o.h,
    fontSize: o.fontSize || 11.5, color: o.color || INK_SOFT, fontFace: F,
    lineSpacingMultiple: 1.18, margin: 0, valign: "top",
  });
}

/** 얇은 구분선 (장식용 아님 — 표/리스트 구분에만) */
function rule(s, x, y, w, color) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.01,
    fill: { color: color || LINE }, line: { color: color || LINE, width: 0 },
  });
}

/* ────────────────────────────────────────────────────────────
   1. 표지
   ──────────────────────────────────────────────────────────── */
{
  const s = slideDark();
  // 배경 고스트 넘버 (모티프)
  s.addText("08", {
    x: 7.9, y: 0.55, w: 5.0, h: 6.4,
    fontSize: 255, color: INK_SOFT, fontFace: FT,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText("8-WEEK CURRICULUM", {
    x: M, y: 1.55, w: 7.5, h: 0.3,
    fontSize: 12, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0,
  });
  s.addText("포트폴리오 제작", {
    x: M, y: 2.0, w: 8.2, h: 1.05,
    fontSize: 54, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("작품집이 아니라, 나를 설득하는 문서를 만든다", {
    x: M, y: 3.08, w: 8.2, h: 0.5,
    fontSize: 19, color: "C9CDD6", fontFace: FL, margin: 0, valign: "middle",
  });
  rule(s, M, 3.92, 3.2, "3A3F4B");
  const meta = [
    ["대상", "디자인 전공생 · 아카데미 수강생 · 주니어 지원자"],
    ["운영", "주 1회 180분 × 8주 (심화 2주 선택)"],
    ["산출물", "케이스 스터디 3편 + 완성 포트폴리오 1종"],
  ];
  meta.forEach(([k, v], i) => {
    const y = 4.18 + i * 0.42;
    s.addText(k, {
      x: M, y, w: 0.9, h: 0.34,
      fontSize: 11, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 1.0, y, w: 7.2, h: 0.34,
      fontSize: 12.5, color: "DDE0E6", fontFace: F, margin: 0, valign: "middle",
    });
  });
  s.addNotes("과정 소개. 첫 문장으로 프레임을 잡는다 — 포트폴리오는 예쁜 작품집이 아니라 '이 사람과 일하고 싶다'를 만드는 설득 문서다. 8주 동안 만들 결과물(케이스 스터디 3편 + 완성본 1종)을 먼저 보여주고 시작할 것.");
}

/* ────────────────────────────────────────────────────────────
   2. 왜 포트폴리오인가 (문제의식)
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "WHY", "포트폴리오는 왜 늘 어려운가", "8주 커리큘럼은 아래 세 가지 병목을 순서대로 해체하는 구조로 설계했습니다.");
  const items = [
    ["01", "무엇을 넣을지 모른다", "가진 프로젝트를 전부 넣거나, 반대로 \"완성된 게 없다\"며 시작을 미룬다. 선정 기준이 없기 때문이다."],
    ["02", "결과만 있고 과정이 없다", "최종 화면 이미지는 많은데, 왜 그렇게 결정했는지가 없다. 읽는 사람은 실력을 판단할 근거를 얻지 못한다."],
    ["03", "끝을 못 낸다", "계속 고치다가 지원 시점을 놓친다. 마감과 피드백 루프가 없으면 완성도는 오히려 떨어진다."],
  ];
  const cw = (CW - 0.4 * 2) / 3;
  items.forEach(([n, t, d], i) => {
    const x = M + i * (cw + 0.4);
    card(s, x, BODY_TOP + 0.18, cw, 3.02);
    chip(s, x + 0.42, BODY_TOP + 0.56, n, { fill: ACCENT, size: 0.4, fontSize: 12 });
    s.addText(t, {
      x: x + 0.42, y: BODY_TOP + 1.10, w: cw - 0.84, h: 0.5,
      fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "top",
    });
    s.addText(d, {
      x: x + 0.42, y: BODY_TOP + 1.62, w: cw - 0.84, h: 1.3,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.25, valign: "top",
    });
  });
  s.addText("→ 선정 기준을 먼저 세우고 · 의사결정을 글로 남기고 · 매주 크리틱으로 마감한다.", {
    x: M, y: 5.34, w: CW, h: 0.48,
    fontSize: 13.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("수강생에게 직접 물어보며 시작하면 좋다: '지금 포트폴리오에서 가장 막히는 지점이 뭔가요?' 대부분 세 가지 중 하나로 수렴한다. 이 세 병목이 각각 3주차(선정), 4주차(과정 서술), 7주차(크리틱·마감)에 대응된다고 예고할 것.");
}

/* ────────────────────────────────────────────────────────────
   3. 과정 개요 (스탯)
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "AT A GLANCE", "과정 한눈에 보기");
  const stats = [
    ["8", "주", "주 1회 · 총 8회차"],
    ["180", "분", "강의 · 실습 · 크리틱 · 랩업"],
    ["3", "편", "완성 케이스 스터디"],
    ["2", "종", "PDF · 웹 포맷 동시 산출"],
  ];
  const cw = (CW - 0.36 * 3) / 4;
  stats.forEach(([big, unit, desc], i) => {
    const x = M + i * (cw + 0.36);
    s.addText(
      [
        { text: big, options: { fontSize: 68, color: INK, fontFace: FL, bold: false } },
        { text: " " + unit, options: { fontSize: 20, color: ACCENT, fontFace: F, bold: true } },
      ],
      { x, y: BODY_TOP + 0.32, w: cw, h: 1.15, margin: 0, valign: "middle" }
    );
    rule(s, x, BODY_TOP + 1.62, cw);
    s.addText(desc, {
      x, y: BODY_TOP + 1.76, w: cw, h: 0.8,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.25, valign: "top",
    });
  });

  card(s, M, 4.66, CW, 1.62, { fill: INK });
  s.addText("이 과정의 원칙", {
    x: M + 0.5, y: 4.9, w: 2.6, h: 0.32,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("매주 결과물을 제출한다. 완벽한 초안보다 고칠 수 있는 초안이 빠르다.", {
    x: M + 0.5, y: 5.26, w: CW - 1.0, h: 0.42,
    fontSize: 19, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("8주 동안 제출 → 크리틱 → 수정 루프를 8번 돈다. 이 반복 횟수가 최종 완성도를 결정한다.", {
    x: M + 0.5, y: 5.72, w: CW - 1.0, h: 0.34,
    fontSize: 11.5, color: "AEB4BF", fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("숫자를 근거로 기대치를 맞추는 슬라이드. 특히 '주 1회 제출'이 협상 대상이 아님을 이 시점에 못 박는다. 180분 구성은 9번 슬라이드에서 자세히 다룬다.");
}

/* ────────────────────────────────────────────────────────────
   4. 학습 목표
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "OUTCOMES", "8주 후 할 수 있게 되는 것", "각 목표는 특정 주차의 산출물로 검증됩니다.");
  const outs = [
    ["01", "지원 직무에 맞춰 넣을 프로젝트를 스스로 선정한다", "관련성 · 완성도 · 차별성 세 축의 기준표로 판단한다.", "3주차"],
    ["02", "프로젝트를 문제–과정–결과의 서사로 재구성한다", "6블록 케이스 스터디 구조로 의사결정 근거까지 쓴다.", "4주차"],
    ["03", "읽히는 지면을 만든다", "그리드 · 타이포 위계 · 여백을 근거를 가지고 운용한다.", "5주차"],
    ["04", "PDF와 웹 두 포맷으로 전달 가능한 상태를 만든다", "용량 · 규격 · 링크 배포까지 실제 지원에 쓸 수 있게 세팅한다.", "6주차"],
    ["05", "3분 안에 나를 설명한다", "발표 스크립트와 예상 질문 답변을 준비해 인터뷰로 연결한다.", "8주차"],
  ];
  const rowH = 0.94;
  outs.forEach(([n, t, d, wk], i) => {
    const y = BODY_TOP + 0.14 + i * rowH;
    chip(s, M, y + 0.14, n, { size: 0.36, fontSize: 11 });
    s.addText(t, {
      x: M + 0.62, y: y + 0.06, w: 8.4, h: 0.36,
      fontSize: 14.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: M + 0.62, y: y + 0.42, w: 8.4, h: 0.3,
      fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(wk + " 검증", {
      x: SW - M - 2.0, y: y + 0.14, w: 2.0, h: 0.36,
      fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0,
      align: "right", valign: "middle",
    });
    if (i < outs.length - 1) rule(s, M, y + rowH - 0.06, CW);
  });
  foot(s);
  s.addNotes("학습 목표를 '알게 된다'가 아니라 '할 수 있게 된다'로 쓴 점을 짚어줄 것. 오른쪽 검증 주차는 평가 루브릭(24p)과 1:1로 연결된다.");
}

/* ────────────────────────────────────────────────────────────
   5. 수강 대상 & 준비물
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "AUDIENCE", "수강 대상과 준비물");
  const colW = (CW - 0.44) / 2;

  card(s, M, BODY_TOP + 0.1, colW, 3.92, { fill: WHITE, line: LINE });
  s.addText("이런 분께 맞습니다", {
    x: M + 0.46, y: BODY_TOP + 0.48, w: colW - 0.92, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  bullets(s, [
    "졸업/취업을 앞두고 첫 포트폴리오를 만드는 전공생",
    "작업물은 있는데 정리해 본 적이 없는 주니어",
    "학교 과제 중심 포트폴리오를 실무형으로 바꾸고 싶은 분",
    "이직을 위해 기존 포트폴리오를 다시 짜야 하는 1~3년차",
    "포트폴리오는 있지만 서류 단계에서 자주 걸러지는 분",
  ], { x: M + 0.46, y: BODY_TOP + 1.02, w: colW - 0.92, h: 2.7, fontSize: 12, gap: 11 });

  card(s, M + colW + 0.44, BODY_TOP + 0.1, colW, 3.92, { fill: SURFACE });
  s.addText("준비물 · 선수 지식", {
    x: M + colW + 0.9, y: BODY_TOP + 0.48, w: colW - 0.92, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  bullets(s, [
    "노트북 (Figma가 원활히 동작하는 사양)",
    "Figma 계정 — 교육 플랜 무료, 1주차 전 가입",
    "지금까지의 작업 파일 원본 (학교 과제 · 개인 작업 · 사이드 프로젝트 모두)",
    "그래픽 툴 기초 조작 능력 (레이어 · 정렬 · 마스크 수준)",
    "완성작이 없어도 괜찮습니다. 3주차에 '무엇을 완성할지'부터 함께 정합니다.",
  ], { x: M + colW + 0.9, y: BODY_TOP + 1.02, w: colW - 0.92, h: 2.7, fontSize: 12, gap: 11 });
  foot(s);
  s.addNotes("'완성작이 없어도 된다'는 마지막 줄이 중요하다. 수강 포기의 가장 큰 이유가 '넣을 게 없다'는 자기 판단이기 때문. 1주차 전에 Figma 가입과 원본 파일 수집만 확실히 공지할 것.");
}

/* ────────────────────────────────────────────────────────────
   6. 섹션 구분 — 커리큘럼
   ──────────────────────────────────────────────────────────── */
function divider(num, kicker, title, desc) {
  const s = slideDark();
  s.addText(num, {
    x: SW - M - 4.2, y: 1.0, w: 4.2, h: 5.5,
    fontSize: 260, color: INK_SOFT, fontFace: FT,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText(kicker, {
    x: M, y: 2.72, w: 8.0, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 3.1, w: 8.0, h: 0.8,
    fontSize: 42, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText(desc, {
    x: M, y: 4.0, w: 7.4, h: 0.6,
    fontSize: 13.5, color: "AEB4BF", fontFace: F, margin: 0,
    lineSpacingMultiple: 1.3, valign: "top",
  });
  return s;
}
divider("01", "PART 01", "커리큘럼", "8주를 어떤 순서로, 매주 몇 분씩, 어떤 산출물로 채우는지 전체 지도를 먼저 봅니다.")
  .addNotes("파트 전환. 여기서부터 30분 정도 커리큘럼 전체를 훑는다. 세부는 주차별 슬라이드에서.");

/* ────────────────────────────────────────────────────────────
   7. 8주 커리큘럼 한눈에
   ──────────────────────────────────────────────────────────── */
const WEEKS = [
  {
    n: "01", title: "포트폴리오의 목적과 목표 설정",
    goal: "포트폴리오가 작품집이 아니라 설득 문서임을 이해하고, 내가 설득할 대상을 특정한다.",
    lecture: [
      "읽는 사람은 누구인가 — 채용 담당자 · 실무 리더 · 교수의 서로 다른 관심사",
      "좋은 포트폴리오의 3요소: 판단 근거 · 역할의 명확성 · 읽는 속도",
      "직무별 기대치 차이 (UX / UI / BX / 그래픽 / 영상)",
    ],
    practice: "지원 목표 직무 3곳을 고르고 채용 공고(JD)를 요구 역량 단위로 분해한다.",
    output: "목표 정의서 1p — 목표 직무 · 요구 역량 10개 · 내가 증명해야 할 것 3개",
  },
  {
    n: "02", title: "리서치와 포지셔닝",
    goal: "레퍼런스와 경쟁 지원자 사이에서 나의 강점을 한 문장으로 정의한다.",
    lecture: [
      "벤치마킹하는 법 — 베끼는 것과 구조를 읽는 것의 차이",
      "레퍼런스 아카이브 구축과 태깅 (구성 / 서술 / 비주얼로 분리 수집)",
      "포지셔닝 스테이트먼트 작성 공식과 흔한 실패 사례",
    ],
    practice: "레퍼런스 20개를 수집해 3개 축으로 분류하고, 강점 후보 3개를 도출한다.",
    output: "벤치마킹 보드 + 포지셔닝 문장 1개 (초안)",
  },
  {
    n: "03", title: "프로젝트 선정과 전체 구조 설계",
    goal: "넣을 것과 뺄 것을 기준에 따라 결정하고 목차를 확정한다.",
    lecture: [
      "선정 3기준 — 관련성 · 완성도 · 차별성, 그리고 가중치 두는 법",
      "왜 3~5개인가 — 분량과 신뢰도의 관계",
      "목차 설계: 첫 프로젝트에 무엇을 둘 것인가",
    ],
    practice: "보유 프로젝트 인벤토리를 만들고 우선순위 매트릭스에 배치한다.",
    output: "포트폴리오 목차 + 페이지 와이어프레임",
  },
  {
    n: "04", title: "케이스 스터디 스토리텔링",
    goal: "프로젝트를 문제–과정–결과의 서사로 다시 쓴다.",
    lecture: [
      "케이스 스터디 6블록 구조 — 맥락 / 문제 / 접근 / 과정 / 결과 / 회고",
      "의사결정 근거 쓰기 — \"A를 골랐다\"가 아니라 \"B를 버린 이유\"",
      "정량 결과가 없을 때의 정성 결과 표현법",
    ],
    practice: "대표 프로젝트 1개를 6블록 구조로 다시 쓴다. 이미지 없이 글부터.",
    output: "케이스 스터디 A 텍스트 초안",
  },
  {
    n: "05", title: "비주얼 디자인과 레이아웃",
    goal: "읽히는 지면을 만든다 — 그리드 · 타이포 위계 · 여백을 근거를 가지고 쓴다.",
    lecture: [
      "그리드와 마진 — 한 번 정하면 끝까지 지키는 규칙 세우기",
      "타이포 위계 3단계와 대비, 컬러는 몇 개까지",
      "이미지 · 목업 퀄리티: 해상도 · 크롭 · 그림자 남용 피하기",
    ],
    practice: "케이스 스터디 A에 디자인 시스템을 적용해 지면으로 완성한다.",
    output: "비주얼 적용된 케이스 스터디 A",
  },
  {
    n: "06", title: "확장과 포맷 제작",
    goal: "PDF와 웹, 두 포맷으로 실제 지원에 쓸 수 있는 상태를 만든다.",
    lecture: [
      "PDF 규격 — 페이지 비율 · 용량 · 폰트 임베딩 · 파일명 규칙",
      "웹 포트폴리오 플랫폼 비교와 선택 기준",
      "링크 배포 전략 · 반응형 · 기본적인 접근성 점검",
    ],
    practice: "케이스 스터디 B · C를 같은 규칙으로 제작하고 두 포맷을 세팅한다.",
    output: "전체 초안 v1 (PDF + 웹 링크)",
  },
  {
    n: "07", title: "크리틱과 리파인",
    goal: "피드백을 구조적으로 받고, 우선순위를 정해 반영한다.",
    lecture: [
      "크리틱 규칙 — 취향이 아니라 목표를 기준으로 말하기",
      "자가진단 체크리스트 22항목 사용법",
      "모든 피드백을 반영하지 않는 법 — 수정 우선순위 정하기",
    ],
    practice: "동료 크리틱 2라운드를 진행하고 수정 계획표를 작성한다.",
    output: "수정 반영본 v2 + 수정 계획표",
  },
  {
    n: "08", title: "최종 발표와 커리어 연결",
    goal: "3분 안에 나를 설명하고, 포트폴리오를 지원 패키지로 연결한다.",
    lecture: [
      "3분 발표 구조 — 무엇을 먼저 말하고 무엇을 버릴 것인가",
      "이력서 · 자기소개서와의 연계, 중복 없이 보강하기",
      "포트폴리오 기반 예상 질문 10개와 답변 준비",
    ],
    practice: "3분 최종 발표 + 상호 피드백, 지원 패키지 점검.",
    output: "최종본 + 3분 발표 스크립트 + 이력서 1p",
  },
];

{
  const s = slideLight();
  head(s, "CURRICULUM", "8주 커리큘럼", "1~2주 기반 · 3~4주 구조와 서사 · 5~6주 제작 · 7~8주 완성과 전달");
  const gx = 0.3, gy = 0.28;
  const cw = (CW - gx * 3) / 4;
  const ch = 2.16;
  WEEKS.forEach((w, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = M + col * (cw + gx);
    const y = BODY_TOP + 0.24 + row * (ch + gy);
    const dark = row === 1;
    card(s, x, y, cw, ch, dark ? { fill: INK } : { fill: WHITE, line: LINE });
    s.addText(w.n, {
      x: x + 0.36, y: y + 0.28, w: 1.4, h: 0.5,
      fontSize: 30, color: dark ? ACCENT : ACCENT, fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText("WEEK", {
      x: x + 0.36, y: y + 0.74, w: 1.6, h: 0.22,
      fontSize: 8.5, bold: true, color: dark ? MUTED : MUTED, fontFace: F,
      charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(w.title, {
      x: x + 0.36, y: y + 1.06, w: cw - 0.72, h: 0.86,
      fontSize: 13, bold: true, color: dark ? WHITE : INK, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.18, valign: "top",
    });
  });
  foot(s);
  s.addNotes("전체 지도. 각 주차 카드를 3초씩만 짚고 넘어간다. 위 4개(1~4주)는 '무엇을 어떻게 말할까'를 정하는 기간, 아래 4개(5~8주)는 '실제로 만들어 끝내는' 기간이라는 대비를 강조.");
}

/* ────────────────────────────────────────────────────────────
   8. 3단계 학습 여정
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "JOURNEY", "세 단계로 나눈 8주");
  const phases = [
    ["PHASE 1", "기반 세우기", "1–3주", "누구에게 무엇을 증명할지 정한다. 이 단계를 건너뛰면 나머지 5주가 방향 없이 예뻐지기만 한다.",
      ["목표 정의서", "포지셔닝 문장", "목차 · 와이어프레임"]],
    ["PHASE 2", "만들기", "4–6주", "정해진 구조 위에 실제 지면을 만든다. 글을 먼저 쓰고 비주얼을 입히는 순서를 지킨다.",
      ["케이스 스터디 3편", "디자인 시스템 적용", "PDF · 웹 포맷"]],
    ["PHASE 3", "끝내기", "7–8주", "피드백으로 완성도를 올리고 지원 패키지로 연결한다. 마감이 있어야 완성된다.",
      ["크리틱 2라운드", "수정 반영본 v2", "최종본 + 발표"]],
  ];
  const cw = (CW - 0.4 * 2) / 3;
  phases.forEach(([tag, name, span, desc, outs], i) => {
    const x = M + i * (cw + 0.4);
    const dark = i === 2;
    card(s, x, BODY_TOP + 0.14, cw, 4.28, dark ? { fill: INK } : { fill: SURFACE });
    s.addText(tag, {
      x: x + 0.44, y: BODY_TOP + 0.5, w: cw - 0.88, h: 0.26,
      fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.6, margin: 0, valign: "middle",
    });
    s.addText(
      [
        { text: name, options: { fontSize: 22, bold: true, color: dark ? WHITE : INK, fontFace: F } },
        { text: "   " + span, options: { fontSize: 12, color: dark ? MUTED : GRAPHITE, fontFace: F } },
      ],
      { x: x + 0.44, y: BODY_TOP + 0.86, w: cw - 0.88, h: 0.44, margin: 0, valign: "middle" }
    );
    s.addText(desc, {
      x: x + 0.44, y: BODY_TOP + 1.42, w: cw - 0.88, h: 1.24,
      fontSize: 11.5, color: dark ? "AEB4BF" : GRAPHITE, fontFace: F,
      margin: 0, lineSpacingMultiple: 1.3, valign: "top",
    });
    rule(s, x + 0.44, BODY_TOP + 2.76, cw - 0.88, dark ? "3A3F4B" : LINE);
    s.addText("산출물", {
      x: x + 0.44, y: BODY_TOP + 2.9, w: cw - 0.88, h: 0.26,
      fontSize: 9.5, bold: true, color: MUTED, fontFace: F, charSpacing: 1, margin: 0, valign: "middle",
    });
    bullets(s, outs, {
      x: x + 0.44, y: BODY_TOP + 3.2, w: cw - 0.88, h: 1.0,
      fontSize: 11.5, color: dark ? WHITE : INK_SOFT, gap: 5,
    });
  });
  foot(s);
  s.addNotes("Phase 1을 건너뛰고 싶어 하는 수강생이 반드시 나온다. '빨리 만들고 싶다'는 요구를 인정하되, 1~3주 산출물이 4주차 이후 작업 속도를 좌우한다는 점을 사례로 설득할 것.");
}

/* ────────────────────────────────────────────────────────────
   9. 매주 180분 운영
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "SESSION", "매주 180분은 이렇게 씁니다", "강의보다 실습과 크리틱에 더 많은 시간을 씁니다. 만들면서 배우는 구조입니다.");
  const blocks = [
    ["45", "강의", "이론과 사례 분석", 45],
    ["60", "실습", "그 자리에서 만들기", 60],
    ["60", "크리틱", "동료 · 강사 피드백", 60],
    ["15", "랩업", "과제 안내와 정리", 15],
  ];
  const total = 180;
  const gap = 0.14;
  const usableW = CW - gap * 3;
  let x = M;
  const barY = BODY_TOP + 0.5;
  blocks.forEach(([mins, name, desc, val], i) => {
    const w = (usableW * val) / total;
    const dark = i === 1 || i === 2;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: barY, w, h: 1.0,
      fill: { color: dark ? INK : SURFACE },
      line: { color: dark ? INK : LINE, width: 1 },
      rectRadius: 0.08,
    });
    // 좁은 블록은 폭에 맞춰 축소 — 숫자가 줄바꿈되어 박스를 넘지 않도록
    const narrow = w < 1.6;
    const inset = narrow ? 0.12 : 0.3;
    s.addText(
      [
        { text: mins, options: { fontSize: narrow ? 20 : 28, color: dark ? WHITE : INK, fontFace: FL } },
        { text: "분", options: { fontSize: narrow ? 10 : 12, color: dark ? MUTED : GRAPHITE, fontFace: F } },
      ],
      {
        x: x + inset, y: barY + 0.16, w: w - inset * 2, h: 0.66,
        margin: 0, valign: "middle", align: narrow ? "center" : "left",
      }
    );
    s.addText(name, {
      x, y: barY + 1.22, w, h: 0.34,
      fontSize: 16, bold: true, color: INK, fontFace: F, align: "center", margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x - 0.1, y: barY + 1.56, w: w + 0.2, h: 0.3,
      fontSize: 10.5, color: GRAPHITE, fontFace: F, align: "center", margin: 0, valign: "middle",
    });
    x += w + gap;
  });

  const notes = [
    ["과제", "매주 종료 시 다음 주 실습 과제를 공지합니다. 제출 마감은 다음 수업 24시간 전입니다."],
    ["크리틱", "매주 3~4명이 발표대에 섭니다. 8주 동안 전원이 최소 2회 이상 발표합니다."],
    ["보강", "결석 시 녹화본과 과제 가이드를 제공하지만, 크리틱은 대체되지 않습니다."],
  ];
  const nw = (CW - 0.4 * 2) / 3;
  notes.forEach(([k, v], i) => {
    const nx = M + i * (nw + 0.4);
    rule(s, nx, 5.06, nw);
    s.addText(k, {
      x: nx, y: 5.18, w: nw, h: 0.3,
      fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: nx, y: 5.50, w: nw, h: 0.86,
      fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
  });
  foot(s);
  s.addNotes("시간 배분 자체가 이 과정의 교육 철학이다 — 강의 45분 대 실습·크리틱 120분. 첫 수업에서 이 비율을 못 박아야 '왜 이렇게 실습이 많냐'는 저항이 줄어든다. 크리틱 발표 순번은 1주차에 미리 배정할 것.");
}

/* ────────────────────────────────────────────────────────────
   10~17. 주차별 상세 (두 가지 레이아웃 교차)
   ──────────────────────────────────────────────────────────── */
WEEKS.forEach((w, idx) => {
  const s = slideLight();
  head(s, "WEEK " + w.n, w.title);

  if (idx % 2 === 0) {
    /* 레이아웃 A — 좌: 넘버 + 학습목표 / 우: 3블록 */
    const lw = 4.36;
    card(s, M, BODY_TOP, lw, 4.42, { fill: INK });
    s.addText(w.n, {
      x: M + 0.5, y: BODY_TOP + 0.34, w: 2.4, h: 1.24,
      fontSize: 78, color: ACCENT, fontFace: FT, margin: 0, valign: "middle",
    });
    s.addText("학습 목표", {
      x: M + 0.5, y: BODY_TOP + 1.76, w: lw - 1.0, h: 0.28,
      fontSize: 10, bold: true, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(w.goal, {
      x: M + 0.5, y: BODY_TOP + 2.1, w: lw - 1.0, h: 1.9,
      fontSize: 15, color: WHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.34, valign: "top",
    });

    const rx = M + lw + 0.42;
    const rw = CW - lw - 0.42;
    s.addText("강의 내용", {
      x: rx, y: BODY_TOP + 0.02, w: rw, h: 0.28,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
    });
    bullets(s, w.lecture, { x: rx, y: BODY_TOP + 0.38, w: rw, h: 1.6, fontSize: 12.5, gap: 9 });
    rule(s, rx, BODY_TOP + 2.06, rw);
    s.addText("실습", {
      x: rx, y: BODY_TOP + 2.2, w: rw, h: 0.28,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
    });
    s.addText(w.practice, {
      x: rx, y: BODY_TOP + 2.54, w: rw, h: 0.68,
      fontSize: 12.5, color: INK_SOFT, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
    card(s, rx, BODY_TOP + 3.3, rw, 1.12, { fill: SURFACE });
    s.addText("제출 산출물", {
      x: rx + 0.36, y: BODY_TOP + 3.48, w: rw - 0.72, h: 0.26,
      fontSize: 10, bold: true, color: GRAPHITE, fontFace: F, charSpacing: 1, margin: 0, valign: "middle",
    });
    s.addText(w.output, {
      x: rx + 0.36, y: BODY_TOP + 3.76, w: rw - 0.72, h: 0.56,
      fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.2, valign: "top",
    });
  } else {
    /* 레이아웃 B — 상: 학습목표 밴드 / 하: 3컬럼 */
    card(s, M, BODY_TOP, CW, 1.06, { fill: INK });
    s.addText("학습 목표", {
      x: M + 0.46, y: BODY_TOP + 0.2, w: 1.6, h: 0.28,
      fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(w.goal, {
      x: M + 0.46, y: BODY_TOP + 0.5, w: CW - 0.92, h: 0.42,
      fontSize: 15, color: WHITE, fontFace: F, margin: 0, valign: "middle",
    });

    const colW = (CW - 0.42 * 2) / 3;
    const cy = BODY_TOP + 1.36;
    const ch = 3.06;

    card(s, M, cy, colW, ch, { fill: WHITE, line: LINE });
    chip(s, M + 0.4, cy + 0.4, "1", { size: 0.32, fontSize: 10.5 });
    s.addText("강의 내용", {
      x: M + 0.82, y: cy + 0.4, w: colW - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    bullets(s, w.lecture, { x: M + 0.4, y: cy + 0.94, w: colW - 0.8, h: 1.94, fontSize: 11.5, gap: 8 });

    const x2 = M + colW + 0.42;
    card(s, x2, cy, colW, ch, { fill: WHITE, line: LINE });
    chip(s, x2 + 0.4, cy + 0.4, "2", { size: 0.32, fontSize: 10.5 });
    s.addText("실습", {
      x: x2 + 0.82, y: cy + 0.4, w: colW - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(w.practice, {
      x: x2 + 0.4, y: cy + 0.94, w: colW - 0.8, h: 1.9,
      fontSize: 12, color: INK_SOFT, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.32, valign: "top",
    });

    const x3 = M + (colW + 0.42) * 2;
    card(s, x3, cy, colW, ch, { fill: SURFACE });
    chip(s, x3 + 0.4, cy + 0.4, "3", { size: 0.32, fontSize: 10.5, fill: ACCENT });
    s.addText("제출 산출물", {
      x: x3 + 0.82, y: cy + 0.4, w: colW - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(w.output, {
      x: x3 + 0.4, y: cy + 0.94, w: colW - 0.8, h: 1.4,
      fontSize: 13.5, bold: true, color: INK, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
    s.addText("마감 — 다음 수업 24시간 전", {
      x: x3 + 0.4, y: cy + 2.5, w: colW - 0.8, h: 0.3,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
  }
  foot(s);
  s.addNotes(
    "WEEK " + w.n + " — " + w.title + "\n" +
    "학습 목표: " + w.goal + "\n" +
    "실습 운영: 60분 안에 끝낼 수 있는 범위로 쪼개서 제시하고, 막힌 수강생부터 순회 지도.\n" +
    "제출물: " + w.output
  );
});

/* ────────────────────────────────────────────────────────────
   18. 섹션 구분 — 핵심 프레임워크
   ──────────────────────────────────────────────────────────── */
divider("02", "PART 02", "핵심 프레임워크", "수업 전체에서 반복해서 쓰는 도구들입니다. 4주차 이후 매주 이 기준으로 크리틱합니다.")
  .addNotes("파트 전환. 여기부터는 매주 재사용하는 '도구' 설명이다. 인쇄 배포용 핸드아웃으로 뽑아두면 좋다.");

/* ────────────────────────────────────────────────────────────
   19. 케이스 스터디 6블록
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "FRAMEWORK", "케이스 스터디 6블록 구조", "모든 프로젝트를 이 여섯 칸에 채웁니다. 채워지지 않는 칸이 곧 보완할 지점입니다.");
  const blocks = [
    ["01", "맥락", "어떤 조직 · 기간 · 팀 규모에서, 나의 역할은 무엇이었나."],
    ["02", "문제", "무엇이 문제였나. 한 문장으로 쓸 수 없다면 아직 정의되지 않은 것."],
    ["03", "접근", "왜 이 방법을 택했나. 고려했다가 버린 대안과 그 이유."],
    ["04", "과정", "실제로 무엇을 했나. 중간 산출물 · 실패한 시도 · 바뀐 판단."],
    ["05", "결과", "무엇이 달라졌나. 숫자가 없으면 관찰 · 인용 · 전후 비교로."],
    ["06", "회고", "다시 한다면 무엇을 바꾸겠나. 여기서 성장 가능성이 읽힌다."],
  ];
  const gx = 0.36, gy = 0.26;
  const cw = (CW - gx * 2) / 3;
  const ch = 1.8;
  blocks.forEach(([n, t, d], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (cw + gx);
    const y = BODY_TOP + 0.24 + row * (ch + gy);
    card(s, x, y, cw, ch, { fill: WHITE, line: LINE });
    chip(s, x + 0.4, y + 0.3, n, { size: 0.36, fontSize: 11 });
    s.addText(t, {
      x: x + 0.88, y: y + 0.3, w: cw - 1.28, h: 0.36,
      fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: x + 0.4, y: y + 0.84, w: cw - 0.8, h: 0.86,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3, valign: "top",
    });
  });
  s.addText("03 접근과 06 회고가 비어 있는 포트폴리오가 가장 많습니다. 그리고 그 두 칸이 실력을 가장 잘 드러냅니다.", {
    x: M, y: 6.16, w: CW, h: 0.4,
    fontSize: 12.5, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("6블록은 4주차 실습의 템플릿이자 7주차 크리틱의 체크리스트다. 실제 사례 하나를 골라 여섯 칸을 함께 채워보는 시연을 15분 정도 하면 이해가 빨라진다.");
}

/* ────────────────────────────────────────────────────────────
   20. 좋은 / 아쉬운 케이스 스터디 비교
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "COMPARE", "같은 프로젝트, 다른 서술");
  const colW = (CW - 0.44) / 2;
  const rows = [
    ["문제 정의", "\"배송 조회 이탈률이 높다\"는 한 문장과 그 근거 데이터", "\"사용자 경험을 개선하고자 했다\""],
    ["과정", "세 가지 안을 만들고 A/B로 검증, 2안을 버린 이유까지 기록", "\"리서치를 진행했다\" 이후 바로 최종 화면"],
    ["나의 역할", "\"4인 팀, IA와 3개 핵심 플로우 담당\"", "팀 프로젝트라는 사실만 표기"],
    ["결과", "조회 완료율 변화 + 담당자 인용 + 전후 화면 비교", "완성 화면 12장 나열"],
    ["읽는 시간", "3분이면 판단 가능", "스크롤 20분, 끝까지 안 읽힘"],
  ];

  card(s, M, BODY_TOP + 0.02, colW, 4.5, { fill: SURFACE });
  s.addText("설득되는 서술", {
    x: M + 0.44, y: BODY_TOP + 0.32, w: colW - 0.88, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  card(s, M + colW + 0.44, BODY_TOP + 0.02, colW, 4.5, { fill: WHITE, line: LINE });
  s.addText("아쉬운 서술", {
    x: M + colW + 0.88, y: BODY_TOP + 0.32, w: colW - 0.88, h: 0.4,
    fontSize: 17, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle",
  });

  rows.forEach(([k, good, bad], i) => {
    const y = BODY_TOP + 0.92 + i * 0.72;
    s.addText(k, {
      x: M + 0.44, y, w: 1.5, h: 0.3,
      fontSize: 10, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(good, {
      x: M + 0.44, y: y + 0.26, w: colW - 0.88, h: 0.42,
      fontSize: 11.5, color: INK_SOFT, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.2, valign: "top",
    });
    s.addText(k, {
      x: M + colW + 0.88, y, w: 1.5, h: 0.3,
      fontSize: 10, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(bad, {
      x: M + colW + 0.88, y: y + 0.26, w: colW - 0.88, h: 0.42,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.2, valign: "top",
    });
    if (i < rows.length - 1) {
      rule(s, M + 0.44, y + 0.66, colW - 0.88, "DCDEE3");
      rule(s, M + colW + 0.88, y + 0.66, colW - 0.88, LINE);
    }
  });
  foot(s);
  s.addNotes("왼쪽과 오른쪽은 같은 프로젝트를 다르게 쓴 것이라는 점을 반드시 말할 것. 작업의 질이 아니라 서술의 질 차이라는 메시지가 핵심이다. 수강생이 자기 포트폴리오를 이 표에 대입해보게 5분 준다.");
}

/* ────────────────────────────────────────────────────────────
   21. 자주 하는 실수 TOP 5
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "PITFALLS", "자주 하는 실수 다섯 가지");
  const mistakes = [
    ["결과 이미지만 나열한다", "예쁜 최종 화면 20장보다, 판단 근거가 담긴 3장이 더 강하다.", "→ 6블록 중 접근 · 과정을 먼저 쓴다"],
    ["가진 것을 전부 넣는다", "약한 프로젝트 하나가 전체 평균을 끌어내린다.", "→ 3~5개로 제한하고 선정 기준표로 판단한다"],
    ["팀 프로젝트에서 내 역할이 안 보인다", "\"우리는\"으로만 서술하면 기여도를 확인할 방법이 없다.", "→ 팀 구성 · 담당 범위 · 내 결정물을 명시한다"],
    ["파일이 무겁고 안 열린다", "20MB PDF는 열리기 전에 닫힌다. 링크가 깨지면 끝이다.", "→ 용량 · 파일명 · 링크 접근 권한을 매번 점검한다"],
    ["끝내지 못한다", "완벽을 기다리다 지원 시점을 놓치는 경우가 가장 많다.", "→ 마감을 먼저 정하고 그 안에서 완성도를 올린다"],
  ];
  const rowH = 0.94;
  mistakes.forEach(([t, d, fix], i) => {
    const y = BODY_TOP + 0.12 + i * rowH;
    s.addText(String(i + 1).padStart(2, "0"), {
      x: M, y: y + 0.04, w: 0.72, h: 0.5,
      fontSize: 26, color: "D8DBE1", fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText(t, {
      x: M + 0.86, y: y + 0.02, w: 5.5, h: 0.36,
      fontSize: 15, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: M + 0.86, y: y + 0.38, w: 5.5, h: 0.34,
      fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(fix, {
      x: M + 6.7, y: y + 0.12, w: CW - 6.7, h: 0.5,
      fontSize: 12, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
    if (i < mistakes.length - 1) rule(s, M, y + rowH - 0.08, CW);
  });
  foot(s);
  s.addNotes("오른쪽 처방이 각각 몇 주차에서 다뤄지는지 연결해 말할 것 (1→4주, 2→3주, 3→4주, 4→6주, 5→7주). 이 슬라이드는 7주차 크리틱 때 다시 띄운다.");
}

/* ────────────────────────────────────────────────────────────
   22. 크리틱 운영 규칙
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "CRITIQUE", "크리틱 네 가지 규칙", "4주차부터 매주 60분씩 진행합니다. 규칙 없는 피드백은 상처만 남기고 아무것도 바꾸지 못합니다.");
  const rules = [
    ["의도를 먼저 묻는다", "발표자가 무엇을 노렸는지 듣기 전에는 평가하지 않는다. 첫 질문은 언제나 \"이 페이지로 무엇을 전하고 싶었나요?\""],
    ["취향이 아니라 목표로 말한다", "\"저는 이게 별로예요\"가 아니라 \"목표가 A라면 이 요소가 방해가 됩니다\"로 말한다."],
    ["관찰 · 영향 · 제안 순서로 말한다", "\"제목이 본문과 크기가 비슷하다(관찰) · 그래서 어디부터 읽을지 모르겠다(영향) · 제목을 키우거나 본문을 줄이면 어떨까(제안)\""],
    ["받는 사람은 변론하지 않고 기록한다", "그 자리에서 설명하고 싶은 충동을 참는다. 다 듣고 나서 무엇을 반영할지는 본인이 정한다."],
  ];
  const cw = (CW - 0.4) / 2;
  const ch = 2.14;
  rules.forEach(([t, d], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.4);
    const y = BODY_TOP + 0.16 + row * (ch + 0.32);
    card(s, x, y, cw, ch, { fill: i === 0 ? INK : SURFACE });
    const dark = i === 0;
    chip(s, x + 0.44, y + 0.4, String(i + 1), {
      size: 0.36, fontSize: 11, fill: dark ? ACCENT : INK,
    });
    s.addText(t, {
      x: x + 0.94, y: y + 0.4, w: cw - 1.4, h: 0.36,
      fontSize: 16, bold: true, color: dark ? WHITE : INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: x + 0.44, y: y + 0.96, w: cw - 0.88, h: 1.0,
      fontSize: 11.5, color: dark ? "AEB4BF" : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.32, valign: "top",
    });
  });
  foot(s);
  s.addNotes("첫 크리틱 전에 이 규칙을 소리 내어 함께 읽는다. 특히 4번(변론 금지)은 강사가 매번 개입해서 지켜줘야 한다. 규칙이 지켜지면 크리틱이 수업에서 가장 만족도 높은 시간이 된다.");
}

/* ────────────────────────────────────────────────────────────
   23. 섹션 구분 — 평가와 운영
   ──────────────────────────────────────────────────────────── */
divider("03", "PART 03", "평가와 운영", "무엇을 어떤 기준으로 평가하는지, 무엇을 제출해야 하는지 첫 주에 모두 공개합니다.")
  .addNotes("파트 전환. 평가 기준을 첫 주에 전부 공개하는 것이 이 과정의 원칙. 기준이 공개되어야 자가진단이 가능하다.");

/* ────────────────────────────────────────────────────────────
   24. 평가 루브릭
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "RUBRIC", "평가 기준", "최종 결과물 70% + 주차별 제출 성실도 20% + 크리틱 참여 10%");
  const rubric = [
    ["01", "문제 정의와 리서치", 20, "문제가 한 문장으로 정의되고 근거가 제시되는가"],
    ["02", "과정의 논리성", 25, "선택의 이유와 버린 대안이 드러나는가"],
    ["03", "결과와 임팩트", 20, "무엇이 달라졌는지 정량 또는 정성으로 확인되는가"],
    ["04", "비주얼 완성도", 20, "그리드 · 위계 · 여백이 일관되게 운용되는가"],
    ["05", "전달력", 15, "3분 안에 핵심이 전달되는가 (문서 · 발표 공통)"],
  ];
  const rowH = 0.78;
  const barMaxW = 2.6;
  const barX = SW - M - barMaxW - 0.9;
  rubric.forEach(([n, name, pct, crit], i) => {
    const y = BODY_TOP + 0.2 + i * rowH;
    chip(s, M, y + 0.16, n, { size: 0.34, fontSize: 10.5 });
    s.addText(name, {
      x: M + 0.6, y: y + 0.04, w: 3.0, h: 0.34,
      fontSize: 14.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(crit, {
      x: M + 0.6, y: y + 0.38, w: 6.3, h: 0.3,
      fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
    // 비중 바 (데이터 표현 — 장식용 스트라이프 아님)
    s.addShape(pres.ShapeType.roundRect, {
      x: barX, y: y + 0.2, w: barMaxW, h: 0.16,
      fill: { color: "EDEFF2" }, line: { color: "EDEFF2", width: 0 }, rectRadius: 0.03,
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: barX, y: y + 0.2, w: (barMaxW * pct) / 25, h: 0.16,
      fill: { color: i === 1 ? ACCENT : INK }, line: { color: i === 1 ? ACCENT : INK, width: 0 }, rectRadius: 0.03,
    });
    s.addText(pct + "%", {
      x: SW - M - 0.85, y: y + 0.08, w: 0.85, h: 0.36,
      fontSize: 15, bold: true, color: i === 1 ? ACCENT : INK, fontFace: F,
      align: "right", margin: 0, valign: "middle",
    });
    if (i < rubric.length - 1) rule(s, M, y + rowH - 0.06, CW);
  });
  s.addText("가장 배점이 높은 항목은 결과물의 완성도가 아니라 과정의 논리성입니다. 실무에서 재현 가능한 실력을 보기 때문입니다.", {
    x: M, y: 6.14, w: CW, h: 0.44,
    fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("배점 공개는 첫 주에. '과정의 논리성 25%'가 최고 배점인 이유를 설명하는 데 시간을 쓸 것 — 결과물의 미적 완성도만 신경 쓰는 관성을 깨는 장치다. 4주차 이후 매주 이 기준으로 크리틱한다.");
}

/* ────────────────────────────────────────────────────────────
   25. 산출물 체크리스트
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "DELIVERABLES", "8주 동안 제출하는 것", "매주 마감은 다음 수업 24시간 전입니다.");
  const left = [
    ["1주", "목표 정의서 1p"],
    ["2주", "벤치마킹 보드 + 포지셔닝 문장"],
    ["3주", "포트폴리오 목차 · 와이어프레임"],
    ["4주", "케이스 스터디 A 텍스트 초안"],
  ];
  const right = [
    ["5주", "비주얼 적용된 케이스 스터디 A"],
    ["6주", "전체 초안 v1 (PDF + 웹 링크)"],
    ["7주", "수정 반영본 v2 + 수정 계획표"],
    ["8주", "최종본 · 3분 발표 스크립트 · 이력서 1p"],
  ];
  const colW = (CW - 0.44) / 2;
  [[left, M], [right, M + colW + 0.44]].forEach(([list, x]) => {
    list.forEach(([wk, item], i) => {
      const y = BODY_TOP + 0.24 + i * 0.82;
      s.addShape(pres.ShapeType.roundRect, {
        x, y, w: colW, h: 0.66,
        fill: { color: SURFACE }, line: { color: SURFACE, width: 0 }, rectRadius: 0.08,
      });
      s.addText(wk, {
        x: x + 0.32, y, w: 0.7, h: 0.66,
        fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
      });
      s.addText(item, {
        x: x + 1.06, y, w: colW - 1.38, h: 0.66,
        fontSize: 12.5, color: INK, fontFace: F, margin: 0, valign: "middle",
      });
    });
  });

  card(s, M, 5.42, CW, 1.14, { fill: INK });
  s.addText("최종 제출 패키지", {
    x: M + 0.46, y: 5.6, w: 3.0, h: 0.28,
    fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  s.addText("완성 포트폴리오 (PDF + 웹 링크) · 케이스 스터디 3편 · 3분 발표 스크립트 · 이력서 1p", {
    x: M + 0.46, y: 5.92, w: CW - 0.92, h: 0.4,
    fontSize: 14.5, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("이 슬라이드는 인쇄해서 나눠주거나 강의 게시판 상단에 고정해둔다. 제출 누락이 발생하는 주차는 대개 4주와 6주 — 분량이 갑자기 늘어나기 때문. 해당 주차 전에 별도 리마인드할 것.");
}

/* ────────────────────────────────────────────────────────────
   26. 도구와 레퍼런스
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "TOOLKIT", "도구와 레퍼런스", "도구는 자유입니다. 다만 팀 크리틱을 위해 링크 공유가 되는 도구를 권장합니다.");
  const groups = [
    ["제작", ["Figma — 지면 · 웹 포트폴리오 공용, 이 수업의 기본 도구", "Adobe InDesign — 페이지 수가 많은 인쇄형 포트폴리오", "Keynote · PowerPoint — 발표형으로 빠르게 만들 때"]],
    ["웹 배포", ["Framer — 노코드로 반응형 웹 포트폴리오", "Notion — 가장 빠른 시작, 구조 중심 정리에 유리", "Webflow · 개인 도메인 — 커스터마이징 여지가 클 때"]],
    ["아카이브", ["Behance · Dribbble — 비주얼 레퍼런스 수집", "Are.na · Pinterest — 태깅 기반 아카이브 구축", "채용 공고 사이트 — 요구 역량 원본 자료"]],
  ];
  const cw = (CW - 0.4 * 2) / 3;
  groups.forEach(([name, items], i) => {
    const x = M + i * (cw + 0.4);
    card(s, x, BODY_TOP + 0.2, cw, 3.6, { fill: WHITE, line: LINE });
    chip(s, x + 0.42, BODY_TOP + 0.58, String(i + 1), { size: 0.34, fontSize: 10.5 });
    s.addText(name, {
      x: x + 0.9, y: BODY_TOP + 0.58, w: cw - 1.3, h: 0.34,
      fontSize: 16, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    bullets(s, items, {
      x: x + 0.42, y: BODY_TOP + 1.14, w: cw - 0.84, h: 2.3, fontSize: 11.5, gap: 10,
    });
  });
  s.addText("툴 사용법 자체는 수업에서 가르치지 않습니다. 필요한 경우 1주차에 별도 워밍업 세션을 안내합니다.", {
    x: M, y: 5.86, w: CW, h: 0.4,
    fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("도구 선택으로 첫 2주를 낭비하는 수강생이 많다. '지금 가장 익숙한 도구로 시작하라'고 명확히 지시할 것. 도구를 바꿀 거면 3주차 이전에 결정하도록.");
}

/* ────────────────────────────────────────────────────────────
   27. 심화 옵션 (9~10주)
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "OPTIONAL", "심화 2주 (선택)", "8주 과정을 마친 뒤, 실제 지원까지 이어가고 싶은 수강생을 위한 확장 과정입니다.");
  const ext = [
    ["09", "직무별 심화 리파인", "UX · UI · BX · 그래픽 등 지원 직무별로 요구 포인트가 다릅니다. 직무 그룹으로 나눠 맞춤 리파인을 진행하고, 1:1 개별 리뷰 30분을 배정합니다.",
      ["직무별 기대치 정밀 분석", "1:1 개별 리뷰 30분", "직무 맞춤 수정본 v3"]],
    ["10", "모의 면접과 실전 지원", "포트폴리오를 실제 지원 패키지로 완성합니다. 예상 질문 기반 모의 면접을 진행하고, 지원처별 커스터마이징 전략을 세웁니다.",
      ["포트폴리오 기반 모의 면접", "지원처별 커스터마이징", "지원 패키지 최종 점검"]],
  ];
  const cw = (CW - 0.44) / 2;
  ext.forEach(([n, t, d, list], i) => {
    const x = M + i * (cw + 0.44);
    const dark = i === 1;
    card(s, x, BODY_TOP + 0.16, cw, 4.28, dark ? { fill: INK } : { fill: SURFACE });
    s.addText(n, {
      x: x + 0.46, y: BODY_TOP + 0.48, w: 1.6, h: 0.76,
      fontSize: 48, color: ACCENT, fontFace: FT, margin: 0, valign: "middle",
    });
    s.addText("WEEK", {
      x: x + 0.46, y: BODY_TOP + 1.24, w: 1.6, h: 0.24,
      fontSize: 8.5, bold: true, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(t, {
      x: x + 0.46, y: BODY_TOP + 1.6, w: cw - 0.92, h: 0.4,
      fontSize: 19, bold: true, color: dark ? WHITE : INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: x + 0.46, y: BODY_TOP + 2.08, w: cw - 0.92, h: 1.06,
      fontSize: 11.5, color: dark ? "AEB4BF" : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3, valign: "top",
    });
    rule(s, x + 0.46, BODY_TOP + 3.22, cw - 0.92, dark ? "3A3F4B" : "DCDEE3");
    bullets(s, list, {
      x: x + 0.46, y: BODY_TOP + 3.4, w: cw - 0.92, h: 0.92,
      fontSize: 11.5, color: dark ? WHITE : INK_SOFT, gap: 5,
    });
  });
  foot(s);
  s.addNotes("심화 2주는 8주 수료자 대상 옵션. 8주차 발표에서 실제 지원 의사가 확인된 수강생 위주로 안내한다. 1:1 리뷰 30분은 강사 리소스가 크므로 인원 상한을 정할 것.");
}

/* ────────────────────────────────────────────────────────────
   28. 마무리
   ──────────────────────────────────────────────────────────── */
{
  const s = slideDark();
  s.addText("01", {
    x: SW - M - 4.4, y: 0.9, w: 4.4, h: 5.6,
    fontSize: 260, color: INK_SOFT, fontFace: FT, align: "right", valign: "middle", margin: 0,
  });
  s.addText("NEXT WEEK", {
    x: M, y: 1.5, w: 7.6, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 2, margin: 0, valign: "middle",
  });
  s.addText("다음 주까지 해올 것", {
    x: M, y: 1.9, w: 7.6, h: 0.7,
    fontSize: 38, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  const todo = [
    ["01", "Figma 계정을 만들고 교육 플랜을 신청한다"],
    ["02", "지금까지의 작업 파일 원본을 한 폴더에 모은다 (학교 과제 · 개인 작업 전부)"],
    ["03", "가고 싶은 회사 또는 직무 3곳의 채용 공고를 캡처해 온다"],
  ];
  todo.forEach(([n, t], i) => {
    const y = 2.95 + i * 0.62;
    chip(s, M, y + 0.04, n, { size: 0.34, fontSize: 10.5, fill: ACCENT });
    s.addText(t, {
      x: M + 0.62, y, w: 7.6, h: 0.42,
      fontSize: 14, color: "DDE0E6", fontFace: F, margin: 0, valign: "middle",
    });
  });
  rule(s, M, 5.22, 7.6, "3A3F4B");
  s.addText("아직 완성된 작업이 없어도 괜찮습니다. 3주차에 무엇을 완성할지부터 함께 정합니다.", {
    x: M, y: 5.46, w: 7.8, h: 0.44,
    fontSize: 15, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText(DECK_TITLE, {
    x: M, y: 6.2, w: 7.8, h: 0.3,
    fontSize: 10.5, color: MUTED, fontFace: F, margin: 0, valign: "middle",
  });
  s.addNotes("수업 마무리. 과제 3개는 반드시 화면에 띄운 채로 읽어주고, 게시판에도 동일하게 공지한다. 마지막 문장('완성된 작업이 없어도 괜찮다')으로 끝내면 1주차 이탈이 눈에 띄게 줄어든다.");
}

/* ──────────────────────────────────────────────────────────── */
const out = path.join(__dirname, "..", "dist", "포트폴리오_제작_8주과정_강의자료.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("생성 완료:", out));
