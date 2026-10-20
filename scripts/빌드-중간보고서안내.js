/* 서비스디자인 중간보고서 배포용 안내문.
   주차는 학사 주차로 적는다 — 자료 번호는 한 칸 뒤처져 있다.
   중간평가는 9주차(10/28), 이 안내를 하는 수업은 8주차(10/21). (2026-10-20)
   실행: node scripts/빌드-중간보고서안내.js <출력디렉터리>  (docx 모듈 필요) */
const { Document, Packer, Paragraph, TextRun, AlignmentType,
        BorderStyle, LevelFormat, convertInchesToTwip } = require("docx");
const fs = require("fs");
const F = "Pretendard", INK = "111111", GRAY = "5A5A5A";
const rule = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C8C8C8", space: 8 } };
const ruleThick = { bottom: { style: BorderStyle.SINGLE, size: 12, color: "111111", space: 6 } };
const p = (text, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 0, after: o.after ?? 110, line: 300 },
  border: o.border, numbering: o.numbering,
  children: [new TextRun({ text, font: F, size: o.size ?? 20, bold: o.bold, color: o.color ?? INK })],
});
const rich = (runs, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 0, after: o.after ?? 110, line: 300 },
  numbering: o.numbering, border: o.border,
  children: runs.map(r => new TextRun({ text: r.t, font: F, size: r.size ?? 20, bold: r.bold, color: r.color ?? INK })),
});
const h = (text) => p(text, { size: 24, bold: true, before: 280, after: 120, border: rule });

const C = [];
C.push(p("서비스디자인 · 학부 3학년 · 2026-2학기", { size: 16, color: GRAY, after: 60 }));
C.push(p("중간 보고서 작성 안내", { size: 34, bold: true, after: 80 }));
C.push(p("9주차(10월 28일) 중간평가 제출물 · 8주차 수업에서 안내한 내용입니다.", { size: 20, color: GRAY, after: 100, border: ruleThick }));

C.push(h("제출 개요"));
C.push(rich([{ t: "마감 — ", bold: true }, { t: "10월 28일(수) 수업 시작 전까지. 수업 중 제출은 지연으로 처리합니다." }], { numbering: { reference: "b", level: 0 } }));
C.push(rich([{ t: "형식 — ", bold: true }, { t: "PDF 와 Figma 링크 둘 다. 한쪽만 내면 미제출로 봅니다. 컴포넌트와 인스턴스는 파일을 열어야 확인됩니다." }], { numbering: { reference: "b", level: 0 } }));
C.push(rich([{ t: "파일 이름 — ", bold: true }, { t: "학번_이름_중간보고서" }], { numbering: { reference: "b", level: 0 } }));
C.push(rich([{ t: "분량 — ", bold: true }, { t: "여덟 장. 표와 그림 위주로 쓰고 설명은 짧게 씁니다. 분량을 늘리려고 글을 늘리지 않습니다." }], { numbering: { reference: "b", level: 0 } }));
C.push(rich([{ t: "중간평가 수업 방식 — ", bold: true }, { t: "발표가 아닙니다. 1인 10분 동안 보고서를 띄워 놓고 묻는 자리입니다. 발표 준비는 하지 않아도 되지만, 보고서를 본인이 설명할 수 있어야 합니다." }], { numbering: { reference: "b", level: 0 } }));

C.push(h("보고서 여덟 장"));
C.push(p("새로 쓰는 것은 첫 장과 마지막 장뿐입니다. 나머지 여섯 장은 2주차부터 지금까지 만든 것을 모아 순서대로 놓는 일입니다.", { color: GRAY, after: 140 }));
const sheets = [
  ["표지", "서비스 이름 · 한 문장 정의 · 학번과 이름. 한 문장 정의는 2주차 발표에서 쓴 것이며, 그동안 바뀌었으면 바뀐 것으로 적습니다.", "새로 씁니다"],
  ["작업 범위", "2주차에 낸 확정서를 지금 기준으로 고칩니다. 만들 화면 목록 · 패널에 실을 화면 · 아직 비어 있는 것.", ""],
  ["규격 표", "기준 화면 폭 · 하단 GNB · 헤더 · 리스트 · 카드 · 아이콘 · 입력 요소 · 버튼 · 세그먼트 탭. 3~6주차에 쌓은 값을 한 장에 모읍니다.", ""],
  ["토큰 표", "색 · 글자 · 간격. 값과 이름과 쓰는 자리까지 적습니다. 5주차 산출물입니다.", ""],
  ["컴포넌트 목록", "만든 컴포넌트와 배리언트, 그리고 화면에서 쓰인 인스턴스 수. Figma 에서 인스턴스 수가 표시됩니다.", ""],
  ["흐름 지도와 흐름 셋", "흐름끼리 어떻게 이어지는지 한 장, 그리고 흐름 셋의 화면 전체. 7~8주차 산출물입니다.", ""],
  ["화면 목록표", "8주차에 만든 여섯 칸 표. 보고서에서 가장 중요한 장입니다.", ""],
  ["남은 일정", "10~15주차에 무엇을 언제 할지. 화면 목록표에서 상태가 '없음'인 줄의 개수를 남은 주차로 나누면 나옵니다.", "새로 씁니다"],
];
sheets.forEach(([t, d, tag], i) => {
  const no = String(i + 1).padStart(2, "0");
  C.push(rich([
    { t: no + "  ", bold: true, color: GRAY },
    { t: t, bold: true },
    ...(tag ? [{ t: "  — " + tag, bold: true, color: GRAY, size: 18 }] : []),
  ], { after: 40 }));
  C.push(p(d, { color: GRAY, after: 130 }));
});

C.push(h("화면 목록표 — 여섯 칸"));
C.push(p("보고서의 중심 문서이자 남은 여덟 주의 작업 지시서입니다. 만든 것의 목록이 아니라 필요한 것의 목록으로 씁니다.", { color: GRAY, after: 130 }));
[
  ["번호", "흐름별로 매깁니다. A-01, A-02. 전체 일련번호로 하면 중간에 하나 끼울 때 전부 밀립니다."],
  ["화면 이름", "Figma 안의 프레임 이름과 똑같이 적습니다."],
  ["속한 흐름", "여럿이면 여럿 다 적습니다. 두 개 이상이면 겹치는 화면입니다."],
  ["상태", "완료 / 작업 중 / 없음. 아직 없는 화면도 반드시 적습니다."],
  ["패널 게재", "졸업 전시 패널에 올릴 후보에 표시합니다. 13주차에 확정합니다."],
  ["메모", "겹치는 화면의 네 가지, 돌아올 때 유지할 것."],
].forEach(([k, v]) => C.push(rich([{ t: k + " — ", bold: true }, { t: v }], { numbering: { reference: "b", level: 0 } })));
C.push(p("표를 채우고 나서 전체가 15~25장인지, 상태가 '없음'인 줄이 몇 장인지, 패널 후보가 5~8장 있는지 확인합니다. '없음'의 개수가 남은 작업량입니다.", { before: 110, color: GRAY }));

C.push(h("평가에서 보는 다섯 가지"));
[
  ["시스템으로 조립되었는가", "직접 그린 요소가 남아 있지 않은가. 2학기 전체의 기준입니다."],
  ["흐름이 이어지는가", "화면 수가 아니라 처음부터 끝까지 따라갈 수 있는가를 봅니다."],
  ["규격이 지켜지는가", "같은 요소가 화면마다 같은 크기와 같은 자리에 있는가."],
  ["상태와 예외가 있는가", "빈 화면 · 불러오는 중 · 오류. 정상 화면만 있으면 절반만 한 것입니다."],
  ["남은 작업이 현실적인가", "남은 기간에 못 할 계획을 적어 내면 그 자체가 문제입니다."],
].forEach(([k, v], i) => C.push(rich([{ t: k + " — ", bold: true }, { t: v }], { numbering: { reference: "q", level: 0 } })));

C.push(h("내기 전 점검표"));
[
  "보고서가 여덟 장으로 되어 있다",
  "화면 목록표에 상태가 '없음'인 줄이 있다",
  "흐름이 셋이고 그중 하나가 만드는 흐름이다",
  "겹치는 화면이 한 벌만 있고 복제본이 없다",
  "겹치는 화면 옆에 돌아가는 곳 · 처음 상태 · 노출 · 유지할 것이 적혀 있다",
  "상태 화면 3종이 보고서에 들어 있다",
  "컴포넌트 목록에 인스턴스 사용 수가 적혀 있다",
  "남은 일정이 주차별 작업량으로 적혀 있다",
  "직접 그린 요소가 한 개도 남아 있지 않다",
  "PDF 와 Figma 링크를 둘 다 냈다",
  "파일 이름이 학번_이름_중간보고서 다",
].forEach(t => C.push(p(t, { numbering: { reference: "b", level: 0 }, after: 70 })));
C.push(p("앞의 두 가지와 마지막 두 가지를 먼저 보십시오. 복제본이 남아 있거나 한쪽만 내면 나머지가 아무리 좋아도 깎입니다.", { before: 130, color: GRAY }));

const doc = new Document({
  creator: "MIN.D", title: "중간 보고서 작성 안내",
  numbering: { config: [
    { reference: "q", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
      style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } }] },
    { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "—", alignment: AlignmentType.START,
      style: { paragraph: { indent: { left: convertInchesToTwip(0.35), hanging: convertInchesToTwip(0.25) } } } }] },
  ]},
  styles: { default: { document: { run: { font: F, size: 20, color: INK } } } },
  sections: [{ properties: { page: { margin: { top: 1300, right: 1200, bottom: 1300, left: 1200 } } }, children: C }],
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(process.argv[2], b); console.log("wrote", process.argv[2]); });
