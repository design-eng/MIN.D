---
name: figma-slides-migration
description: 현대건설 THE H / HILLSTATE UI·UX 기획서를 Figma 디자인 파일에서 Figma Slides 덱으로 이관·정렬할 때 사용한다. "슬라이드로 이관", "원본과 맞춰줘", "화면이 깨졌다", "헤더/푸터를 가린다", "선택 프레임 위치 수정", "구분 페이지 디자인 통일", "서비스 플로우 화살표 정렬" 같은 요청에 반드시 먼저 확인한다. 좌표 배율(0.703125), 내부 스케일 어긋남 복구, MCP 제약, 구분 페이지(버전) 규격, Frame 273 규격을 모두 다룬다.
---

# Figma 디자인 → Slides 이관 · 정렬

## When to use

- 디자인 파일 프레임(2048×1536)을 Slides 덱(1920×1080)으로 옮기거나 맞출 때
- "화면이 깨졌다", "텍스트가 너무 크다", "헤더/푸터를 가린다" 류의 보고를 받았을 때
- 구분(섹션) 페이지 디자인을 통일할 때
- `Frame 273` 등 공통 요소를 일괄 정렬할 때

---

## 1. 대상 파일

| 역할 | fileKey | 비고 |
|---|---|---|
| 1차 디자인 | `KFulqeSWrVuSA8738lF9LP` | 페이지 `THE H`(0:1, 416 프레임), `Hillstate_Design`(31:2538, 403 프레임) — **두 페이지에 같은 이름·같은 제목의 쌍둥이 프레임이 존재**하므로 어느 페이지가 원본인지 반드시 확인 |
| 1차 덱 | `EMCPEFkDPnlxfaAuBaJmLx` | 543장. 21~53p만 `PPT_top`/`PPT_low`, 나머지는 `PPT_form`/`PPT_form/bottom` |
| 2차 디자인 | `cvp5xR3hw402B7PKQvUZP4` | `_slides용(임시)`(4390:231173)이 실제 이관 원본 |
| 2차 덱 | `jqLWDaZxW5yTZH4cJqmjBb` | 333장 |

> 슬라이드 번호는 사용자가 슬라이드를 추가·삭제·재배열하면 바뀐다. **번호 대신 헤더 제목으로 찾을 것.**

---

## 2. MCP 환경의 하드 제약 — 먼저 알고 시작한다

이걸 모르면 시간을 크게 낭비한다. 전부 실측으로 확인된 사항이다.

| 제약 | 내용 | 대응 |
|---|---|---|
| **선택 읽기 불가** | `figma.currentPage.selection` 은 **항상 `[]`**. `figma.currentPage` 도 편집기에서 연 페이지가 아니라 파일 첫 페이지로 리셋된다(호출마다 문서 컨텍스트를 새로 연다) | "선택 화면" 요청이 오면 **프레임 이름 / 헤더 제목 / node-id 링크**를 달라고 요청 |
| **파일 간 복사 불가** | 노드를 다른 파일로 옮기는 API가 없다. `importComponentByKeyAsync` 는 **라이브러리 게시된 컴포넌트만** 가능 (`remote: false` 면 실패) | 사용자가 Figma에서 직접 복사·붙여넣기 → 그 뒤 좌표 정렬은 이쪽에서 |
| **이미지·중첩 프레임 재현 불가** | 화면 목업이 중첩 `FRAME`/`GROUP`/래스터 이미지면 코드로 못 만든다 | 대상 프레임의 자식 타입을 먼저 조사. `INSTANCE`+`VECTOR`만이면 자동 가능, `FRAME`이 섞이면 수동 붙여넣기 필요 |
| **응답 ~20KB 절단** | 원본 좌표를 한 번에 다 못 가져온다 | 프레임 5~6개(요소 200행) 단위로 나눠 fetch |
| **code 파라미터 50,000자** | 대량 데이터를 코드에 박아 넣을 때 한계 | 청크 유지 |
| **60초 타임아웃** | 전 슬라이드 `findAll()` 딥 스캔은 타임아웃난다 | `slide.children` 만 순회. 딥 스캔이 꼭 필요하면 범위를 쪼갠다 |
| **`get_metadata` 미지원** | Slides 파일에는 동작하지 않음 | `figma.getSlideGrid()` 사용 |
| **스크린샷 URL 차단** | `www.figma.com` 에셋 URL은 프록시가 403 | `await node.screenshot()` 인라인 호출만 사용 |
| 금지 API | `loadAllPagesAsync`, `setPluginData`, `createImageAsync` | 사용 금지 |

```js
// 슬라이드 순회 표준 형태
const grid = figma.getSlideGrid();
const flat = []; for (const r of grid) for (const s of r) flat.push(s);
```

---

## 3. 좌표 변환 규칙

원본 프레임 **2048×1536** → 슬라이드 **1920×1080**

```
K  = 0.703125          // 1080 / 1536
OX = 240               // (1920 - 2048×K) / 2
OY = 0

slideX = OX + srcX × K
slideY = OY + srcY × K
```

| 요소 | 규격 |
|---|---|
| 헤더 | `1920 × 172` @ (0,0) — 21~53p의 `PPT_top` 만 `1920 × 170` |
| 푸터 | `1920 × 60` @ (0,1020) |
| 본문 | 헤더·푸터를 덮지 않아야 함 |

**과거 실수 두 가지 (반복 금지)**
- 원본 프레임 높이를 2048로 가정 → 본문이 56px 아래로 밀려 푸터와 충돌. **높이는 1536이다.**
- 배율만 줄이고 오프셋을 안 줌 → 좌우 240 여백·하단 320 공백 발생.

원본이 프레임(2048×1536) 밖으로 삐져나간 요소는 원본에서도 잘려 있는 것이다. 좌표 그대로 옮기고, 슬라이드 경계에서 잘린다고 설명한다.

---

## 4. ★ 핵심 함정 — 내부 스케일 어긋남

**가장 중요한 항목.** 이걸 놓치면 "화면이 깨졌다"는 재작업이 발생한다.

`resize()` 는 프레임 크기만 바꾸고 **자식·폰트·선 굵기는 그대로 둔다.** 바깥만 0.703배로 줄이면 내용이 프레임을 26% 뚫고 나간다.

실측 예 (`마이` 화면):

| | 원본 | 잘못된 결과 |
|---|---|---|
| 바깥 프레임 | 240×547 | 168.8×384.6 (0.703×) |
| 내부 요소 | 242.4 | 215.5 (**0.889×**) |
| 폰트 | 10.77 | 9.58 (**0.889×**) |

게다가 내부 배율은 요소마다 **0.889 / 0.791 / 1.0** 으로 제각각이었다. 전역 상수로 처리하면 안 된다.

### 복구 레시피 (요소별)

```
ρ = (슬라이드 내부 측정값) / (원본 내부 측정값)   ← 요소마다 개별 계산
1) resize(srcW × ρ, srcH × ρ)   // 프레임을 내부와 다시 동기화
2) rescale(K / ρ)               // 프레임·자식·폰트·선굵기를 한 번에 K로
3) x, y 설정
```

`resize` 가 아니라 **`rescale`** 이 폰트 크기와 선 굵기까지 함께 줄인다.

**내부 측정값 `m` 정의** (원본·슬라이드 양쪽에서 동일하게 계산):
```js
const metric = n => {
  if ('children' in n && n.children.length) return n.children[0].width; // 첫 자식 폭
  if (n.type === "TEXT") return (n.fontSize || 0);
  return Math.max(n.width, n.height);
};
```

이 레시피는 **멱등**하다. 이미 맞은 요소는 ρ = K 가 되어 `rescale(1)` 이 생략된다. 안심하고 재실행할 수 있다.

### `rescale()` 의 별도 함정

**두께 0인 노드(직선 벡터)에서 `rescale()` 은 조용히 아무 일도 안 한다.** 이 세션에서 세 번 당했다. 판별 표식은 축소되지 않은 `strokeWeight`.

→ 자식이 없는 노드(단일 요소)는 `rescale` 대신 명시적으로:
```js
c.resize(Math.max(srcW * K, 0.01), Math.max(srcH * K, 0.01));
if (typeof c.strokeWeight === "number" && srcStroke) c.strokeWeight = srcStroke * K;
```

---

## 5. 표준 작업 절차

원본과 슬라이드는 다른 파일이므로 **fetch → apply 2콜 1세트**로 진행한다.

### 매칭 키

```
헤더의 TEXT 레이어(name === "Navigation" 또는 "Header 3")의 characters + "|" + slide.children.length
예: "회원가입_간편인증 등록(AOS)|48"
```
> 헤더를 컴포넌트에 재연결하면 레이어 이름이 `Navigation` → `Header 3` 로 바뀐다. **항상 둘 다 받는다.** (이 이름을 하나만 보다가 전 슬라이드 "원본 없음"이 나온 적 있음)

### fetch (디자인 파일) — 프레임 5~6개씩

```js
const page = figma.root.children.find(p => p.id === PAGE_ID);
await figma.setCurrentPageAsync(page);
const frames = page.children.filter(n => 'width' in n
  && Math.round(n.width) === 2048 && Math.round(n.height) === 1536);
const metric = n => {
  if ('children' in n && n.children.length) return +n.children[0].width.toFixed(2);
  if (n.type === "TEXT") return +(n.fontSize || 0).toFixed(3);
  return +Math.max(n.width, n.height).toFixed(2);
};
const out = {}, seen = {};
for (const f of frames) {
  const hdr = f.children.find(c => /^PPT_(top|form)/.test(c.name) && c.y <= 5);
  if (!hdr) continue;
  let t = null;
  try { t = hdr.findAllWithCriteria({types:["TEXT"]})
      .find(x => x.name === "Navigation" || x.name === "Header 3"); } catch(e) {}
  if (!t) continue;
  const nav = t.characters.trim();
  if (WANT[nav] !== f.children.length || seen[nav]) continue;
  seen[nav] = 1;
  out[nav + "|" + f.children.length] = f.children
    .filter(c => !/^PPT_(top|low)$/.test(c.name))
    .map(c => {
      let sw = 0;
      try { if (typeof c.strokeWeight === "number") sw = +c.strokeWeight.toFixed(3); } catch(e) {}
      return [c.name, +c.x.toFixed(1), +c.y.toFixed(1),
              +c.width.toFixed(1), +c.height.toFixed(1), metric(c), sw];
    });
}
return JSON.stringify(out);
```

### apply (슬라이드 덱)

```js
const K = 0.703125, OX = 240, OY = 0;
const metric = n => {
  if ('children' in n && n.children.length) return n.children[0].width;
  if (n.type === "TEXT") return (n.fontSize || 0);
  return Math.max(n.width, n.height);
};
const grid = figma.getSlideGrid();
const flat = []; for (const r of grid) for (const s of r) flat.push(s);
for (let idx = 0; idx < flat.length; idx++) {
  const sl = flat[idx];
  const hdr = sl.children.find(c => /^PPT_(top|form)/.test(c.name) && c.y <= 5);
  if (!hdr) continue;
  let t = null;
  try { t = hdr.findAllWithCriteria({types:["TEXT"]})
      .find(x => x.name === "Navigation" || x.name === "Header 3"); } catch(e) {}
  if (!t) continue;
  const rows = SRC[t.characters.trim() + "|" + sl.children.length];
  if (!rows) continue;
  const pool = {}, used = {};
  for (const r of rows) (pool[r[0]] = pool[r[0]] || []).push(r);
  for (const c of sl.children) {
    if (/^PPT_(top|low)$/.test(c.name)) continue;          // 헤더·푸터는 건드리지 않음
    const list = pool[c.name], i = used[c.name] || 0;
    if (!list || !list[i]) continue;                        // 이름+등장순서로 매칭
    used[c.name] = i + 1;
    const r = list[i], sx = r[1], sy = r[2], sw = r[3], sh = r[4], msrc = r[5], stw = r[6];
    const isLeaf = !('children' in c) || c.children.length === 0;
    if (isLeaf && c.type !== "TEXT") {
      try { c.resize(Math.max(sw * K, 0.01), Math.max(sh * K, 0.01)); } catch (e) {}
      try { if (typeof c.strokeWeight === "number" && stw) c.strokeWeight = +(stw * K).toFixed(3); } catch (e) {}
    } else {
      let mnow = 0; try { mnow = metric(c); } catch (e) {}
      let rho = (msrc > 0 && mnow > 0) ? mnow / msrc : 1;
      if (!(rho > 0.2 && rho < 3)) rho = 1;                 // 이상값 방어
      try {
        c.resize(Math.max(sw * rho, 0.01), Math.max(sh * rho, 0.01));
        const f = K / rho;
        if (Math.abs(f - 1) > 0.0005) c.rescale(f);
      } catch (e) {}
    }
    c.x = +(OX + sx * K).toFixed(2);
    c.y = +(OY + sy * K).toFixed(2);
  }
}
```

전체 슬라이드를 순회하되 `SRC` 에 있는 키만 처리하므로, 슬라이드 번호가 밀려도 안전하고 재실행해도 안전하다.

---

## 6. 검증 — 매번 한다

1. **수치**: 배치 수 / 미매칭 / 오류를 항상 리포트. 미매칭 0, 오류 0 이 정상.
2. **넘침 검사**: 컨테이너의 첫 자식 폭이 컨테이너보다 12% 넘게 크면 내부 스케일이 어긋난 것.
   ```js
   const rw = c.children[0].width / c.width;  // > 1.12 이면 깨짐
   ```
3. **폰트**: `serviceflow_nameteg` 라벨은 전 슬라이드 **14.06** (원본 20 × K) 이어야 한다.
4. **스크린샷**: 가장 복잡한 슬라이드 1~2장을 `await sl.screenshot()` 으로 확인. **원본 프레임도 같이 찍어 나란히 비교한다.**

---

## 7. 구분(섹션) 페이지 규격

`버전` 컴포넌트 (2차 덱 `42:205509`, 1920×267)

```
위치      x = 0,  y = 407          (1080 기준 세로 중앙)
구성      버전테그/2차 [INSTANCE] (300,0) 120×267
          Frame 2612553 [FRAME]  (457,0) 1163×267
              TEXT "Title"  96pt Bold  y=0     ← 코드
              TEXT "Title"  96pt Bold  y=152   ← 화면명
태그 텍스트  "1차" / "2차"
```

**번호 체계**
- `3_SF_NN` — 서비스 플로우 섹션
- `3_SS_NN` — 화면정의서 섹션 (2차 덱은 78p 이후)
- 번호가 없는 하위 구분 페이지: 화면명을 **첫 줄**에 넣고 **둘째 줄을 `visible = false`** 로 숨긴다. 높이는 267로 유지되고 텍스트가 태그 중앙에 정렬된다.

**변환 규칙** (`1.인트로` → `버전`)
```
"2\n카페 + 로봇배송"  →  Title1 = "3_SF_02",  Title2 = "카페 + 로봇배송"
```

---

## 8. 공통 요소 규격

| 요소 | 규격 |
|---|---|
| `Frame 273` (우측 리스트) | `x = 1240`, `y = 160`, `w = 680` — 높이는 내용에 따름 |
| `Frame 273` 내부 행 | 폭 `680`, 이름 `PPT_form/list` |
| 헤더 마스터 (1차 덱) | `PPT_top` `74884614bfd964ade3b4045812b514a154740ec4` (remote) |
| 푸터 마스터 (1차 덱) | `PPT_low` `9cf40ec40a37c773f05174a6d87a58427e27cfe6` (remote) |

컴포넌트 마스터 안에 있는 `Frame 273`은 좌표계가 다르므로 **일괄 정렬 대상에서 제외**한다.

---

## 9. 하지 말 것

| 금지 | 이유 |
|---|---|
| `swapComponent()` 를 검증 없이 사용 | 레이어 이름이 다르면 **텍스트가 컴포넌트 기본값으로 날아간다.** 중첩 variant 인스턴스는 variant를 잃는다. 반드시 1개 파일럿 → 내용 손실 확인 → 자동 롤백 |
| 두께 0 노드에 `rescale()` | 조용히 무시된다 (§4) |
| `resetOverrides()` | 내부 기하는 복구되지만 **입력된 텍스트가 전부 사라진다** |
| 사용 중인 컴포넌트 마스터 삭제 | 인스턴스가 깨진다. 참조 0개를 먼저 확인. (참조 0이어도 API `remove()` 가 무시될 수 있음 → 사용자에게 Assets 패널에서 삭제하도록 안내) |
| 전 슬라이드 딥 `findAll()` | 60초 타임아웃 |
| 슬라이드 번호로 대상 지정 | 순서가 바뀐다. 헤더 제목으로 찾는다 |

**폰트**: `Noto Sans CJK KR` 은 이 환경에 없다. `loadFontAsync` 실패 시 `{ family: "Noto Sans KR", style: "Bold" }` 로 대체하고 대체 건수를 리포트한다.

---

## 10. 진행 방식

1. **선택은 못 읽는다** → 대상을 이름·제목·링크로 받는다.
2. **조사 먼저** → 대상 프레임의 자식 타입 구성(`INSTANCE`/`FRAME`/`VECTOR`/`TEXT`)을 확인해 자동 가능 여부를 판정하고 사용자에게 알린다.
3. **파일럿 1장** → 스크린샷으로 확인받는다.
4. **일괄 적용** → 청크 단위, 매 청크마다 배치/미매칭/오류 리포트.
5. **검증** → §6.
6. **되돌릴 수 있게** → 파괴적 변경 전 원본 값(텍스트·좌표)을 리포트에 남긴다.

중복 생성 주의: 덱에 이미 같은 제목·같은 자식 수의 슬라이드가 있으면 **새로 만들지 말고 기존 것을 갱신**한 뒤, 둘 다 필요한지 되묻는다.

---

## 11. 화면정의서 결손 감사 · 행 추가 (2026-08 추가)

### 11.1 결손 산출

슬라이드마다 **마커 수(`Number sign` 최상위 인스턴스)** 와 **스펙 리스트 행 수**를 비교한다.
기대값은 `행 수 = 마커 수 + 1` (index 0 = `설명` 헤더 행).

```js
const list = s.children.find(c =>
  c.type === "FRAME" && c.layoutMode === "VERTICAL" && c.x > 1000);
const marks = s.children.filter(c => c.name === "Number sign").length;
const deficit = marks - (list.children.length - 1);
```

`list`가 없는 슬라이드는 **결손이 아니라 다른 템플릿**(스크린샷 나열형·3화면 플로우형)일 수 있다.
숫자만 보고 결손으로 단정하지 말고 스크린샷으로 확인한다.

### 11.2 행 템플릿은 반드시 44/44 짜리를 복제한다

`PPT_form/list` 인스턴스는 **외곽 높이가 오버라이드로 고정**되어 있다.
3줄짜리 행(88px)을 복제해 1줄 텍스트를 넣으면
`Frame 270`은 88 그대로, 외곽은 44로 남아 **번호·기능·설명이 서로 어긋나게 렌더된다.**
`textAutoResize = "HEIGHT"` 로도 복구되지 않는다.

```js
const parts = r => { const f = r.children[0]; return {
  note: f.children[0].children[0].children[0],
  fun:  f.children[1].children[0].children[0],
  desc: f.children[2].children[0] }; };

// 깨끗한 1줄 템플릿만 고른다
const tpl = list.children.find(r =>
  Math.round(r.height) === 44 &&
  Math.round(r.children[0].height) === 44 &&
  (() => { try { parts(r); return true; } catch (e) { return false; } })());
```

- 리스트 안에 44/44 행이 없으면 **다른 슬라이드의 리스트에서 복제**해 온다 (같은 파일 내 clone 가능).
- 2줄 설명은 `\n` 만 넣으면 66px로 알아서 hug 된다.
- 행 index 0(`설명` 헤더)은 구조가 달라 `parts()` 가 던진다. 항상 try/catch.

**검증**: `list.children.filter(r => Math.abs(r.children[0].height - r.height) > 1).length === 0`

### 11.3 높이 한계 → 초과하면 슬라이드를 나눈다

리스트 상단 `y = 140`, 푸터 라인 `y = 1020` → **가용 높이 870px**.
44px 행 기준 최대 19행, 실제 혼합 기준 **15행 전후가 상한**.

초과하면 화면(좌/우) 기준으로 2장으로 나눈다. 마커 x좌표로 분류한다.

```js
const isScreen = c => c.width > 300 && c.width < 345 && c.height > 400;
const scr = A.children.filter(isScreen).sort((a,b) => a.x - b.x);
const THRESH = Math.round(scr[1].x - 60);          // 좌/우 경계

const side = {};                                    // 마커번호 → 좌측인가
for (const c of A.children)
  if (c.name === "Number sign") side[mnum(c)] = c.x < THRESH;

const B = A.clone();
A.parent.insertChild(A.parent.children.indexOf(A) + 1, B);
// A: side===true 인 행/마커/화면만 남김,  B: 나머지 + Toast
```

- **행 index가 아니라 마커 번호로 분류**한다 (번호가 건너뛰는 슬라이드가 있다).
- `clone()` 이 원본 앞에 삽입되는 경우가 있으므로 **삽입 후 순서를 반드시 재확인**한다.
- 화면이 1개만 남은 슬라이드는 `x = 535`, `y = 199` 로 옮겨 덱의 1화면 레이아웃과 맞춘다.
  (화면이 848px보다 높으면 `y = 172` 로 붙이고 푸터 침범을 리포트한다.)

### 11.4 폰트

이 실행 환경에는 **Pretendard가 없다** (사용 가능 패밀리 1938개 중 0건, 시스템 폰트 자체가 없는 클라우드 카탈로그).
따라서 새로 쓰는 행은 전부 `Noto Sans KR`이 된다. 이는 **되돌릴 수 있는 문제**로 취급한다:

1. 새 텍스트는 일관되게 `Noto Sans KR / Regular` 로 쓴다 (섞지 않는다).
2. 작업 종료 시 아래 스크립트를 사용자에게 전달해 **데스크톱 Figma에서 한 번에 복원**하게 한다.

```js
// Pretendard가 설치된 데스크톱 Figma 플러그인 콘솔에서 실행
const PRET = s => ({ family: "Pretendard", style: s });
const MAP  = { "Regular": "Regular", "Medium": "Medium", "Bold": "Bold" };
for (const slide of slides) {                       // 대상 슬라이드 배열
  const ts = []; (function w(n){ if (n.type === "TEXT") ts.push(n);
    if ('children' in n) n.children.forEach(w); })(slide);
  for (const t of ts) {
    if (t.fontName === figma.mixed) continue;
    if (t.fontName.family !== "Noto Sans KR") continue;
    const f = PRET(MAP[t.fontName.style] || "Regular");
    await figma.loadFontAsync(f);
    t.fontName = f;
  }
}
```

### 11.5 원본 덱의 기존 불일치는 고치지 말고 리포트한다

자동화 상세 슬라이드처럼 **기획자가 쓴 행 번호와 마커 위치가 어긋난 슬라이드**가 있다
(마커는 보이는 화면 기준, 행은 스크롤된 전체 내용 기준).
새 행은 **마커 위치 기준으로** 쓰되, 기존 행은 건드리지 않고 불일치 사실만 보고한다.
