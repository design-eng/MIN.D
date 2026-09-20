---
name: figma-screen-spec-table
description: 현대건설 THE H / HILLSTATE 화면정의서(Screen Specification) 덱의 우측 기획 표와 목업 마커를 읽고·수정·검수할 때 사용한다. "기획 내용 추가", "기획 정의", "타이틀에 맞게 정리", "표에 행 추가", "화면정의서 확인·검수", "설명 행 수정", "마커 정리", "마커 위치 맞춰줘", "목업이랑 표가 안 맞아", "페이지 PDF로" 같은 요청에 반드시 먼저 확인한다. 표 행 구조·줄 수 계산·높이 한계(1018), 편집 가능 여부 판별(textStyleId), Pretendard 스왑 스타일 기법, 마커 부여·신설·정렬 규칙, 페이지 분리 원칙, 목업 대조, 슬라이드 라벨 이동, PDF 내보내기 제약을 모두 다룬다.
---

# 화면정의서 기획 표 작성 · 수정

## When to use

- 덱 슬라이드 우측의 기획 표(번호 / 유형 / 내용)에 행을 추가하거나 문구를 고칠 때
- "타이틀에 맞는 기획 정의" 처럼 장별 역할을 나눠야 할 때
- 목업의 콜아웃 마커 번호와 표의 번호를 맞춰야 할 때
- 여러 장이 같은 표를 복제해 쓰고 있어 중복을 정리해야 할 때

**이관·좌표 정렬**은 이 스킬이 아니라 `figma-slides-migration` 을 본다.

---

## 1. 슬라이드 지오메트리 (1920×1080)

| 요소 | 좌표 / 크기 |
|---|---|
| 헤더 `PPT_form` | (0,0) 1920×172 |
| 푸터 `PPT_form/bottom` | (0,1020) 1920×60 |
| 기획 표 | x = **1240**, w = **680**, y는 장마다 140 또는 172 |
| 목업(화면) | x < 1150 영역 |
| **콘텐츠 하단 한계** | **1018** — `표 y + 표 height ≤ 1018` |

표를 슬라이드에서 찾는 판별식:

```js
const SX = slide.absoluteTransform[0][2];
let tbl = null;
for (const c of slide.children) {
  const dx = c.absoluteTransform[0][2] - SX;
  if (dx > 1150 && c.width > 500 && c.width < 800) tbl = c;
}
```

슬라이드 전수 순회 (SLIDE_ROW / SLIDE_GRID 로 감싸여 있음):

```js
const flat = [];
(function walk(x){
  for (const c of x.children || []) {
    if (c.type === "SLIDE") flat.push(c);
    else if (c.type === "SLIDE_ROW" || c.type === "SLIDE_GRID") walk(c);
  }
})(figma.currentPage);
```

> 250장 이상을 한 번에 순회하면 타임아웃. **100장 단위로 청크 분할**.

---

## 2. 표 행 구조

```
표 프레임 (VERTICAL auto-layout)
└ PPT_form/list                 ← 행 1개
  └ Frame 270 (HORIZONTAL)
    ├ Note              번호   (Inter)
    ├ Funtion           유형   (Noto Sans KR / 원본은 Pretendard)
    └ Frame 2609099     내용   (w 484, textAutoResize NONE)
```

행 안의 TEXT 노드를 순서대로 뽑는 헬퍼 — **항상 이걸 쓴다**:

```js
function texts(row){
  const ts=[];
  (function w(x,d){ if(d>6) return;
    for(const c of x.children||[]){ if(c.type==="TEXT") ts.push(c); else w(c,d+1); }
  })(row,0);
  return ts;               // ts[0]=번호, ts[1]=유형, ts[2]=내용
}
```

### 줄 수와 높이

- 내용 셀 폭 484px / 14pt 한글 ≈ **한 줄 32자**
- **행 높이 = 줄수 × 24 + 16**
- 내용 셀은 `textAutoResize = NONE` 이므로 줄 수를 바꾸면 반드시 `resize(484, 줄수*24)`

**높이를 바꾸지 않는 편집이 가장 안전하다.** 문구를 고칠 때는 줄 수를 유지하도록 32자 안에서 압축한다.

---

## 3. ★ Pretendard 를 못 쓴다 — 스왑 스타일 기법

`figma.loadFontAsync({family:"Pretendard"})` 는 **"font family does not exist"** 로 실패한다.
Noto Sans KR 과 Inter 는 로드된다.

텍스트 스타일이 바인딩된 노드는 **스타일을 잠깐 갈아끼웠다가 되돌리는** 방식으로 Pretendard 를 유지한 채 글자만 바꿀 수 있다:

```js
await figma.loadFontAsync({family:"Noto Sans KR", style:"Regular"});
const SWAP = "S:af58f9e59acb5f2cbc12bca96b549f2c8656294b,";   // swap/14-24--6

async function setT(t, v){
  const orig = t.textStyleId;        // ★ getTextStyleIdAsync 는 없다. 속성으로 읽는다
  await t.setTextStyleIdAsync(SWAP);
  t.characters = v;
  await t.setTextStyleIdAsync(orig); // 되돌리면 Pretendard 로 복귀
}
```

> **스왑 스타일의 fontSize / lineHeight / letterSpacing 이 대상과 정확히 같아야 한다.**
> 다르면 그 메트릭이 그대로 구워져 버린다. 본문 스타일은 14 / 24 / −6% 이고
> `S:3a335f8983a3de509ea57f0c2e069dcf53224d7f,` · `S:7d4f50851f08e4a05a3219b4b73eee13e1cad5d5,` 두 가지가 쓰인다.

### ★ 편집 가능 여부는 폰트가 아니라 `textStyleId` 로 판별한다

Pretendard 라고 바로 포기하면 안 된다. **스타일이 바인딩돼 있으면 스왑으로 편집 가능하다.**

| 폰트 | `textStyleId` | 판정 |
|---|---|---|
| Noto Sans KR / Inter | 무엇이든 | **직접 대입 가능** (스왑 불필요) |
| Pretendard | 바인딩 있음 | **스왑 기법으로 가능** |
| Pretendard | `""` (없음) | **불가** — 되돌릴 스타일이 없어 폰트가 영구히 바뀐다 |

작업 전 반드시 셀 3개(번호·유형·내용)를 **행마다** 찍어본다. 한 표 안에서도 행마다 다르다
(앞서 편집한 행만 Noto 로 바뀌어 있는 경우가 흔하다).

```js
tbl.children.map((r,i)=>{const c=cells(r);
  return i+"|num="+(c[0].fontName.family||"?")+",st="+(c[0].textStyleId?"Y":"N")
          +"|body="+(c[2].fontName.family||"?")+",st="+(c[2].textStyleId?"Y":"N");});
```

**스왑 스타일은 대상과 fontSize·lineHeight·letterSpacing 이 모두 같은 것을 고른다.**
`getLocalTextStylesAsync()` 로 찾는다. 이 덱에 준비된 것들:

| 대상 | 메트릭 | 스왑 스타일 |
|---|---|---|
| 표 본문 (`Body 14pt`) | 14 / 24 / −6% | `swap/14-24--6` = `S:af58f9e59acb5f2cbc12bca96b549f2c8656294b,` |
| 슬라이드 타이틀 (`Header 3`) | 36 / 132% / −2% | **`swap/title 36 (fix)`** (Noto Sans KR Bold) |

타이틀도 이 스타일로 바꿀 수 있다. 바꾼 뒤 `fontSize / lineHeight / letterSpacing / fontName` 을
다시 읽어 원래 값과 같은지 **반드시 검증**한다.

미바인딩 Pretendard 만 사용자 작업으로 넘긴다 (덱 290·291·295 오타, 905장 표 전체가 이 경우).

### ★ 미바인딩 Pretendard 도 되살릴 수 있다 — 임시 스타일로 Noto 전환

되돌릴 스타일이 없어도, **Noto Sans KR 스타일을 새로 만들어 씌우면** 폰트가 바뀌면서 편집 가능해진다.

```js
const K = 1/0.703125;                       // ★ 스타일 값은 이 비율로 나뉘어 적용된다
const st = figma.createTextStyle();
st.name = "auto/" + n.fontSize.toFixed(2);
st.fontName = {family:"Noto Sans KR", style:"Regular"};
st.fontSize = n.fontSize * K;               // 보정하지 않으면 0.703125 배로 줄어든다
st.lineHeight = n.lineHeight.unit === "PIXELS"
  ? {unit:"PIXELS", value: n.lineHeight.value * K}
  : n.lineHeight;                           // PERCENT 는 그대로
st.letterSpacing = n.letterSpacing;         // 그대로
await n.setTextStyleIdAsync(st.id);
```

**주의**
- `n.fontSize = ...` 직접 대입은 **무시된다** (Pretendard 가 안 올라와서). 반드시 스타일 경유.
- 스타일 적용 후 `setTextStyleIdAsync("")` 로 떼면 크기가 축소된 채 남는다. **떼지 말고 유지**한다.
- 셀마다 메트릭이 제각각이다. `(fontSize, lineHeight, letterSpacing)` 로 묶어 그룹당 스타일 하나씩 만든다.
  한 표 안에 6~7종이 나오는 게 보통이다.
- 전환 후에는 Noto 라서 `characters` 직접 대입이 되고, 크기·행간도 직접 수정된다.

실적용: 897·899 표(각 30·31셀)를 이 방식으로 전환 → 이후 자유 편집 가능.

---

## 4. 행 추가

템플릿은 **번호가 비어 있고 1줄짜리인 기존 행**을 복제한다.

```js
const tmpl = tbl.children[2];         // 번호 공란 1줄 행
const cp = tmpl.clone(); tbl.appendChild(cp);
const ts = texts(cp);
await setT(ts[1], "Info");
await setT(ts[2], "첫째 줄\n둘째 줄");
ts[2].resize(484, 2*24);
```

행 삭제:

```js
while (tbl.children.length > 9) tbl.children[tbl.children.length-1].remove();
```

추가 후 **반드시** `표 y + height ≤ 1018` 을 확인한다. 넘치면 **다음 페이지로 분할**한다 — 배율 축소는 금지.

---

## 5. 마커(콜아웃 번호) — 사용자 확정 규칙

목업 옆 원형 번호는 `Number` / `Number sign` INSTANCE (컴포넌트 `18:4275`, `18:4232`), 34×24, 안쪽 TEXT 는 **Inter Bold** → 직접 대입 가능.

### 규칙 (사용자가 명시한 것)

1. **UI 요소마다 개별 번호를 준다.** 성격이 다른 요소를 한 행에 묶지 않는다.
   (관리자 ID / 등록일·조회수, 뱃지 / 카테고리명 / 제목 — 전부 따로)
2. **필요하면 마커를 새로 만든다.** 기존 마커 복제 후 번호·좌표만 바꾼다.
3. **표 자리가 모자라면 압축하지 말고 페이지를 분리**해 나머지를 설명한다.

### 마커 위치는 요소 중앙에 맞춘다

```
마커 y = 요소 y + 요소 height/2 − 12      (마커 높이 24)
```

요소 좌표는 **텍스트가 아니라 감싸는 프레임**의 `absoluteTransform[1][2]` 와 `height` 로 잰다.
목업이 바뀌면 전부 다시 잰다 — 30~80px 씩 밀려 있는 경우가 흔하다.

### 마커 x 좌표

폰 프레임 왼쪽 바깥. 폰 사이 간격을 재서 넣는다.
```js
// 폰 프레임 실측 → 마커 x 결정
s.children.filter(c=>c.height>300).map(c=>[c.id, Math.round(c.x), Math.round(c.x+c.width)]);
```
예: 좌측 폰 100~420 → 마커 x=73 / 두 번째 폰 501~821 → x=460 / 세 번째 폰 896~1216 → x=855.
**사용자가 폰을 옮기면 마커도 같이 옮겨야 한다.**

### 겹칠 때

두 요소가 **한 줄에 나란히** 있으면(예: 「중요」 뱃지 + [카테고리 명]) 마커를 한 점에 둘 수 없다.
→ **24px 이상 위아래로 어긋나게** 놓고, 위쪽 마커 = 왼쪽 요소로 읽히게 한다.

### 그 외

- **표의 번호 = 목업 마커 번호.** 하나가 바뀌면 둘 다 바꾼다.
- 같은 번호가 목업에 **두 번 나올 수 있다** — 같은 상태(미확인/확인)를 다른 영역에서 보여줄 때.
  오류가 아니다. 표 문구에 "A 영역 · B 영역 공통" 이라고 명시한다.
- 번호 공란 행은 **바로 위 번호 행의 부연**이다. `Info` 유형을 쓴다.
- **해당 UI 가 목업에 안 보이면 번호를 주지 말고**, 규칙 3에 따라 연속 페이지를 만들 것을 제안한다.

### 새 마커 만들기

```js
await figma.loadFontAsync({family:"Inter", style:"Bold"});
function num(c){const t=[];(function w(n,d){if(d>5)return;
  for(const q of n.children||[]){if(q.type==="TEXT")t.push(q);else w(q,d+1);}})(c,0);return t[0];}
const cp = src.clone(); slide.appendChild(cp);
cp.x = 73; cp.y = 400; num(cp).characters = "5";
```
번호를 밀 때는 **뒤에서부터**(큰 번호부터) 바꾼다.

---

## 6. 목업이 정답이다

표 문구를 쓰기 전에 **반드시 해당 슬라이드를 렌더해서 목업을 본다.**

```
get_screenshot(fileKey, nodeId=슬라이드ID, maxDimension=1400, enableBase64Response=true)
```

실측으로 겪은 사고:

| 추정으로 쓴 문구 | 목업의 실제 |
|---|---|
| "[고정] 뱃지 표시" | 리스트엔 뱃지가 없고 **카드형(그림자)** 으로 구분 |
| "고정 영역 하단 구분선" | 구분선 없이 **여백**으로 구분 |
| "상단 고정" 기능 | 실제 개념은 **「긴급」 등록** — 상세에 「긴급」 뱃지 |

용어는 반드시 사용자에게 확인한다. 화면에 보이는 라벨이 곧 기획 용어다.

> **egress 정책이 figma.com 을 막는다(403).** 스크린샷 URL 을 curl 로 못 받는다.
> 항상 `enableBase64Response: true` 로 인라인 수신한다.

---

## 7. ★ MCP 타임아웃 — 쓰기는 적용된다

`use_figma` 가 60초 타임아웃으로 실패해도 **거의 항상 쓰기는 이미 반영되어 있다.**

1. 같은 코드를 다시 던지지 말 것 (중복 행이 생긴다)
2. **먼저 읽어서 상태를 확인**하고
3. 안 된 부분만 다시 실행

타임아웃을 줄이려면 한 호출에 **쓰기 2건 이하**로 쪼갠다. 읽기도 마찬가지다.

---

## 8. 장별 역할 분화 패턴

사용자가 한 장을 복제해 여러 장을 만들고 **타이틀만 다르게** 지정하는 경우가 많다.
이때 표는 전부 동일한 상태이므로 타이틀에 맞춰 나눈다:

- **기본 장** — 공통 정의만 남기고, 파생 기능은 제거 후 `Info` 한 줄로 참조 넘김
  「댓글 · 답글 작성 및 표시 규칙은 / 상세페이지_댓글, 답글(283장) 참조」
- **파생 장** — 공통 행(0~n번)은 그대로 두고 **그 장 전용 행만 뒤에 추가**
- 참조는 **장 번호**로 쓴다. 장 번호는 사용자가 재배열하면 바뀌므로, 헤더 타이틀도 함께 적는다

설명(0번) 행은 브레드크럼으로 쓴다: `상위 페이지 > 이 페이지`

---

## 9. 절대 금지

- **`visible = false`** — 숨긴 노드는 다시 찾을 수 없다. 비울 땐 `characters = ""` 나 opacity 0
- **오타가 아닌 문장을 임의로 고치지 않는다.** 용어 통일이 필요하면 먼저 물어본다
- **표가 넘친다고 배율을 줄이지 않는다.** 다음 페이지로 분할
- **미사용 요소·컴포넌트를 삭제하지 않는다.** 사용자가 직접 확인 후 처리
- **레이아웃이 잘려 보여도 지적·수정 대상이 아니다** (사용자 의도)
- **사용자가 준 원본 화면은 수정하지 않는다.** 복제해서 쓴다
- "이상해 보이는 설정"을 임의 판단으로 되돌리지 않는다 — 먼저 확인

---

## 10. ★ 슬라이드 라벨은 계속 밀린다

슬라이드 이름(`slide.name`)은 **위치에서 파생된 라벨**이라, 사용자가 장을 추가·삭제하면 전부 밀린다.
이 세션에서만 같은 노드가 905 → 906 → 907, 897 → 896 으로 옮겨 다녔다.

- 사용자가 "281 정리해줘" 라고 하면 **라벨로 찾되 반드시 제목을 렌더해 확인**하고 답에 노드 ID를 함께 적는다.
- 위치 인덱스(`flat[i]`)와 라벨(`s.name`)은 **다르다**. 라벨로 매칭할 것.
- 작업 결과를 보고할 때 **노드 ID를 같이 준다.** 라벨만 주면 다음 대화에서 못 찾는다.

```js
const flat=[];
(function walk(x){for(const c of x.children||[]){
  if(c.type==="SLIDE")flat.push(c); else if(c.type==="SLIDE_ROW"||c.type==="SLIDE_GRID")walk(c);}})(figma.currentPage);
flat.filter(s=>["281","282","283"].includes(s.name)).map(s=>s.id+"|"+s.name);
```

슬라이드 제목 추출 (헤더 아래 36pt 텍스트):
```js
let t=""; (function w(n,d){ if(d>3||t) return; for(const c of n.children||[]){
  if(c.type==="TEXT"){ const y=c.absoluteTransform[1][2]-SY, x=c.absoluteTransform[0][2]-SX;
    if(y>95&&y<170&&x<900&&c.characters.trim()){ t=c.characters.trim(); return; } }
  else w(c,d+1); }})(slide,0);
```

---

## 11. PDF·이미지 내보내기 — 파일을 만들어 줄 수 없다

- **프록시가 `www.figma.com` 을 조직 정책으로 차단한다** (CONNECT 403). `curl` 로 렌더 URL 을 못 받는다.
- `use_figma` 응답은 **20 KB 에서 잘린다** (실측). base64 로 나르면
  5장 PDF 8.3 MB → 580회, 1280px JPG 1.2 MB → 87회. **비현실적.**
- `exportAsync({format:"PDF"})` / `download_assets` 는 서버에 파일을 만들지만 **URL 다운로드가 막혀 있다.**

**대응**: 장별 PDF URL 을 만들어 사용자에게 넘기고(단기 유효), 한 파일로 묶는 건
**Figma 자체 `파일 → 내보내기 → PDF`** 를 안내한다. 라벨이 밀리므로 **제목 기준**으로 범위를 잡게 한다.

```js
// 장별 export 크기 미리 재보기 (전송 가능 여부 판단용)
const b = await n.exportAsync({format:"PDF"});           // 또는 {format:"JPG", constraint:{type:"WIDTH", value:1280}}
b.length;
```

---

## 12. 참조 노드 (공지사항, 2026-09-07 시점)

덱 `XVGk8Kx3teqKS42Gnd6DCn` — **라벨은 밀리므로 노드 ID 로 찾을 것**

| 라벨 | 노드 | 표 | 제목 |
|---|---|---|---|
| 281 | `910:124327` | `910:124328` (828) | 홈 _ 공지사항 — 마커 1~6, 3·4 중복(중요/일반 공통) |
| 282 | `3018:140435` | `3018:140439` (868) | 홈 _ 공지사항_상세페이지 — **마커 1~13**, 목업 3개 |
| 283 | `40004105:489181` | `40004105:489195` (848) | 홈 _ 공지사항_「중요」 공지 상세 페이지 — 마커 1~9 |
| 284 | `40001565:334946` | — | 상세페이지/확대사진 |
| 905 | `40003540:531730` | `40003540:531733` (Frame 273, 행별 list 인스턴스) | 기축_마이(입주 전) — 미바인딩 Pretendard 였으나 **Noto Sans KR 전환 완료** |
| 906 | `40003540:531743` | `40003540:531797` (642) | 기축_마이(입주 후) — Noto Sans KR, 편집 가능 |
| 564 | `40004472:496039` | `40004472:496040` (Frame 2609093, 520) | 홈_ 커뮤니티_신청현황 카드 — 마커 1~9 (좌 6 / 우 3), 「기획 진행」 뱃지 |

### 용어 확정
- 공지사항 상단 고정 = **「중요」** (긴급 → 중요로 변경됨). 리스트는 카드형, 상세는 「중요」 뱃지.
- 상세페이지 구성: [카테고리 명] → 제목 → 관리자 ID → 등록일·조회수 → 이미지 → 도트 → 본문 → 댓글 → 답글

### 취소선 보존 기법
취소선(STRIKETHROUGH)이 걸린 줄이 섞인 셀은 `characters` 전체 재작성 시 서식이 날아간다.
**앞부분만 교체**할 때는 삽입 후 삭제:
```js
const cut = t.characters.indexOf("위치정보설정");   // 보존할 구간의 시작
t.insertCharacters(0, NEW, "AFTER");               // 0번 문자의 서식을 상속
t.deleteCharacters(NEW.length, NEW.length + cut);  // 옛 구간만 제거
```
검증: `t.getRangeTextDecoration(i,i+1)` 로 구간을 다시 훑는다.

---

## 13. 2026-09-10 추가 — 미바인딩 Pretendard 전환 실전 보강

### ★ 스타일을 갈아끼우면 취소선이 날아간다 (range fills 는 살아남는다)
`setTextStyleIdAsync()` 는 **range text decoration 을 스타일 값(NONE)으로 덮어쓴다.**
반면 `setRangeFills` 로 넣은 색(빨강 변수 alias 포함)은 **그대로 보존된다.**

⇒ 전환 **전에** 구간을 떠 두고, 전환 **후에** 다시 칠한다:
```js
// 1) 전환 전 — 구간 기록
const segs=[]; let cur=null;
for(let i=0;i<t.characters.length;i++){
  const d=t.getRangeTextDecoration(i,i+1);
  if(!cur||cur.d!==d){cur={d,a:i,b:i+1};segs.push(cur);}else cur.b=i+1;
}
// 2) setTextStyleIdAsync(...) 로 Noto 전환 + 본문 수정
// 3) 전환 후 — 복원
for(const g of segs) if(g.d!=="NONE") t.setRangeTextDecoration(g.a,g.b,g.d);
```
빨강이 변수 바인딩이면 다시 칠할 때도 바인딩을 유지한다:
```js
const paint = figma.variables.setBoundVariableForPaint(
  {type:"SOLID", color:{r:1,g:0.2314,b:0.1882}}, "color",
  await figma.variables.getVariableByIdAsync("VariableID:...")
);
t.setRangeFills(a,b,[paint]);
```

### ★ 표가 「행마다 별도 인스턴스」인 슬라이드가 있다
`PPT_form/list` 를 하나 잡고 끝내면 **1행만 읽힌다.**
실제 구조가 이런 경우가 있다:
```
Frame 273 (VERTICAL, HUG)        ← 이게 표 컨테이너
 ├ PPT_form/list  ← 0행
 ├ PPT_form/list  ← 1행
 ├ PPT_form/list  ← 2행
 ├ PPT_form/list  ← 3행
 └ PPT_form/list  ← 마감선(Rectangle 961 하나뿐, 높이 0.703125)
```
표를 잡기 전에 **x>1150 & width>400 인 컨테이너를 전부 나열**해 어느 쪽인지 먼저 확인한다.
모두 auto-layout HUG 이므로 줄을 늘리면 행·표 높이가 자동으로 늘어난다.

**행 추가**: 기존 행을 `clone()` → 마감선 **앞에** `insertChild`
```js
const nw = src.clone();
const idx = f.children.findIndex(c=>c.id===CLOSING_LINE_ID);
f.insertChild(idx<0?f.children.length:idx, nw);
```

### 마커 텍스트가 Pretendard Bold 인 경우
`Number sign/left` (48×20, 리더선 포함) 는 내부 TEXT 가 **Pretendard Bold 12/20/0.15px**,
단 **textStyleId 바인딩이 있다** ⇒ **스왑 기법으로 편집 가능**.
(`Number`/`Number sign` 34×24 는 Inter Bold 라 직접 대입 가능 — 둘을 혼동하지 말 것.)
마커 y = 대상 요소 그룹의 **세로 중앙 − (마커 height / 2)**.

### 잔실수 방지
- **`console.log` 는 응답에 나오지 않는다.** 반드시 `return` 으로 문자열을 돌려받는다.
- `node.fontSize` 는 `figma.mixed`(symbol)일 수 있다 → `typeof x === "number"` 가드 없이 비교하면
  `TypeError: cannot convert symbol to number`.
- 폰트 미로드 에러가 나면 **그 호출 전체가 롤백**된다(clone 도 남지 않는다). 다시 통째로 실행하면 된다.

---

## 14. 마커 좌·우 배치 — `Number` 컴포넌트 세트 6종

컴포넌트 세트 **`18:4313` (Number)** 에 방향 변형이 있다. 리더선이 대상 쪽으로 향해야 한다.

| 노드 | Property 1 | Property 2 | 용도 |
|---|---|---|---|
| `18:4275` | left | plat | 대상 **왼쪽**에 배치 (기본) |
| `18:4232` | right | plat | 대상 **오른쪽**에 배치 |
| `18:4274` / `18:4312` | left | down / up | 꺾인 리더선 |
| `18:4237` / `18:4311` | right | down / up | 꺾인 리더선 |

- 34×24, 내부 TEXT 는 **Inter Bold, textStyleId 없음 ⇒ 직접 대입 가능**.
- 새로 만들 때: `(await figma.getNodeByIdAsync("18:4232")).createInstance()` → 슬라이드에 `appendChild`.
- 기존 인스턴스의 방향만 바꿀 때: `inst.setProperties({"Property 1":"right"})`.

**y 좌표가 겹치는 요소는 좌·우로 나눠 단다.** (예: 「신청현황」과 「더보기」가 같은 줄)
320폭 목업이 x=92~412 에 놓인 슬라이드 기준 실측값:

| 위치 | 마커 x |
|---|---|
| 좌측 | **60** (프레임 60~94, 목업 좌단 92 에 맞닿음) |
| 우측 | **404** (프레임 404~438, 카드 우단 396 에 맞닿음) |

y 는 변형과 무관하게 **대상 세로 중앙 − 12**.

### 표 행 삭제
`Frame 2609093` / `Frame 273` 직속 자식인 행 인스턴스는 **`row.remove()` 로 삭제된다.**
(인스턴스 *하위* 레이어만 삭제가 막힌다 — 둘을 혼동하지 말 것.)
복제된 페이지에서 남는 행을 정리할 때 쓴다.

---

## 15. 내용 셀 줄 수를 늘릴 때 — `resize()` 가 조용히 무시되는 함정

내용 셀(`Frame 2609099` 안의 TEXT, `textAutoResize = NONE`)의 높이를 `resize(484, 줄수*24)` 로
바꾸려 할 때, **에러 없이 24 그대로 남는 경우**가 있다. 원인 두 가지:

1. **폰트 미로드** — 셀이 Pretendard 인데 `loadFontAsync` 로 Pretendard 를 올리지 않았으면
   레이아웃이 걸린 쓰기(`resize`, `textAutoResize`)가 **무시된다**. `textAutoResize` 는 그나마
   `Cannot write to node with unloaded font "Pretendard Regular"` 로 에러를 내지만 `resize` 는 조용하다.
   ⇒ 스왑 스타일을 씌운 상태에서 resize 하거나, 아래 2번 방법을 쓴다.
2. **부모가 FIXED 로 잠김** — `Frame 2609099` 의 `counterAxisSizingMode` 가 `FIXED` 면 셀 높이가
   그 값에 고정된다. 정상값은 **`AUTO`(HUG)** 이며, 진단·수정 중 실수로 FIXED 로 바꾸면 복구해도
   한 번 잠긴 높이가 풀리지 않는다. **건드리지 말 것.**

```js
// 정상 행 vs 문제 행 비교 진단
const t = 내용셀, p = t.parent;             // p.name === "Frame 2609099"
t.layoutAlign      // 정상 2줄 행: STRETCH
t.layoutSizingVertical  // 정상: FILL
p.counterAxisSizingMode // 정상: AUTO   ← FIXED 면 이게 원인
```

**가장 확실한 방법 — 원하는 높이의 행을 통째로 clone 한다.**
표 안에 이미 1줄(44) · 2줄(64) · 3줄(88) · 4줄(112) 행이 섞여 있으므로,
필요한 줄 수의 행을 골라 `clone()` → `insertChild(원하는 위치)` → 번호·유형·내용만 덮어쓴다.
resize 를 건드릴 일이 없어진다.

```js
const f = await figma.getNodeByIdAsync(표ID);
const src = await figma.getNodeByIdAsync(원하는_줄수의_행ID);
const nw = src.clone();
f.insertChild(f.children.findIndex(c=>c.id===앞_행ID)+1, nw);
// 삽입 후 전 행 번호 다시 매기기 (번호 셀은 Inter → 직접 대입)
f.children.forEach((r,i)=>{ cells(r)[0].characters = String(i); });
```

---

## 16. Pretendard 는 정말로 로드가 안 된다 (실측 확인)

`figma.loadFontAsync({family:"Pretendard", style:"Regular"|"Medium"|"Bold"})` 는 전부 실패한다:

```
The font "Pretendard Medium" could not be loaded.
The font family "Pretendard" does not exist.
```

**렌더는 정상으로 나온다** — Figma 렌더러는 Pretendard 를 가지고 있지만 플러그인 런타임에는 없다.
"혹시 되지 않을까" 하고 다시 시도하지 말 것.

플러그인에서 실제로 쓸 수 있는 글꼴:
`Noto Sans KR` (Regular/Medium/SemiBold/Bold) · `Noto Sans CJK KR` · `Noto Sans` · `Inter`

### 캡션(`PPT_text_regular`) 을 새로 달 때
목업 위 캡션은 **Pretendard Medium 18 / `textStyleId` 없음** 이라 직접 대입도, 스왑 복원도 안 된다.
파일에 **Pretendard Medium 18 텍스트 스타일이 없기** 때문이다 (113개 스타일 전수 확인).

가장 가까운 것이 **`16/medium` = `S:30bcb35bcb7a6e0db62d3652b6c7a4d072aa51f6,`** (Pretendard Medium 16/24/−1px).
이걸 복원 스타일로 쓰면 **글꼴 계열은 덱과 일치**하고 크기만 18→16 으로 작아진다.
Noto 로 전환하면 크기는 지키지만 **혼자 다른 글꼴**이 되므로, 캡션은 16/medium 쪽이 낫다.

```js
const SWAP  = "S:af58f9e59acb5f2cbc12bca96b549f2c8656294b,"; // Noto 14/24/-6 (쓰기용)
const PRE16 = "S:30bcb35bcb7a6e0db62d3652b6c7a4d072aa51f6,"; // Pretendard Medium 16 (복원용)
const c = 기존캡션.clone(); slide.appendChild(c); c.x = 목업x; c.y = 목업y - 30;
await t.setTextStyleIdAsync(SWAP); t.characters = "시설 탭"; await t.setTextStyleIdAsync(PRE16);
```
캡션 y 는 **목업 상단 − 30** (다른 장은 목업 250 / 캡션 218).

### 덱의 표기 관례 (566 에서 확인)
- 기본 선택값은 **`Default : 전체`** 형식으로 별도 줄에 적는다.
- 한 영역에 버튼이 여러 개면 **`알림, 전체보기 구성`** 처럼 먼저 구성을 적고 다음 줄에 `[Tap]` 동작.

---

## 17. 표가 두 종류다 — `PPT_form/list` (24행간) vs `PPT_list` (20행간)

덱에는 행 규격이 다른 표가 섞여 있다. **작업 전에 행 높이를 먼저 재서 어느 쪽인지 판별할 것.**

| 표 | 셀 행간 | 행 높이 | 내용 셀 | 예 |
|---|---|---|---|---|
| `PPT_form/list` / `Frame 2609093` | **24px** | 44 / 64 / 88 / 112 | `textAutoResize = NONE` → 줄 수만큼 **직접 resize** | 565 |
| `PPT_list` / `Frame 273` | **20px** | 45 / 65 / 85 / 105 … (+20/줄) | `textAutoResize = HEIGHT` → **자동 확장, resize 불필요** | 566 |

### ★ 자동 높이(HEIGHT) 셀에 스왑 기법을 쓸 때 — 행간이 같은 스왑 스타일을 써야 한다

`ar = HEIGHT` 셀은 글자를 쓰는 **그 순간의 스타일**로 높이를 다시 잰다.
행간 24짜리 `swap/14-24--6` 을 씌우고 쓰면 높이가 24/줄로 잡히고,
원래 스타일(행간 20)로 되돌려도 **Pretendard 를 못 읽어 재측정이 안 되므로 24 가 그대로 남는다.**
(45 → 49, 65 → 73 처럼 줄당 4px 씩 커진다.)

⇒ **행간 20 표에는 행간 20 스왑 스타일을 쓴다.**

```js
let st = (await figma.getLocalTextStylesAsync()).find(s => s.name === "swap/14-20");
if (!st) { st = figma.createTextStyle(); st.name = "swap/14-20";
  st.fontName = {family:"Noto Sans KR", style:"Regular"};
  st.fontSize = 14; st.lineHeight = {unit:"PIXELS", value:20};
  st.letterSpacing = {unit:"PERCENT", value:0}; }
```
`swap/14-20` = `S:724a60d2217a3bb1915d563cabaf1991e66bea39,` (이미 만들어 둠)
`swap/14-24--6` = `S:af58f9e59acb5f2cbc12bca96b549f2c8656294b,` (행간 24 표용)

**이미 틀어진 높이를 되돌리는 법**: 맞는 스왑 스타일을 씌웠다가 바로 원래 스타일로 되돌린다
(글자는 안 건드려도 재측정된다).
```js
const o = t.textStyleId;
await t.setTextStyleIdAsync(SW20);
await t.setTextStyleIdAsync(o);   // 높이가 20/줄로 복구
```

---

## 18. 카드 내부 항목이 촘촘할 때 — 마커를 여러 카드에 분산한다

카드형 리스트는 내부 항목이 **20px 간격**으로 쌓이는 경우가 많다.
마커(`Number` 34×24 / `Number sign/left` 50×24)는 **높이가 24** 라서
한 카드 안에 세로로 3개를 달면 반드시 겹친다.

**해법: 같은 구조의 카드가 여러 장이면 항목마다 다른 카드에 단다.**
목업에 카드가 3장 + 변형 예시 2장 있으면 카드당 1~2개씩 나눠 붙이면 간격이 150px 이상 벌어진다.

```
카드1 → 뱃지 + 이동 화살표
카드2 → 제목 | 예약번호
변형카드A(영화) → 이용기간
변형카드B(카페) → 주문번호
```

**마커가 텍스트를 가리지 않게 하려면 실제 텍스트 오른쪽 끝을 재고 그 바깥에 둔다.**
레이어 이름이나 프레임 폭이 아니라 **TEXT 노드의 `x + width`** 가 기준이다.
```js
q.type==="TEXT" && console.log(q.characters, "right=", q.absoluteTransform[0][2]-SX + q.width);
```
목업 좌측 열(x=70)과 카드 내부 빈 자리를 함께 쓰고, 목업과 우측 예시 카드 **사이 간격이
마커 폭(50)보다 좁으면** 그 사이에는 절대 두지 말 것 — 예시 카드를 덮는다.

---

## 19. 슬라이드를 통째로 복제해서 개정판을 만들 때

원본을 고치지 않고 **개정판 슬라이드를 새로 만드는 것**이 기본이다.

```js
const c = slide.clone();
row.insertChild(20, c);           // ← 주의: 원하는 위치 + 1
```

`SLIDE_ROW.insertChild(n, slide)` 의 `n` 은 **"제거 후 재삽입" 기준이 아니라 한 칸 밀린 값**으로
동작한다. 18번 뒤에 넣고 싶으면 19가 아니라 **20** 을 줘야 한다. 넣고 나서
`row.children.indexOf(c)` 로 반드시 확인할 것.

### ★ 화면정의서 슬라이드에는 COMPONENT 마스터가 얹혀 있다

목업이 `INSTANCE` 인 장도 있고 `COMPONENT`(마스터 원본) 인 장도 있다.
마스터가 있는 장을 통째로 clone 하면 **컴포넌트가 복제되어 파일이 오염된다.**

```js
const dup  = c.children.filter(n=>n.type==="COMPONENT" && n.name===NAME)[0];
const inst = figma.getNodeById(MAIN_ID).createInstance();
c.appendChild(inst); inst.x = X; inst.y = Y;
dup.remove();
c.insertChild(ORIGINAL_INDEX, inst);   // z-order 복원 (안 하면 마커를 덮는다)
```

복제 전에 `s.children.map(x=>x.type+":"+x.name)` 로 COMPONENT 유무와 **원래 인덱스**를
먼저 기록해 둘 것.

---

## 20. ★ 스왑 스타일은 "크기·행간이 같은 것"을 써야 한다

Pretendard 를 로드할 수 없으므로 **문자를 넣는 순간의 스왑 폰트로 박스가 측정되고,
원래 스타일로 되돌려도 다시 측정되지 않는다.** 박스가 작게 굳으면

- 표에서는 행 높이가 틀어지고 (14px 스왑으로 36pt 제목을 쓰면 h=24 로 굳음)
- **Figma Slides 렌더에서는 글자가 통째로 작게 보인다** (제목이 본문 크기로 보이는 사고)

### 크기별 스왑 스타일 대응표

| 대상 | 스왑 스타일 | ID |
|---|---|---|
| 제목 36 Bold (Header 3) | `swap/title 36 (fix)` | `S:8a19c39ded716473a85d55cfa237f871e308cbbe,` |
| 헤더 22 (Ver / Screen Number) | `swap/22-28-0` | `S:0b23e330aab323542312aae0508e59ef3782b948,` |
| 16 Regular | `swap/16-24--6` | `S:2ace0d9945857384bf1b5f948329c68f4b0ab3b2,` |
| 16 Bold (목업 버튼·타이틀) | `swap/16-24--4b` | `S:3e9b6079eed5b4d6c40cfac98dbf46e4de6d0294,` |
| 표 셀 14 / 행간 24 | `swap/14-24--6` | `S:af58f9e59acb5f2cbc12bca96b549f2c8656294b,` |
| 표 셀 14 / 행간 20 | `swap/14-20` | `S:724a60d2217a3bb1915d563cabaf1991e66bea39,` |

**같은 `Frame 2609093` 안에서도 셀마다 행간이 20 / 24 로 섞여 있다.**
쓰기 전에 반드시 실측해서 고를 것.

```js
const lh = t.lineHeight;                       // {unit:"PIXELS", value:20 | 24}
const SWAP = (lh && lh.value===20) ? SW20 : SW24;
```

### 박스가 이미 작게 굳었을 때 복구

`resize()` 는 Pretendard 미로드 상태에서 무시된다. **같은 크기 스왑으로 다시 써 넣는 것**이
유일하게 확실한 복구 방법이다.

```js
const keep = t.textStyleId, v = t.characters;
await t.setTextStyleIdAsync(SAME_SIZE_SWAP);
t.textAutoResize = "WIDTH_AND_HEIGHT";   // 부모가 hug 면 이때 폭이 다시 잡힌다
t.characters = v;
await t.setTextStyleIdAsync(keep);
```

원래 `textAutoResize` 가 `HEIGHT`(가로 FILL) 였던 노드를 `WIDTH_AND_HEIGHT` 로 바꾸면
가운데로 밀려 보인다 → 스왑이 걸려 있는 동안 `layoutSizingHorizontal="FILL"` +
`resize(원래폭, h)` 로 되돌린 뒤 스타일을 복구한다.

---

## 21. 텍스트를 새로 만들 때

`createText()` 는 로드된 폰트로 시작해야 하지만, **다 쓴 뒤 Pretendard 스타일을 씌우면
로드 없이 Pretendard 로 돌아온다.**

```js
await figma.loadFontAsync({family:"Noto Sans KR", style:"Regular"});
const t = figma.createText();
t.fontName   = {family:"Noto Sans KR", style:"Regular"};
t.characters = "※ ...";
await t.setTextStyleIdAsync("S:6693d9ec2158f13dbf6d7db13f146e384d20a6ad,"); // Pretendard Regular 16
t.fills = [{type:"SOLID", color:{r:0.878, g:0.243, b:0.102}}];              // 개정 표기 빨강 #E03E1A
slide.appendChild(t); t.x = X; t.y = Y;
```

- `fills` 는 폰트 로드 없이 바꿀 수 있다.
- **스타일을 씌운 뒤 `lineHeight` · `fontSize` 를 건드리면 "unloaded font" 에러로
  그 호출 전체가 롤백된다.** 행간을 바꾸려면 스왑이 걸려 있는 동안 해야 한다.
- 개정 표기 빨강은 기존 표에서 뽑은 값 `rgb(224,62,26)` 을 그대로 쓴다.

---

## 22. 「3. 서비스 플로우」 슬라이드 구조

| 요소 | 정체 |
|---|---|
| 화면 한 칸 | `FRAME` = `serviceflow_nameteg`(파란 라벨) + 목업 INSTANCE |
| 탭 가능 요소 표시 | `serviceflow_mark` (파란 점선 상자) — clone 후 `resize` + `x/y` |
| 연결선 | `VECTOR` — stroke `#094BA3`, weight 2, `dashPattern [2,2]`, align CENTER |

### ★ 연결선 방향은 좌표만 보면 반대로 읽힌다

`relativeTransform` 에 flip(`-1`)이 섞여 있어서 `vectorPaths` 의 좌표를 그대로 더하면
엉뚱한 곳을 가리킨다. **화살표 끝은 `vectorNetwork.vertices[].strokeCap === "ARROW_LINES"`
로 판별할 것.**

### 새 연결선 만들기 / 길이 바꾸기

`resize()` 는 무시된다. `setVectorNetworkAsync` 로 다시 그리는 게 확실하다.

```js
async function setLine(node, pts){            // pts = [[x,y,cap], ...]
  const vertices = pts.map(p=>({x:p[0], y:p[1], strokeCap:p[2]||"NONE"}));
  const segments = vertices.slice(1).map((_,i)=>({start:i, end:i+1,
    tangentStart:{x:0,y:0}, tangentEnd:{x:0,y:0}}));
  await node.setVectorNetworkAsync({vertices, segments, regions:[]});
}
await setLine(v, [[0,0,"NONE"], [437,0,"ARROW_LINES"]]);
v.relativeTransform = [[1,0,643],[0,1,791]];   // flip 없는 깨끗한 행렬로 재설정
```

---

## 23. 진행 상태 뱃지 `Process`

헤더(`PPT_form`) 안의 `Process` 인스턴스. variants 는 **기획 | 디자인 | 디자인 완료 | 확인**.

```js
header.findAll(n=>n.type==="INSTANCE" && n.name==="Process")[0]
      .setProperties({"Property 1":"기획"});
```

원본을 복제해서 만든 **신규 기획 페이지는 반드시 `기획` 으로 내릴 것.**
「디자인 완료」가 붙은 채로 새 화면을 올리면 개발·디자인 쪽에 잘못된 신호를 준다.

---

## 24. 앱바 아이콘은 컴포넌트마다 다르다

`List/top/2icon` 이라는 같은 이름의 앱바라도 **메인 컴포넌트가 서로 다르다.**
(어떤 것은 우측 아이콘 슬롯 `Frame 2609167` 을 갖고 있고, 어떤 것은 아예 없다.
`componentProperties` 는 `{}` 라서 토글로 켤 수도 없다.)

인스턴스 내부 노드는 `clone()` 이 막혀 있으므로 **아이콘을 실제로 이식할 수 없다.**
→ 기획서에서는 `serviceflow_mark`(점선 상자) + 빨간 라벨로 "여기에 추가" 를 표기하고,
표에 `Button` 행과 마커 번호를 새로 부여하는 방식으로 정의한다.

---

## 25. 작업한 페이지를 눈에 띄게 — 슬라이드 배경색

개정·신규 페이지를 슬라이드 그리드에서 바로 찾을 수 있게 **배경만 옅게 물들인다.**

```js
const TINT = {r:1, g:0.9647, b:0.8588};          // #FFF6DB
slide.fills = [{type:"SOLID", color:TINT, opacity:1, blendMode:"NORMAL", visible:true}];
```

- 슬라이드 기본 배경은 **흰색이 변수에 바인딩**되어 있다
  (`boundVariables.color = VariableID:40003540:596163`). 위처럼 `fills` 를 덮어쓰면 바인딩이 끊기고
  그게 곧 "손댄 페이지" 표시가 된다.
- 되돌릴 때는 같은 변수로 다시 바인딩하면 된다.
  ```js
  const v = await figma.variables.getVariableByIdAsync("VariableID:40003540:596163");
  slide.fills = [figma.variables.setBoundVariableForPaint(
      {type:"SOLID", color:{r:1,g:1,b:1}}, "color", v)];
  ```
- 헤더(`PPT_form`)·푸터(`PPT_form/Default`)는 배경이 비어 있어 **틴트가 전체에 깔린다.**
  목업과 표 행은 흰색이라 오히려 도드라진다 — 가독성 손해 없음.
- 채도가 높은 색은 인쇄·PDF 에서 지저분해지므로 **명도 95% 이상의 옅은 색**만 쓴다.

---

## 26. ★ `figma.createText()` 로 만든 노드는 다음 호출에서 사라진 것처럼 보인다

MCP 플러그인에서 **새로 만든 노드는 렌더(스크린샷)에는 나오지만,
이후 `use_figma` 호출에서 `getNodeById` · `parent.children` · `findAll` 로 전부 잡히지 않는다.**
파일에는 남아 있으므로 **지우거나 고칠 수가 없게 된다.**

```
createText() → appendChild → 화면에는 보인다
다음 호출 → getNodeById(id) === null, 부모의 children 에도 없음
```

- `clone()` 로 만든 노드는 대체로 정상적으로 다시 잡힌다.
- 그래서 **텍스트를 새로 만들어야 할 때도 가급적 기존 TEXT 를 `clone()` 해서 쓴다.**
  (스타일·폰트·색을 그대로 가져오므로 §21 보다 안전하다)
- 부득이 `createText()` 를 썼다면 **그 호출 안에서 위치·크기·내용을 모두 끝내라.**
  나중에 지우거나 옮길 수 없다고 가정할 것.
- 이미 만들어 버려서 지워야 한다면 사용자에게 **직접 삭제를 요청**하는 수밖에 없다.

### 같은 증상의 다른 얼굴

작업 중 "내가 만든 라벨이 사라졌다" 고 느껴지면 **사용자가 지운 게 아니라 이 현상**일 수 있다.
렌더를 먼저 확인하고, 렌더에 남아 있으면 파일에는 있는 것이다 — 다시 만들지 말 것
(다시 만들면 **겹쳐서 두 개가 된다**).

---

## 27. 표 셀의 `fontSize` · `lineHeight` 직접 쓰기가 조용히 무시될 때

`textStyleId` 가 `""`(미바인딩) 인데도 **`fontSize` 대입이 반영되지 않는 셀**이 있다.
쓰기 직후·다음 호출 양쪽에서 읽어도 값이 그대로다 — 에러도 안 난다.

이런 셀에 §20 의 스왑 스타일을 쓰면 **되돌릴 수단이 없어 더 나빠진다.**
`setTextStyleIdAsync(원래값)` 의 원래값이 `""` 이라 복구가 no-op 이고,
스왑 스타일의 크기·행간이 그대로 굳어 버린다 (14pt 표에 9.8pt 글자가 남는다).

### 판별

쓰기 전에 **같은 표의 이웃 행과 `fontSize` · `lineHeight` · `textStyleId` 를 같이 읽어 비교**한다.

```js
[5,6,7,8,9].forEach(i=>{const t=cells(u.children[i])[2];
  out.push(i+" fs="+t.fontSize+" lh="+JSON.stringify(t.lineHeight)+" st="+JSON.stringify(t.textStyleId));});
```

- `st` 가 `"S:..."` → 스타일 바인딩. §20 의 스왑으로 편집한다.
- `st` 가 `""` → **미바인딩. 폰트만 로드하면 `characters` 는 바로 써진다. 스왑을 쓰지 말 것.**

### 이미 굳었다면 — 정상 행을 clone 해서 통째로 교체

`fontSize` 를 되돌릴 수 없으므로 **행 자체를 버린다.**

```js
const old = t.children[8];
const nr  = t.children[9].clone();     // 같은 유형(Info 등)의 멀쩡한 행
cells(nr)[2].characters = "…여러 줄…"; // ar=HEIGHT 라 줄 수만큼 자동으로 늘어난다
t.insertChild(8, nr);                  // 프레임 자식은 인덱스 그대로 들어간다 (§19 의 +1 은 SLIDE_ROW 한정)
t.children.indexOf(nr);                // 확인 후
t.children[9].remove();                // 밀려난 옛 행 삭제
```

한 호출에 `insertChild` 까지만 하고 **삭제는 다음 호출에서** 한다.
같은 호출에서 지우면 인덱스가 어긋난 채 타임아웃이 나기 쉽다.

---

## 28. 검색 결과 리스트 목업 — 한 줄에 다 넣지 말고 2행으로 나눈다

검색 결과 항목(`Group 1775` 계열)의 텍스트는 **폭 고정 · `ar=HEIGHT`** 라
길어지면 말줄임이 아니라 **엉뚱한 곳에서 줄바꿈**된다 (`12,000` / `원` 이 찢어진다).

날짜 · 금액 같은 부가 정보를 요구받으면 한 줄에 이어 붙이지 말고
**1행 = 명칭, 2행 = 날짜 ㅣ 금액** 으로 나누고 2행을 시각적으로 낮춘다.

```js
t.characters = 명칭 + "\n" + "09.01 ㅣ 3,000원";
const s = 명칭.length + 1, e = t.characters.length;
t.setRangeFills(s, e, [{type:"SOLID", color:{r:0.55,g:0.55,b:0.55}}]);
t.setRangeFontSize(s, e, t.fontSize * 0.84);   // 이 API 는 범위 대상이라 정상 반영된다
```

- 범위 지정 API(`setRangeFills` · `setRangeFontSize`)는 §27 의 `fontSize` 대입과 달리 **잘 먹는다.**
- 적용 후 `fontSize` 는 `undefined`(mixed)로 읽힌다 — 정상이다.
- 목업 프레임은 대개 내용보다 높이가 크므로 행이 늘어도 넘치지 않는다.
  그래도 적용 뒤에는 **반드시 렌더로 확인**한다.

### 회권 · 정기권 표기

회차 상품은 **`4회차/10회권` 처럼 사용 회차와 총 회권을 같이** 적는다.
명칭 뒤(1행)에 붙이면 2행의 날짜 · 금액과 역할이 겹치지 않는다.

---

## 29. 본인 / 가족구성원 건의 권한 차이를 표에 적는 자리

「본인 건은 편집 가능, 가족구성원 건은 조회만」 같은 규칙은
**행을 새로 만들지 말고 해당 버튼 행의 마지막 줄에 붙인다.**

```
신청취소
[Tap] 신청취소 재확인 팝업 표시
본인 신청 건 : 활성 / 가족구성원 신청 건 : 비활성 (조회만 가능)
```

표가 이미 하단 한계(1018)에 닿아 있으면 **다른 행에서 같은 줄 수를 줄여 상쇄**한다.
줄일 때는 정보를 버리지 말고 **두 줄을 `/` 로 합친다.**

```
이용기간 표기 (예약 유형별)          →  이용기간 표기 (예약 유형별) / 기간 : 2026년09월01일 ~ 2026년09월31일
기간 : 2026년09월01일 ~ 2026년09월31일
```

합친 줄이 셀 폭을 넘으면 다시 두 줄이 되어 상쇄가 무너지므로,
**합칠 줄은 이미 한 줄에 들어가던 것 중 가장 짧은 쌍**을 고른다.
적용 후 `t.y + t.height` 로 하단을 다시 확인할 것.

디자인 파일에는 **비활성 상태 화면을 한 장 더** 둔다
(원본 화면 `clone()` → 버튼 인스턴스 `opacity = 0.35` → 프레임 이름에 「조회만」 명시).

---

## 30. 덱 전체(1000장 이상)에서 기존 화면을 찾을 때

슬라이드를 순회하면 **로드되지 않은 슬라이드는 `children` 이 빈 배열**이라 대부분이 누락된다.
(실측 : 1024장 중 887장이 헤더조차 안 잡힘 → "그런 화면은 없다"고 잘못 결론 내리기 쉽다)

```js
// ✗ 이렇게 하면 안 된다
for (const row of grid.children) for (const s of row.children) { … }

// ✓ 전수 조사는 반드시 이쪽
const nodes = figma.currentPage.findAllWithCriteria({ types: ["TEXT"] });
for (const t of nodes) {
  if (typeof t.fontSize !== "number" || t.fontSize < 24) continue;  // 제목만
  if (!/카페|주문내역/.test(t.characters)) continue;
  let p = t; while (p && p.type !== "SLIDE") p = p.parent;          // 소속 슬라이드
}
```

- 제목 텍스트 크기는 장마다 다르다(36 / 51.2 / 96). **`fontSize` 범위로 거르고 정규식으로 찾는다.**
- 텍스트가 10만 개 가까우면 한 번에 다 돌리다 타임아웃 난다 — **`fontSize` 조건을 먼저 좁혀라.**

### 왜 중요한가

새 화면을 기획하기 전에 **이미 전용 화면이 있는지 반드시 확인한다.**
예 : 「예약확인 상세」를 편의 3종 공통으로 만들었는데, 실제로는
카페 = 전용 주문내역 상세 / 영화 = 외부 예매시스템 연동 / H 툴스만 공통 화면이었다.
못 찾으면 **기존 화면을 덮어쓰는 기획서**가 된다.

---

## 31. 목업 안에 행을 추가해야 할 때 — 인스턴스 디테치

목업은 INSTANCE 라서 내부에 노드를 넣을 수 없다. 메인 컴포넌트를 고치면 **그 컴포넌트를 쓰는 다른 페이지가 전부 바뀐다**
(예 : `커뮤니티_예약_시설 결재` 는 결제 플로우 여러 장이 공유). 그러니 **슬라이드에 놓인 인스턴스만 디테치**한다.

```js
const m = (await figma.getNodeByIdAsync(id)).detachInstance();   // FrameNode 반환, id 가 바뀐다
const f607 = find(m, "Frame 607");      // 정보 행 컨테이너 (VERTICAL)
const nr = f607.children[0].clone();    // 기존 행을 복제해야 서식이 맞는다
f607.insertChild(0, nr);
```

- **디테치 후에는 `I<instanceId>;<subId>` 형태의 id 가 전부 무효**가 된다. 이름으로 다시 찾을 것.
- 컴포넌트에서 `visible = false` 였던 여분 행이 드러난다. **그대로 둔다** — 숨김 상태라 렌더에는 안 나온다.

### 늘어난 높이를 흡수하는 법

행 1개 = 행 높이 + 간격 (실측 22 + 19.3 ≈ 41px). 목업 하단 버튼은 **오토레이아웃 밖**이라 밀리지 않고 **겹친다.**
여유가 없으면 `itemSpacing` 을 줄여 흡수한다.

```
Frame 607 (행 간격) 19.3 → 14
Frame 632 (섹션 간격) 21.06 → 16     → 본문 끝 793 → 798, 버튼 807 과 안 겹침
```

바꾸기 전에 **본문 마지막 요소의 하단과 버튼의 상단을 실측**해서 흡수량을 계산할 것.

### 디자인 파일(일반 프레임)이라면 디테치가 필요 없다

정보 행 컨테이너가 이미 FRAME 이면 `Component 370` 인스턴스를 clone 해서 바로 넣을 수 있다.
높이가 넘치면 **배너 높이를 줄이고 블록을 그만큼 위로 올려** 상쇄한다.

```js
banner.resizeWithoutConstraints(375, 130);   // 188 → 130
banner.children[0].resizeWithoutConstraints(375, 130);
info.y = 230;                                // 288 → 230, 블록 하단은 그대로 1020
```

---

## 32. 항목을 "제목 밑에 끼워 넣지" 말 것

새 정보(신청자명 등)를 넣을 자리가 없다고 제목 아래에 작은 글씨로 붙이면
**십중팔구 「억지로 들어가 있다」는 지적을 받는다.**

같은 화면에 **이미 라벨+값 행 형식이 있으면 그 형식을 따른다.** 자리는 §31 처럼 만들어 낸다.

부수 효과로 **표의 설명 위치도 바뀐다** — 마커가 가리키는 블록을 따라가야 하므로,
명칭 행이 아니라 **예약 정보 행**에 적는다.

### 좌측 정렬이 어긋날 때

제목 텍스트만 clone 해서 넣으면 부모의 `counterAxisAlignItems` 가 CENTER 라 **가운데로 간다.**
**제목이 들어 있는 행 프레임을 통째로 clone** 하면 정렬이 맞는다.

---

## 33. 다른 페이지의 이미지를 가져다 쓰기

`findAllWithCriteria` 는 **현재 페이지만** 훑는다. 다른 페이지를 뒤지려면 페이지를 바꿔야 한다.

```js
const pg = figma.root.children.find(p => p.name === "단지생활");
await figma.setCurrentPageAsync(pg);
// … 여기서 검색 …
```

- **전환 상태는 호출이 끝나면 돌아간다.** 다음 호출에서 또 뒤지려면 매번 다시 전환할 것.
- 사용자가 편집 중이어도 크게 방해되지 않는다(호출 단위로만 바뀐다). 그래도 **미리 양해를 구하는 편이 낫다.**
- `getNodeByIdAsync` 는 페이지 전환 없이도 다른 페이지 노드를 가져온다. **id 를 아는 노드는 전환이 필요 없다.**

### 이미지는 imageHash 로 재사용한다

이미지를 새로 올릴 수 없어도(`createImageAsync` 금지), **이미 파일에 있는 이미지는 해시만 복사하면 된다.**

```js
const src = await figma.getNodeByIdAsync(원본);
const h = src.fills.find(f => f.type === "IMAGE").imageHash;
r.fills = [{ type:"IMAGE", imageHash: h, scaleMode:"FILL" }];

// 세로로 긴 원본에서 윗부분만 쓰고 싶을 때
r.fills = [{ type:"IMAGE", imageHash: h, scaleMode:"CROP",
             imageTransform: [[1,0,0],[0,0.30,0.02]] }];
```

### ★ 렌더가 비어 보인다고 이미지가 없는 게 아니다

마스크나 가려진 노드는 `get_screenshot` 이 **1x1 흰색**으로 돌아온다.
그래도 `imageHash` 는 멀쩡하고, 다른 노드에 넣으면 정상적으로 보인다.
**해시가 있으면 쓸 수 있다고 판단할 것.**

### 찾는 순서

1. 섹션 이름으로 좁힌다 — 이 파일은 `31_독서실` · `34_툴즈` · `26_강좌신청` 처럼 시설별로 섹션이 나뉘어 있다
2. 섹션 안에서 `fills` 에 IMAGE 가 있는 노드를 모으고 **`imageHash` 로 중복 제거**
3. 후보를 작게(`maxDimension: 200`) 렌더해 내용을 확인
4. 없으면 **억지로 비슷한 걸 쓰지 말고 없다고 보고**한다 (라커 · 사우나는 실제로 파일에 없었다)
