/* 대학원 제3차 과제 피드백 — 2026-10-08 교수님 교정본의 구조와 문체를 따른다.
   섹션: 잘한 점(불릿) / 보완할 점(번호, 한 항목에 이어 씀) /
         다음 과제(번호, 한 항목에 이어 씀) / 추가 안내(불릿)
   질문형을 쓰지 않고, 학생 글을 인용하지 않으며, 다른 학생을 언급하지 않는다.
   추가 안내는 회차마다 달라지므로 학생별 배열로 둔다. */
const { Document, Packer, Paragraph, TextRun, AlignmentType,
        BorderStyle, LevelFormat, convertInchesToTwip } = require("docx");
const fs = require("fs");
const F = "Pretendard", INK = "111111", GRAY = "4A4A4A";
const rule = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C8C8C8", space: 8 } };
const ruleThick = { bottom: { style: BorderStyle.SINGLE, size: 12, color: "111111", space: 6 } };
const p = (text, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 0, after: o.after ?? 96, line: 286 },
  border: o.border, numbering: o.numbering,
  children: [new TextRun({ text, font: F, size: o.size ?? 20, bold: o.bold, color: o.color ?? INK })],
});
const h = (text) => p(text, { size: 23, bold: true, before: 240, after: 120, border: rule });

const STUDENTS = [
  {
    file: "3차과제_피드백_피영극.docx",
    topic: "중국 전통 그림자극의 시각언어 재해석을 통한 현대 그래픽디자인 연구 — 산시성 동로 그림자극을 중심으로",
    good: [
      "연구 대상을 산시성 동로 그림자극으로 한정하여 범위를 좁혔습니다.",
      "제2차 과제에서 지적한 다섯 항목에 모두 답했습니다.",
      "표본 선정 기준을 지역과 시대, 출처 추적, 시각적 판독, 비교 가능성, 중복과 편중, 색채 정보의 여섯 항목으로 표에 정리했습니다.",
      "표본마다 고유번호를 부여하고 기록할 항목 아홉 가지를 정했습니다.",
      "통계적 코드화 대신 시각적 형식 분석과 서술형 기록으로 진행한다고 방법을 분명히 밝혔습니다.",
      "연구 일정을 12주 주차별 표로 작성했고, 표본이 제한된 점과 외부 평가를 하지 않는 점을 연구의 한계로 적었습니다.",
    ],
    fix: [
      "선행연구가 참고자료에서 빠졌습니다. 제2차 과제에서 정리한 다섯 편이 이번 과제에 들어오지 않았고 기관 웹사이트 두 곳만 남았습니다. 본문에서 문헌을 근거로 삼겠다고 여러 차례 적었으므로 그 문헌이 무엇인지 밝혀야 합니다.",
      "연구자 1인이 검증한다는 결정의 근거가 없습니다. 본인이 만든 디자인을 본인이 평가하는 구조이므로, 같은 방식으로 진행한 선행연구를 근거로 제시하거나 외부 확인 절차를 일부라도 넣어야 합니다.",
      "표본 수가 확정되지 않았습니다. 12점으로 적었으나 자료 확보 상황에 따라 정한다고 되어 있고, 왜 12점인지에 대한 근거도 없습니다. 검토한 선행연구의 표본 수와 비교하여 적정 여부를 설명해야 합니다.",
      "디자인 결과물의 수가 제시되지 않았습니다. 표본 12점을 분석한 뒤 몇 점의 디자인을 제작할 것인지 작성해야 합니다.",
      "서술형 검증의 기록 양식이 없습니다. 점수를 매기지 않기로 했다면 무엇을 어느 칸에 적을 것인지 정해야 하며, 표본 선정 기준과 같은 형식으로 표를 만들면 됩니다.",
      "동로 그림자극을 선택한 이유가 제시되지 않았습니다. 자료 확보가 쉬워서인지, 시각적 특징이 뚜렷해서인지 설명해야 합니다.",
    ],
    next: [
      "제2차 과제에서 정리한 선행연구 다섯 편을 참고자료에 넣고, 본문에서 문헌을 근거로 한다고 적은 자리마다 어느 연구인지 밝히십시오. 지금은 근거로 삼겠다는 문헌이 한 편도 확인되지 않습니다.",
      "연구자 1인 검증을 택한 근거를 선행연구에서 찾아 한 문단으로 쓰십시오. 같은 방식으로 진행한 연구가 있으면 그 절차를 따르면 됩니다.",
      "표본 수를 확정하고 그 근거를 선행연구의 표본 수와 비교하여 쓰십시오. 검토한 연구 중 한 편은 86점을 사용했으므로 12점이 적정한 이유를 설명해야 합니다.",
      "검증 기록표를 한 장 만드십시오. 표본 선정 기준표와 같은 형식으로, 유지·변형·생략을 구분해 적을 칸을 두면 됩니다.",
    ],
    notes: [
      "계획한다가 아니라 확정된 수치로 적어야 하며, 12주 일정도 시작 시점을 밝혀 논문 제출 일정과 맞는지 확인해야 합니다.",
      "항목 번호가 1번 다음 3번으로 이어집니다. 표본 수와 선정 기준이 2번 제목을 잃었으므로 번호를 다시 매겨야 합니다.",
    ],
  },
  {
    file: "3차과제_피드백_둔황벽화.docx",
    topic: "AIGC 기반 시각적 내러티브 디자인 방법론 — 문화적 요소 추출과 연속 이미지 생성을 중심으로",
    good: [
      "연구 유형을 사용자 실험에서 디자인 실천 방법론으로 바꾸고 전체 구조를 다시 세웠습니다.",
      "디자인 수준에서 확인할 수 있는 것과 사용자 수준에서 확인해야 하는 것을 구분하고, 후자는 주장하지 않겠다고 여러 곳에 밝혔습니다.",
      "핵심 개념 여덟 가지를 정의와 증거 항목으로 나누어 표에 정리했습니다.",
      "연구 과정을 일곱 단계로 나누고 각 단계의 산출물을 지정했습니다.",
      "분석 차원 일곱 가지마다 관찰할 문제와 필요한 증거를 표로 정리했습니다.",
      "실패한 생성 버전을 보관해 과정 자료로 쓰겠다고 밝혔고, 양식적 유사성을 문화적 정확성과 동일시하지 않는다고 적었습니다.",
    ],
    fix: [
      "선행연구가 두 차례 연속 제시되지 않았습니다. 제2차 과제에서 선행연구 조사가 과제의 핵심이라고 밝혔으나 이번 과제에도 참고문헌이 한 편도 없습니다. 관련 연구를 검토한다는 계획만 있을 뿐 어떤 연구인지 확인되지 않습니다.",
      "분석 대상 벽화가 정해지지 않았습니다. 선정 기준 세 가지만 제시되어 있고 어느 굴의 어느 벽화인지 작성되지 않았습니다. 대상이 확정되어야 문화 요소 추출을 시작할 수 있습니다.",
      "숫자가 연속 이미지 약 6프레임 하나뿐이고, 그마저도 개수에 맞추지 않는다고 다시 열어 두었습니다. 분석할 벽화 수, 생성할 이미지 총 수, 반복 수정 횟수를 확정해야 합니다.",
      "연구 일정이 제시되지 않았습니다. 일곱 단계를 설정했으므로 각 단계에 몇 주가 필요한지 작성해야 합니다.",
      "검증 주체가 확정되지 않았습니다. 전문가를 참여시키지 않은 경우를 조건으로 적어 두었을 뿐, 전문가 검증을 할 것인지 연구자 혼자 할 것인지 정해지지 않았습니다.",
      "연구 제목과 연구 유형이 바뀌었는데 그 사실과 이유가 적혀 있지 않습니다. 제2차 과제의 혼합현실과 사용자 실험이 모두 빠졌으므로 무엇을 왜 바꾸었는지 앞부분에 설명해야 합니다.",
    ],
    next: [
      "AIGC를 활용한 문화유산 이미지 생성, 시각적 내러티브, 연속 이미지의 일관성 가운데 선행연구 다섯 편을 조사해 목록을 작성하십시오. 두 차례 미루었으므로 이번에는 다른 항목보다 먼저 해야 합니다.",
      "분석 대상 벽화를 굴 번호와 소장 정보까지 확정하십시오. 대상이 정해지면 문화 요소 표의 첫 줄을 바로 채울 수 있습니다.",
      "생성할 이미지 총 수와 단계별 소요 기간을 확정하십시오. 일곱 단계 표에 주차를 적는 칸을 하나 더 두면 됩니다.",
      "검증 주체를 확정하십시오. 전문가 평가라면 참여 인원과 평가 항목을, 연구자 단독이라면 그 방식을 사용한 선행연구를 근거로 제시하십시오.",
    ],
    notes: [
      "문체가 섞여 있습니다. 한 문서 안에 ~하십시오, ~합니다, ~한다, ~할까요가 함께 쓰이고 아직 하지 않은 일이 과거형으로 적힌 곳도 있습니다. 제출 전에 서술형으로 통일해야 합니다.",
      "본 논문, 이 글, 본 연구, 우리는이 뒤섞여 있습니다. 하나로 정해 끝까지 써야 합니다.",
    ],
  },
];

function build(st) {
  const C = [];
  C.push(p("컨셉트와 프로세스 · 대학원 박사과정 · 2026-2학기", { size: 16, color: GRAY, after: 60 }));
  C.push(p("제3차 과제 피드백", { size: 34, bold: true, after: 80 }));
  C.push(p(st.topic, { size: 20, color: GRAY, after: 100, border: ruleThick }));

  C.push(h("잘한 점"));
  st.good.forEach(t => C.push(p(t, { numbering: { reference: "b", level: 0 }, after: 76 })));

  C.push(h("보완할 점"));
  st.fix.forEach(t => C.push(p(t, { numbering: { reference: "q", level: 0 }, after: 104 })));

  C.push(h("다음 과제"));
  st.next.forEach(t => C.push(p(t, { numbering: { reference: "r", level: 0 }, after: 104 })));

  C.push(h("추가 안내"));
  st.notes.forEach((t, i) => C.push(p(t, { numbering: { reference: "b", level: 0 },
                                           after: i === st.notes.length - 1 ? 40 : 76 })));

  const dec = (ref) => ({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
    style: { paragraph: { indent: { left: convertInchesToTwip(0.34), hanging: convertInchesToTwip(0.34) } } } }] });
  return new Document({
    creator: "MIN.D", title: "제3차 과제 피드백",
    numbering: { config: [
      dec("q"), dec("r"),
      { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.30), hanging: convertInchesToTwip(0.20) } } } }] },
    ]},
    styles: { default: { document: { run: { font: F, size: 20, color: INK } } } },
    sections: [{ properties: { page: { margin: { top: 1080, right: 1100, bottom: 1000, left: 1100 } } }, children: C }],
  });
}

(async () => {
  const outDir = process.argv[2];
  for (const st of STUDENTS) {
    fs.writeFileSync(outDir + "/" + st.file, await Packer.toBuffer(build(st)));
    console.log("생성:", st.file);
  }
})();
