---
name: figma-screen-spec-table
description: 현대건설 THE H / HILLSTATE 화면정의서(Screen Specification) 덱의 우측 기획 표를 읽고·수정·행 추가할 때 사용한다. "기획 내용 추가", "기획 정의", "타이틀에 맞게 정리", "표에 행 추가", "화면정의서 확인", "설명 행 수정", "마커 번호 정리", "목업이랑 표가 안 맞아" 같은 요청에 반드시 먼저 확인한다. 표 행 구조·줄 수 계산·높이 한계(1018), Pretendard 대체 스왑 스타일 기법, 마커(Number) 번호 체계, 목업 대조 원칙, MCP 타임아웃 대응을 모두 다룬다.
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

### 손댈 수 없는 노드

`textStyleId === ""` (스타일 미바인딩) + Pretendard 인 노드는 **되돌릴 스타일이 없어** 글자를 쓰면 폰트가 영구히 바뀐다.
→ **건드리지 말고 사용자 작업으로 넘긴다.** (덱 290·291·295 오타가 이 경우)

번호 셀은 Inter 이므로 스왑 없이 `characters` 직접 대입하면 된다.

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

## 5. 마커(콜아웃 번호)와 표 번호

목업 왼쪽/오른쪽의 원형 번호는 `Number` / `Number sign` INSTANCE (컴포넌트 `18:4275`, `18:4232`), 34×24, 안쪽 TEXT 는 Inter Bold 12.

```js
const ts=[];(function w(x,d){ ... })(markerInstance,0);
ts[0].characters = "3";               // Inter 라 직접 대입 가능
```

원칙:

- **표의 번호 = 목업 마커 번호**. 하나가 바뀌면 둘 다 바꾼다.
- 같은 번호가 목업에 **두 번 나올 수 있다** — 같은 상태(미확인/확인)를 다른 영역에서 보여줄 때. 이건 오류가 아니다.
  이 경우 표의 해당 행 문구에 "A 영역 · B 영역 공통" 이라고 명시한다.
- 번호가 없는 행(공란)은 **바로 위 번호 행의 부연 설명**이다. `Info` 유형을 쓴다.
- 마커 위치는 사용자가 직접 배치한 것이다. **임의로 옮기지 않는다.** 어긋나면 보고만 한다.

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

## 10. 참조 노드 (공지사항 기준, 2026-09 시점)

덱 `XVGk8Kx3teqKS42Gnd6DCn`

| 장 | 슬라이드 | 표 | 타이틀 |
|---|---|---|---|
| 280 | `910:124327` | `910:124328` | 홈 _ 공지사항 |
| 281 | `3018:140435` | `3018:140439` | 홈 _ 공지사항_상세페이지 |
| 282 | `40004105:489181` | `40004105:489195` | …_관리자 상단고정 상세 페이지 |
| 283 | `40004105:488805` | `40004105:488819` | …_댓글, 답글 |
| 782 / 785 (피드) | — | `784:137821` / `529:68284` | 댓글·답글 원문 준용 대상 |

디자인 파일 `KGtQP6j8Tm1affFKSj7hGg` · SECTION `20-공지사항` = `17302:286358`
(답글 작성 바텀시트 `TheH_IOT_답글 - 1` = `17305:289341`)

> 슬라이드 번호는 재배열로 바뀐다. **node-id 와 타이틀을 함께 확인**하고 시작한다.
