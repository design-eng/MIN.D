// 취업규칙 시행 공지문 · 근로계약서 정정 합의서 생성기
const d = require('docx');
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow,
        TableCell, WidthType, ShadingType, BorderStyle, PageBreak } = d;

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

function table(head, rows, widths) {
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
      ...rows.map(r=>new TableRow({children:r.map((c,i)=>cell(c,widths[i],{center:i>0}))})) ],
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
      width:{size:[1500,2600,1500,2600][i],type:WidthType.DXA}, margins:{top:200,bottom:200,left:0,right:130},
      children:[new Paragraph({children:[T(t,{size:20,bold:i%2===0,color:i%2===0?GRAY:INK})]})]})) }) ],
  });
}

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
