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
      "캡션을 「무엇을 왜 그렇게 했는지」의 형태로 썼습니다. 이미지를 설명하는 데 그치지 않습니다.",
    ],
    fix: [
      "수치가 없습니다. 세 프로젝트 모두 면적과 층수, 주요 실의 크기, 작업 기간이 한 곳에도 없습니다. 규모를 알아야 도면과 이미지를 판단할 기준이 생깁니다.",
      "직접 작업한 이미지와 참고 이미지가 구분되지 않았습니다. 10쪽은 직접 모델링한 화면으로 보이고, 5·8·9·11쪽은 완성된 사진에 가깝습니다. 보는 쪽에서 이 차이가 먼저 눈에 들어옵니다.",
      "도면이 모락에만 있습니다. 나머지 둘은 3D 이미지만 있어 동선과 치수를 확인할 수 없습니다.",
      "문제를 정의한 쪽이 없습니다. 왜 익산 중앙동인지, 그 건물의 무엇이 비어 있었는지가 적혀 있지 않습니다. 쪽번호가 05에서 07로 건너뛰므로 그 쪽이 빠진 것으로 보입니다.",
      "프로젝트 이름이 쪽마다 다릅니다. 목차와 머리글은 「키즈 베이」, 본문 제목은 「샌드 베이 키즈」입니다.",
      "프로필이 비어 있습니다. 사진 자리가 색면으로 남아 있고, 학력이 「원광대학교 전공」이라고만 되어 있어 학과명과 재학 여부를 알 수 없습니다.",
      "사용한 도구가 프로젝트별로 표기되지 않았습니다. 어느 작업에 무엇을 썼는지 알 수 없고, 「V-Rey」는 「V-Ray」의 오타입니다.",
      "표기와 형식이 서로 다른 곳이 있습니다. 빛의 간격만 항목명이 「포트폴리오 발전 범위」이고, 13쪽 캡션만 평서체입니다. 마지막 쪽은 바탕색이 희고, 「설계를 시작하는」에서 문장이 끝나 받는 말이 없습니다.",
    ],
    next: [
      "세 프로젝트의 규모를 채우십시오. 연면적과 층수, 주요 실의 크기, 작업 기간을 프로젝트 표지 쪽에 한 칸 더 두면 됩니다.",
      "키즈 베이와 빛의 간격에 평면도를 한 장씩 넣으십시오. 모락의 평면도 수준이면 충분하고, 동선을 화살표로 표시하면 설명이 줄어듭니다.",
      "모락 앞에 문제를 정의하는 쪽을 한 장 넣으십시오. 무엇이 비어 있었고 누가 쓰게 할 것인지를 세 줄로 적으면 됩니다. 빠진 06쪽이 그 자리입니다.",
      "쪽마다 작업 범위를 표시하고 표기를 통일하십시오. 프로젝트명과 항목명 맞추기, 13쪽 캡션의 문체, 마지막 쪽 바탕색과 마무리 문장까지 한 시간이면 끝납니다.",
      "프로필 사진과 학과명을 채우고, 프로젝트마다 사용한 도구를 적으십시오.",
    ],
    notes: [
      "첫 번째와 두 번째만 보완해도 자료의 성격이 달라집니다. 수치와 도면이 들어가면 분위기를 보여 주는 자료에서 설계한 자료로 읽힙니다.",
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
