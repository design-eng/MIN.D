// 취업규칙 시행 공지문 · 근로계약서 정정 합의서 생성기
const d = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow,
        TableCell, WidthType, ShadingType, BorderStyle, PageBreak, HeightRule } = d;

const CO = {
  name: '마인드(MIN.D)', ceo: '최 민 숙',
  addr: '서울시 양천구 목동동로 293 현대 41타워 1314호',
  enacted: '2026년 8월 27일', effect: '2026년 9월 1일',
};
const FONT = '맑은 고딕';
const INK='14161B', GRAY='6B7280', LINE='D4D6DB', SURF='F4F5F7', ACC='C2410C';
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const med  = { style: BorderStyle.SINGLE, size: 8, color: INK };

const T = (t,o={}) => new TextRun({ text:t, font:FONT, color:o.color||INK,
  size:o.size||20, bold:!!o.bold, italics:!!o.italics });
const P_ = (t,o={}) => new Paragraph({ spacing:{ after:o.after??100, line:288, before:o.before||0 },
  alignment:o.align||AlignmentType.LEFT, indent:o.indent, children:[T(t,o)] });
const hang = t => new Paragraph({ spacing:{after:70,line:288}, indent:{left:200,hanging:200}, children:[T(t)] });
const ho   = t => new Paragraph({ spacing:{after:60,line:288}, indent:{left:480,hanging:200}, children:[T(t)] });
const gap  = n => new Paragraph({ spacing:{after:n||140}, children:[T('')] });
const h2   = t => new Paragraph({ spacing:{before:340,after:130}, keepNext:true,
  border:{ bottom:{...med, space:7} }, children:[T(t,{bold:true,size:22})] });

function table(head, rows, widths, rowHeight) {
  const cell=(text,w,opt={})=>new TableCell({
    width:{size:w,type:WidthType.DXA},
    shading: opt.head?{type:ShadingType.CLEAR,fill:SURF,color:'auto'}:undefined,
    margins:{top:95,bottom:95,left:130,right:130},
    children:[new Paragraph({
      alignment:(opt.center && String(text).length<=22)?AlignmentType.CENTER:AlignmentType.LEFT,
      spacing:{line:264}, children:[T(text,{bold:!!opt.head,size:19})]})],
  });
  return new Table({
    width:{size:widths.reduce((a,b)=>a+b,0),type:WidthType.DXA}, columnWidths:widths,
    borders:{ top:med, bottom:med, left:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},
      right:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},
      insideHorizontal:thin, insideVertical:{style:BorderStyle.NONE,size:0,color:'FFFFFF'} },
    rows:[ new TableRow({tableHeader:true, children:head.map((h,i)=>cell(h,widths[i],{head:true,center:i>0}))}),
      ...rows.map(r=>new TableRow({
        height: rowHeight ? {value:rowHeight, rule:HeightRule.ATLEAST} : undefined,
        children:r.map((c,i)=>cell(c,widths[i],{center:i>0}))})) ],
  });
}
// 서명란
function signRow(labelA, nameA, labelB, nameB) {
  return new Table({
    width:{size:8200,type:WidthType.DXA}, columnWidths:[1500,2600,1500,2600],
    borders:{ top:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}, bottom:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},
      left:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}, right:{style:BorderStyle.NONE,size:0,color:'FFFFFF'},
      insideHorizontal:{style:BorderStyle.NONE,size:0,color:'FFFFFF'}, insideVertical:{style:BorderStyle.NONE,size:0,color:'FFFFFF'} },
    rows:[ new TableRow({ children:[labelA,nameA,labelB,nameB].map((t,i)=>new TableCell({
      width:{size:[1500,2600,1500,2600][i],type:WidthType.DXA},
      margins:{top:260,bottom:120,left:0,right:130},
      borders: i%2===1 ? {bottom:{style:BorderStyle.SINGLE,size:4,color:LINE}} : undefined,
      children:[new Paragraph({children:[T(t,{size:20,bold:i%2===0,color:i%2===0?GRAY:INK})]})]})) }) ],
  });
}

// 손으로 적어 넣는 빈칸 — 지정한 높이의 테두리 상자
function writeBox(height, placeholder) {
  return new Table({
    width:{size:8200,type:WidthType.DXA}, columnWidths:[8200],
    borders:{ top:thin, bottom:thin, left:thin, right:thin,
      insideHorizontal:thin, insideVertical:thin },
    rows:[ new TableRow({ height:{value:height, rule:HeightRule.ATLEAST}, children:[
      new TableCell({ width:{size:8200,type:WidthType.DXA},
        margins:{top:120,bottom:120,left:150,right:150},
        children:[ new Paragraph({ spacing:{line:400},
          children:[T(placeholder||'', {size:18, color:GRAY, italics:true})] }) ] }) ] }) ],
  });
}
// 라벨 + 기입 칸이 반복되는 머리 표
function headBox(pairs) {
  return table(['구분','내용'], pairs, [1800,6400], 420);
}
const CHK = '□';

const docs = [];

// ══════════════════ 1. 취업규칙 시행 공지문 ══════════════════
const a = [];
a.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('취업규칙 제정 및 시행 안내', {size:34, bold:true})] }),
  new Paragraph({ spacing:{after:300}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  gap(60),
  P_(`시행일    ${CO.effect}`, {size:19, color:GRAY, after:50}),
  P_(`제정일    ${CO.enacted}`, {size:19, color:GRAY, after:50}),
  P_('수신      전 직원', {size:19, color:GRAY, after:260}),
  P_('그동안 근로조건을 개별 근로계약서로만 정해 왔습니다. 이번에 취업규칙을 제정하여 근무시간·휴가·급여·복무에 관한 기준을 한 문서에 정리했습니다. 아래 내용을 확인해 주시고, 의견이 있으시면 시행일 전까지 알려 주시기 바랍니다.', {after:200}),
);
a.push(h2('1. 함께 보시는 문서'),
  table(['문서','내용'], [
    ['취업규칙','근로조건의 기준을 정한 규정 원문. 전 10장 50조'],
    ['근무 정책 안내서','취업규칙에서 매일 쓰이는 부분만 뽑은 요약본'],
    ['근태·연차 관리대장','출퇴근 기록과 연차 발생·사용·잔여 현황'],
  ], [2000,6200]));

a.push(h2('2. 알아두실 주요 내용'),
  table(['항목','기준','근거'], [
    ['근무시간','09:00 ~ 18:00 · 휴게 12:00 ~ 13:00','제18조·제19조'],
    ['휴일','일요일(주휴일) · 근로자의 날 · 관공서 공휴일 유급 / 토요일 무급휴무일','제20조'],
    ['연차','1년 이상 15일 · 1년 미만 월 1일(최대 11일) · 입사일 기준','제22조'],
    ['연차 신청','사용 3일 전까지 · 반일 단위 가능','제23조'],
    ['여름휴가','연차로 사용 · 희망일 매년 6월 30일까지 제출','제24조'],
    ['급여','연봉 12등분 · 매월 말일 지급 · 변동급은 다음 달 정산','제30조·제31조'],
    ['가산수당','연장·야간 50% · 휴일 8시간 초과분 100%','제21조'],
    ['수습','3개월 · 임금 80% · 근속기간에 포함','제9조'],
  ], [1500,5000,1700]));

a.push(h2('3. 기존 근로계약과의 관계'),
  hang('취업규칙에서 정한 기준에 미달하는 근로계약은 그 부분에 한하여 취업규칙이 적용됩니다. 반대로 근로계약이 취업규칙보다 유리한 조건을 정하고 있으면 근로계약이 우선합니다. (제4조)'),
  hang('이번 제정으로 기존 근로계약의 급여 지급일과 수습기간 임금이 달라지는 사항은 없습니다.'),
  hang('근로계약서와 취업규칙의 표현이 어긋나는 부분은 별도의 「근로계약서 정정 합의서」로 정리합니다.'));

a.push(h2('4. 열람과 의견 제출'),
  hang('취업규칙 전문은 언제든지 열람할 수 있도록 공유합니다.'),
  hang(`내용에 대한 의견은 ${CO.effect} 전까지 대표에게 알려 주시기 바랍니다.`),
  hang('시행 이후에도 규칙을 변경할 때는 직원의 의견을 듣고, 직원에게 불리하게 변경하는 경우에는 직원 과반수의 동의를 받습니다. (부칙 제2조)'));

a.push(gap(400),
  P_(CO.effect, {align:AlignmentType.CENTER, after:130}),
  P_(CO.name, {align:AlignmentType.CENTER, bold:true, size:22, after:100}),
  P_(`대표    ${CO.ceo}            (서명 또는 인)`, {align:AlignmentType.CENTER}));

a.push(new Paragraph({children:[new PageBreak()]}));
a.push(new Paragraph({ spacing:{after:100}, children:[T('[별지] 취업규칙 제정에 대한 의견 확인서', {bold:true, size:26})] }),
  new Paragraph({ spacing:{after:280}, border:{bottom:{...thin, space:8}},
    children:[T('직원의 의견을 들었음을 확인하기 위한 서식입니다. 서명 후 회사가 보관합니다.', {size:19, color:GRAY})] }),
  hang(`본인은 ${CO.name}의 취업규칙(${CO.enacted} 제정) 전문을 열람하였으며, 그 내용에 대하여 의견을 제출할 기회를 부여받았음을 확인합니다.`),
  gap(200),
  P_('의견 (없으면 「없음」으로 적어 주세요)', {size:19, color:GRAY, after:100}),
  new Paragraph({ spacing:{after:120}, border:{bottom:{...thin, space:10}}, children:[T('')] }),
  new Paragraph({ spacing:{after:120}, border:{bottom:{...thin, space:10}}, children:[T('')] }),
  new Paragraph({ spacing:{after:120}, border:{bottom:{...thin, space:10}}, children:[T('')] }),
  gap(300),
  P_('작성일    2026년        월        일', {after:0}),
  signRow('성  명', '', '서  명', '(서명 또는 인)'));

docs.push({ name:'마인드_취업규칙_시행공지문.docx', body:a });

// ══════════════════ 2. 근로계약서 정정 합의서 ══════════════════
const b = [];
b.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('근로계약서 정정 합의서', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:300}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  gap(60),
  hang(`${CO.name}(이하 "사업주")와 아래 근로자(이하 "근로자")는 ${CO.enacted} 제정된 취업규칙의 시행에 따라, 기존 근로계약서의 일부 조항을 다음과 같이 정정하기로 합의한다.`),
  gap(200),
  table(['구분','내용'], [
    ['근로자','성명                                    생년월일'],
    ['최초 계약일','2026년 1월 12일'],
  ], [1800,6400]),
);

b.push(h2('제1조 (정정 사항)'),
  P_('아래 각 호와 같이 정정하며, 정정하지 아니한 나머지 조항은 종전과 같이 효력을 유지한다.', {after:180}),
  table(['조항','종전','정정'], [
    ['제1조·제3조\n유급주휴일',
     '유급휴일은 매주 토요일, 일요일(주휴일)과 근로자의 날',
     '유급휴일은 일요일(주휴일)과 근로자의 날 및 관공서 공휴일로 하고, 토요일은 무급휴무일로 한다'],
    ['제7조\n연차유급휴가',
     '근로기준법 등 관련 법령에 의거하여 산정',
     '취업규칙 제22조에 따라 산정하며, 1년 이상 근속 시 15일, 1년 미만은 1개월 개근 시 1일(최대 11일)로 한다'],
    ['제8조\n특별휴가',
     '본인 결혼 5일, 배우자 사망 5일, 부모 사망 3일, 배우자의 부모 사망 2일, 자녀 사망 3일',
     '삭제한다. 경조휴가는 취업규칙 제25조에 따른다'],
    ['제10조\n기타 사항',
     '취업규칙과 본 계약이 상충할 경우 취업규칙이 우선한다',
     '취업규칙에서 정한 기준에 미달하는 부분은 취업규칙에 따르고, 본 계약이 취업규칙보다 근로자에게 유리한 경우에는 본 계약에 따른다'],
  ], [1500,3200,3500]));

b.push(h2('제2조 (정정의 취지)'),
  hang('① 제1조제1호는 종전 계약서가 토요일을 유급휴일로 정하면서 임금을 월 소정근로 209시간 기준으로 산정하여 서로 맞지 않던 것을 바로잡는 것이다. 209시간은 주 40시간과 주휴 8시간을 반영한 값으로 토요일을 포함하지 아니한다.'),
  hang('② 제1조제1호의 정정으로 "근로자"가 지급받는 임금 총액은 달라지지 아니한다.'),
  hang('③ 제1조제3호의 정정으로 경조휴가 일수는 종전보다 늘어난다. 부모 사망은 3일에서 5일로, 배우자의 부모 사망은 2일에서 5일로 변경되며, 배우자 출산휴가 20일과 조부모·형제자매 사망 3일이 새로 적용된다.'),
  hang('④ 제1조제4호의 정정은 근로기준법 제97조의 취지에 따른 것이다.'));

b.push(h2('제3조 (확인 사항)'),
  hang('① 종전 계약서 제4조제3항에 따른 연장·야간·휴일근로 가산수당은 취업규칙 제21조제2항에 같은 기준으로 규정되었으며, 종전과 같이 지급된다.'),
  hang('② 급여 지급일(매월 말일)과 수습기간 임금(80%)은 종전 계약과 취업규칙이 동일하므로 변경되는 사항이 없다.'),
  hang('③ 종전 계약서 제9조에서 정한 비밀유지서약서는 별도로 체결·보관한다.'));

b.push(h2('제4조 (시행일)'),
  hang(`이 합의서는 ${CO.effect}부터 효력을 발생한다.`),
  gap(300),
  P_('이 합의서는 2통을 작성하여 사업주와 근로자가 각각 1통씩 보관한다.', {after:400}),
  P_('2026년        월        일', {align:AlignmentType.CENTER, after:0}),
  signRow('사 업 주', `${CO.name}\n대표  ${CO.ceo}`, '근 로 자', ''),
  new Paragraph({ spacing:{before:0}, alignment:AlignmentType.RIGHT,
    children:[T('(각 서명 또는 인)', {size:18, color:GRAY})] }));

docs.push({ name:'마인드_근로계약서_정정합의서.docx', body:b });


// ══════════════════ 3. 연봉조정 운영기준 ══════════════════
const c = [];
c.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('연봉조정 운영기준', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:300}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  gap(60),
  hang('이 기준은 취업규칙 제34조제3항에 따라 연봉 조정의 평가 항목·배점·절차를 정한 것이다. 취업규칙과 달리 이 기준은 회사가 경영 상황에 따라 매년 조정할 수 있다. 다만 이미 확정·통보된 조정 결과에는 소급하지 아니한다.'),
);

c.push(h2('1. 조정 시기'),
  table(['구분','기준'], [
    ['조정 주기','입사일 기준 매년 1회'],
    ['적용 시점','입사 기념일이 속한 달의 다음 달 1일'],
    ['면담 시기','적용일이 속한 달의 전달까지'],
    ['첫 조정','입사 1주년이 지난 후 첫 조정. 수습기간도 근속에 포함한다'],
  ], [1900,6300]),
  gap(120),
  P_('예시 — 2026년 1월 12일 입사자는 2026년 12월 중 면담하고, 2027년 2월 1일부터 조정 연봉을 적용한다.',
     {size:19, color:GRAY}));

c.push(h2('2. 평가 항목과 배점'),
  table(['영역','세부 항목','배점'], [
    ['직무 성과\n(40점)','산출물의 완성도와 품질','15'],
    ['','일정 준수와 진행 관리','15'],
    ['','클라이언트 요구 파악과 대응','10'],
    ['직무 역량\n(30점)','사용자 조사와 화면 설계의 깊이','10'],
    ['','디자인 시스템 구축·운용','10'],
    ['','도구 숙련도와 새로운 방법의 습득','10'],
    ['협업과 태도\n(20점)','팀·직무 간 소통과 정보 공유','10'],
    ['','피드백 수용과 반영','10'],
    ['기여와 성장\n(10점)','업무 방식·프로세스 개선 제안','5'],
    ['','학습 내용의 공유와 후배 지원','5'],
  ], [1700,5000,1500]));

c.push(h2('3. 등급과 인상률'),
  table(['등급','총점','정의','인상률 구간'], [
    ['S','90 ~ 100','기대를 크게 넘어섰다','8 ~ 12%'],
    ['A','80 ~ 89','기대를 넘어섰다','5 ~ 8%'],
    ['B','65 ~ 79','기대한 수준을 충족했다','3 ~ 5%'],
    ['C','50 ~ 64','일부 항목에서 보완이 필요하다','0 ~ 3%'],
    ['D','49 이하','전반적인 개선이 필요하다','동결'],
  ], [900,1500,3800,2000]),
  gap(150),
  hang('① 인상률 구간은 권장 범위이며, 회사의 경영 상황에 따라 구간 내에서 결정한다.'),
  hang('② 경영 상황상 권장 구간을 적용하기 어려운 경우 회사는 그 사유를 면담에서 설명한다.'),
  hang('③ D등급이라도 연봉을 감액하지 아니한다. 동결이 하한이다. (취업규칙 제34조제5항)'),
  hang('④ 조정 후 연봉은 최저임금액 이상이어야 하며, 최저임금은 매년 고용노동부 고시로 변경된다.'));

c.push(h2('4. 절차'),
  ho('1. 자기평가 — 사원이 평가 항목에 따라 스스로 기재하고, 그해의 주요 작업과 성과를 정리하여 제출한다.'),
  ho('2. 회사평가 — 대표가 같은 항목으로 평가하고 총점과 등급을 산정한다.'),
  ho('3. 면담 — 두 평가의 차이를 함께 확인하고, 다음 1년의 목표와 조정 연봉을 협의한다.'),
  ho('4. 합의 — 결정된 연봉액을 연봉계약서에 기재하여 서명하고, 2통을 작성해 각 1통씩 보관한다.'),
  ho('5. 반영 — 4대보험 보수월액 변경을 신고하고, 관리대장의 연봉을 갱신한다.'),
  gap(140),
  hang('합의가 이루어지지 아니한 경우에는 종전 연봉이 계속 적용되며, 회사는 이를 이유로 불리한 처우를 하지 아니한다. 다음 조정 시기에 다시 협의한다.'));

c.push(h2('5. 평가하지 않는 것'),
  hang('다음 사유는 평가에 반영하지 아니한다.'),
  ho('1. 연차유급휴가·경조휴가·병가 등 정당하게 사용한 휴가'),
  ho('2. 출산전후휴가·육아휴직·육아기 근로시간 단축 및 그 신청'),
  ho('3. 성별·연령·혼인 여부·임신·출산·장애 등 근로기준법 제5조가 정한 차별 금지 사유'),
  ho('4. 직장 내 성희롱·괴롭힘의 신고 또는 조사 협조'),
  ho('5. 연봉 조정 합의가 이루어지지 아니하였던 사실'));

c.push(gap(360),
  P_('시행일    ' + CO.effect, {align:AlignmentType.CENTER, after:130}),
  P_(CO.name, {align:AlignmentType.CENTER, bold:true, size:22, after:100}),
  P_('대표    ' + CO.ceo + '            (서명 또는 인)', {align:AlignmentType.CENTER}));

docs.push({ name:'마인드_연봉조정_운영기준.docx', body:c });

// ══════════════════ 4. 연봉계약서 ══════════════════
const e = [];
e.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('연 봉 계 약 서', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:300}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  gap(60),
  hang(CO.name + '(이하 "사업주")와 아래 근로자(이하 "근로자")는 취업규칙 제34조에 따라 다음과 같이 연봉을 정한다.'),
  gap(200),
  table(['구분','내용'], [
    ['성명',''],
    ['입사일',''],
    ['직위 / 직무',''],
    ['계약기간','          년      월      일  ~            년      월      일  (12개월)'],
  ], [1800,6400]));

e.push(h2('제1조 (연봉액)'),
  table(['구분','종전','조정','증감'], [
    ['연봉 (원)','','',''],
    ['월 지급액 (원)','','',''],
    ['인상률 (%)','—','',''],
    ['평가 등급','—','','—'],
  ], [2000,2100,2100,2000], 500),
  gap(150),
  hang('① 연봉액은 12로 나누어 매월 균등하게 지급하며, 지급일은 당월 말일로 한다.'),
  hang('② 월 지급액은 기본급과 식대로 구성한다. 식대는 「소득세법」이 정한 한도까지 비과세로 처리한다.'),
  hang('③ 연봉액에는 연장근로·야간근로 및 휴일근로에 대한 임금이 포함되어 있지 아니하다. 이 계약은 포괄임금 약정이 아니다.'),
  hang('④ 연장근로·야간근로에 대하여는 통상임금의 100분의 50을, 휴일근로에 대하여는 8시간 이내는 100분의 50을, 8시간을 초과한 시간은 100분의 100을 가산하여 그 사유가 발생한 달의 다음 달 지급일에 지급한다. (취업규칙 제21조)'),
  hang('⑤ 통상임금은 월 통상임금을 월 소정근로시간 209시간으로 나누어 산정한다.'));

e.push(h2('제2조 (적용기간)'),
  hang('① 이 계약에 따른 연봉은 제1조의 계약기간 동안 적용한다.'),
  hang('② 계약기간이 만료된 후 새로운 연봉계약이 체결되지 아니한 경우에는 종전 연봉을 계속 적용한다.'));

e.push(h2('제3조 (그 밖의 사항)'),
  hang('① 이 계약에서 정하지 아니한 사항은 근로계약서와 취업규칙 및 노동관계법령에 따른다.'),
  hang('② 취업규칙에서 정한 기준에 미달하는 부분은 취업규칙에 따르고, 이 계약이 취업규칙보다 근로자에게 유리한 경우에는 이 계약에 따른다.'),
  hang('③ 퇴직급여는 이 계약의 연봉에 포함되지 아니하며, 「근로자퇴직급여 보장법」에 따라 별도로 적립·지급한다.'));

e.push(gap(320),
  P_('이 계약서는 2통을 작성하여 사업주와 근로자가 각각 1통씩 보관한다.', {after:360}),
  P_('        년        월        일', {align:AlignmentType.CENTER, after:0}),
  signRow('사 업 주', CO.name + '   대표  ' + CO.ceo, '근 로 자', ''),
  new Paragraph({ alignment:AlignmentType.RIGHT, children:[T('(각 서명 또는 인)', {size:18, color:GRAY})] }));

docs.push({ name:'마인드_연봉계약서.docx', body:e });


// ══════════════════ 5. 자기평가서 ══════════════════
const f = [];
const AREAS = [
  ['직무 성과', 40, '산출물의 완성도와 품질 / 일정 준수와 진행 관리 / 클라이언트 요구 파악과 대응'],
  ['직무 역량', 30, '사용자 조사와 화면 설계의 깊이 / 디자인 시스템 구축·운용 / 도구 숙련도와 새로운 방법의 습득'],
  ['협업과 태도', 20, '팀·직무 간 소통과 정보 공유 / 피드백 수용과 반영'],
  ['기여와 성장', 10, '업무 방식·프로세스 개선 제안 / 학습 내용의 공유와 후배 지원'],
];
f.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('자기평가서', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:260}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  P_('연봉조정 운영기준 4항제1호에 따라 본인이 작성합니다. 점수보다 근거가 중요합니다. 기억나는 대로 구체적인 작업과 상황을 적어 주세요.', {size:19, color:GRAY, after:220}),
  headBox([['성명',''],['평가기간','          년      월  ~          년      월'],['작성일','          년      월      일']]),
);
f.push(h2('1. 이번 1년의 주요 작업'),
  table(['작업 / 프로젝트','맡은 역할','기간','결과'], [
    ['','','',''],['','','',''],['','','',''],['','','',''],['','','',''],
  ], [2900,2000,1500,1800], 620));

f.push(h2('2. 영역별 자기평가'));
AREAS.forEach(([name, pts, detail]) => {
  f.push(
    new Paragraph({ spacing:{before:240, after:60}, keepNext:true,
      children:[T(`${name}   `, {bold:true, size:21}), T(`배점 ${pts}점`, {size:19, color:ACC}),
                T('          자기점수         점', {size:19, color:GRAY})] }),
    new Paragraph({ spacing:{after:100}, children:[T(detail, {size:17, color:GRAY})] }),
    writeBox(760, '그렇게 판단한 근거를 적어 주세요.'),
  );
});
f.push(new Paragraph({ spacing:{before:220},
  children:[T('자기점수 합계          점', {bold:true, size:21})] }));

f.push(new Paragraph({children:[new PageBreak()]}));
f.push(h2('3. 스스로 평가하는 잘한 점과 아쉬운 점'),
  P_('잘한 점', {size:19, color:GRAY, after:70}), writeBox(760),
  gap(140),
  P_('아쉬운 점 · 보완하고 싶은 점', {size:19, color:GRAY, after:70}), writeBox(760));

f.push(h2('4. 다음 1년의 목표'),
  P_('무엇을 어느 수준까지 하고 싶은지 세 가지만 적어 주세요.', {size:19, color:GRAY, after:100}),
  table(['','목표','어떻게 확인할 수 있나'], [
    ['1','',''],['2','',''],['3','',''],
  ], [700,3600,3900], 700));

f.push(h2('5. 회사에 바라는 점'),
  P_('업무 환경, 필요한 지원, 배우고 싶은 것 등 무엇이든 좋습니다. 비워 두셔도 됩니다.', {size:19, color:GRAY, after:100}),
  writeBox(900));

f.push(gap(300),
  P_('        년        월        일', {align:AlignmentType.CENTER, after:0}),
  signRow('작 성 자', '', '서  명', '(서명 또는 인)'),
  new Paragraph({ spacing:{before:240}, border:{top:{...thin, space:8}},
    children:[T('휴가 사용, 출산·육아휴직, 성별·연령 등 차별 금지 사유, 괴롭힘 신고, 과거 연봉 합의가 이루어지지 않았던 사실은 평가에 반영되지 않습니다. (연봉조정 운영기준 5항)', {size:17, color:GRAY})] }));

docs.push({ name:'마인드_연봉조정_자기평가서.docx', body:f });

// ══════════════════ 6. 회사평가표 ══════════════════
const g = [];
g.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('회사평가표', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:260}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  P_('연봉조정 운영기준 4항제2호에 따라 대표가 작성합니다. 면담 전까지는 공개하지 않습니다.', {size:19, color:ACC, after:220}),
  headBox([['성명',''],['입사일',''],['평가기간','          년      월  ~          년      월'],['평가자','대표    ' + CO.ceo]]),
);
g.push(h2('1. 영역별 평가'));
AREAS.forEach(([name, pts, detail]) => {
  g.push(
    new Paragraph({ spacing:{before:240, after:60}, keepNext:true,
      children:[T(`${name}   `, {bold:true, size:21}), T(`배점 ${pts}점`, {size:19, color:ACC}),
                T('          자기점수         점          회사점수         점', {size:19, color:GRAY})] }),
    new Paragraph({ spacing:{after:100}, children:[T(detail, {size:17, color:GRAY})] }),
    writeBox(700, '점수의 근거가 된 구체적인 상황이나 산출물을 적습니다. 인상이나 태도가 아니라 관찰한 사실을 씁니다.'),
  );
});

g.push(h2('2. 총점과 등급'),
  table(['자기평가 총점','회사평가 총점','등급','권장 인상률'], [['      점','      점','','']], [2050,2050,2050,2050], 520),
  gap(140),
  table(['등급','총점','인상률'], [
    ['S','90 ~ 100','8 ~ 12%'], ['A','80 ~ 89','5 ~ 8%'], ['B','65 ~ 79','3 ~ 5%'],
    ['C','50 ~ 64','0 ~ 3%'], ['D','49 이하','동결'],
  ], [1400,3400,3400]));

g.push(h2('3. 총평'),
  P_('면담에서 그대로 읽어 줄 수 있는 문장으로 적습니다.', {size:19, color:GRAY, after:100}),
  writeBox(900));

g.push(h2('4. 다음 1년에 기대하는 것'),
  writeBox(760));

g.push(gap(280),
  P_('        년        월        일', {align:AlignmentType.CENTER, after:0}),
  signRow('평 가 자', '대표  ' + CO.ceo, '서  명', '(서명 또는 인)'),
  new Paragraph({ spacing:{before:240}, border:{top:{...thin, space:8}},
    children:[T('D등급이라도 연봉을 감액할 수 없습니다. 동결이 하한입니다. (취업규칙 제34조제5항)', {size:17, color:GRAY})] }));

docs.push({ name:'마인드_연봉조정_회사평가표.docx', body:g });

// ══════════════════ 7. 면담기록서 ══════════════════
const h = [];
h.push(
  P_(CO.name, {size:19, color:GRAY, after:60}),
  new Paragraph({ spacing:{after:60}, children:[T('연봉조정 면담기록서', {size:32, bold:true})] }),
  new Paragraph({ spacing:{after:260}, border:{bottom:{...med, space:8}}, children:[T('')] }),
  P_('연봉조정 운영기준 4항제3호에 따라 면담 자리에서 함께 작성하고, 양측이 서명하여 회사가 3년간 보관합니다.', {size:19, color:GRAY, after:220}),
  headBox([['성명',''],['면담일시','          년      월      일           시'],['장소',''],['참석자','대표    ' + CO.ceo + ' ,']]),
);

h.push(h2('1. 평가 대조'),
  table(['영역','배점','자기평가','회사평가','차이'], [
    ['직무 성과','40','','',''], ['직무 역량','30','','',''],
    ['협업과 태도','20','','',''], ['기여와 성장','10','','',''],
    ['합계','100','','',''],
  ], [2200,1000,1700,1700,1600], 480),
  gap(140),
  P_('점수 차이가 큰 영역을 먼저 이야기합니다. 어느 쪽이 맞는지 가리는 자리가 아니라, 같은 일을 서로 다르게 본 이유를 확인하는 자리입니다.', {size:19, color:GRAY}));

h.push(h2('2. 면담에서 나눈 이야기'),
  P_('회사가 전달한 내용', {size:19, color:GRAY, after:70}), writeBox(820),
  gap(140),
  P_('본인이 말한 내용', {size:19, color:GRAY, after:70}), writeBox(820));

h.push(new Paragraph({children:[new PageBreak()]}));
h.push(h2('3. 다음 1년의 목표 (합의)'),
  table(['','목표','확인 방법','시기'], [
    ['1','','',''], ['2','','',''], ['3','','',''],
  ], [700,3500,2400,1600], 700));

h.push(h2('4. 연봉 결정'),
  table(['구분','내용'], [
    ['평가 등급',''],
    ['현 연봉','                                    원'],
    ['조정 연봉','                                    원'],
    ['인상률','                    %'],
    ['월 지급액','                                    원'],
    ['적용일','          년      월      일'],
  ], [1800,6400], 480));

h.push(h2('5. 합의 여부'),
  new Paragraph({ spacing:{after:110}, indent:{left:200},
    children:[T(CHK + '  합 의', {bold:true, size:22}),
              T('        위 제4항의 연봉에 합의하였다. 연봉계약서를 작성한다.', {size:19})] }),
  new Paragraph({ spacing:{after:130}, indent:{left:200},
    children:[T(CHK + '  미합의', {bold:true, size:22}),
              T('        합의에 이르지 못하였다.', {size:19})] }),
  new Paragraph({ spacing:{after:110}, indent:{left:480},
    children:[T('미합의인 경우, 취업규칙 제34조제6항에 따라 종전 연봉이 계속 적용되며, 합의하지 아니하였다는 사실을 이유로 어떠한 불리한 처우도 하지 아니한다. 다음 조정 시기에 다시 협의한다.', {size:19, color:ACC})] }),
  gap(80),
  P_('미합의 사유 (해당하는 경우에만)', {size:19, color:GRAY, after:70}),
  writeBox(560));

h.push(gap(300),
  P_('이 기록서는 2통을 작성하여 회사와 본인이 각각 1통씩 보관한다.', {after:300}),
  P_('        년        월        일', {align:AlignmentType.CENTER, after:0}),
  signRow('회  사', '대표  ' + CO.ceo, '본  인', ''),
  new Paragraph({ alignment:AlignmentType.RIGHT, children:[T('(각 서명 또는 인)', {size:18, color:GRAY})] }));

docs.push({ name:'마인드_연봉조정_면담기록서.docx', body:h });

// ══════════════════ 출력 ══════════════════
(async () => {
  for (const doc of docs) {
    const out = new Document({
      styles:{ default:{ document:{ run:{ font:FONT, size:20, color:INK } } } },
      sections:[{ properties:{ page:{ margin:{ top:1300, right:1200, bottom:1300, left:1200 } } },
                  children: doc.body }],
    });
    const buf = await Packer.toBuffer(out);
    fs.writeFileSync(__dirname + '/../' + doc.name, buf);
    console.log('OK', doc.name, buf.length, 'bytes');
  }
})();
