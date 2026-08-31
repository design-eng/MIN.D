/**
 * 학부 3학년「서비스디자인」— 15주 개요 덱 생성기 【1학기용 · 보관】
 *
 * 리서치에서 컨셉 정의를 거쳐 전시 패널까지 한 학기에 다루는 구성이다.
 * 2026-2학기(디자이닝 중심)에는 사용하지 않는다. 내년 1학기용 보관본.
 *   node scripts/build-deck.js
 *
 * 내용 근거: Drive「원광대_2026-2_커리큘럼_기획안」PART A (학부 3학년)
 *   - 주 3시간 × 15주 (총 45시간), 실습형 (강의 40% / 실습·크리틱 60%)
 *   - 4 Phase: 발견(1–4) · 정의(5–8) · 개발(9–12) · 전달(13–15)
 *   - 최종 산출물: 졸업 전시용 패널 B0 900×1200mm, CMYK 300dpi
 */
const pptxgen = require("pptxgenjs");
const path = require("path");

/* ────────────────────────────────────────────────────────────
   디자인 토큰
   ──────────────────────────────────────────────────────────── */
// 흑백 에디토리얼 — 컬러 없음. 강조는 무게·대문자·자간·괘선으로만 만든다.
const INK      = "111111"; // 먹 — 헤드라인·다크 면
const INK_SOFT = "1F1F1F";
const GRAPHITE = "6E6E6E"; // 보조 텍스트
const MUTED    = "9B9B9B";
const LINE     = "DCDCDC";
const LINE_D   = "333333"; // 다크 면 위 헤어라인
const SURFACE  = "F2F2F2";
const WHITE    = "FFFFFF";
const GHOST    = "1B1B1B"; // 다크 면 위 대형 숫자
const ACCENT   = "111111"; // 라이트 면 강조 = 먹
const ACCENT_D = "FFFFFF"; // 다크 면 강조 = 흰색
const BODY_D   = "B8B8B8"; // 다크 면 위 본문

const F  = "Pretendard";
const FL = "Pretendard Light";
const FT = "Pretendard Thin";
const FB = "Pretendard Black"; // 디스플레이 전용

const SW = 13.333, SH = 7.5;   // LAYOUT_WIDE
const M  = 0.7;                // 좌우 마진
const CW = SW - M * 2;         // 11.933
const BODY_TOP = 1.72;

const DECK_TITLE = "서비스디자인 · 15주 · 1학기용";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "MIN.D";
pres.company = "MIN.D";
pres.title = "서비스디자인 15주 개요 (학부 3학년) · 1학기용";
pres.subject = "주 3시간 × 15주 실습형 · 졸업 전시 패널 제작 커리큘럼 강의자료";

let pageNo = 0;

/* ────────────────────────────────────────────────────────────
   공통 헬퍼
   ──────────────────────────────────────────────────────────── */
function slideLight() { const s = pres.addSlide(); s.background = { color: WHITE }; return s; }
function slideDark()  { const s = pres.addSlide(); s.background = { color: INK };   return s; }

// 상단 레일 — 작은 자간 라벨 두 개와 헤어라인
function rail(s, onDark) {
  const c = onDark ? "9A9A9A" : "8A8A8A";
  s.addText("서비스디자인", {
    x: M, y: 0.30, w: 5.0, h: 0.24,
    fontSize: 9, color: c, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  s.addText("WONKWANG UNIV · 2026-2", {
    x: SW - M - 5.0, y: 0.30, w: 5.0, h: 0.24,
    fontSize: 9, color: c, fontFace: F, charSpacing: 2.0, align: "right", margin: 0, valign: "middle",
  });
  rule(s, M, 0.60, CW, onDark ? LINE_D : LINE);
}

function head(s, kicker, title, sub) {
  rail(s);
  s.addText(kicker, {
    x: M, y: 0.70, w: CW, h: 0.24,
    fontSize: 9.5, color: "8A8A8A", fontFace: F,
    charSpacing: 2.6, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 0.94, w: CW, h: 0.52,
    fontSize: 30, color: INK, fontFace: FB, margin: 0, valign: "middle",
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.50, w: CW, h: 0.24,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  }
}

function foot(s) {
  pageNo += 1;
  rule(s, M, 6.88, CW);
  s.addText(DECK_TITLE, {
    x: M, y: 6.98, w: 6, h: 0.26,
    fontSize: 8.5, color: MUTED, fontFace: F, charSpacing: 0.4, margin: 0, valign: "middle",
  });
  s.addText("P." + String(pageNo).padStart(2, "0"), {
    x: SW - M - 1.4, y: 6.98, w: 1.4, h: 0.26,
    fontSize: 8.5, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, align: "right", valign: "middle",
  });
}

// 번호 표식 — 참고 덱의 아웃라인 원. solid 를 주면 채운 원.
function chip(s, x, y, label, opts = {}) {
  const size = opts.size || 0.34;
  const onDark = !!opts.onDark;
  const stroke = onDark ? WHITE : INK;
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color: opts.solid ? stroke : (opts.bg || (onDark ? INK : WHITE)) },
    line: { color: stroke, width: 1 },
  });
  s.addText(label, {
    x, y, w: size, h: size,
    fontSize: opts.fontSize || 10.5, bold: true,
    color: opts.solid ? (onDark ? INK : WHITE) : stroke, fontFace: F,
    align: "center", valign: "middle", margin: 0,
  });
}

function card(s, x, y, w, h, opts = {}) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h,
    fill: { color: opts.fill || SURFACE },
    line: { color: opts.line || (opts.fill === INK ? INK : LINE), width: 1 },
  });
}

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

function rule(s, x, y, w, color) {
  s.addShape(pres.ShapeType.rect, {
    x, y, w, h: 0.008,
    fill: { color: color || LINE }, line: { color: color || LINE, width: 0 },
  });
}

// 참고 덱의 시그니처 — 선으로 그린 아래 방향 화살표
function arrow(s, x, y, size, color) {
  const c = color || INK, lw = 1.25, cx = x + size / 2, hy = y + size * 0.6;
  s.addShape(pres.ShapeType.line, { x: cx, y, w: 0, h: size, line: { color: c, width: lw } });
  s.addShape(pres.ShapeType.line, { x, y: hy, w: size / 2, h: size * 0.4, line: { color: c, width: lw } });
  s.addShape(pres.ShapeType.line, { x: cx, y: hy, w: size / 2, h: size * 0.4, line: { color: c, width: lw }, flipV: true });
}

// 오른쪽 가장자리 세로 캡션
function edgeCaption(s, txt, color) {
  s.addText(txt, {
    x: SW - 1.92, y: 3.6, w: 3.0, h: 0.3, rotate: 270,
    fontSize: 8.5, color: color || MUTED, fontFace: F, charSpacing: 2.6,
    align: "center", valign: "middle", margin: 0,
  });
}

function divider(num, kicker, title, desc) {
  const s = slideDark();
  rail(s, true);
  s.addText(num, {
    x: SW - M - 4.6, y: 1.90, w: 4.6, h: 3.6,
    fontSize: 200, color: GHOST, fontFace: FB,
    align: "right", valign: "middle", margin: 0,
  });
  arrow(s, M, 1.5, 0.66, WHITE);
  s.addText(kicker, {
    x: M, y: 2.86, w: 8.6, h: 0.28,
    fontSize: 9.5, color: "9A9A9A", fontFace: F, charSpacing: 2.8, margin: 0, valign: "middle",
  });
  s.addText(title, {
    x: M, y: 3.16, w: 8.6, h: 0.86,
    fontSize: 46, color: WHITE, fontFace: FB, margin: 0, valign: "middle",
  });
  rule(s, M, 4.16, 2.4, WHITE);
  s.addText(desc, {
    x: M, y: 4.38, w: 7.6, h: 0.8,
    fontSize: 13.5, color: BODY_D, fontFace: FL, margin: 0,
    lineSpacingMultiple: 1.34, valign: "top",
  });
  edgeCaption(s, "SECTION " + num, "7A7A7A");
  return s;
}

/* ────────────────────────────────────────────────────────────
   커리큘럼 데이터 — 기획안 PART A 주차별 계획표 그대로
   ──────────────────────────────────────────────────────────── */
const PHASES = [
  { key: "P1", name: "발견", span: "1–4주",   desc: "사용자와 맥락을 스스로 찾아낸다" },
  { key: "P2", name: "정의", span: "5–8주",   desc: "관찰을 문제 진술과 컨셉으로 번역한다" },
  { key: "P3", name: "개발", span: "9–12주",  desc: "컨셉을 화면과 프로토타입으로 구현한다" },
  { key: "P4", name: "전달", span: "13–15주", desc: "전시 패널이라는 공적 형식으로 완결한다" },
];

const WEEKS = [
  { n: "01", phase: 0, title: "오리엔테이션 & 서비스디자인 개관",
    lecture: ["과목 운영·평가 기준 안내", "서비스디자인의 정의와 산업 사례", "졸업 전시 패널의 목표와 심사 관점"],
    practice: "관심 영역 3개를 문장으로 적고, 레퍼런스 전시 패널 5점을 수집해 무엇이 읽히는지 분석한다.",
    output: "관심 영역 3개 · 레퍼런스 전시 패널 5점" },
  { n: "02", phase: 0, title: "리서치 설계와 주제 후보 도출",
    lecture: ["문제 발견의 출발점", "데스크 리서치 방법", "이해관계자 맵 초안", "주제 스코핑"],
    practice: "주제 후보 3안을 근거 자료와 함께 정리하고, 1:1 주제 상담을 진행한다.",
    output: "주제 후보 3안 + 근거 자료 · 1:1 주제 상담" },
  { n: "03", phase: 0, title: "필드 리서치 실습",
    lecture: ["인터뷰 설계와 질문 유형", "관찰·섀도잉", "기록과 윤리", "실제 대상자 섭외 전략"],
    practice: "인터뷰 가이드를 작성하고 대상자 2인 이상을 실제로 인터뷰한다.",
    output: "인터뷰 가이드 · 인터뷰 기록 2건 이상" },
  { n: "04", phase: 0, title: "리서치 합성",
    lecture: ["어피니티 다이어그램", "퍼소나", "사용자 여정맵 작성 실습"],
    practice: "수업 시간 안에 퍼소나와 저니맵을 완성한다. 집으로 가져가지 않는다.",
    output: "퍼소나 1~2인 · 저니맵 1점 (수업 중 제작 완료)" },
  { n: "05", phase: 1, title: "문제 정의",
    lecture: ["인사이트 스테이트먼트", "POV 문장", "HMW 질문 전환", "문제의 크기 조정"],
    practice: "POV 3문장과 HMW 10개를 도출하고 1차 크리틱을 받는다.",
    output: "POV 3문장 · HMW 10개 · 1차 크리틱" },
  { n: "06", phase: 1, title: "아이디에이션",
    lecture: ["발산 기법 — 브레인라이팅 · SCAMPER", "컨셉 스케치", "아이디어 평가 매트릭스"],
    practice: "컨셉 스케치 20안을 만든 뒤 평가 매트릭스로 3안까지 압축한다.",
    output: "컨셉 스케치 20안 → 컨셉 3안" },
  { n: "07", phase: 1, title: "서비스 컨셉 구조화",
    lecture: ["밸류 프로포지션", "서비스 블루프린트", "터치포인트와 IoT 연동 시나리오"],
    practice: "블루프린트 1점을 작성하고 중간 발표 자료를 구성한다.",
    output: "서비스 블루프린트 1점 · 중간 발표 자료" },
  { n: "08", phase: 1, title: "중간 발표",
    lecture: ["개인별 컨셉 발표 15분", "상호 피드백", "패널 스토리라인 1차 구성"],
    practice: "발표 후 받은 피드백을 패널 스토리보드에 즉시 반영한다.",
    output: "중간 발표 (평가 20%) · 패널 스토리보드", milestone: true },
  { n: "09", phase: 2, title: "정보구조 & 와이어프레임",
    lecture: ["IA 설계", "태스크 플로우", "저충실도 와이어프레임", "화면 목록 확정"],
    practice: "핵심 플로우 3개를 정하고 와이어프레임 12화면 이상을 그린다.",
    output: "핵심 플로우 3개 · 와이어프레임 12화면 이상" },
  { n: "10", phase: 2, title: "UI 디자인 시스템",
    lecture: ["컬러·타이포 스케일", "컴포넌트와 상태 정의", "Figma 라이브러리 구성"],
    practice: "디자인 토큰을 정리하고 재사용 가능한 컴포넌트 세트를 구축한다.",
    output: "디자인 토큰 · Figma 컴포넌트 세트" },
  { n: "11", phase: 2, title: "화면 디자인",
    lecture: ["핵심 화면 고충실도 디자인", "시각 위계와 정렬", "접근성 대비 점검"],
    practice: "주요 화면 8~12개를 완성하고 2차 크리틱을 받는다.",
    output: "주요 화면 8~12개 · 2차 크리틱" },
  { n: "12", phase: 2, title: "프로토타입 & 사용성 테스트",
    lecture: ["Figma 인터랙션", "테스트 시나리오 설계", "5인 테스트 진행과 기록"],
    practice: "프로토타입을 연결하고 5인 사용성 테스트를 실시해 결과를 정리한다.",
    output: "프로토타입 1식 · 사용성 테스트 결과 리포트", milestone: true },
  { n: "13", phase: 3, title: "패널 레이아웃 설계",
    lecture: ["전시 패널의 정보 위계", "3m 거리 가독성", "그리드와 여백", "스토리텔링 순서"],
    practice: "B0 기준 패널 시안 2안을 만들고 축소 출력으로 가독성을 검토한다.",
    output: "패널 시안 2안 (B0) · 축소 출력 검토" },
  { n: "14", phase: 3, title: "패널 제작 & 인쇄 데이터",
    lecture: ["CMYK 변환", "300dpi 이미지", "재단 여백과 도련", "출력 사양 확정", "최종 크리틱"],
    practice: "인쇄용 최종 데이터를 확정해 제출하고 출력을 발주한다. 마감 예외 없음.",
    output: "인쇄용 최종 데이터 (마감) · 출력 발주", milestone: true },
  { n: "15", phase: 3, title: "최종 발표 & 아카이빙",
    lecture: ["실물 패널 기반 최종 발표", "전시 시뮬레이션", "포트폴리오 아카이브 정리"],
    practice: "실물 패널 앞에서 최종 발표를 진행하고 포트폴리오 아카이브를 정리한다.",
    output: "최종 발표 (평가 25%) · 포트폴리오 PDF" },
];

/* ────────────────────────────────────────────────────────────
   1. 표지
   ──────────────────────────────────────────────────────────── */
{
  const s = slideDark();
  s.addText("15", {
    x: 7.9, y: 0.55, w: 5.0, h: 6.4,
    fontSize: 255, color: INK_SOFT, fontFace: FT,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText("WONKWANG UNIV. · 2026-2 · 학부 3학년", {
    x: M, y: 1.5, w: 7.5, h: 0.3,
    fontSize: 12, bold: true, color: ACCENT_D, fontFace: F, charSpacing: 1.6, margin: 0,
  });
  s.addText("서비스디자인", {
    x: M, y: 1.96, w: 8.2, h: 1.05,
    fontSize: 48, color: WHITE, fontFace: FB, margin: 0, valign: "middle",
  });
  s.addText("프로세스를 한 바퀴 돌려, 전시 패널로 완결한다", {
    x: M, y: 3.06, w: 8.2, h: 0.5,
    fontSize: 19, color: "C8C8C8", fontFace: FL, margin: 0, valign: "middle",
  });
  rule(s, M, 3.9, 3.2, LINE_D);
  [
    ["운영", "주 3시간 × 15주 (총 45시간) · 실습형"],
    ["구성", "강의 40% / 실습 · 크리틱 60%"],
    ["최종 산출물", "졸업 전시용 패널 1점 (B0 900×1200mm)"],
  ].forEach(([k, v], i) => {
    const y = 4.16 + i * 0.42;
    s.addText(k, {
      x: M, y, w: 1.4, h: 0.34,
      fontSize: 11, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 1.5, y, w: 6.8, h: 0.34,
      fontSize: 12.5, color: "DDDDDD", fontFace: F, margin: 0, valign: "middle",
    });
  });
  s.addNotes("1주차 오리엔테이션 첫 화면. 과목명보다 '전시 패널로 완결한다'는 목표를 먼저 각인시킬 것. 15주가 하나의 프로젝트를 처음부터 끝까지 도는 구조라는 점을 표지에서 이미 말해둔다.");
}

/* ────────────────────────────────────────────────────────────
   2. 과목 개요
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "AT A GLANCE", "과목 한눈에 보기");
  const stats = [
    ["15", "주", "9월 개강 · 주 1회"],
    ["45", "시간", "주 3시간 × 15주"],
    ["4", "단계", "발견 · 정의 · 개발 · 전달"],
    ["1", "점", "졸업 전시 패널 (개인)"],
  ];
  const cw = (CW - 0.36 * 3) / 4;
  stats.forEach(([big, unit, desc], i) => {
    const x = M + i * (cw + 0.36);
    s.addText(
      [
        { text: big, options: { fontSize: 68, color: INK, fontFace: FL } },
        { text: " " + unit, options: { fontSize: 20, color: ACCENT, fontFace: F, bold: true } },
      ],
      { x, y: BODY_TOP + 0.32, w: cw, h: 1.15, margin: 0, valign: "middle" }
    );
    rule(s, x, BODY_TOP + 1.62, cw);
    s.addText(desc, {
      x, y: BODY_TOP + 1.76, w: cw, h: 0.7,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.25, valign: "top",
    });
  });

  card(s, M, 4.66, CW, 1.62, { fill: INK });
  s.addText("이 과목의 원칙", {
    x: M + 0.5, y: 4.9, w: 2.6, h: 0.32,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("만들면서 이해한다. 강의는 40%, 나머지 60%는 손으로 만들고 서로 크리틱한다.", {
    x: M + 0.5, y: 5.26, w: CW - 1.0, h: 0.42,
    fontSize: 19, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("개인 프로젝트 기반 · 권장 20명 내외 · 실습실 · Figma 계정 · A0 출력 협력업체 필요", {
    x: M + 0.5, y: 5.72, w: CW - 1.0, h: 0.34,
    fontSize: 11.5, color: BODY_D, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("숫자로 기대치를 맞추는 슬라이드. 특히 '주 3시간 중 강의는 1시간 남짓'이라는 점을 여기서 못 박아야 이후 실습 비중에 대한 저항이 줄어든다. 개인 프로젝트라는 점도 함께 공지.");
}

/* ────────────────────────────────────────────────────────────
   3. 설계 원칙
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "PRINCIPLE", "이 과목이 설계된 방식", "세 가지 원칙이 15주 전체의 운영과 평가를 결정합니다.");
  const items = [
    ["01", "프로세스를 한 바퀴 돌린다", "발견에서 전달까지 네 단계를 빠짐없이 통과한다. 한 단계를 건너뛰면 다음 단계의 근거가 사라지기 때문에, 중간에 합류하거나 되돌아가는 설계를 두지 않는다."],
    ["02", "매주 손으로 만든다", "이론은 40%까지만 쓴다. 저니맵도 블루프린트도 패널 시안도 수업 시간 안에 만들기 시작한다. 집에서 완성할 것을 전제로 강의하지 않는다."],
    ["03", "공적 형식으로 끝낸다", "최종 산출물은 제출물이 아니라 전시 패널이다. 남이 3m 밖에서 보고 이해하는 형식까지 가야 프로젝트가 끝난 것으로 본다."],
  ];
  const cw = (CW - 0.4 * 2) / 3;
  items.forEach(([n, t, d], i) => {
    const x = M + i * (cw + 0.4);
    card(s, x, BODY_TOP + 0.18, cw, 3.1);
    chip(s, x + 0.42, BODY_TOP + 0.5, n, { size: 0.4, fontSize: 11.5 });
    s.addText(t, {
      x: x + 0.42, y: BODY_TOP + 1.04, w: cw - 0.84, h: 0.5,
      fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "top",
    });
    s.addText(d, {
      x: x + 0.42, y: BODY_TOP + 1.56, w: cw - 0.84, h: 1.5,
      fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
  });
  s.addText("→ 그래서 결석 3회, 14주차 인쇄 마감 지연에는 예외를 두지 않습니다.", {
    x: M, y: 5.36, w: CW, h: 0.48,
    fontSize: 13.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("운영 규정의 근거를 원칙에서 끌어오는 슬라이드. 규정을 먼저 말하면 통제로 들리지만, 원칙을 먼저 말하면 납득이 된다. 출력 일정이 물리적으로 되돌릴 수 없다는 점을 여기서 언급해둔다.");
}

/* ────────────────────────────────────────────────────────────
   4. 학습 목표
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "OUTCOMES", "15주 후 할 수 있게 되는 것", "각 목표는 특정 주차의 산출물로 검증됩니다.");
  const outs = [
    ["01", "서비스디자인 프로세스 전 과정을 스스로 한 바퀴 돌려본다", "리서치부터 전달까지 남의 지시 없이 다음 단계를 판단할 수 있다.", "1–15주"],
    ["02", "리서치 결과를 인사이트와 문제 진술로 번역할 수 있다", "관찰한 것과 해석한 것을 구분해 POV·HMW로 쓴다.", "5주차"],
    ["03", "서비스 컨셉을 화면·시나리오 수준까지 구체화한다", "블루프린트에서 프로토타입까지 끊기지 않게 이어간다.", "7·12주차"],
    ["04", "자신의 프로젝트를 전시 패널이라는 공적 형식으로 편집한다", "3m 거리에서 읽히는 정보 위계와 인쇄 사양을 갖춘다.", "13–14주차"],
    ["05", "포트폴리오로 재사용 가능한 아카이브를 남긴다", "이번 학기 작업이 다음 지원에 그대로 쓰이는 상태로 정리한다.", "15주차"],
  ];
  const rowH = 0.94;
  outs.forEach(([n, t, d, wk], i) => {
    const y = BODY_TOP + 0.14 + i * rowH;
    chip(s, M, y + 0.14, n, { size: 0.36, fontSize: 11 });
    s.addText(t, {
      x: M + 0.62, y: y + 0.06, w: 8.5, h: 0.36,
      fontSize: 14.5, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: M + 0.62, y: y + 0.42, w: 8.5, h: 0.3,
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
  s.addNotes("'알게 된다'가 아니라 '할 수 있게 된다'로 쓴 점을 짚을 것. 오른쪽 검증 주차는 평가 배점 슬라이드와 1:1로 연결된다. 학기 말에 이 슬라이드를 다시 띄워 자가진단하게 하면 효과가 좋다.");
}

/* ────────────────────────────────────────────────────────────
   5. 4대 역량 체계
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "COMPETENCY", "네 가지 역량을 순차적으로 쌓습니다",
       "학부 과목은 이 중 03 구현 · 04 전달에 시수 비중을 더 둡니다.");
  const comps = [
    ["01", "발견", "사용자와 맥락을 스스로 찾아내는 힘", "데스크 · 필드 리서치", "1–4주", false],
    ["02", "정의", "관찰을 문제 진술로 번역하는 힘", "인사이트 · POV · 컨셉 진술문", "5–8주", false],
    ["03", "구현", "개념을 형태와 논리로 만드는 힘", "프로토타입 · 디자인 시스템", "9–12주", true],
    ["04", "전달", "결과를 설득 가능한 형식으로 짓는 힘", "전시 패널 · 포트폴리오", "13–15주", true],
  ];
  const cw = (CW - 0.34 * 3) / 4;
  comps.forEach(([n, name, desc, tool, span, heavy], i) => {
    const x = M + i * (cw + 0.34);
    card(s, x, BODY_TOP + 0.14, cw, 3.5, heavy ? { fill: INK } : { fill: SURFACE });
    s.addText(n, {
      x: x + 0.42, y: BODY_TOP + 0.44, w: cw - 0.84, h: 0.6,
      fontSize: 34, color: heavy ? WHITE : INK, fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText(name, {
      x: x + 0.42, y: BODY_TOP + 1.12, w: cw - 0.84, h: 0.42,
      fontSize: 22, color: heavy ? WHITE : INK, fontFace: FB, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.42, y: BODY_TOP + 1.64, w: cw - 0.84, h: 0.8,
      fontSize: 11.5, color: heavy ? BODY_D : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
    rule(s, x + 0.42, BODY_TOP + 2.56, cw - 0.84, heavy ? LINE_D : "D2D2D2");
    s.addText(tool, {
      x: x + 0.42, y: BODY_TOP + 2.7, w: cw - 0.84, h: 0.56,
      fontSize: 11, color: heavy ? WHITE : INK_SOFT, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.2, valign: "top",
    });
    s.addText(span, {
      x: x + 0.42, y: BODY_TOP + 3.0, w: cw - 0.84, h: 0.3,
      fontSize: 10.5, bold: true, color: heavy ? "9A9A9A" : GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  });
  s.addText("대학원「컨셉트와 프로세스」와 같은 역량 축을 공유하되, 학부는 만들고 전달하는 쪽에 무게를 둡니다. 중복이 아니라 층위의 차이입니다.", {
    x: M, y: 5.62, w: CW, h: 0.5,
    fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0,
    lineSpacingMultiple: 1.25, valign: "top",
  });
  foot(s);
  s.addNotes("두 과목을 함께 지도하거나 연계 수강하는 학생이 있을 때 쓰는 슬라이드. 학부만 대상이면 마지막 문장은 건너뛰어도 된다. 03·04가 어두운 카드인 것은 이 과목의 무게중심을 시각적으로 표시한 것.");
}

/* ────────────────────────────────────────────────────────────
   6. 최종 산출물
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "DELIVERABLE", "최종 산출물 — 졸업 전시 패널");
  const lw = 5.6;
  card(s, M, BODY_TOP + 0.1, lw, 4.34, { fill: INK });
  s.addText("개인 1점", {
    x: M + 0.52, y: BODY_TOP + 0.44, w: lw - 1.04, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  s.addText("B0", {
    x: M + 0.52, y: BODY_TOP + 0.8, w: lw - 1.04, h: 1.0,
    fontSize: 64, color: WHITE, fontFace: FL, margin: 0, valign: "middle",
  });
  s.addText("900 × 1200 mm", {
    x: M + 0.52, y: BODY_TOP + 1.86, w: lw - 1.04, h: 0.4,
    fontSize: 22, color: WHITE, fontFace: FB, margin: 0, valign: "middle",
  });
  rule(s, M + 0.52, BODY_TOP + 2.44, lw - 1.04, LINE_D);
  [
    ["색상", "CMYK 변환 필수"],
    ["해상도", "이미지 300dpi 이상"],
    ["가독성", "3m 거리 기준 설계"],
    ["마감", "14주차 · 예외 없음"],
  ].forEach(([k, v], i) => {
    const y = BODY_TOP + 2.62 + i * 0.42;
    s.addText(k, {
      x: M + 0.52, y, w: 1.3, h: 0.34,
      fontSize: 11, bold: true, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(v, {
      x: M + 1.9, y, w: lw - 2.42, h: 0.34,
      fontSize: 12.5, color: "DDDDDD", fontFace: F, margin: 0, valign: "middle",
    });
  });

  const rx = M + lw + 0.44;
  const rw = CW - lw - 0.44;
  s.addText("부속 산출물", {
    x: rx, y: BODY_TOP + 0.14, w: rw, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  s.addText("패널 한 장이 전부가 아닙니다. 아래 다섯 가지가 남아야 다음 학기와 취업 지원에 그대로 재사용됩니다.", {
    x: rx, y: BODY_TOP + 0.5, w: rw, h: 0.56,
    fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0,
    lineSpacingMultiple: 1.28, valign: "top",
  });
  const subs = [
    ["리서치 리포트", "2–3주차 데스크·필드 리서치 정리본"],
    ["사용자 여정맵", "4주차 퍼소나와 함께 제작"],
    ["서비스 블루프린트", "7주차 컨셉 구조화 결과"],
    ["Figma 프로토타입", "12주차 사용성 테스트에 사용한 1식"],
    ["포트폴리오 아카이브 PDF", "15주차 최종 정리본"],
  ];
  subs.forEach(([t, d], i) => {
    const y = BODY_TOP + 1.24 + i * 0.66;
    chip(s, rx, y + 0.1, String(i + 1), { size: 0.3, fontSize: 10 });
    s.addText(t, {
      x: rx + 0.46, y: y + 0.02, w: rw - 0.46, h: 0.3,
      fontSize: 13, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(d, {
      x: rx + 0.46, y: y + 0.3, w: rw - 0.46, h: 0.28,
      fontSize: 10.5, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
  });
  foot(s);
  s.addNotes("패널 규격은 학과 전시 운영에 따라 바뀔 수 있다. 규격이 확정되지 않았다면 이 슬라이드를 띄우기 전에 학과와 협의할 것 — 13주차 그리드 실습이 이 수치에 묶여 있다. 부속 산출물 5종은 평가의 '아카이브 5%' 근거이기도 하다.");
}

/* ────────────────────────────────────────────────────────────
   7. DIVIDER — 커리큘럼
   ──────────────────────────────────────────────────────────── */
divider("01", "PART 01", "15주 커리큘럼",
        "네 단계를 어떤 순서로, 매주 몇 분씩, 어떤 산출물로 채우는지 전체 지도를 먼저 봅니다.")
  .addNotes("파트 전환. 여기서 20분 정도 전체 지도를 훑고, 세부는 주차별 슬라이드에서 다룬다.");

/* ────────────────────────────────────────────────────────────
   8. 15주 커리큘럼 지도
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "CURRICULUM", "15주 전체 지도", "발견 → 정의 → 개발 → 전달. 각 단계는 다음 단계의 재료를 만듭니다.");
  const cw = (CW - 0.34 * 3) / 4;
  PHASES.forEach((ph, pi) => {
    const x = M + pi * (cw + 0.34);
    const dark = pi >= 2;
    card(s, x, BODY_TOP + 0.14, cw, 4.08, dark ? { fill: INK } : { fill: SURFACE });
    s.addText("PHASE " + (pi + 1), {
      x: x + 0.4, y: BODY_TOP + 0.42, w: cw - 0.8, h: 0.26,
      fontSize: 9.5, bold: true, color: dark ? "9A9A9A" : GRAPHITE, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(
      [
        { text: ph.name, options: { fontSize: 22, color: dark ? WHITE : INK, fontFace: FB } },
        { text: "   " + ph.span, options: { fontSize: 11.5, color: dark ? MUTED : GRAPHITE, fontFace: F } },
      ],
      { x: x + 0.4, y: BODY_TOP + 0.74, w: cw - 0.8, h: 0.44, margin: 0, valign: "middle" }
    );
    s.addText(ph.desc, {
      x: x + 0.4, y: BODY_TOP + 1.24, w: cw - 0.8, h: 0.58,
      fontSize: 11, color: dark ? BODY_D : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.25, valign: "top",
    });
    rule(s, x + 0.4, BODY_TOP + 1.92, cw - 0.8, dark ? LINE_D : "D2D2D2");
    WEEKS.filter((w) => w.phase === pi).forEach((w, wi) => {
      const y = BODY_TOP + 2.02 + wi * 0.54;
      s.addText(w.n, {
        x: x + 0.4, y, w: 0.5, h: 0.5,
        fontSize: 15, color: dark ? MUTED : "A8A8A8", fontFace: FL, margin: 0, valign: "middle",
      });
      s.addText(w.title, {
        x: x + 0.94, y, w: cw - 1.34, h: 0.5,
        fontSize: 11, bold: true, color: dark ? WHITE : INK, fontFace: F, margin: 0,
        lineSpacingMultiple: 1.1, valign: "middle",
      });
    });
  });
  s.addText("8주차 중간 발표 · 12주차 사용성 테스트 리뷰 · 14주차 인쇄 데이터 마감이 세 개의 검증점입니다.", {
    x: M, y: 6.14, w: CW, h: 0.4,
    fontSize: 12, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("전체 지도. 각 Phase를 30초씩만 짚는다. 왼쪽 두 개(발견·정의)는 '무엇을 만들지 정하는' 기간, 오른쪽 두 개(개발·전달)는 '실제로 만들어 끝내는' 기간이라는 대비를 강조. 어두운 카드가 이 과목의 무게중심.");
}

/* ────────────────────────────────────────────────────────────
   9. 검증점과 크리틱 일정
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "CHECKPOINT", "세 개의 검증점", "이 세 시점을 통과하지 못하면 다음 단계로 넘어갈 수 없습니다.");
  const cps = [
    ["08", "중간 발표", "컨셉 검증", "개인별 15분 발표로 문제 정의와 서비스 컨셉의 설득력을 검증한다. 여기서 컨셉이 확정되어야 9주차부터 화면 작업에 들어갈 수 있다.", "평가 20%"],
    ["12", "사용성 테스트 리뷰", "구현 검증", "5인 테스트 결과를 리뷰해 화면과 플로우의 문제를 드러낸다. 여기서 나온 수정 사항이 13주차 패널 내용의 근거가 된다.", "디자인 완성도 20%에 반영"],
    ["14", "인쇄 데이터 마감", "전달 검증", "출력 발주와 직결되므로 지연 시 감점하며 예외를 두지 않는다. CMYK · 300dpi · 도련 사양을 모두 만족해야 접수된다.", "지연 시 감점"],
  ];
  const cw = (CW - 0.4 * 2) / 3;
  cps.forEach(([wk, name, kind, desc, tag], i) => {
    const x = M + i * (cw + 0.4);
    const dark = i === 2;
    card(s, x, BODY_TOP + 0.16, cw, 4.1, dark ? { fill: INK } : { fill: SURFACE });
    s.addText(
      [
        { text: wk, options: { fontSize: 44, color: dark ? WHITE : INK, fontFace: FT } },
        { text: "  주차", options: { fontSize: 13, color: dark ? MUTED : GRAPHITE, fontFace: F } },
      ],
      { x: x + 0.44, y: BODY_TOP + 0.5, w: cw - 0.88, h: 0.8, margin: 0, valign: "middle" }
    );
    s.addText(name, {
      x: x + 0.44, y: BODY_TOP + 1.4, w: cw - 0.88, h: 0.42,
      fontSize: 20, color: dark ? WHITE : INK, fontFace: FB, margin: 0, valign: "middle",
    });
    s.addText(kind, {
      x: x + 0.44, y: BODY_TOP + 1.84, w: cw - 0.88, h: 0.3,
      fontSize: 11, bold: true, color: dark ? "9A9A9A" : GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.44, y: BODY_TOP + 2.26, w: cw - 0.88, h: 1.3,
      fontSize: 11.5, color: dark ? BODY_D : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3, valign: "top",
    });
    rule(s, x + 0.44, BODY_TOP + 3.62, cw - 0.88, dark ? LINE_D : "D2D2D2");
    s.addText(tag, {
      x: x + 0.44, y: BODY_TOP + 3.76, w: cw - 0.88, h: 0.3,
      fontSize: 11, bold: true, color: dark ? WHITE : INK, fontFace: F, margin: 0, valign: "middle",
    });
  });
  s.addText("이와 별도로 5주차 1차 크리틱 · 11주차 2차 크리틱 · 14주차 최종 크리틱이 운영됩니다.", {
    x: M, y: 6.14, w: CW, h: 0.4,
    fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("검증점을 '평가'가 아니라 '다음 단계로 가는 관문'으로 설명할 것. 특히 8주차에 컨셉이 확정되지 않은 학생이 매년 나오는데, 그 경우 9주차 IA 작업이 공회전한다. 8주차 전에 1:1로 미리 걸러낼 것.");
}

/* ────────────────────────────────────────────────────────────
   10. 매주 180분 운영
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "SESSION", "매주 180분은 이렇게 씁니다", "강의 40% · 실습과 크리틱 60%. 만들면서 배우는 구조입니다.");
  const blocks = [
    ["70", "강의", "이론과 사례 분석", 70],
    ["60", "실습", "그 자리에서 만들기", 60],
    ["40", "크리틱", "동료 · 교수 피드백", 40],
    ["10", "랩업", "과제 안내와 정리", 10],
  ];
  const total = 180;
  const gap = 0.14;
  const usableW = CW - gap * 3;
  // 비례 폭을 쓰되, 가장 짧은 블록도 읽히도록 최소 폭을 확보하고 나머지에서 차감한다
  const MINW = 1.05;
  let widths = blocks.map((b) => (usableW * b[3]) / total);
  const deficit = widths.reduce((a, w) => a + Math.max(0, MINW - w), 0);
  const donor = widths.filter((w) => w > MINW).reduce((a, w) => a + w, 0);
  widths = widths.map((w) => (w < MINW ? MINW : w - (deficit * w) / donor));
  let x = M;
  const barY = BODY_TOP + 0.5;
  blocks.forEach(([mins, name, desc, val], i) => {
    const w = widths[i];
    const dark = i === 1 || i === 2;
    s.addShape(pres.ShapeType.rect, {
      x, y: barY, w, h: 1.0,
      fill: { color: dark ? INK : SURFACE },
      line: { color: dark ? INK : LINE, width: 1 },
    });
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
    ["크리틱", "5 · 11 · 14주차는 전원 크리틱입니다. 그 외 주차는 순회 지도와 조별 크리틱으로 운영합니다."],
    ["상담", "2주차 주제 상담은 1:1로 진행합니다. 20명 기준 한 명당 10분을 배정합니다."],
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
      x: nx, y: 5.50, w: nw, h: 0.9,
      fontSize: 11, color: GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
  });
  foot(s);
  s.addNotes("시간 배분은 기획안의 '강의 40% / 실습·크리틱 60%'를 분 단위로 옮긴 값이다. 실제 강의실 사정에 따라 조정하되 비율은 유지할 것. 수강 인원이 30명을 넘으면 5·11주차 전원 크리틱을 조별로 전환해야 한다.");
}

/* ────────────────────────────────────────────────────────────
   11–25. 주차별 상세 (레이아웃 3종 순환)
   ──────────────────────────────────────────────────────────── */
WEEKS.forEach((w, idx) => {
  const s = slideLight();
  const ph = PHASES[w.phase];
  head(s, "WEEK " + w.n + "  ·  PHASE " + (w.phase + 1) + " " + ph.name, w.title);

  const variant = idx % 3;
  const isLast = idx === WEEKS.length - 1;
  const deadline = isLast
    ? "최종 제출 · 학기 종료"
    : w.milestone
    ? "검증점 주차 · 마감 엄수"
    : "마감 — 다음 수업 24시간 전";

  if (variant === 0) {
    /* A — 좌: 다크 넘버 카드 / 우: 강의·실습·산출물 */
    const lw = 4.36;
    card(s, M, BODY_TOP, lw, 4.42, { fill: INK });
    s.addText(w.n, {
      x: M + 0.5, y: BODY_TOP + 0.34, w: 2.4, h: 1.24,
      fontSize: 78, color: ACCENT, fontFace: FT, margin: 0, valign: "middle",
    });
    s.addText("PHASE " + (w.phase + 1) + " · " + ph.name, {
      x: M + 0.5, y: BODY_TOP + 1.7, w: lw - 1.0, h: 0.28,
      fontSize: 10, bold: true, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(ph.desc, {
      x: M + 0.5, y: BODY_TOP + 2.04, w: lw - 1.0, h: 0.9,
      fontSize: 15, color: WHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.34, valign: "top",
    });
    if (w.milestone) {
      rule(s, M + 0.5, BODY_TOP + 3.3, lw - 1.0, LINE_D);
      s.addText("검증점 주차", {
        x: M + 0.5, y: BODY_TOP + 3.46, w: lw - 1.0, h: 0.32,
        fontSize: 12, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
      });
    }

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
  } else if (variant === 1) {
    /* B — 상: 다크 Phase 밴드 / 하: 3컬럼 */
    card(s, M, BODY_TOP, CW, 1.06, { fill: INK });
    s.addText("PHASE " + (w.phase + 1) + " · " + ph.name, {
      x: M + 0.46, y: BODY_TOP + 0.2, w: 3.0, h: 0.28,
      fontSize: 10, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(ph.desc, {
      x: M + 0.46, y: BODY_TOP + 0.5, w: CW - 3.4, h: 0.42,
      fontSize: 15, color: WHITE, fontFace: F, margin: 0, valign: "middle",
    });
    if (w.milestone) {
      s.addText("검증점 주차", {
        x: SW - M - 2.4, y: BODY_TOP + 0.34, w: 1.94, h: 0.38,
        fontSize: 11.5, bold: true, color: ACCENT, fontFace: F,
        align: "right", margin: 0, valign: "middle",
      });
    }

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
    chip(s, x3 + 0.4, cy + 0.4, "3", { size: 0.32, fontSize: 10 });
    s.addText("제출 산출물", {
      x: x3 + 0.82, y: cy + 0.4, w: colW - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(w.output, {
      x: x3 + 0.4, y: cy + 0.94, w: colW - 0.8, h: 1.4,
      fontSize: 13.5, bold: true, color: INK, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
    s.addText(deadline, {
      x: x3 + 0.4, y: cy + 2.5, w: colW - 0.8, h: 0.3,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
  } else {
    /* C — 좌: 강의 내용 넓게 / 우: 실습 카드 + 다크 산출물 카드 */
    const lw = 6.9;
    s.addText("강의 내용", {
      x: M, y: BODY_TOP + 0.04, w: lw, h: 0.28,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
    });
    bullets(s, w.lecture, { x: M, y: BODY_TOP + 0.44, w: lw, h: 2.3, fontSize: 13, gap: 12 });
    rule(s, M, BODY_TOP + 2.84, lw);
    s.addText("PHASE " + (w.phase + 1) + " · " + ph.name, {
      x: M, y: BODY_TOP + 3.00, w: lw, h: 0.28,
      fontSize: 10, bold: true, color: MUTED, fontFace: F, charSpacing: 1.4, margin: 0, valign: "middle",
    });
    s.addText(ph.desc, {
      x: M, y: BODY_TOP + 3.32, w: lw, h: 0.4,
      fontSize: 13.5, color: INK_SOFT, fontFace: F, margin: 0, valign: "middle",
    });

    const rx = M + lw + 0.46;
    const rw = CW - lw - 0.46;
    card(s, rx, BODY_TOP, rw, 2.06, { fill: SURFACE });
    chip(s, rx + 0.4, BODY_TOP + 0.36, "1", { size: 0.32, fontSize: 10.5 });
    s.addText("실습", {
      x: rx + 0.82, y: BODY_TOP + 0.36, w: rw - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(w.practice, {
      x: rx + 0.4, y: BODY_TOP + 0.9, w: rw - 0.8, h: 1.0,
      fontSize: 12, color: INK_SOFT, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.3, valign: "top",
    });

    card(s, rx, BODY_TOP + 2.32, rw, 2.1, { fill: INK });
    chip(s, rx + 0.4, BODY_TOP + 2.68, "2", { size: 0.32, fontSize: 10, onDark: true });
    s.addText("제출 산출물", {
      x: rx + 0.82, y: BODY_TOP + 2.68, w: rw - 1.2, h: 0.32,
      fontSize: 14, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(w.output, {
      x: rx + 0.4, y: BODY_TOP + 3.22, w: rw - 0.8, h: 0.86,
      fontSize: 13, bold: true, color: WHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.24, valign: "top",
    });
    s.addText(deadline, {
      x: rx + 0.4, y: BODY_TOP + 4.04, w: rw - 0.8, h: 0.3,
      fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, margin: 0, valign: "middle",
    });
  }
  foot(s);
  s.addNotes(
    "WEEK " + w.n + " · PHASE " + (w.phase + 1) + " " + ph.name + " — " + w.title + "\n" +
    "실습 운영: 60분 안에 끝낼 수 있는 범위로 쪼개 제시하고, 막힌 학생부터 순회 지도.\n" +
    "제출물: " + w.output + (w.milestone ? "\n※ 검증점 주차 — 미달 시 다음 단계 진행이 막히므로 사전 점검 필요." : "")
  );
});

/* ────────────────────────────────────────────────────────────
   26. DIVIDER — 평가와 운영
   ──────────────────────────────────────────────────────────── */
divider("02", "PART 02", "평가와 운영",
        "무엇을 어떤 기준으로 평가하는지, 무엇을 준비해야 하는지 첫 주에 모두 공개합니다.")
  .addNotes("파트 전환. 평가 기준을 1주차에 전부 공개하는 것이 원칙 — 기준이 공개되어야 학생이 자가진단을 할 수 있다.");

/* ────────────────────────────────────────────────────────────
   27. 평가 배점
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "GRADING", "평가 배점", "6개 항목 · 합계 100%");
  const rubric = [
    ["01", "출석 · 참여", 10, "출석 및 크리틱 참여도. 3회 이상 결석 시 학칙에 따라 처리", "전 주차"],
    ["02", "리서치 산출물", 20, "리서치 설계의 타당성, 퍼소나·저니맵의 근거 충실도", "2–5주"],
    ["03", "중간 발표", 20, "문제 정의의 명료성, 서비스 컨셉의 설득력, 발표 구성", "8주"],
    ["04", "디자인 완성도", 20, "화면 디자인 품질, 디자인 시스템 일관성, 사용성 테스트 반영", "9–12주"],
    ["05", "최종 패널", 25, "정보 위계와 가독성, 스토리텔링, 인쇄 사양 준수, 전시 완성도", "13–15주"],
    ["06", "아카이브", 5, "포트폴리오 PDF 정리 상태 및 재사용 가능성", "15주"],
  ];
  const rowH = 0.68;
  const barMaxW = 2.3;
  const barX = SW - M - barMaxW - 0.9;
  rubric.forEach(([n, name, pct, crit, span], i) => {
    const y = BODY_TOP + 0.16 + i * rowH;
    const top = pct === 25;
    chip(s, M, y + 0.14, n, { size: 0.32, fontSize: 10 });
    s.addText(name, {
      x: M + 0.58, y: y + 0.02, w: 2.7, h: 0.32,
      fontSize: 14, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(crit, {
      x: M + 0.58, y: y + 0.32, w: 6.0, h: 0.28,
      fontSize: 10.5, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(span, {
      x: M + 6.8, y: y + 0.14, w: 1.1, h: 0.32,
      fontSize: 10.5, color: MUTED, fontFace: F, margin: 0, valign: "middle",
    });
    s.addShape(pres.ShapeType.rect, {
      x: barX, y: y + 0.18, w: barMaxW, h: 0.14,
      fill: { color: "EAEAEA" }, line: { color: "EAEAEA", width: 0 },
    });
    s.addShape(pres.ShapeType.rect, {
      x: barX, y: y + 0.18, w: (barMaxW * pct) / 25, h: 0.14,
      fill: { color: top ? INK : "A8A8A8" }, line: { color: top ? INK : "A8A8A8", width: 0 },
    });
    s.addText(pct + "%", {
      x: SW - M - 0.85, y: y + 0.06, w: 0.85, h: 0.34,
      fontSize: 14.5, bold: true, color: top ? INK : GRAPHITE, fontFace: F,
      align: "right", margin: 0, valign: "middle",
    });
    if (i < rubric.length - 1) rule(s, M, y + rowH - 0.06, CW);
  });
  s.addText("배점이 가장 높은 항목은 최종 패널 25%입니다. 다만 리서치 20 · 중간 발표 20 · 디자인 완성도 20을 합한 60%가 학기 중 과정에 배정되어 있어, 마지막 결과물만으로는 학점이 나오지 않습니다.", {
    x: M, y: 6.02, w: CW, h: 0.5,
    fontSize: 12.5, bold: true, color: INK, fontFace: F, margin: 0,
    lineSpacingMultiple: 1.25, valign: "top",
  });
  foot(s);
  s.addNotes("1주차에 반드시 공개. 학생들이 가장 궁금해하는 슬라이드이므로 질문 시간을 충분히 준다. '패널만 잘 만들면 된다'는 오해를 여기서 깨야 2–5주 리서치 과제의 제출률이 유지된다.");
}

/* ────────────────────────────────────────────────────────────
   28. 루브릭 4단계
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "RUBRIC", "등급 기준", "모든 평가 항목에 아래 4단계 루브릭을 공통으로 적용합니다.");
  const grades = [
    ["A", "탁월", "근거 · 완성도 · 독창성을 모두 충족", true],
    ["B", "우수", "프로세스는 충실하나 완성도가 일부 미흡", false],
    ["C", "보통", "단계 이행은 했으나 근거가 빈약", false],
    ["D", "미흡", "산출물 누락", false],
  ];
  const cw = (CW - 0.36 * 3) / 4;
  grades.forEach(([g, name, desc, top], i) => {
    const x = M + i * (cw + 0.36);
    card(s, x, BODY_TOP + 0.16, cw, 2.5, top ? { fill: INK } : { fill: SURFACE });
    s.addText(g, {
      x: x + 0.42, y: BODY_TOP + 0.42, w: cw - 0.84, h: 0.86,
      fontSize: 54, color: top ? WHITE : "A8A8A8", fontFace: FL, margin: 0, valign: "middle",
    });
    s.addText(name, {
      x: x + 0.42, y: BODY_TOP + 1.34, w: cw - 0.84, h: 0.36,
      fontSize: 18, bold: true, color: top ? WHITE : INK, fontFace: F, margin: 0, valign: "middle",
    });
    s.addText(desc, {
      x: x + 0.42, y: BODY_TOP + 1.76, w: cw - 0.84, h: 0.66,
      fontSize: 11.5, color: top ? BODY_D : GRAPHITE, fontFace: F, margin: 0,
      lineSpacingMultiple: 1.28, valign: "top",
    });
  });

  card(s, M, 4.7, CW, 1.56, { fill: SURFACE });
  s.addText("감점 규정", {
    x: M + 0.5, y: 4.92, w: 3.0, h: 0.3,
    fontSize: 10.5, bold: true, color: ACCENT, fontFace: F, charSpacing: 1.2, margin: 0, valign: "middle",
  });
  s.addText("14주차 패널 인쇄 데이터 마감은 출력 일정과 직결되므로 예외를 두지 않습니다.", {
    x: M + 0.5, y: 5.26, w: CW - 1.0, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("지연 제출 시 최종 패널 항목에서 감점하며, 출력 발주가 불가능해지면 전시 참여 자체가 어려워집니다.", {
    x: M + 0.5, y: 5.7, w: CW - 1.0, h: 0.36,
    fontSize: 11.5, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("B와 C의 차이를 구체적으로 설명해줄 것 — '프로세스는 충실한데 완성도가 아쉬운' 경우와 '결과물은 그럴듯한데 근거가 없는' 경우. 후자가 C라는 점이 이 과목의 성격을 가장 잘 드러낸다.");
}

/* ────────────────────────────────────────────────────────────
   29. 수강 환경과 준비물
   ──────────────────────────────────────────────────────────── */
{
  const s = slideLight();
  head(s, "SETUP", "수강 환경과 준비물");
  const colW = (CW - 0.44) / 2;

  card(s, M, BODY_TOP + 0.1, colW, 3.92, { fill: WHITE, line: LINE });
  s.addText("개강 전 준비", {
    x: M + 0.46, y: BODY_TOP + 0.48, w: colW - 0.92, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  bullets(s, [
    "Figma 계정 — 교육 플랜(무료) 신청, 1주차 전 완료",
    "노트북 — Figma가 원활히 동작하는 사양",
    "관심 영역 3개를 문장으로 적어 올 것",
    "레퍼런스 전시 패널 5점 수집 (선배 졸업전시·공모전 등)",
    "인터뷰 대상자 후보 리스트 — 3주차에 실제 섭외로 이어집니다",
  ], { x: M + 0.46, y: BODY_TOP + 1.02, w: colW - 0.92, h: 2.7, fontSize: 12, gap: 11 });

  card(s, M + colW + 0.44, BODY_TOP + 0.1, colW, 3.92, { fill: SURFACE });
  s.addText("운영 환경", {
    x: M + colW + 0.9, y: BODY_TOP + 0.48, w: colW - 0.92, h: 0.4,
    fontSize: 17, bold: true, color: INK, fontFace: F, margin: 0, valign: "middle",
  });
  bullets(s, [
    "권장 인원 20명 내외 · 개인 프로젝트 기반",
    "실습실 — 매 수업 실습과 크리틱을 병행합니다",
    "A0 출력 협력업체 — 14주차 발주, 비용과 일정은 별도 공지",
    "결석 3회 이상은 학칙에 따라 처리됩니다",
    "인원이 30명을 넘으면 5·11주차 전원 크리틱을 조별로 전환합니다",
  ], { x: M + colW + 0.9, y: BODY_TOP + 1.02, w: colW - 0.92, h: 2.7, fontSize: 12, gap: 11 });

  s.addText("툴 사용법 자체는 수업에서 가르치지 않습니다. Figma 기초가 필요한 경우 1주차에 별도 워밍업 세션을 안내합니다.", {
    x: M, y: 5.86, w: CW, h: 0.4,
    fontSize: 12, color: GRAPHITE, fontFace: F, margin: 0, valign: "middle",
  });
  foot(s);
  s.addNotes("출력 비용 부담 주체가 확정되지 않았다면 '별도 공지'로 두고 넘어갈 것. 학생 부담이면 1주차에 금액 범위를 미리 알려야 나중에 문제가 생기지 않는다. 인원이 30명을 넘는 경우 크리틱 운영 방식은 2주차 전까지 확정해 공지.");
}

/* ────────────────────────────────────────────────────────────
   30. 마무리 — 1주차 과제
   ──────────────────────────────────────────────────────────── */
{
  const s = slideDark();
  s.addText("01", {
    x: SW - M - 4.4, y: 0.9, w: 4.4, h: 5.6,
    fontSize: 255, color: INK_SOFT, fontFace: FT, align: "right", valign: "middle", margin: 0,
  });
  s.addText("NEXT WEEK", {
    x: M, y: 1.5, w: 7.6, h: 0.3,
    fontSize: 11, bold: true, color: ACCENT_D, fontFace: F, charSpacing: 2, margin: 0, valign: "middle",
  });
  s.addText("다음 주까지 해올 것", {
    x: M, y: 1.9, w: 7.6, h: 0.7,
    fontSize: 38, color: WHITE, fontFace: FB, margin: 0, valign: "middle",
  });
  const todo = [
    ["01", "관심 영역 3개를 각각 한 문장으로 적어 온다"],
    ["02", "레퍼런스 전시 패널 5점을 수집하고, 무엇이 먼저 읽혔는지 메모한다"],
    ["03", "Figma 계정을 만들고 교육 플랜을 신청한다"],
  ];
  todo.forEach(([n, t], i) => {
    const y = 2.95 + i * 0.62;
    chip(s, M, y + 0.04, n, { size: 0.34, fontSize: 10.5, onDark: true });
    s.addText(t, {
      x: M + 0.62, y, w: 7.6, h: 0.42,
      fontSize: 14, color: "DDDDDD", fontFace: F, margin: 0, valign: "middle",
    });
  });
  rule(s, M, 5.22, 7.6, LINE_D);
  s.addText("주제가 아직 없어도 괜찮습니다. 2주차에 후보 3안을 함께 좁혀 나갑니다.", {
    x: M, y: 5.46, w: 7.8, h: 0.44,
    fontSize: 15, bold: true, color: WHITE, fontFace: F, margin: 0, valign: "middle",
  });
  s.addText("원광대학교 2026-2 · 서비스디자인 · 학부 3학년", {
    x: M, y: 6.2, w: 7.8, h: 0.3,
    fontSize: 10.5, color: MUTED, fontFace: F, margin: 0, valign: "middle",
  });
  s.addNotes("오리엔테이션 마무리. 과제 3개는 화면에 띄운 채 읽어주고 강의 게시판에도 동일하게 공지한다. '주제가 없어도 괜찮다'로 끝내면 1주차 이탈이 줄어든다. 2주차 1:1 상담 시간표도 이때 배포할 것.");
}

/* ──────────────────────────────────────────────────────────── */
const out = path.join(__dirname, "..", "dist", "서비스디자인_1학기_15주_개요.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("생성 완료:", out));
