/* 포트폴리오 검수 의견 — 학생에게 전달하는 문서.
   구조와 문체는 대학원 과제 피드백과 같다(원칙 21).
   제목만 '검수 의견'으로 두고, 설명형 톤(원칙 24)을 따른다.
   실행: node scripts/빌드-포트폴리오검수.js <출력디렉터리>  (docx 모듈 필요) */
const { Document, Packer, Paragraph, TextRun, AlignmentType,
        BorderStyle, LevelFormat, convertInchesToTwip } = require("docx");
const fs = require("fs");
const F = "Pretendard", INK = "111111", GRAY = "4A4A4A";
const rule = { bottom: { style: BorderStyle.SINGLE, size: 6, color: "C8C8C8", space: 8 } };
const ruleThick = { bottom: { style: BorderStyle.SINGLE, size: 12, color: "111111", space: 6 } };
const p = (text, o = {}) => new Paragraph({
  spacing: { before: o.before ?? 0, after: o.after ?? 76, line: 272 },
  border: o.border, numbering: o.numbering,
  children: [new TextRun({ text, font: F, size: o.size ?? 20, bold: o.bold, color: o.color ?? INK })],
});
const h = (text) => p(text, { size: 22.5, bold: true, before: 190, after: 96, border: rule });

const DOCS = [
  {
    file: "포트폴리오_검수의견_소상섭.docx",
    course: "포트폴리오제작 · 성인학습반 · 2026-2학기",
    title: "포트폴리오 검수 의견",
    topic: "목조건축 BIM 설계 · 구조용 집성재 제작 — 소상섭",
    good: [
      "설계와 제작, 가공, 현장 시공까지 전 과정을 한 사람이 수행한 이력을 담았습니다. 이 포트폴리오의 가장 큰 강점입니다.",
      "2022년부터 2025년까지 일곱 건의 이력을 연도순으로 정리했습니다.",
      "두 프로젝트를 개요 · 인사이트 · 프로세스 · 결과의 같은 틀로 구성해 통일감이 있습니다.",
      "BIM 모델과 시공 사진을 나란히 배치해 설계가 현장으로 이어지는 과정을 보여 주었습니다.",
      "공장 가공과 준공 장면 등 직접 확보한 자료를 사용했습니다.",
    ],
    fix: [
      "수치가 제시되지 않았습니다. 「초대형 집성재」라고 적었으나 부재의 길이와 수량, 건축 면적, 가공 오차, 소요 기간이 한 곳에도 없습니다. 목조건축에서는 수치가 역량을 보여 주는 가장 직접적인 정보입니다.",
      "문제와 해결 과정이 없습니다. 인사이트 세 줄이 모두 일반적인 원칙 서술입니다. 실제로 막혔던 상황과 그것을 어떻게 해결했는지를 프로젝트마다 하나씩 적는 것이 좋습니다.",
      "본인의 역할과 기여 범위가 구분되지 않았습니다. 참여 업무만 나열되어 있어 단독 수행인지 협업인지, 그중 무엇을 맡았는지 확인하기 어렵습니다.",
      "보유 기술과 장비가 제시되지 않았습니다. BIM 소프트웨어의 종류, 5축 CNC 장비의 기종과 가공 범위, 자격 사항을 적으면 역량의 수준이 드러납니다.",
      "표지와 자기소개가 비어 있습니다. 표지에 과목명인 「포트폴리오 제작」이 들어가 있고, 이름 외에 직무와 연락처가 없습니다. 본인을 소개하는 쪽도 따로 없습니다.",
      "도면이 한 장도 없습니다. BIM 설계가 핵심 역량이므로 접합부 상세도 한 장을 넣으면 모델 이미지 여러 장보다 효과적입니다.",
      "상세히 소개한 프로젝트가 두 건입니다. 이력에는 일곱 건이 있으므로 한 건을 더 넣는 것이 좋습니다.",
      "표기와 형식에 빠진 것이 있습니다. 2쪽 건축 이력과 8쪽 북한산 자연학습장의 머리글이 모두 「PROJECT 01 · 나주 스마트산림바이오」로 되어 있고, 목차와 쪽번호가 없습니다.",
    ],
    next: [
      "두 프로젝트의 수치를 채우십시오. 부재의 최대 길이와 수량, 건축 면적, 가공 오차, 설계와 제작과 시공에 걸린 기간을 적으면 됩니다. 이미 알고 계신 내용이므로 반나절이면 가능합니다.",
      "프로젝트마다 실제로 막혔던 상황을 하나씩 쓰십시오. 가공 오차, 현장 조립 간섭, 운반 길이 제약과 같은 것이면 됩니다. 그 상황과 해결 방법을 한 쪽으로 정리하면 지금의 인사이트 쪽을 대체할 수 있습니다.",
      "표지를 다시 만들고 자기소개와 보유 기술을 한 쪽으로 넣으십시오. 표지에는 이름, 직무를 설명하는 한 줄, 연락처, 작성 연도를 적습니다.",
      "머리글 오류를 고치고 목차와 쪽번호를 넣으십시오. 한 시간이면 끝나는 작업입니다.",
      "여유가 되면 세 번째 프로젝트와 접합부 상세도를 추가하십시오.",
    ],
    notes: [
      "첫 번째와 두 번째만 보완해도 설득력이 크게 달라집니다. 알고 계신 내용을 지면으로 옮기는 작업입니다.",
      "사진이 회사 프로젝트 자료라면 사용 범위를 미리 확인하시는 것이 좋습니다.",
      "마무리 문구의 「창조자」보다 전 과정을 직접 수행했다는 사실을 그대로 적는 편이 더 강하게 읽힙니다.",
    ],
  },
  {
    file: "포트폴리오_검수의견_김다혜.docx",
    course: "포트폴리오제작 · 성인학습반 · 2026-2학기",
    title: "포트폴리오 검수 의견",
    topic: "공간디자인 · 원도심 재생 · 상업공간 · 전시공간 — 김다혜",
    good: [
      "원도심 재생과 상업공간, 전시공간을 함께 다루어 작업 범위가 넓다는 점이 드러납니다.",
      "머리글과 쪽번호, 제목 위치, 이미지와 캡션의 배치가 끝까지 같은 틀로 유지됩니다.",
      "색과 글자를 절제했습니다. 크림 바탕에 진한 초록 번호만 쓰는 구성이라 이미지가 먼저 읽힙니다.",
      "모락의 평면도와 단면도를 함께 넣어 층별 구성이 읽힙니다. 설계 근거가 가장 잘 보이는 쪽입니다.",
    ],
    fix: [
      "자기소개 글이 없습니다. 2쪽에 작업 태도를 적은 두 줄이 있을 뿐, 어떤 사람이고 어떤 공간을 다루고 싶은지를 쓴 글이 없습니다. 사진 자리는 색면으로 남아 있고 학력은 「원광대학교 전공」이라고만 되어 있습니다.",
      "처음 보는 사람을 위한 설명이 없습니다. 각 프로젝트가 이미지와 두 줄 캡션으로만 되어 있어, 어떤 공간을 누구를 위해 어떻게 구성했는지가 한 번에 읽히지 않습니다.",
      "바뀌기 전과 바뀐 뒤가 구분되지 않습니다. 5쪽에 기존 상가 사진과 제안 이미지가 나란히 있으나 표기가 없습니다. 재생 프로젝트에서는 이 비교가 성과를 보여 주는 자리입니다.",
      "수치가 없습니다. 세 프로젝트 모두 면적과 층수, 주요 실의 크기, 작업 기간이 한 곳에도 없습니다.",
      "직접 작업한 이미지와 참고 이미지가 구분되지 않았습니다. 10쪽은 직접 모델링한 화면으로 보이고, 5·8·9·11쪽은 완성된 사진에 가깝습니다.",
      "도면이 모락에만 있습니다. 나머지 둘은 3D 이미지만 있어 동선과 치수를 확인할 수 없습니다.",
      "문제를 정의한 쪽이 없습니다. 왜 익산 중앙동인지가 적혀 있지 않고, 쪽번호가 05에서 07로 건너뛰므로 그 쪽이 빠진 것으로 보입니다.",
      "사용한 도구가 프로젝트별로 표기되지 않아 어느 작업에 무엇을 썼는지 알 수 없습니다.",
      "표기가 서로 다릅니다. 프로젝트 이름이 「키즈 베이」와 「샌드 베이 키즈」로 갈리고, 빛의 간격만 항목명이 다르며 13쪽 캡션만 평서체입니다. 마지막 쪽은 문장이 끝맺지 않았고 「V-Rey」는 오타입니다.",
    ],
    next: [
      "자기소개 한 쪽을 만드십시오. 어떤 공간을 다루고 싶은지, 지금까지의 일 경험이 공간을 보는 눈으로 어떻게 이어졌는지를 적습니다. 사진과 학과명도 함께 채웁니다.",
      "프로젝트마다 설명 쪽을 한 장씩 더 두십시오. 대상과 규모, 주요 공간의 구성, 선택한 재료와 그 이유를 적으면 처음 보는 사람도 이미지만으로 짐작하지 않아도 됩니다.",
      "모락의 기존 모습과 제안을 한 쪽에 나란히 놓고 「기존 · 제안」을 표시하십시오. 같은 각도의 두 장이면 가장 잘 읽힙니다.",
      "세 프로젝트의 규모를 채우고, 키즈 베이와 빛의 간격에 평면도를 한 장씩 넣으십시오. 동선을 화살표로 표시하면 설명이 줄어듭니다.",
      "쪽마다 작업 범위를 표시하고 표기를 통일하십시오. 프로젝트명과 항목명 맞추기, 13쪽 캡션의 문체, 마지막 쪽 정리까지 한 시간이면 끝납니다.",
    ],
    notes: [
      "자기소개와 설명 쪽, 기존·제안 비교 세 가지만 보완해도 처음 보는 사람이 자료를 따라갈 수 있습니다.",
      "이미지의 출처는 미리 정리해 두시면 면접에서 답하기 수월합니다.",
      "SWOT 약점의 「포트폴리오 제작 경험」 대신 앞으로 다루고 싶은 공간 유형을 적는 편이 낫습니다.",
    ],
  },
];

function build(st) {
  const C = [];
  C.push(p(st.course, { size: 16, color: GRAY, after: 60 }));
  C.push(p(st.title, { size: 34, bold: true, after: 80 }));
  C.push(p(st.topic, { size: 20, color: GRAY, after: 100, border: ruleThick }));

  C.push(h("잘한 점"));
  st.good.forEach(t => C.push(p(t, { numbering: { reference: "b", level: 0 }, after: 58 })));

  C.push(h("보완할 점"));
  st.fix.forEach(t => C.push(p(t, { numbering: { reference: "q", level: 0 }, after: 80 })));

  C.push(h("다음 과제"));
  st.next.forEach(t => C.push(p(t, { numbering: { reference: "r", level: 0 }, after: 80 })));

  C.push(h("추가 안내"));
  st.notes.forEach((t, i) => C.push(p(t, { numbering: { reference: "b", level: 0 },
                                           after: i === st.notes.length - 1 ? 30 : 58 })));

  const dec = (ref) => ({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.START,
    style: { paragraph: { indent: { left: convertInchesToTwip(0.34), hanging: convertInchesToTwip(0.34) } } } }] });
  return new Document({
    creator: "MIN.D", title: st.title,
    numbering: { config: [
      dec("q"), dec("r"),
      { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.START,
        style: { paragraph: { indent: { left: convertInchesToTwip(0.30), hanging: convertInchesToTwip(0.20) } } } }] },
    ]},
    styles: { default: { document: { run: { font: F, size: 20, color: INK } } } },
    sections: [{ properties: { page: { margin: { top: 1040, right: 1080, bottom: 980, left: 1080 } } }, children: C }],
  });
}

(async () => {
  const outDir = process.argv[2];
  for (const st of DOCS) {
    fs.writeFileSync(outDir + "/" + st.file, await Packer.toBuffer(build(st)));
    console.log("생성:", st.file);
  }
})();
