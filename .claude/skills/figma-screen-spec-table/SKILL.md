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
| 905 | — | — | 기축_마이(입주 전) — 표 전체 미바인딩 Pretendard, **편집 불가** |
| 906 | `40003540:531743` | `40003540:531797` (642) | 기축_마이(입주 후) — Noto Sans KR, 편집 가능 |

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
