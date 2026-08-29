/**
 * 마인드 근태 기록 — 출퇴근 스크립트
 *
 * 구글 시트로 옮긴 「마인드_근태연차_관리대장」에 붙여 넣고 초기설정() 을 한 번 실행한다.
 * 「출퇴근」 시트가 만들어지고, 체크박스를 누르면 근태기록 시트에 시각이 들어간다.
 *
 * 회사 노트북 브라우저에서 쓰는 것을 전제로 한다. 개인 휴대폰은 쓰지 않는다.
 *
 * 체크박스를 기본으로 삼는 이유가 둘 있다.
 *   1. 체크박스 편집은 단순 트리거(onEdit)로 잡히므로 사원이 최초 권한 승인 절차를
 *      거치지 않고 바로 쓸 수 있다. 상단 「근태」 메뉴는 사람마다 첫 사용 때
 *      승인 창이 한 번 뜬다.
 *   2. 그림에 스크립트를 연결한 버튼은 스크립트로 만들 수 없어 사람이 직접 넣어야 한다.
 */

const TZ = 'Asia/Seoul';

const SH_AT = '근태기록';
const SH_EMP = '직원명부';
const SH_PUNCH = '출퇴근';

const AT_FIRST = 5;          // 근태기록 첫 데이터 행
const AT_LAST = 2004;
const EMP_FIRST = 5;         // 직원명부 첫 데이터 행
const EMP_LAST = 24;

// 근태기록 열 번호
const C_DATE = 1, C_NO = 3, C_IN = 5, C_OUT = 6, C_BREAK = 7;
const C_WORK = 8, C_OT = 9, C_NIGHT = 10, C_COMP = 11, C_TYPE = 12;

// 출퇴근 시트 자리
const P_NAME = 'B4', P_IN = 'B5', P_BS = 'B6', P_BE = 'B7', P_OUT = 'B8', P_MSG = 'B10';
const HOW_HEAD = 12;         // 사용 방법 머리글 행
const MAP_HEAD = 21;         // 계정 매핑표 머리글 행 (D열에 휴게 시작 시각을 임시 보관)

// 근로기준법 제54조 — 근로시간 4시간에 30분, 8시간에 1시간 이상의 휴게
const BREAK_8H = 1, BREAK_4H = 0.5;


/* ══════════════ 최초 1회 ══════════════ */

function 초기설정() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);

  let p = ss.getSheetByName(SH_PUNCH);
  if (!p) p = ss.insertSheet(SH_PUNCH, 0);
  ss.setActiveSheet(p);
  ss.moveActiveSheet(1);
  p.clear();
  p.clearConditionalFormatRules();
  p.setHiddenGridlines(true);
  p.setColumnWidth(1, 96);
  p.setColumnWidth(2, 300);
  p.setColumnWidth(3, 380);
  p.setColumnWidth(4, 110);

  p.getRange('A1').setValue('출퇴근').setFontSize(16).setFontWeight('bold');
  p.getRange('A2').setValue('체크박스를 누르면 근태기록 시트에 오늘 날짜의 시각이 들어갑니다.')
    .setFontSize(9).setFontColor('#6B7280');

  p.getRange(4, 1, 5, 1)
    .setValues([['이름'], ['출근'], ['휴게 시작'], ['휴게 종료'], ['퇴근']])
    .setFontWeight('bold');
  p.getRange('A10').setValue('상태').setFontWeight('bold');
  p.getRange(P_MSG).setFontColor('#6B7280').setWrap(true);

  const hints = [
    ['← 자리에 앉으면 누르세요'],
    ['← 점심·저녁 먹으러 나갈 때'],
    ['← 돌아와서. 그 사이 시간이 휴게로 빠집니다'],
    ['← 나갈 때. 근무·연장·야간 시간이 계산됩니다'],
  ];
  p.getRange(5, 3, 4, 1).setValues(hints).setFontSize(9).setFontColor('#6B7280');

  // 이름 목록 — 직원명부에서 가져온다
  const emp = readRoster(ss);
  const names = emp.map(function (e) { return e.name; }).filter(String);
  if (names.length) {
    p.getRange(P_NAME).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(names, true).build());
    if (names.length === 1) p.getRange(P_NAME).setValue(names[0]);
  }

  const cb = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  [P_IN, P_BS, P_BE, P_OUT].forEach(function (a1) {
    p.getRange(a1).setDataValidation(cb).setValue(false);
  });

  // 사용 방법 — 쓰는 자리에 붙여 둔다
  p.getRange(HOW_HEAD, 1).setValue('사용 방법').setFontWeight('bold').setFontSize(11);
  const how = [
    ['1', '출근하면 이 시트를 열고 「출근」 을 누릅니다.'],
    ['2', '점심 먹으러 나갈 때 「휴게 시작」, 돌아와서 「휴게 종료」 를 누릅니다.'],
    ['3', '저녁까지 일해서 한 번 더 쉬었다면 그때도 같은 방식으로 두 번 누릅니다. 합산됩니다.'],
    ['4', '퇴근할 때 「퇴근」 을 누릅니다. 근무·연장·야간 시간이 자동 계산됩니다.'],
    ['5', '휴게를 한 번도 누르지 않고 퇴근하면 법정 기준(8시간 이상 1시간)으로 자동 입력됩니다.'],
    ['6', '체크는 눌린 뒤 바로 풀립니다. 정상입니다. 결과는 「상태」 줄에서 확인하세요.'],
    ['7', '잊었거나 시각이 틀렸으면 근태기록 시트에서 직접 고치면 됩니다.'],
  ];
  p.getRange(HOW_HEAD + 1, 1, how.length, 2).setValues(how);
  p.getRange(HOW_HEAD + 1, 1, how.length, 1).setFontColor('#6B7280').setHorizontalAlignment('center');
  p.getRange(HOW_HEAD + 1, 2, how.length, 2).setFontSize(9);
  // 설명이 길어 B열을 넘어가므로 C열까지 병합해 한 줄로 보이게 한다
  for (let i = 0; i < how.length; i++) p.getRange(HOW_HEAD + 1 + i, 2, 1, 2).merge();

  // 계정 매핑 — 회사 구글 계정으로 자동 식별하려면 여기에 이메일을 적는다
  p.getRange(MAP_HEAD - 1, 1).setValue('계정 매핑').setFontWeight('bold').setFontSize(11);
  p.getRange(MAP_HEAD - 1, 2)
    .setValue('회사 구글 계정을 적어 두면 이름을 고르지 않아도 본인으로 기록됩니다.')
    .setFontSize(9).setFontColor('#6B7280');
  p.getRange(MAP_HEAD, 1, 1, 4).setValues([['사번', '성명', '구글 계정', '휴게 시작(임시)']])
    .setFontWeight('bold').setBackground('#F4F5F7');
  p.getRange(MAP_HEAD, 4).setNote(
    '「휴게 시작」을 누르면 여기에 시각이 잠깐 적혔다가 「휴게 종료」를 누르면 지워집니다.\n'
    + '종료를 누르지 않고 퇴근했다면 이 칸을 비우고 근태기록의 휴게 칸을 직접 적어 주세요.');
  if (emp.length) {
    p.getRange(MAP_HEAD + 1, 1, emp.length, 2).setValues(
      emp.map(function (e) { return [e.no, e.name]; }));
    p.getRange(MAP_HEAD + 1, 4, emp.length, 1).setNumberFormat('hh:mm');
  }

  status_(p, '준비되었습니다. 출근할 때 체크박스를 누르세요.');
  SpreadsheetApp.getUi().alert('초기설정이 끝났습니다.\n\n「출퇴근」 시트에서 체크박스를 눌러 보세요.');
}


/* ══════════════ 트리거 ══════════════ */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('근태')
    .addItem('출근', '출근')
    .addItem('휴게 시작', '휴게시작')
    .addItem('휴게 종료', '휴게종료')
    .addItem('퇴근', '퇴근')
    .addSeparator()
    .addItem('초기설정', '초기설정')
    .addToUi();
}

function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== SH_PUNCH) return;
  if (e.range.getValue() !== true) return;
  const a1 = e.range.getA1Notation();
  const kind = a1 === P_IN ? 'in' : a1 === P_BS ? 'bs' : a1 === P_BE ? 'be' : a1 === P_OUT ? 'out' : null;
  if (!kind) return;
  sh.getRange(a1).setValue(false);
  punch_(kind);
}

function 출근() { punch_('in'); }
function 휴게시작() { punch_('bs'); }
function 휴게종료() { punch_('be'); }
function 퇴근() { punch_('out'); }


/* ══════════════ 본체 ══════════════ */

function punch_(kind) {
  const ss = SpreadsheetApp.getActive();
  const p = ss.getSheetByName(SH_PUNCH);
  const at = ss.getSheetByName(SH_AT);
  if (!at) { status_(p, '근태기록 시트를 찾지 못했습니다.'); return; }

  const who = resolveEmp_(ss, p);
  if (!who) {
    status_(p, '누구인지 알 수 없습니다. 이름을 고르거나 계정 매핑에 구글 계정을 적어 주세요.');
    return;
  }

  const now = new Date();
  const today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  const frac = (now.getHours() * 3600 + now.getMinutes() * 60) / 86400;
  const hhmm = Utilities.formatDate(now, TZ, 'HH:mm');

  const row = findRow_(at, today, who.no);
  if (!row) { status_(p, today + ' 행을 찾지 못했습니다. 근태기록에 날짜를 추가해 주세요.'); return; }

  if (kind === 'in') { punchIn_(p, at, row, frac, hhmm); return; }
  if (kind === 'bs') { breakStart_(p, at, row, who, frac, hhmm); return; }
  if (kind === 'be') { breakEnd_(p, at, row, who, frac, hhmm); return; }
  punchOut_(p, at, row, who, frac, hhmm);
}


function punchIn_(p, at, row, frac, hhmm) {
  const already = at.getRange(row, C_IN).getValue();
  if (already !== '' && already !== null) {
    status_(p, '이미 출근이 기록되어 있습니다 — ' + fmt_(already)
      + '. 고치려면 근태기록에서 직접 수정하세요.');
    return;
  }
  at.getRange(row, C_IN).setValue(frac).setNumberFormat('hh:mm');
  status_(p, '출근 ' + hhmm + ' 기록했습니다.');
}


function breakStart_(p, at, row, who, frac, hhmm) {
  if (at.getRange(row, C_IN).getValue() === '') {
    status_(p, '출근 기록이 없습니다. 「출근」 을 먼저 눌러 주세요.');
    return;
  }
  const cell = p.getRange(who.mapRow, 4);
  const open = cell.getValue();
  if (open !== '' && open !== null) {
    status_(p, '이미 ' + fmt_(open) + ' 에 휴게가 시작되어 있습니다. 「휴게 종료」 를 누르세요.');
    return;
  }
  cell.setValue(frac).setNumberFormat('hh:mm');
  status_(p, '휴게 시작 ' + hhmm + '. 돌아오시면 「휴게 종료」 를 눌러 주세요.');
}


function breakEnd_(p, at, row, who, frac, hhmm) {
  const cell = p.getRange(who.mapRow, 4);
  const open = cell.getValue();
  if (open === '' || open === null) {
    status_(p, '시작된 휴게가 없습니다. 「휴게 시작」 을 먼저 눌러 주세요.');
    return;
  }
  let span = (frac - toFrac_(open)) * 24;
  if (span < 0) span += 24;
  cell.clearContent();

  const prev = Number(at.getRange(row, C_BREAK).getValue()) || 0;
  const total = Math.round((prev + span) * 100) / 100;
  at.getRange(row, C_BREAK).setValue(total).setNumberFormat('0.00');
  status_(p, '휴게 종료 ' + hhmm + '. 이번 휴게 ' + mins_(span)
    + (prev > 0 ? ', 오늘 합계 ' + mins_(total) : '') + ' 입니다.');
}


function punchOut_(p, at, row, who, frac, hhmm) {
  const inVal = at.getRange(row, C_IN).getValue();
  if (inVal === '' || inVal === null) {
    status_(p, '출근 기록이 없습니다. 출근을 먼저 누르거나 근태기록에 직접 적어 주세요.');
    return;
  }

  // 휴게 종료를 누르지 않은 채 퇴근한 경우, 퇴근 시각을 종료로 보고 마감한다
  const openCell = p.getRange(who.mapRow, 4);
  let dangling = '';
  if (openCell.getValue() !== '' && openCell.getValue() !== null) {
    let span = (frac - toFrac_(openCell.getValue())) * 24;
    if (span < 0) span += 24;
    const prev = Number(at.getRange(row, C_BREAK).getValue()) || 0;
    at.getRange(row, C_BREAK).setValue(Math.round((prev + span) * 100) / 100)
      .setNumberFormat('0.00');
    openCell.clearContent();
    dangling = ' 휴게 종료를 누르지 않으셔서 퇴근 시각까지 휴게로 처리했습니다.';
  }

  const redo = at.getRange(row, C_OUT).getValue() !== '';
  at.getRange(row, C_OUT).setValue(frac).setNumberFormat('hh:mm');

  let stay = (frac - toFrac_(inVal)) * 24;
  if (stay < 0) stay += 24;                             // 자정을 넘긴 퇴근

  // 휴게를 한 번도 누르지 않았다면 근로기준법 제54조 기준으로 채운다
  let brk = at.getRange(row, C_BREAK).getValue();
  let guessed = false;
  if (brk === '' || brk === null) {
    brk = stay >= 8 ? BREAK_8H : (stay >= 4 ? BREAK_4H : 0);
    at.getRange(row, C_BREAK).setValue(brk).setNumberFormat('0.00');
    guessed = true;
  }
  if (at.getRange(row, C_TYPE).getValue() === '') at.getRange(row, C_TYPE).setValue('정상');

  SpreadsheetApp.flush();
  const work = at.getRange(row, C_WORK).getValue();
  const ot = at.getRange(row, C_OT).getValue();
  const night = at.getRange(row, C_NIGHT).getValue();
  const comp = at.getRange(row, C_COMP).getValue();

  let msg = (redo ? '퇴근을 ' + hhmm + ' 로 다시 기록했습니다.' : '퇴근 ' + hhmm + ' 기록했습니다.')
    + dangling + '  근무 ' + work + '시간 · 휴게 ' + mins_(brk)
    + (guessed ? '(자동)' : '');
  if (ot > 0) msg += ' · 연장 ' + ot + '시간';
  if (night > 0) msg += ' · 야간 ' + night + '시간';
  if (comp > 0) msg += '  →  보상휴가 ' + comp + '시간';

  // 근로기준법 제54조 위반 여부를 그 자리에서 알린다
  const need = work >= 8 ? BREAK_8H : (work >= 4 ? BREAK_4H : 0);
  if (brk + 0.001 < need) {
    msg += '   ※ 휴게가 ' + mins_(need) + ' 에 못 미칩니다. 근로기준법 제54조에 따라 '
      + (work >= 8 ? '8' : '4') + '시간 이상 근무하면 ' + mins_(need) + ' 이상을 쉬어야 합니다.';
  }
  status_(p, msg);
}


/* ══════════════ 도우미 ══════════════ */

function readRoster(ss) {
  const em = ss.getSheetByName(SH_EMP);
  if (!em) return [];
  const v = em.getRange(EMP_FIRST, 1, EMP_LAST - EMP_FIRST + 1, 2).getValues();
  const out = [];
  for (let i = 0; i < v.length; i++) {
    if (v[i][0] !== '' && v[i][0] !== null) out.push({ no: v[i][0], name: v[i][1] });
  }
  return out;
}

/** 구글 계정으로 먼저 찾고, 안 되면 이름 드롭다운을 쓴다. 매핑표의 행 번호도 함께 돌려준다. */
function resolveEmp_(ss, p) {
  const n = Math.max(0, p.getLastRow() - MAP_HEAD);
  const map = n > 0 ? p.getRange(MAP_HEAD + 1, 1, n, 3).getValues() : [];

  let email = '';
  try { email = (Session.getActiveUser().getEmail() || '').toLowerCase(); } catch (err) { email = ''; }
  if (email) {
    for (let i = 0; i < map.length; i++) {
      if (String(map[i][2]).trim().toLowerCase() === email) {
        return { no: map[i][0], name: map[i][1], mapRow: MAP_HEAD + 1 + i };
      }
    }
  }

  const name = p.getRange(P_NAME).getValue();
  if (name) {
    for (let i = 0; i < map.length; i++) {
      if (map[i][1] === name) return { no: map[i][0], name: name, mapRow: MAP_HEAD + 1 + i };
    }
    const roster = readRoster(ss);                       // 매핑표에 없으면 명부로 보완
    for (let i = 0; i < roster.length; i++) {
      if (roster[i].name === name) {
        return { no: roster[i].no, name: name, mapRow: MAP_HEAD + 1 + i };
      }
    }
  }
  return null;
}

/** 근태기록에서 날짜와 사번이 맞는 행을 찾는다. */
function findRow_(at, ymd, empNo) {
  const n = AT_LAST - AT_FIRST + 1;
  const v = at.getRange(AT_FIRST, 1, n, C_NO).getValues();
  let firstEmpty = 0;
  for (let i = 0; i < n; i++) {
    const d = v[i][C_DATE - 1];
    if (d === '' || d === null) { if (!firstEmpty) firstEmpty = AT_FIRST + i; continue; }
    if (d instanceof Date && Utilities.formatDate(d, TZ, 'yyyy-MM-dd') === ymd
        && String(v[i][C_NO - 1]) === String(empNo)) {
      return AT_FIRST + i;
    }
  }
  if (firstEmpty) {                                  // 날짜가 아직 안 채워진 경우 새로 만든다
    at.getRange(firstEmpty, C_DATE).setValue(new Date(ymd + 'T00:00:00+09:00'))
      .setNumberFormat('yyyy-mm-dd');
    at.getRange(firstEmpty, C_NO).setValue(empNo);
    return firstEmpty;
  }
  return null;
}

function toFrac_(v) {
  if (v instanceof Date) return (v.getHours() * 3600 + v.getMinutes() * 60) / 86400;
  return Number(v) - Math.floor(Number(v));
}

function fmt_(v) {
  const f = toFrac_(v) * 24;
  const h = Math.floor(f), m = Math.round((f - h) * 60);
  return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
}

/** 0.83 → 「50분」, 1.5 → 「1시간 30분」 */
function mins_(hours) {
  const total = Math.round(Number(hours) * 60);
  const h = Math.floor(total / 60), m = total % 60;
  if (h && m) return h + '시간 ' + m + '분';
  if (h) return h + '시간';
  return m + '분';
}

function status_(p, msg) {
  if (p) p.getRange(P_MSG).setValue(Utilities.formatDate(new Date(), TZ, 'HH:mm') + '  ' + msg);
}


/* ══════════════ 미기록 알림 ══════════════
 *
 * 완전 자동 기록은 회사 와이파이·GPS·출입문 같은 관찰 장치가 있어야 가능하다.
 * 그 대신 「누르는 것을 잊는 일」을 막는다. 아침에 출근 기록이 없거나 저녁에
 * 퇴근 기록이 없으면 본인에게 메일이 간다.
 *
 * 알림설치() 를 한 번 실행하면 켜지고, 알림해제() 로 끈다.
 * 실행하기 전에는 아무 메일도 나가지 않는다.
 */

function 알림설치() {
  알림해제();
  ScriptApp.newTrigger('출근확인').timeBased().atHour(9).nearMinute(20).everyDays(1).create();
  ScriptApp.newTrigger('퇴근확인').timeBased().atHour(18).nearMinute(40).everyDays(1).create();
  SpreadsheetApp.getUi().alert(
    '알림을 켰습니다.\n\n평일 09:20 에 출근 기록이 없으면, 18:40 에 퇴근 기록이 없으면\n'
    + '「출퇴근」 시트의 계정 매핑표에 적힌 주소로 메일이 갑니다.\n\n'
    + '주소가 비어 있으면 그 사람에게는 보내지 않습니다.');
}

function 알림해제() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    var f = t.getHandlerFunction();
    if (f === '출근확인' || f === '퇴근확인') ScriptApp.deleteTrigger(t);
  });
}

function 출근확인() { remind_('in'); }
function 퇴근확인() { remind_('out'); }

/** 오늘 쉬는 날인지 — 주말·공휴일·휴가대장에 기록된 종일 휴가 */
function offToday_(ss, ymd, empNo) {
  var d = new Date(ymd + 'T00:00:00+09:00').getDay();
  if (d === 0 || d === 6) return true;
  var lg = ss.getSheetByName('휴가대장');
  if (!lg) return false;
  var v = lg.getRange(5, 2, 500, 5).getValues();          // B 사번 … F 일수
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]) !== String(empNo)) continue;
    var dt = v[i][2];                                      // D 사용일자
    if (!(dt instanceof Date)) continue;
    if (Utilities.formatDate(dt, TZ, 'yyyy-MM-dd') !== ymd) continue;
    if (Number(v[i][4]) >= 1) return true;                 // 반차는 근무가 있다
  }
  return false;
}

function remind_(kind) {
  var ss = SpreadsheetApp.getActive();
  var at = ss.getSheetByName(SH_AT), p = ss.getSheetByName(SH_PUNCH);
  if (!at || !p) return;

  var ymd = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');
  var n = Math.max(0, p.getLastRow() - MAP_HEAD);
  if (!n) return;
  var map = p.getRange(MAP_HEAD + 1, 1, n, 3).getValues();  // 사번 · 성명 · 계정

  var rows = at.getRange(AT_FIRST, 1, AT_LAST - AT_FIRST + 1, C_OUT).getValues();

  map.forEach(function (m) {
    var no = m[0], name = m[1], mail = String(m[2] || '').trim();
    if (!no || !mail) return;
    if (offToday_(ss, ymd, no)) return;

    var found = null;
    for (var i = 0; i < rows.length; i++) {
      var d = rows[i][C_DATE - 1];
      if (d instanceof Date && Utilities.formatDate(d, TZ, 'yyyy-MM-dd') === ymd
          && String(rows[i][C_NO - 1]) === String(no)) { found = rows[i]; break; }
    }
    var hasIn  = found && found[C_IN - 1] !== '';
    var hasOut = found && found[C_OUT - 1] !== '';

    var subject, body;
    if (kind === 'in') {
      if (hasIn) return;
      subject = '[마인드] 오늘 출근 기록이 없습니다';
      body = name + ' 님,\n\n오늘(' + ymd + ') 출근 기록이 아직 없습니다.\n'
        + '「출퇴근」 시트에서 출근을 눌러 주세요. 이미 근무 중이시면 시각을 직접 고치셔도 됩니다.\n\n'
        + ss.getUrl();
    } else {
      if (!hasIn || hasOut) return;
      subject = '[마인드] 오늘 퇴근 기록이 없습니다';
      body = name + ' 님,\n\n오늘(' + ymd + ') 출근은 기록되었으나 퇴근이 남아 있지 않습니다.\n'
        + '퇴근하실 때 눌러 주세요. 이미 퇴근하셨다면 근태기록 시트에서 시각을 적어 주시면 됩니다.\n\n'
        + ss.getUrl();
    }
    try { MailApp.sendEmail(mail, subject, body); } catch (e) {}
  });
}
