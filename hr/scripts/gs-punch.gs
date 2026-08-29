/**
 * 마인드 근태 기록 — 출퇴근 스크립트
 *
 * 구글 시트로 옮긴 「마인드_근태연차_관리대장」에 붙여 넣고 초기설정() 을 한 번 실행한다.
 * 「출퇴근」 시트가 만들어지고, 체크박스를 누르면 근태기록 시트에 시각이 들어간다.
 *
 * 체크박스를 기본으로 삼는 이유가 둘 있다.
 *   1. 체크박스 편집은 단순 트리거(onEdit)로 잡히므로 사원이 최초 권한 승인 절차를
 *      거치지 않고 바로 쓸 수 있다. 상단 「근태」 메뉴는 사람마다 첫 사용 때
 *      한 번 승인 창이 뜬다.
 *   2. 그림에 스크립트를 연결한 버튼은 모바일 구글 시트 앱에서 눌리지 않는다.
 *      회사 노트북에서만 쓴다면 버튼을 따로 만들어 붙여도 되지만, 그림 삽입은
 *      스크립트로 못 하므로 사람이 직접 넣어야 한다.
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
const P_NAME = 'B4', P_IN = 'B5', P_OUT = 'B6', P_MSG = 'B8';
const MAP_HEAD = 18;         // 계정 매핑표 머리글 행


/* ══════════════ 최초 1회 ══════════════ */

function 초기설정() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone(TZ);

  let p = ss.getSheetByName(SH_PUNCH);
  if (!p) p = ss.insertSheet(SH_PUNCH, 0);
  ss.setActiveSheet(p);
  ss.moveActiveSheet(1);
  p.clear();
  p.setHiddenGridlines(true);
  p.setColumnWidth(1, 90);
  p.setColumnWidth(2, 520);
  p.setColumnWidth(3, 300);

  p.getRange('A1').setValue('출퇴근').setFontSize(16).setFontWeight('bold');
  p.getRange('A2').setValue('체크박스를 누르면 근태기록 시트에 오늘 날짜의 출퇴근 시각이 들어갑니다.')
    .setFontSize(9).setFontColor('#6B7280');

  p.getRange(4, 1, 3, 1).setValues([['이름'], ['출근'], ['퇴근']]).setFontWeight('bold');
  p.getRange('A8').setValue('상태').setFontWeight('bold');
  p.getRange(P_MSG).setFontColor('#6B7280').setWrap(true);
  p.getRange('C5').setValue('← 자리에 앉으면 누르세요').setFontSize(9).setFontColor('#6B7280');
  p.getRange('C6').setValue('← 나갈 때 누르세요. 휴게시간은 자동으로 들어갑니다')
    .setFontSize(9).setFontColor('#6B7280');

  // 이름 목록 — 직원명부에서 가져온다
  const emp = readRoster(ss);
  const names = emp.map(function (e) { return e.name; }).filter(String);
  if (names.length) {
    p.getRange(P_NAME).setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInList(names, true).build());
    if (names.length === 1) p.getRange(P_NAME).setValue(names[0]);
  }

  const cb = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  p.getRange(P_IN).setDataValidation(cb).setValue(false);
  p.getRange(P_OUT).setDataValidation(cb).setValue(false);

  // 사용 방법 — 쓰는 자리에 붙여 둔다
  p.getRange('A10').setValue('사용 방법').setFontWeight('bold').setFontSize(11);
  const how = [
    ['1', '출근하면 이 시트를 열고 「출근」 체크박스를 누릅니다. 누른 시각이 기록됩니다.'],
    ['2', '퇴근할 때 「퇴근」 체크박스를 누릅니다. 휴게시간·근무시간·연장시간이 자동 계산됩니다.'],
    ['3', '체크는 눌린 뒤 바로 풀립니다. 정상입니다. 결과는 아래 「상태」 줄에서 확인하세요.'],
    ['4', '누르는 것을 잊었거나 시각이 틀렸으면 근태기록 시트에서 직접 고치면 됩니다.'],
    ['5', '휴게를 한 시간과 다르게 썼다면 근태기록의 「휴게(h)」 칸을 고쳐 주세요.'],
  ];
  p.getRange(11, 1, how.length, 2).setValues(how);
  p.getRange(11, 1, how.length, 1).setFontColor('#6B7280').setHorizontalAlignment('center');
  p.getRange(11, 2, how.length, 1).setFontSize(9).setWrap(false);

  // 계정 매핑 — 회사 구글 계정으로 자동 식별하려면 여기에 이메일을 적는다
  p.getRange(MAP_HEAD - 1, 1).setValue('계정 매핑').setFontWeight('bold').setFontSize(11);
  p.getRange(MAP_HEAD - 1, 2)
    .setValue('회사 구글 계정을 적어 두면 이름을 고르지 않아도 본인으로 기록됩니다.')
    .setFontSize(9).setFontColor('#6B7280');
  p.getRange(MAP_HEAD, 1, 1, 3).setValues([['사번', '성명', '구글 계정']])
    .setFontWeight('bold').setBackground('#F4F5F7');
  if (emp.length) {
    p.getRange(MAP_HEAD + 1, 1, emp.length, 2).setValues(
      emp.map(function (e) { return [e.no, e.name]; }));
  }

  status_(p, '준비되었습니다. 출근할 때 체크박스를 누르세요.');
  SpreadsheetApp.getUi().alert('초기설정이 끝났습니다.\n\n「출퇴근」 시트에서 체크박스를 눌러 보세요.');
}


/* ══════════════ 트리거 ══════════════ */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('근태')
    .addItem('출근', '출근')
    .addItem('퇴근', '퇴근')
    .addSeparator()
    .addItem('초기설정', '초기설정')
    .addToUi();
}

function onEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== SH_PUNCH) return;
  const a1 = e.range.getA1Notation();
  if (a1 === P_IN && e.range.getValue() === true) { sh.getRange(P_IN).setValue(false); punch_('in'); }
  if (a1 === P_OUT && e.range.getValue() === true) { sh.getRange(P_OUT).setValue(false); punch_('out'); }
}

function 출근() { punch_('in'); }
function 퇴근() { punch_('out'); }


/* ══════════════ 본체 ══════════════ */

function punch_(kind) {
  const ss = SpreadsheetApp.getActive();
  const p = ss.getSheetByName(SH_PUNCH);
  const at = ss.getSheetByName(SH_AT);
  if (!at) { status_(p, '근태기록 시트를 찾지 못했습니다.'); return; }

  const empNo = resolveEmp_(ss, p);
  if (!empNo) {
    status_(p, '누구인지 알 수 없습니다. 이름을 고르거나 계정 매핑에 구글 계정을 적어 주세요.');
    return;
  }

  const now = new Date();
  const today = Utilities.formatDate(now, TZ, 'yyyy-MM-dd');
  const frac = (now.getHours() * 3600 + now.getMinutes() * 60) / 86400;
  const hhmm = Utilities.formatDate(now, TZ, 'HH:mm');

  const row = findRow_(at, today, empNo);
  if (!row) { status_(p, today + ' 행을 찾지 못했습니다. 근태기록에 날짜를 추가해 주세요.'); return; }

  if (kind === 'in') {
    const already = at.getRange(row, C_IN).getValue();
    if (already !== '' && already !== null) {
      status_(p, '이미 출근이 기록되어 있습니다 — ' + fmt_(already) + '. 고치려면 근태기록에서 직접 수정하세요.');
      return;
    }
    at.getRange(row, C_IN).setValue(frac).setNumberFormat('hh:mm');
    status_(p, '출근 ' + hhmm + ' 기록했습니다.');
    return;
  }

  const inVal = at.getRange(row, C_IN).getValue();
  if (inVal === '' || inVal === null) {
    status_(p, '출근 기록이 없습니다. 출근을 먼저 누르거나 근태기록에 직접 적어 주세요.');
    return;
  }
  const redo = at.getRange(row, C_OUT).getValue() !== '';
  at.getRange(row, C_OUT).setValue(frac).setNumberFormat('hh:mm');

  // 휴게시간 — 근로기준법 제54조. 4시간에 30분, 8시간에 1시간.
  // 이미 적힌 값이 있으면 건드리지 않는다.
  if (at.getRange(row, C_BREAK).getValue() === '') {
    let stay = (frac - toFrac_(inVal)) * 24;
    if (stay < 0) stay += 24;                       // 자정을 넘긴 퇴근
    at.getRange(row, C_BREAK).setValue(stay >= 8 ? 1 : (stay >= 4 ? 0.5 : 0));
  }
  if (at.getRange(row, C_TYPE).getValue() === '') at.getRange(row, C_TYPE).setValue('정상');

  SpreadsheetApp.flush();
  const work = at.getRange(row, C_WORK).getValue();
  const ot = at.getRange(row, C_OT).getValue();
  const night = at.getRange(row, C_NIGHT).getValue();
  const comp = at.getRange(row, C_COMP).getValue();

  let msg = (redo ? '퇴근을 ' + hhmm + ' 로 다시 기록했습니다.' : '퇴근 ' + hhmm + ' 기록했습니다.')
    + '  근무 ' + work + '시간';
  if (ot > 0) msg += ' · 연장 ' + ot + '시간';
  if (night > 0) msg += ' · 야간 ' + night + '시간';
  if (comp > 0) msg += '  →  보상휴가 ' + comp + '시간';
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

/** 구글 계정으로 먼저 찾고, 안 되면 이름 드롭다운을 쓴다. */
function resolveEmp_(ss, p) {
  let email = '';
  try { email = (Session.getActiveUser().getEmail() || '').toLowerCase(); } catch (err) { email = ''; }

  if (email) {
    const n = Math.max(0, p.getLastRow() - MAP_HEAD);
    if (n > 0) {
      const map = p.getRange(MAP_HEAD + 1, 1, n, 3).getValues();
      for (let i = 0; i < map.length; i++) {
        if (String(map[i][2]).trim().toLowerCase() === email) return map[i][0];
      }
    }
  }

  const name = p.getRange(P_NAME).getValue();
  if (name) {
    const roster = readRoster(ss);
    for (let i = 0; i < roster.length; i++) if (roster[i].name === name) return roster[i].no;
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

function status_(p, msg) {
  if (p) p.getRange(P_MSG).setValue(Utilities.formatDate(new Date(), TZ, 'HH:mm') + '  ' + msg);
}
