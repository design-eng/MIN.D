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
