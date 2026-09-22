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

---

## 34. 마커가 렌더에 안 보이면 z-order 가 아니라 x 좌표를 의심한다

목업을 옮기거나 폭을 바꾼 뒤 **마커가 통째로 사라져 보이는** 일이 있다.
숨김(`visible`)도 투명도도 아니고, **마커 x 가 목업 영역 안으로 들어가 뒤에 깔린 것**이다.

```js
// 실측 : 편의 슬라이드만 마커 x=116 이었는데 목업을 @176 → @100 으로 옮기자
// 목업(100~416)이 마커를 완전히 덮어 렌더에서 사라졌다
mks.forEach(c => { c.x = 40; });   // 다른 페이지와 같은 40 으로 통일
```

슬라이드를 복제해 쓰다 보면 **마커 x 가 페이지마다 달라져 있다.** 정리할 때 x 부터 통일할 것.

### 마커 y 는 요소를 실측해서 붙인다

같은 구조라도 목업의 행 수가 다르면 하단 요소 위치가 달라진다.
상단 4개(앱바 · 헤더 · 제목 · 정보 시작)는 고정값으로 두고,
**추가선택 · 버튼은 슬라이드 기준 절대좌표를 환산**해 개별로 놓는다.

```js
const sb = slide.absoluteBoundingBox;
const top = y => Math.round(y - sb.y);
mk5.y = top(find(mock,"Frame 606").absoluteBoundingBox.y) - 4;   // 추가선택
mk6.y = top(mock.children.find(c=>c.name==="Frame 608").absoluteBoundingBox.y) + 10;  // 버튼
```

---

## 35. 번호가 페이지에 걸쳐 이어지는 표에는 행을 끼우지 않는다

한 화면을 1/2 · 2/2 로 나눈 기획서는 번호가 **0~25 처럼 페이지를 건너 이어진다.**
여기에 행을 하나 끼우면 **뒤쪽 페이지 번호와 마커까지 전부 밀린다.**

새 항목이 기존 항목에 딸린 것이라면 **그 행에 줄을 덧붙인다.**

```
신청정보
첫 행에 신청자명 표기 (예시 : 김명석) — 세대 구성원 중 신청한 사람
```

번호를 새로 줘야만 하는 독립 요소일 때만 재번호를 감수한다.

---

## 36. 목업에 행을 넣었으면 마커를 같이 내린다

행을 하나 추가하면 그 아래 내용이 **행 높이 + `itemSpacing` 만큼** 내려간다.
마커는 슬라이드 직계라 **따라오지 않으므로**, 표의 번호와 화면이 한 칸씩 어긋난다.

```js
const delta = Math.round(row.height + (row.parent.itemSpacing || 0));   // 실측 39~40
const rowY  = Math.round(row.absoluteBoundingBox.y - slide.absoluteBoundingBox.y);
slide.children
  .filter(c => /^Number sign/.test(c.name) && c.y > rowY)
  .forEach(c => { c.y += delta; });
```

델타는 **추측하지 말고 실측**한다 — 같은 덱에서도 목업마다 gap 이 19/20 으로 달랐다.
적용 후 렌더로 「표 N번 = 화면 N번」이 맞는지 눈으로 확인할 것.

### 이중 인스턴스

축소 목업은 **인스턴스 안에 또 인스턴스**(`iPhone SE - 3` 등)가 들어 있는 경우가 있다.
한 번만 디테치하면 내부 행이 여전히 안 잡힌다.

```js
let m = (await figma.getNodeByIdAsync(id)).detachInstance();
if (m.children[0] && m.children[0].type === "INSTANCE") m.children[0].detachInstance();
```

### 헤더가 첫 자식이라고 가정하지 말 것

「신청정보」·「신청내역」 같은 헤더가 `children[0]` 이 아닌 화면이 있다
(결제·예약현황은 제목 행이 먼저 와서 index 1). **헤더 인덱스를 찾아 그 다음에 삽입**한다.

## 37. 기준 화면의 그룹 구조를 나머지 화면에 옮길 때

사용자가 한 화면(예: 결제)의 정보 블록을 **그룹 프레임 여러 개**로 재구성해 두면,
같은 세트의 나머지 화면도 그 구조에 맞춰야 한다. 평면으로 남은 화면은
자식 목록이 `헤더 | 행 | 행 | … | 토글 | 토글 | 입력` 처럼 한 겹으로 나열돼 있다.

새 프레임을 `createFrame()` 으로 만들지 말고 **기준 화면의 그룹을 `clone()`** 한다 —
`itemSpacing`·패딩·정렬·리사이즈 모드가 통째로 따라와서 눈으로 맞출 필요가 없다.

```js
const gA0 = await figma.getNodeByIdAsync(정보그룹_ID);   // 기준 화면의 그룹
const gB0 = await figma.getNodeByIdAsync(서비스그룹_ID);

const info = f.children.find(c => c.name === "Frame 2611659");
if (info.children.some(c => c.name === "정보 행 그룹")) return;   // 멱등성

const kids = info.children.slice();      // ★ 먼저 스냅샷
const rows = kids.slice(1, 6);           // 헤더 다음 ~ 합계
const svc  = kids.slice(6);              // 토글 + 입력

const gA = gA0.clone(); gA.name = "정보 행 그룹"; info.insertChild(1, gA);
gA.children.slice().forEach(c => c.remove());   // clone 의 내용물 비우기
rows.forEach(r => gA.appendChild(r));           // 기존 행을 그대로 이동

const gB = gB0.clone(); gB.name = "서비스 행 그룹"; info.insertChild(2, gB);
gB.children.slice().forEach(c => c.remove());
svc.forEach(r => gB.appendChild(r));

info.itemSpacing = 24;
```

주의할 점

- `info.children` 은 **라이브 배열**이다. `appendChild` 로 옮기는 순간 인덱스가 밀리므로
  반드시 `slice()` 로 먼저 떠 놓고 자른다.
- `clone()` 한 그룹 안에는 기준 화면의 행이 들어 있다. **비우지 않으면 내용이 중복**된다.
- 행을 그룹으로 감싸면 바깥 `itemSpacing` 이 한 번만 적용돼 **전체 높이가 줄어든다**.
  반대로 그룹의 자체 패딩(24)이 더해지므로 **반드시 높이를 재고 하단 버튼과 겹치는지 본다**.
- 이미 적용된 화면을 다시 돌리면 행이 사라진다. **그룹 이름으로 멱등성 가드**를 넣는다.

### 적용 후 점검 쿼리

한 세트를 다 고쳤으면 화면별로 한 줄씩 찍어 **구조·간격·여백을 나란히 비교**한다.

```js
const info = f.children.find(c => c.name === "Frame 2611659");
const btn  = f.children.find(c => c.name && c.name.indexOf("bottom-fix") === 0);
out.push(f.name
  + " info " + Math.round(info.y) + "~" + Math.round(info.y + info.height)
  + " gap=" + info.itemSpacing
  + " | " + info.children.map(c => c.name).join(" | ")
  + " | 버튼까지 " + Math.round(btn.y - (info.y + info.height)) + "px");
```

여유가 한 자릿수(3px 등)로 나와도 **그 자체가 오류는 아니다** — 렌더로 확인해
잘리지 않으면 둔다. 대신 제목 프레임의 `paddingTop` 을 다른 화면(24)에 맞춰
올리는 식의 "통일"은 **하단 버튼을 밀어 넘치게 하므로 하지 않는다**.

## 38. 축소 목업에 행을 넣을 때 — 폰트를 건드리지 말고 행을 복제한다

플로우 슬라이드의 축소 목업은 텍스트가 **Pretendard 직접 지정 + `textStyleId` 없음**인 경우가 많다.
스타일 바인딩이 없으니 §27 의 스왑 기법을 쓸 수 없고, Pretendard 는 로드도 안 된다.

→ **이미 그 행이 들어 있는 다른 목업에서 행 프레임을 통째로 `clone()`** 한다.
값까지 같이 따라오므로 `characters` 를 건드릴 일이 없다.

```js
const src = await figma.getNodeByIdAsync("I<완료된목업>;<행>");   // 인스턴스 내부라도 clone 가능
const row = src.clone(); row.name = "신청자 행";
const hdr = f639.children.findIndex(c => tn(c).some(t => t.characters.indexOf("신청내역") >= 0));
f639.insertChild(hdr + 1, row);
row.layoutSizingHorizontal = "FILL";
```

### 디테치하면 숨은 행이 드러난다

인스턴스 상태에서 `visible=false` 로 꺼 둔 행(사용시간·좌석번호 등)이 디테치 후 목록에 나타난다.
**그 상태를 그대로 두고** 보이는 행만 기준으로 헤더 인덱스를 찾는다.
(가시 상태를 건드리지 말 것 — 되돌릴 근거가 없다.)

### ★ 다중 디테치가 헤더 오토레이아웃을 깨뜨린다

이중·삼중 인스턴스를 연달아 디테치하면, 축소 배율이 적용되지 않은 **원본 치수가 되살아난
자식**이 생긴다. 상단바 제목이 `x=-15 w=230`(200 폭 프레임 안에서) 같은 값으로 튀어
왼쪽이 잘린다 — 렌더에 `＜ 신청 현황` 이 `l 현황` 으로 보이면 이 증상이다.

`layoutSizingHorizontal` 은 이미 `FILL` 이라고 보고되지만 **실제로는 반영되지 않는다.**
`itemSpacing` 토글·부모 `resize`·FIXED↔FILL 왕복 모두 듣지 않는다.
**그 상단바 인스턴스까지 디테치해야** 비로소 치수가 잡힌다.

```js
let bar = find(m, "List/top/2icon");
if (bar.children.find(c => c.name === "description").width > bar.width) {
  bar = bar.detachInstance();
  const t = bar.children.find(c => c.name === "description");
  const fixed = bar.children.filter(c => c !== t && c.layoutPositioning !== "ABSOLUTE");
  const avail = bar.width - bar.paddingLeft - bar.paddingRight
              - fixed.reduce((s, c) => s + c.width, 0)
              - bar.itemSpacing * fixed.length;
  t.layoutSizingHorizontal = "FIXED"; t.resize(avail, t.height);
  t.layoutSizingHorizontal = "FILL";
}
```

`layoutPositioning === "ABSOLUTE"` 인 자식은 흐름에서 빠지므로 **`avail` 계산에서 제외**한다.
넣고 빼는 걸 틀리면 제목과 우측 배지가 겹친다.

### 목업 루트는 고정 높이 + 클립이다

목업 루트는 보통 `LM=NONE`·`clipsContent=true` 이고, 본문 프레임과 하단 버튼 바가
**절대 좌표로 나란히** 놓여 있다. 행을 넣으면 본문만 자라서 버튼 바 **밑으로 파고든다**.

- 여유가 남으면 그대로 둔다 (실측 결제 33→8px, 예약현황 2→-1px).
- 스티키 버튼 바가 본문 위에 그려지므로 **1~2px 침범은 렌더에 드러나지 않는다.**
- 루트를 키우면 슬라이드의 화살표 Vector 와 마커까지 전부 따라 옮겨야 하므로,
  **웬만하면 키우지 말고 침범을 허용**하는 편이 손해가 적다.

### 떠 있는 라벨도 같이 내린다

목업 루트에 **절대 좌표로 얹힌 텍스트**(「수정」 배지 등)는 본문이 밀려도 따라오지 않는다.
§36 의 마커와 같은 처리를 해 준다 — 숨겨진 짝(`visible=false`)이 있으면 **그것도 같이** 옮겨
나중에 켰을 때 어긋나지 않게 한다.

### 하이라이트 박스는 늘릴지 내릴지 구분한다

`serviceflow_mark` 는 최상위 인스턴스라 `resize()` 가 먹는다.

- 박스가 **블록 전체**를 감싸고 있고 새 행이 그 블록에 속하면 → **높이를 +delta**.
- 박스가 **특정 한 행**을 가리키고 그 행이 밀렸으면 → **y 를 +delta**.

둘을 바꿔 적용하면 "무엇을 강조하는 슬라이드인지"가 달라진다.

## 39. ★ 스왑 스타일의 굵기가 렌더에 남는다

Pretendard 처럼 **없는 폰트**를 쓰는 노드는, 스왑 기법으로 글자를 바꾸면
`fontName` · `textStyleId` · `fontWeight` 가 모두 원래대로 복구된 것으로 보고되지만
**렌더는 스왑에 쓴 폰트의 굵기로 남는다.** 편집한 행만 굵게(또는 가늘게) 보인다.

노드 데이터만 비교하면 절대 못 찾는다 — **반드시 표를 통째로 렌더해서
편집한 행과 안 건드린 행의 굵기를 눈으로 맞춰 본다.**

원인은 "첫 번째로 로드되는 스타일"을 스왑으로 고른 것. 그 스타일이 Medium 이면
Regular 셀은 두꺼워지고 Bold 셀은 얇아진다.

```js
const pick = {};                       // 굵기별 스왑 후보
for (const s of await figma.getLocalTextStylesAsync()) {
  try { await figma.loadFontAsync(s.fontName); } catch (e) { continue; }
  const st = s.fontName.style;
  if (!pick[st] || Math.abs(s.fontSize - 14) < Math.abs(pick[st].fontSize - 14)) pick[st] = s;
}
const want = t.fontName === figma.mixed ? "Regular" : t.fontName.style;
const sw   = pick[want] || pick["Regular"];     // ★ 굵기를 맞춰서 고른다
```

이미 잘못 바꿨다면 **같은 글자를 굵기 맞춘 스왑으로 한 번 더 쓰면 복구된다.**
대상은 `문자열 + textStyleId 有 + 없는 폰트` 로 긁어 일괄 처리하면 된다.

파일 데이터는 처음부터 정상이므로 **사용자 PC(폰트 설치됨)에서는 원래 맞게 보인다.**
그래도 검토가 렌더로 이뤄지는 이상 맞춰 두는 편이 낫다.

## 40. 마커와 설명 표의 매칭 점검

마커는 슬라이드 직계라 목업 내용이 바뀌어도 따라오지 않는다(§36). 점검은 **좌표 실측**으로 한다.

```js
// 목업 요소의 슬라이드 기준 중앙 y
const bb = c.absoluteBoundingBox;
const mid = Math.round(bb.y - slide.absoluteBoundingBox.y + bb.height / 2);
// 마커의 중앙 y = marker.y + marker.height/2  (24px 마커면 y+12)
```

요소 mid 목록과 마커 mid 목록을 나란히 찍어 두고 **표의 번호 순서대로** 짝을 맞춘다.

- **행이 추가된 자리에 있던 마커는 안 움직인다.** `c.y > rowY` 조건으로 거르면
  새 행 자리의 마커가 남아 한 칸씩 밀린 것처럼 보인다 — 그 마커도 같이 내려야 한다.
- **하단 스티키 버튼 바는 내용이 늘어도 움직이지 않는다.** 거기 붙은 마커
  (취소 · 확인 등)를 같이 내리면 오히려 어긋난다. §38 의 "떠 있는 라벨"도 마찬가지.
- 같은 화면을 1/2 · 2/2 로 나눴으면 **양쪽 마커 좌표를 하나의 기준표로 일괄 적용**한다.
  한쪽에만 있는 마커는 다른 장에서 `clone()` 해 가져온다.
- 마커끼리 6~10px 안으로 겹치면 뒤엣것이 가린다. **한쪽을 반대편 여백(x)으로** 옮긴다.

### 설명 표 중복 정리

번호가 다른데 설명이 똑같은 행(「상세 보기 [Tap] 상세 화면 이동」×3)은
**무엇을 여는지 목적어를 넣어** 구분한다. 마커를 합치지 않는다 — 요소마다 개별 번호가 원칙.

동작이 실제로 한 곳에만 있는 경우(버튼 → 팝업 → 확정)는
**트리거 행은 "팝업 표시", 확정 행만 "삭제 처리"** 로 갈라 쓴다. 양쪽에 다 쓰면 중복이다.

## 41. 기존 화면을 복제해 새 화면을 만들 때

기획서 화면을 디자인으로 옮길 때는 **같은 앱의 기존 화면을 복제**해서 고친다.
새로 그리면 서체 · 간격 · 색이 미묘하게 어긋나 "이질감 난다"는 지적을 받는다.

절차

1. 같은 기능의 화면을 텍스트로 찾는다 (`findAllWithCriteria` + 문자열).
   화면 테마(다크/라이트)는 **목적지 화면 기준**으로 고른다.
2. 대상 섹션에 `clone()` → `section.appendChild()` → `x`/`y` 지정.
   섹션 자식 좌표는 **섹션 기준 상대값**이다.
3. 리스트 행은 기존 리스트 화면의 행 인스턴스를 복제하고 **디테치 후 불필요한 부분을 제거**한다.

### ★ 복제본에는 숨은 노드가 섞여 있다

컴포넌트에는 `visible=false` 인 예비 노드가 흔하다. 인덱스로 텍스트를 찾으면
**안 보이는 노드에 값을 넣고 "왜 화면에 안 나오지" 하게 된다.**

```js
const ts = container.children.filter(c => c.type === "TEXT" && c.visible);   // ★ visible 필터
```

디테치하면 숨은 행이 드러나기도 한다(§38). 가시 상태는 **그대로 두고** 필터로만 피한다.

### 오토레이아웃 높이 되돌리기

내용을 다 넣은 뒤 바깥부터 안쪽 순서로 HUG 를 걸고 루트 높이를 다시 계산한다.

```js
inner.layoutSizingVertical = "HUG";
inner.parent.layoutSizingVertical = "HUG";
screen.resize(375, NAVBAR + inner.parent.height + INDICATOR);
byName(screen, "HomeIndicator").y = screen.height - INDICATOR;   // 절대배치라 수동
```

## 42. ★ 루트를 resize 하면 절대배치 자식이 밀린다

화면 루트가 `LM=NONE` 이고 그 안에 `navbar` · `contents` · `HomeIndicator` 가
**절대 좌표로** 놓인 구조가 흔하다. 내용이 늘어 루트를 `resize()` 하면
자식의 **constraints(SCALE 등)** 때문에 y 가 같이 움직인다.

실측: 88 에 있던 `contents` 가 리사이즈 후 68 로 올라가 상단이 20px 잘렸다.
게다가 화면마다 늘어난 양이 달라 **화면끼리 간격이 어긋난다** — 눈으로는
"어떤 화면만 간격이 다르다"로 보인다.

리사이즈 뒤에 **절대배치 자식의 위치를 다시 못 박는다.**

```js
S.resize(375, NAV + outer.height + INDICATOR);
outer.x = 0; outer.y = NAV;
nav.x = 0;   nav.y = 0;
hi.x = 0;    hi.y = S.height - INDICATOR;
```

점검은 **여러 화면을 한 표로 찍어 대조**한다. 한 화면만 보면 절대 안 보인다.

```js
const f = n => Math.round(n.absoluteBoundingBox.y - S.absoluteBoundingBox.y);
out.push(label + " outer=" + f(outer) + " inner=" + f(inner) + " child0=" + f(inner.children[0]));
```

### 같은 역할의 컨테이너는 gap 을 상수로 둔다

그룹을 루프로 만들면서 `itemSpacing` 을 각각 대입하면, 어느 하나만 값이 달라져도
**자식이 1개인 그룹에서는 드러나지 않는다.** (실측: 시설 0 / 강좌·편의 20 —
행이 3개인 시설에서만 보였다.) 만들고 나서 **전 그룹의 gap 을 한 번 더 일괄 대입**해 맞춘다.

## 43. 혼합 스타일 텍스트에 줄 추가하기

목업의 리스트 행은 한 TEXT 안에 `제목(Bold 12.7) \n 부가(Regular 10.6 회색)` 처럼
**범위별로 다른 스타일**이 들어 있다. 여기에 `characters =` 로 통째로 대입하면
**스타일이 첫 범위로 통일돼 위계가 무너진다.**

`insertCharacters` + `setRange*` 를 쓴다.

```js
const segs = t.getStyledTextSegments(["fontName","fontSize","fills"]);  // 먼저 읽어 둔다
t.insertCharacters(0, user + "\n", "AFTER");     // 뒤 범위 스타일을 물려받아 삽입
const n = user.length;
t.setRangeFontName(0, n, { family: "Noto Sans KR", style: "Regular" });
t.setRangeFontSize(0, n, 10.631);
t.setRangeFills(0, n, GRAY);
```

`useStyle` 은 `"BEFORE"`/`"AFTER"` 중 **삽입 지점에 인접한 어느 쪽 스타일을 물려받을지**다.
맨 앞 삽입이면 `"AFTER"` 밖에 못 쓴다 — 그래서 삽입 후에 범위 스타일을 덮어쓴다.

### 검색 결과의 사용자명 배지

처음엔 "사용자명 검색이면 전부 같은 사람이니 생략"으로 갔다가, 사용자가 **모든 결과 행에
배지를 넣자**고 정했다. 결제이력 리스트 원본 행이 항상 배지를 갖고 있으니 그게 자연스럽다.
검색 방식으로 표시 여부를 가르지 말고 **원본 행 그대로 둔다.** 이런 "중복이니 빼자"는
판단은 내가 하지 말고 물어본다.

디자인에서는 결제이력 행 컴포넌트의 **사용자명 칩을 살리고/제거**하는 것으로 갈린다.
기획서에는 두 경우를 한 줄로 못박아 둔다 — 안 그러면 다음 검토 때 또 올라온다.

## 44. 같은 변경을 다른 브랜드 파일에 옮길 때

한 제품의 화면이 브랜드별로 **파일이 따로**인 경우가 있다(THE H 다크 / 마이힐스 라이트).
"저쪽에도 적용해 줘"는 **화면을 복사하라는 뜻이 아니다** — 같은 *변경*을 그쪽
디자인 시스템으로 다시 만들라는 뜻이다. 복사하면 테마·컴포넌트가 통째로 어긋난다.

순서

1. **대상 파일에서 대응 화면을 먼저 찾는다.** 페이지·섹션 이름으로 없으면
   텍스트(`findAllWithCriteria`)로 찾는다. 대개 이미 존재한다.
2. **테마를 확인한다.** 한 장만 렌더해 보면 바로 드러난다(배경색·주 버튼색).
3. **그쪽 행 컴포넌트를 복제**해서 값만 바꾼다. 이쪽 파일의 노드를 가져가지 않는다.
4. 적용 전에 **8장을 한 번에 실측**해 여유 공간을 표로 뽑는다.

```js
const rows = findAll(f, c => /^Component 369\/14pt/.test(c.name));
const cont = rows[0].parent;                       // 행들이 들어 있는 컨테이너
const btn  = f.children.find(c => /bottom-fix/.test(c.name));
const slack = Math.round(btn.y - (cont.y + cont.height));   // 남는 높이
```

행 하나가 차지하는 높이는 `row.height + cont.itemSpacing`. 여유가 그보다 작은 화면만
프레임을 늘리면 된다 — **전부 늘리면 형제 화면과 높이가 제각각이 된다.**

### 늘릴 때는 좌표를 떠 놓고 복구한다

§42 대로 `LM=NONE` 루트를 `resize()` 하면 절대배치 자식이 constraints 로 끌려간다.
**전부 떠 놓고 되돌린 뒤, 내려야 할 것만 내린다.**

```js
const pos = f.children.map(c => ({ c, x: c.x, y: c.y }));
f.resize(375, f.height + d);
pos.forEach(o => { o.c.x = o.x; o.c.y = o.y; });   // 전부 원위치
btn.y += d;                                        // 하단 바만 내린다
```

### 한 줄짜리 행을 골라 복제한다

행 컴포넌트는 값 슬롯을 여러 개 갖고 그중 일부를 숨겨 둔 경우가 많다
(사용기간은 4줄, 신청기간은 1줄). **보이는 줄이 1개인 행**을 골라야 복제본이 깔끔하다.

```js
const proto = rows.find(r => {
  const vc = byName(r, "Frame 2612266");
  return vc && vc.children.length === 1;
});
```

숨은 슬롯은 복제본에도 따라온다. **가시 상태는 건드리지 말고** 그대로 둔다 —
렌더에는 안 나오고, 나중에 그쪽에서 켜서 쓸 수 있다.

### 구조까지 옮기지는 않는다

이쪽 파일에서 사용자가 만든 **그룹 구조**(제목 / 정보 행 그룹 / 서비스 행 그룹)는
그 파일 레이아웃에 맞춘 것이다. 저쪽이 이미 다른 방식으로 묶고 있으면
**그쪽 방식을 유지**하고 내용 변경만 옮긴다. 무엇을 옮기고 무엇을 두었는지 보고에 적는다.

## 45. 정보/서비스 그룹의 경계와, 간격을 옮기지 않는 이유

정보 블록을 「제목 / 정보 행 그룹 / 서비스 행 그룹」 세 덩어리로 묶을 때
**경계는 첫 토글 행이다.** 기준 화면을 여러 장 훑어서 확인한 규칙이다.

- 정보 그룹 : 신청자 · 신청기간 · 사용기간 · 좌석번호 · 기본 요금 · 합계
- 서비스 그룹 : **첫 토글부터 끝까지** — 토글 뒤에 오는
  「H 스마트스터디 요금」 행도 **서비스 쪽**이다 (부가 서비스의 요금이므로)

```js
const kids  = cont.children.slice();
const split = kids.findIndex((c, i) => i > 0 && /list-row\/dark\/(toggle|checkb)/.test(c.name));
const info  = split < 0 ? kids.slice(1) : kids.slice(1, split);
const svc   = split < 0 ? []            : kids.slice(split);
```

서비스 행이 하나도 없는 화면(결제 전 단계 등)은 **정보 그룹만** 만든다.
빈 그룹을 만들면 gap 이 한 번 더 먹어 높이가 어긋난다.

### 간격은 그 파일 것을 쓴다

기준 파일의 그룹은 `gap 36 / pad 24` 였지만, 옮겨 갈 파일의 행이
**자체 패딩 16을 가진 인스턴스**면 그 값을 그대로 쓰면 안 된다. 간격이 이중으로 붙는다.
**그룹의 gap 은 원래 컨테이너의 `itemSpacing` 을 그대로 승계**한다.

```js
const gap = cont.itemSpacing;          // ★ 기준 파일 숫자를 하드코딩하지 않는다
g.itemSpacing = gap;
g.paddingTop = g.paddingBottom = g.paddingLeft = g.paddingRight = 0;
```

이렇게 하면 **높이가 1px 도 안 변한다** — 순수하게 구조만 바뀐다.
실제로 8장 전부 `h 486->486`, `818->818` … 로 동일했다.

### 높이 불변이 곧 검증이다

묶기 전후의 컨테이너 높이를 찍어 **같은지 확인**한다. 달라졌다면
빈 그룹을 만들었거나, 패딩이 남아 있거나, 경계를 잘못 잡은 것이다.

```
원래   : header + Σrows + gap × (ni + ns)
묶은 뒤 : header + [Σinfo + gap×(ni-1)] + [Σsvc + gap×(ns-1)] + gap × 2   ← 같다
```

## 46. "동일하게" 요청은 먼저 대조표를 내고, 큰 변경은 한 번에 적용한다

"A 파일이랑 비교해서 동일하게" 같은 요청은 범위가 셋으로 갈린다 — **값**(날짜·금액·라벨),
**행 구성**(어떤 행이 있고 없고), **화면 구성**(어떤 화면이 몇 장인지). 이를 구분하지 않고
한 번에 밀면 사용자가 뜻하지 않은 화면까지 바뀌고, 되돌리고, 다시 적용하는 왕복이 생긴다.

실제로 겪은 순서: 값+행+화면 전부 적용 → "왜 바뀌었지" → 되돌림 → "다시 디에이치로 맞춰" .
**되돌린 뒤 다시 적용하느라 같은 작업을 세 번 했다.**

### 순서

1. **양쪽을 같은 형식으로 뽑아 대조표를 먼저 낸다** (앱바 / 버튼 / 행 라벨=값).
   추출 스크립트 하나로 두 파일을 찍으면 diff 가 눈에 들어온다.
2. 값 차이는 바로 적용한다 — 명백하다.
3. **행·화면 구성 차이는 항목별로 물어본다.** "정원 행 지울까요 / 좌석 선택 화면 바꿀까요 /
   신청현황 3종을 추첨 상태로 재구성할까요" — 하나씩 예/아니오로 답할 수 있게.
4. 답을 받으면 **한 호출 안에서 전부 적용**하고 렌더 한 장 + 대조표 한 장으로 보고한다.

### 동시 편집 감지

작업 중 노드 id 가 `NULL` 로 바뀌거나, 내가 만들지 않은 `58839:*` 같은 새 id 의 프레임이
섹션 안에 나타나면 **사용자가 같은 섹션을 편집 중**이다. 이때는

- 추측으로 고치지 않고 **현재 상태를 다시 읽는다** (`findAllWithCriteria` 로 내용 검색).
- 내가 만든 것과 사용자가 만든 것을 구분해 보고한다 (원본이 제자리에 있는지 확인).
- 사용자가 새로 만든 화면은 **건드리지 않고 이름·위치만 세트에 맞춘다.**

### 되돌리기는 "원래 값"이 어딘가에 남아 있을 때만 정확하다

줄을 지운 뒤 되돌리려면 그 텍스트가 파일 어디에도 없을 수 있다.
지우기 전에 **원래 값을 보고에 표로 남겨 두면** 그 표가 곧 복구 사양이 된다.
숨은 슬롯(`visible=false`)에 남은 텍스트는 복원 원형으로 쓸 수 있다 — 구조가 같기 때문.

## 47. "구분선"은 LINE 노드가 아닐 수 있다 — 스트로크를 먼저 본다

사용자가 "내가 넣어둔 라인이 없어졌다"고 하면, `LINE` / 얇은 `RECTANGLE` 만 찾는
스캔은 **0건**이 나온다. 이 파일에서 구분선은 **그룹 프레임의 상·하 개별 스트로크**였다
(`strokeTopWeight=1, strokeBottomWeight=1, strokeAlign=INSIDE`, 색 210,210,210).

```js
// 스트로크 가진 프레임을 찾되, 개별 굵기 속성은 노드 타입에 따라 없을 수 있다 → try
const c = ...; let sw = "";
try { sw = typeof c.strokeWeight === "number" ? "w=" + c.strokeWeight
         : "T" + c.strokeTopWeight + " B" + c.strokeBottomWeight; } catch (e) { sw = "?"; }
```

`VECTOR` 는 `strokeTopWeight` 가 없어 **읽기만 해도 TypeError** 로 호출 전체가 롤백된다.
스트로크 속성은 항상 try 로 감싼다.

옮길 때는 `strokes` 배열을 JSON 복사하고 `strokeAlign` + 네 방향 굵기를 각각 대입한다.
`strokeWeight` 하나만 넣으면 네 면 전부에 선이 생긴다.

## 48. 사용자가 기준 화면을 직접 고쳤을 때 — 그 화면은 읽기만 한다

"내가 A 화면 다시 수정해 놓음, 다른 화면에도 적용해줘" 는 **A 를 절대 건드리지 말라**는
뜻이 포함돼 있다. 그 전에 A 를 복제본으로 교체하거나 값을 되돌린 이력이 있으면
사용자는 이미 예민한 상태다.

절차

1. A 를 **속성 단위로 전부 덤프**한다 — 컨테이너 gap, 래퍼 유무와 패딩, 그룹 패딩, 행 폭,
   값 정렬(`primaryAxisAlignItems` + `textAlignHorizontal`), 스트로크, 앱바 부가 텍스트.
2. 나머지 화면에 **같은 속성값을 대입**한다. A 의 노드를 복제해 넣지 않는다.
3. 적용 후 **A 를 포함한 전 화면을 한 표로 찍어** 숫자가 같은지 확인한다.
   렌더만 보면 행 폭 375/343 같은 차이는 안 보인다.
4. 보고에 "A 는 손대지 않았다"를 명시한다.

### 두 파일을 나란히 렌더한다

"디에이치와 같게" 는 두 섹션을 **같은 배율로 나란히** 렌더해 눈으로 세는 게 가장 빠르다.
숫자 대조표에서 안 잡히는 것(앱바 우측 텍스트 유무, 배지 위치)이 여기서 잡혔다.
테마 차이(배경·버튼색)와 구조 차이(바텀시트 vs 풀페이지)는 **일부러 남긴 것**으로
따로 적어 둔다 — 안 그러면 다음 검토 때 또 "다르다"로 올라온다.

## 49. 섹션 하나를 다른 브랜드 파일에 "반영"할 때

"이 섹션을 저 파일에도 반영" 은 §44 의 확장이다 — 화면이 아직 없으므로 **그쪽 파일에서
가장 골격이 비슷한 화면을 하나 골라 복제**하고 내용만 바꾼다. 이번엔 예약확인 상세 9장을
방금 완성한 그쪽 신청현황 화면(앱바·배너·제목·정보 행·토글/체크·하단 바)에서 만들었다.

### 절차 — 조회는 병렬, 쓰기는 순서대로

1. 원본 섹션을 **한 스크립트로 통째로 덤프**한다 (화면별 앱바/버튼/본문 텍스트 순서).
   이것이 곧 화면별 사양표가 된다.
2. 그쪽 파일에서 **같은 기능 화면이 이미 있는지** 텍스트로 찾는다. 있으면 복제해 쓰고
   (카페 주문내역), 없으면 골격 화면을 복제한다 (예약확인 상세).
3. 서로 의존하지 않는 조회(원본 렌더 · 그쪽 후보 검색 · 골격 노드 id)는 **한 응답에 같이**
   보낸다. 60초 타임아웃 위험이 있는 쓰기는 **5장 안팎으로 쪼갠다** — 분리된 프레임에
   쓰는 두 배치는 병렬로 보내도 됐다.
4. 화면별 사양을 **데이터 테이블(SPEC)** 로 두고 한 함수로 돌린다 — 행 수가 다르면
   첫 행(1줄짜리)을 원형으로 삼아 나머지를 지우고 필요한 만큼 복제한다.

### 단일/이중/비활성 버튼 바는 이미 있는 화면에서 가져온다

새 하단 바를 그리지 않는다. 같은 파일에 **단일 primary(신청 01의 「다음」)**,
**회색 비활성(좌석 배치도의 「닫기」)**, **이중(신청현황의 「취소|확인」)** 이 이미 있으니
필요한 것을 `clone()` 해 기존 바 자리에 놓고 라벨만 바꾼다. 텍스트는 `/^(다음|닫기)$/` 로 찾는다.

### 높이는 "버튼 위 여유"로 정한다

행을 지우고 나면 화면이 남는다. `btn.y = cont.bottom + 48` 로 버튼을 올리고
`frame.height = btn.y + btn.height` 로 자른다 — §42 의 좌표 복구를 같이 한다.
원본(디에이치 971)과 높이가 달라지는 건 행 컴포넌트 높이 차이(22 vs 51)라 정상이다.

### ★ 복제본이 인스턴스면 삽입 전에 루트부터 디테치

`getNodeByIdAsync("A:B")` 로 잡은 노드의 자식 id 가 `I A:B;…` 꼴이면 **그 노드 자체가
인스턴스**다. 이걸 `clone()` 하면 복제본도 인스턴스라 안에 아무것도 넣을 수 없다
(`Cannot move node. New parent is an instance`). 조상만 훑으면 루트를 놓친다 —
**루트가 INSTANCE 면 먼저 디테치**하고(이름·좌표는 되돌아오지 않으니 저장했다 복원),
그다음 제목 텍스트에서 루트까지 올라가며 남은 인스턴스를 바깥부터 뗀다. 디테치마다 id 가
바뀌므로 매번 다시 찾는다.

### 후보를 텍스트로 고를 때는 "그 상태의 화면"인지 본다

"매장이용" 텍스트가 있는 375폭 화면을 집었더니 **탭 선택 화면(812)** 이었고,
정작 주문 상세(1482)는 제목이 「매장」이었다. 유형 라벨 하나로 고르지 말고
**높이·단계 표시(접수대기/준비중…)·결제 상세 유무**를 같이 본다. 상태(접수대기/접수완료)까지
원본과 맞는 후보가 없으면 진행 표시를 손대지 말고 **차이로 보고**한다.

### 이미지는 파일을 못 넘어간다

배너 사진(사우나·요가·영화 포스터)은 `imageHash` 가 파일 단위라 복사되지 않는다.
그쪽 파일의 기본 사진을 두고 **"배너 이미지는 콘텐츠별로 교체 필요"** 로 남긴다.

## 50. 검색 결과 행 — 원본 리스트 행을 그대로 쓰고 "콘텐츠별 내용"만 갈아 끼운다

검색 결과에 결제일·결제시간·콘텐츠별 내용을 넣으라는 요청은 **결제이력 리스트 행
(`list-row/커뮤니티`) 을 원형 그대로 쓰라는 뜻**이다. 그 행에 이미 다 있다 —
`날짜 · 명칭 ㅣ 번호 / 시간 · [구분] 상세 / 금액 · 상세내역`.
앞서 "단순 2행"으로 깎아 놓은 걸 되돌린 셈이니, 애초에 원본 행을 깎지 않는 편이 낫다.

### 원형 행 하나를 정해 데이터로 채운다

번호·구분선까지 다 갖춘 행(`17418:183457`)을 유일한 원형으로 잡고, 필요 없는 요소만 지운다.
"골프 행엔 번호가 없다"고 골프 행을 원형으로 쓰면 번호 슬롯이 없어 다른 행을 못 만든다.

```js
const title = findAll(r, c => c.name === "title" && c.children.filter(x => x.type === "TEXT").length >= 2)[0];
```

`byName(r,"title")` 은 **불릿 프레임(`point > title "•"`) 을 먼저 잡는다.** 텍스트가 2개 이상인
`title` 로 골라야 날짜·명칭·번호 행이다. (첫 시도의 `cannot read fontName of undefined` 원인)

### 콘텐츠별 2행 규칙 (신청현황 카드와 1:1)

| 유형 | 2행 [구분] 뒤 |
|---|---|
| 기간형 (월권·수강기간) | `26.09.01~26.09.30` (+ `ㅣ 화·목`) |
| 일자형 (라커·일권) | `26.09.05` |
| 일자+시간형 (시간권·골프) | `26.09.01 ㅣ 13:00` |
| 횟수권 | `4회차 ㅣ 10회권(26.12.12)` |
| 카페 | `주문번호 1264567890` |

시설명 검색 3행을 **기간 / 일자 / 일자+시간** 으로 하나씩 배치하면 기획서 예시가 된다.

### 페이지 정체는 사용자가 정한다

내가 "05=사용자명, 06=시설명"으로 이름 붙였어도 사용자는 **노드 id 로** "이건 시설명 페이지"라고
부른다. 그때는 이름을 고집하지 말고 **두 화면의 내용을 통째로 맞바꾼다** (inner `contents` 자식
이동 → 검색어 → 이름 → 높이). 검색어와 결과가 서로 안 맞아 보이는 건 대개 이 정체 불일치다.

### 불릿·잘림

- 맨 앞 `•` 는 `point` 프레임 — 빼 달라면 행마다 `remove()`.
- 상세 텍스트가 금액 칸에 눌려 `화…` 로 잘리면 원본 리스트도 같은 방식으로 잘린다.
  줄바꿈 대신 **문구를 줄인다** (`화·목 18:00` → `화·목`). 목업 문구도 같이 맞춘다.

## 51. 검색 7장을 다른 브랜드 파일(마이힐스)에 옮길 때

- 목적지 섹션의 기존 화면 x 최대값(≤2091) 오른쪽에 `x = 2500 + i*412`, y 는 기존 화면과 같은 행(276).
- 베이스는 **목적지 파일의 같은 역할 화면**을 복제한다: 빈상태 / 리스트 / 결과없음(H 헬퍼 WEB) / 팝업(popup/2bt) /
  입력 변형(Default·Filled·filled2). 디에이치 노드를 가져오지 않는다 (이미지·컴포넌트 다 끊긴다).
- 행 makeRow 는 파일마다 다르다. 마이힐스는 `Frame 2612371`(칩) / `Frame 2611670`(날짜·`Frame 3736` 명칭·RECT·번호) /
  `Frame 2611671`(시간·`Frame 3612` [구분]+상세) / `Frame 2611666`(금액), `point` 제거.
- 루트 `LM=NONE` 이면 높이는 `resizeWithoutConstraints` 로 맞추고 `bottom-fix` 는 `y = h - 34` 로 직접 재고정 (§42).

## 52. "원본의 행간을 수정했어" — 사용자가 원본 행을 고치면 수치를 읽어 그대로 옮긴다

사용자가 디에이치 검색 결과 행의 세로 리듬을 바꿨을 때(2026-09) 실제로 바뀐 값:

| 위치 | 전 | 후(원본) |
|---|---|---|
| inner `contents` 패딩 | 32/16/32/16 | **16/16/16/16** |
| `구분 그룹` gap | 20 | **0** |
| `구분 헤더` 행간 | 150% (h23) | **24px** (새 스타일 `3차 The H/KR-Callout-15-R`) |
| 행 패딩 / gap | 12/12/0/12, gap 0 | **16/12/0/12, gap 12** |
| 칩 높이 | 28 (텍스트 lh20) | **24** (캡션 12/16) |
| 본문 프레임 패딩 | 12/0/12/0 | **0/0/16/0** |
| 행 높이 | 106 | **110** |

- "행간" 한 단어라도 **padding·gap·lineHeight·칩 텍스트 스타일** 이 함께 바뀐다. 행 하나를 depth 12 로 덤프해
  전/후를 표로 만든 뒤 옮긴다. 렌더만 보고 눈대중으로 맞추지 않는다.
- 헤더 행간: 디에이치는 새 텍스트 스타일을 만들었다. 다른 파일에는 **먼저 값만 직접 넣고**(`lineHeight={unit:"PIXELS",value:24}`,
  스타일은 풀린다) 보고에서 "스타일을 만들어 연결할까요" 를 묻는다. "만들어줘" 를 받으면 원본 스타일 속성을
  그대로 읽어(`fontName/fontSize/lineHeight/letterSpacing`) `figma.createTextStyle()` 로 만들고 이름은 원본 패턴에서
  브랜드만 바꾼다(`3차 The H/KR-Callout-15-R` → `3차 HILLS/KR-Callout-15-R`). 같은 이름이 이미 있으면 재사용.
- 칩 높이는 칩 텍스트의 **스타일**(lh 20 → 16)로 맞춘다. 패딩(4/16)은 그대로.
- 다른 화면(01~04·07)의 패딩 32 는 원본도 32 이므로 손대지 않는다. 바뀐 화면만 바꾼다.
- 6장은 루트 높이도 원본(1094)에 맞추고 `bottom-fix` 를 다시 바닥에 둔다.

## 53. 덱 ↔ 디자인 최종 검토(예약확인 상세 569~572)에서 배운 것

- 검토는 **디자인 화면의 텍스트 라인 덤프**(y 순 정렬, 같은 줄 묶기)와 덱 목업·표 텍스트 덤프를 나란히 놓고 한다.
  렌더만 보면 「추가선택」 헤더 유무, 토글/체크박스 차이, 보조문구 누락, `09.31` 같은 날짜 오류를 놓친다.
- 디자인의 컨트롤 정체는 `findAll(INSTANCE)`의 `componentProperties`로 확인한다(`btn-control Type=checkbox State=check`).
  같은 행 컴포넌트(`list-row/dark/toggle`)에 토글과 체크박스가 둘 다 들어 있고 variant 로 하나만 보이는 구조가 흔하다.
- 덱 목업 수정 순서: ① 헤더 텍스트 그룹 → 1px divider 로 교체(부모 V 오토레이아웃이 간격을 다시 잡는다)
  ② 토글 `swapComponent(onMain)` — on 변형은 다른 슬라이드의 인스턴스에서 `getMainComponentAsync()` 로 얻는다
  ③ 체크박스는 덱 로컬 `checkbox` 컴포넌트 셋(18:5685)의 `primary/active/on` 을 `createInstance()` 후 `rescale(17/24)`
  ④ 보조문구 블록은 기존 `Frame 604`(라벨행+서브텍스트)를 `clone()` 해 라벨행만 갈아 끼운다
  ⑤ 마커 5 는 새 앵커(자동등록 라벨) 실측 중심으로 이동.
- **클론 블록의 텍스트를 바꿀 때 `findAll(TEXT)[0]` 은 방금 옮겨 넣은 라벨이다.** 바꿀 텍스트는 내용으로 찾는다(`/재등록/`).
- 60초 타임아웃이 나도 대부분 적용돼 있다. 상태 점검 코드(add/div/tg/cb/blk/sub 카운트)로 확인하고 빠진 것만 재적용.
- 용어 통일(회수권→횟수권)은 슬라이드 그리드를 행 단위로 쪼개 `findAll` 하면 1026장도 2회 호출로 끝난다.

## 54. 파일 간 이미지 — 가능한 것과 불가능한 것

- `imageHash` 는 **같은 이미지가 목적지 파일에 이미 있으면 그대로 대입된다.** 먼저 `figma.getImageByHash(hash)` 가 null 이 아닌지
  확인하고, 있으면 `fills` 의 `imageHash` 만 바꾼다(라커·필라테스가 이 경우였다).
- 없으면 프록시가 figma.com 을 막아 `download_assets`/`upload_assets` 를 쓸 수 없고, 플러그인 샌드박스에는 `fetch` 도 없다.
  base64 를 컨텍스트로 중계하는 방식은 20KB 출력 제한 때문에 13개 이상 청크가 필요하고 **전사 오류가 실제로 났다**(19000→19002).
  시도하지 말고 사용자에게 "디에이치에서 복사 → 마이힐스에 붙여넣기" 를 부탁한다. 사용자가 이미 붙여넣는 중이면 그 화면은 건드리지 않는다.
- 남긴 임시 텍스트 노드(`img-transfer:*`)는 반드시 지운다.

## 55. 상태 한 가지(토스트) 를 기획서에 추가할 때 — 표가 꽉 찬 장은 (2/2) 상태 페이지로

헤이슬립 475장(표 h834, 바닥 1006)에 토스트 행 하나(57)를 넣으면 1018을 넘는다. 배율 축소 대신:

1. `slide.clone()` → `row.insertChild(idx+2, c)` 후 **`indexOf` 로 확인, 바로 뒤가 아니면 `insertChild(idx+1, c)` 로 다시 이동**
   (이번엔 +2 가 두 칸 뒤로 갔다. §19 의 +1 규칙은 상황에 따라 다르므로 항상 검증).
2. 목업이 COMPONENT 인 장이면 복제본의 COMPONENT 를 `createInstance()` 로 바꾸고 원래 z-index 에 `insertChild`.
3. 제목은 `swap/title 36 (fix)` 로 「헤이슬립 (1/2)」/「(2/2)」.
4. (2/2) 표는 **0 설명 + 새 번호 행만** 남긴다. 다른 장의 마커·행은 지우고, 설명 행에 상태를 적는다(「슬립모드 ON 상태」).
5. ★ 표 셀이 **미바인딩 Pretendard** 인 장은 Noto 임시 스타일로 바꾸면 행 높이가 커진다(57→67, 상자가 K배로 재계산).
   대신 **스타일이 바인딩된 다른 장(934 등)의 행을 `clone()` 해 와서** 스왑 기법으로 쓴다 — 진짜 Pretendard 로 남는다.
   유형 셀은 원본 행에 따라 바인딩이 없을 수 있으니 같은 유형 텍스트(예: 'Toast')의 `textStyleId` 를 찾아 다시 씌운다.
6. 토스트 목업은 그 장에 남아 있던 템플릿 토스트를 재사용(텍스트는 Bold 14 → `swap/14-20--6b` 를 새로 만들어 스왑).
   **폰 목업보다 z-order 가 아래면 렌더에 안 보인다** — `appendChild` 로 맨 위로.
7. 목업 안의 토글은 `findAll(name==="switch")` 이 **여러 개** 나온다. 부모의 라벨 텍스트로 골라 `setProperties`.
   첫 번째를 잡으면 전원 토글이 켜진다(실제로 그랬다).
8. 마커는 토스트 중심(y+22−12)에 하나만. 표 유형은 `Toast`.
- 토스트 아이콘 변형(`Icons-line`)은 컴포넌트 셋 오류로 `setProperties` 가 막힌다 — 체크 아이콘 그대로 두고 보고에 적는다.

## 56. 짧은 정책 한 줄을 기획서에 넣을 때 (소방 세대점검 기축 표시 위치)

- 대상 장은 덱 전수 검색(3회 분할)으로 찾는다. 「소방」은 SS_14 496~509 에 몰려 있고 진입 경로는 첫 장(497)이다.
- 표에 여유가 있으면 **번호 없는 Info 행**을 뒤에 붙인다. 셀이 미바인딩 Pretendard 인 장이라도
  934 같은 바인딩 장의 2줄 행을 `clone()` 해 오면 Pretendard 로 남는다(§55-5). 유형 셀은 원본에 스타일이 없을 수 있으니
  `setT` 복귀 시 `o || refType.textStyleId` 로 보강한다.
- 문장은 사용자가 말한 정책 + 대비되는 기존 경로 한 줄: 「기축 단지 : 단지생활 > 소방 세대점검 탭에서 표시 / 신축 단지 : THE H 홈 배너 · 팝업으로 안내」.
- 메뉴 구성도(9·10)는 인스턴스 내부 텍스트라 편집 불가. 위치가 정책과 다르면(기축 구성도의 소방 세대점검이 우리집 열에 있음) 보고에 적고 사용자에게 넘긴다.
- 사용자가 요청 직후 디자인 파일에서 같은 화면을 직접 만들고 있을 수 있다(새 id 58913). 먼저 섹션을 다시 읽고,
  이미 있으면 **디에이치와 다른 속성만**(슬립 토글 on) 맞춘다. 중복 화면을 만들지 않는다.

## 57. ★ 13.3px(0.95 배율) 표에 934 장의 14px 행을 가져올 때는 `rescale(0.95)` 후 `resize(680, h)`

475·497 같은 장의 표는 행 전체가 0.95 배율(폰트 13.3, 번호 셀 49, 유형 셀 73, 내용 x=145)이다.
934 의 바인딩 행(14px, 52/77/153)을 그대로 넣으면 번호·유형 열이 3~8px 어긋나 눈에 띈다.
`row.rescale(0.95)` 하면 폰트·셀 폭·x 가 정확히 13.3 / 49 / 73 / 145 로 맞고, 폭이 646 이 되므로
`row.resize(680, row.height)` 로 되돌린다(FILL 인 내용 셀만 넓어진다). 1줄 41.8, 2줄 60.8.
- 이 장의 미바인딩 13.3 행은 편집 불가 → 바꿀 행은 934 행 clone → 텍스트 스왑 → rescale 로 **교체**한다.
- 마스터 COMPONENT 목업의 텍스트를 스왑으로 바꾸면 인스턴스에도 전파되지만 렌더가 늦게 갱신된다.
  인스턴스 쪽 텍스트도 같은 스왑으로 한 번 더 써 주면 바로 반영된다.
- 사용자가 같은 장을 동시에 고치고 있을 수 있다(제목에 「_가습기」가 붙고 토스트 아이콘이 바뀌어 있었다). 내 변경만 하고 나머지는 그대로 둔다.

## 58. ★ 「삭제」 지시는 대상 이름이 아니라 위치로 좁힌다 — 이름이 같은 프레임을 `findAll` 로 지우면 안 된다

「신청카드에서 사용자명 삭제」에서 실수한 것: 마이힐스 상세 화면의 정보 행 5개가 **모두 `신청자 행` 이라는 이름**이었다
(사용자가 신청자 행을 복제해 이용기간·좌석·요금·결제수단 행을 만들었다). `findAll(name==="신청자 행")` 으로 지우니 행 5개가 전부 사라졌고
그룹 높이가 321→321 로 안 변한 것이 그 신호였다(auto-layout 높이는 다음 재계산 전까지 그대로다).
- **지우기 전에 후보의 텍스트를 찍어 본다**: 라벨이 '신청자' 인 것만 골라야 한다. "removed 5" 처럼 예상(1)과 개수가 다르면 즉시 멈춘다.
- 복구는 같은 파일의 같은 구조 행(월권 01 `58853:98442`, 343×51 · 상하 divider · Frame 3763 라벨 + Frame 2612264 값)을 `clone()` 해
  `정보 행 그룹` 에 `appendChild` + `layoutAlign="STRETCH"`, 라벨·값은 이전 조회 결과(transcript)의 원문으로 되돌린다. Noto Sans KR Bold/Medium 은 로드된다.
  그룹 높이가 원래(321/376)와 같아지면 복구 완료.
- 「신청카드」= 목록 카드(xlsx `신청현황_카드`), 「상세」는 별개다. 사용자가 「상세 페이지는 유지」라고 확인했다. 지시의 범위는 정의서 시트 이름으로 판단한다.
- 디에이치 상세의 신청자 행은 INSTANCE 라 `name==="신청자 행"` 검색에 잡히지만 텍스트 정규식 검색이 이전에 놓쳤다 — "없다"는 결론은 두 방법으로 교차 확인한다.

## 59. 카드 목록 장(569)에서 요소 하나(사용자명 칩)를 지우고 탭별 3장으로 나눌 때

- 칩은 목업 COMPONENT 3개(번호/01, 번호/02, Frame 2610916)의 `Frame 2612589` 를 지우면 인스턴스 전체에 전파된다. 디자인 파일(디에이치·마이힐스)엔 애초에 칩이 없었다(페이지 전수 `/사용자 ?명/` 0건).
- 표는 행마다 `PPT_form/list` 인스턴스가 `Frame 2609093`(VERTICAL) 에 쌓인 구조. 행 삭제는 인스턴스 `remove()`, 번호 셀은 Inter/Noto 라 직접 대입. 마커는 `Number` 인스턴스(텍스트 `18:4273`), 지운 요소의 마커는 삭제하고 뒤 번호를 당긴다.
- 칩이 빠지면 카드 높이가 줄어 마커가 어긋난다 → 대상 텍스트/카드의 중심(y+h/2−12)으로 전부 재정렬.
- 3장 분리: `clone()` 은 장이 무거워 **한 번에 하나만**(두 개 clone 하면 60초 초과; 타임아웃 뒤엔 반드시 다시 읽어 어디에 생겼는지 확인 — 이번엔 앞쪽 idx 에 생겨 `insertChild(idx+1)` 로 옮겼다).
  각 장은 폰 1대(x=460)·탭 라벨·해당 마커만 남기고, 표는 [0 설명 + 그 탭 행 + 공통 버튼 행] 을 원하는 순서로 `insertChild(i, row)` 후 0..n 재번호.
  (1/3)에만 탭·헤더·전체보기 공통 행(1~3)을 남기고 (2/3)(3/3)은 카드 행만. 마커가 없던 폰(강좌·편의)은 기존 마커 `clone()` 으로 신청취소·카드 탭 마커를 추가(왼쪽 x=폰.x−32, 오른쪽 x=폰.x+312).
- 제목은 `swap/title 36 (fix)`, 설명 행은 `swap/14-24--6` 스왑으로 「… _ 시설 (1/3)」/「커뮤니티 > 신청현황 카드 _ 시설 탭 (…)」.

## 60. 정책 한 줄(회원 기준 본인 건만 표시)을 분리된 3장에 넣을 때 — 스왑 도중 타임아웃 주의

- 정책은 각 장의 **0 설명 행 2번째 줄**에 같은 문장으로 넣고, 모순되는 줄(신청취소 행의 「가족구성원 신청 건 : 비활성 (조회만 가능)」)은 지운다. 상세 장은 건드리지 않고 모순만 보고한다.
- ★ 한 호출에서 6개 셀을 `setTextStyleIdAsync(SWAP)` 하다 60초를 넘기면 **스왑만 적용되고 characters·복귀가 안 된 상태**로 남는다(폰트가 Noto Sans KR 로 보임).
  타임아웃 뒤엔 셀별 `textStyleId` 를 찍어 swap 스타일(`S:af58f9e5…`)에 남은 셀을 찾고, 그 상태를 이용해 `loadFontAsync(Noto Sans KR Regular)` 후 characters 대입 → 같은 표의 다른 셀에서 원래 스타일 id(`S:7d4f…` 2줄 행 / `S:3a33…` 일반 행)를 가져와 복귀한다.
- 장 하나당 호출 하나로 나누면 타임아웃 없이 끝난다(셀 2개 × 3장).
