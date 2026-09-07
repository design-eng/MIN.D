---
name: figma-instance-relink
description: Figma 디자인 파일에서 인스턴스가 메인 컴포넌트를 찾아가지 못할 때(끊긴 라이브러리 참조) 진단하고 로컬 컴포넌트로 재연결한다. "메인 컴포넌트로 이동이 안 됨", "인스턴스 컴포넌트와 연결", "라이브러리가 끊겼다", "컴포넌트 못 찾아감", "인스턴스 점검" 같은 요청에 사용한다. 끊긴 참조 3종 판별법, 재연결 전 백업(depth 12), 스왑 후 텍스트 복원, 인스턴스 하위 레이어 삭제 불가 한계, 원본 섹션에서 소실값 복구까지 다룬다.
---

# Figma 인스턴스 → 컴포넌트 재연결

## When to use

- 「메인 컴포넌트로 이동」이 동작하지 않는 인스턴스가 있을 때
- 라이브러리 파일이 삭제·게시 해제되어 참조가 끊겼을 때
- 한 화면 안에 로컬/라이브러리 인스턴스가 섞여 있을 때

---

## 1. ★ 끊긴 참조 판별 — 3종 세트

`remote: true` 라고 해서 정상이 아니다. **셋을 모두 확인**한다.

```js
const m = await inst.getMainComponentAsync();
m.remote                                   // true 인데
m.parent                                   // → null (고아 프록시)
await m.getPublishStatusAsync()            // → "UNPUBLISHED"
await figma.importComponentByKeyAsync(m.key)  // → 던짐: "Component with key ... not found"
```

셋 다 걸리면 **원본 라이브러리가 사라진 것**이다. 인스턴스는 렌더는 되지만 갱신도 이동도 안 된다.

### 섹션 전수 감사

```js
const inst={}, nonInst=[];
for (const c of section.children) {
  if (c.type === "INSTANCE") {
    const m = await c.getMainComponentAsync();
    const k = m ? `${m.name} | ${m.id} | remote:${m.remote}` : "MISSING";
    inst[k] = (inst[k]||0) + 1;
  } else if (c.type !== "GROUP") nonInst.push(c.id+"|"+c.type+"|"+c.name);
}
```
→ 다수가 쓰는 쪽이 사실상의 표준이다. **소수파를 다수파에 맞추는 게 보통 맞지만, 다수파가 끊겨 있으면 반대로 간다.**

---

## 2. ★ 재연결 전에 반드시 백업 — depth 12 이상

`swapComponent()` 는 **텍스트 오버라이드를 기본값으로 되돌린다.** 미리 다 떠 놓는다.

```js
const t=[];
(function w(x,d){ if(d>12) return;                    // ★ 7 로 하면 수치가 빠진다
  for(const q of x.children||[]){ if(q.type==="TEXT") t.push([q.name,q.characters]); else w(q,d+1); }
})(inst,0);
```

> **실패 사례**: depth 7 로 백업했다가 그래프 수치(`Price Text` / `Unit Text`, depth 9~10)가
> 중첩 인스턴스 안에 있어 누락 → 스왑 후 7장의 관리비·에너지 수치가 기본값으로 덮였다.

백업은 파일로 저장한다. 대화 컨텍스트는 날아간다.

---

## 3. 스왑 & 복원

```js
const target = await figma.getNodeByIdAsync("765:96366");   // 로컬 컴포넌트
inst.swapComponent(target);

// 이름으로 되돌리기 (컴포넌트마다 레이어명이 다르므로 매핑표가 필요)
const N=[]; (function w(x,d){ if(d>8) return;
  for(const q of x.children||[]){ if(q.type==="TEXT") N.push(q); else w(q,d+1); } })(inst,0);
const B={}; for(const n of N){ (B[n.name]=B[n.name]||[]).push(n); }
B["Tag Text"][0].characters = tag;
for (let i=0; i<(B["Date Text"]||[]).length; i++) { /* 행 단위로 채운다 */ }
```

**레이어명 매핑표를 먼저 만든다.** 예 (dash-card 라이브러리 → 로컬):

| 끊긴 쪽 | 로컬 쪽 |
|---|---|
| `분양중` | `Tag Text` |
| `전체보기` | `View All Label` |
| `2023.11.05 \| 13:45` | `Date and Time` (community2) / `Date Text` (community3) |
| `레슨변경` | `Button Text` |
| `text1` `highlight` `text2` `time` `title` `Subtitle 3~5` | 그대로 |

원본에 없던 행은 **빈 문자열 `""`** 로 둔다. 기본값(「14:00 미디어룸」 같은)을 남기면 가짜 데이터가 된다.

---

## 4. ★ 인스턴스 하위 레이어는 삭제할 수 없다

```
Error: in remove: Removing this node is not allowed
```

플러그인 API 는 인스턴스 안의 자식을 못 지운다. **Figma UI 에서는 된다.**
→ 로컬 컴포넌트가 2행 고정인데 원본이 1행이면 **빈 행이 남는다.** 텍스트만 비우고
**대상 목록을 사용자에게 넘긴다.** 임의로 숨기지 말 것(`visible=false` 금지).

---

## 5. 구조가 다르면 재연결이 파괴적이다 — 먼저 시험한다

이름이 같아도 세대가 다르면 행 수·버튼 구성이 다르다. **한 장으로 시험하고 손실을 계량해 보고**한 뒤 진행한다.

| 항목 | 스왑 전 | 스왑 후 |
|---|---|---|
| 행 수 | 1행 | 2행 |
| 내용 | 실제 데이터 | 기본값 |
| 추가 요소 | 없음 | 「레슨변경 >」 버튼 |
| 유지 | — | 태그·날짜만 |

선택지는 셋이다 — ① 원본 라이브러리 재게시(가장 깔끔) ② 로컬 컴포넌트에 배리언트 추가 후 연결 ③ 그냥 지금 연결(손실 감수).
**사용자에게 고르게 한다.**

---

## 6. 소실된 값은 원본 섹션에서 되찾는다

같은 파일 안에 **손대지 않은 이전 버전 섹션**이 남아 있는 경우가 많다.

```js
// 같은 페이지에서 같은 컴포넌트를 쓰는 인스턴스 찾기
async function scan(n,d){ if(d>4) return;
  for(const c of n.children||[]){
    if(c.id===workingSectionId) continue;
    if(c.type==="INSTANCE"){ const m=await c.getMainComponentAsync();
      if(m && /contents3/.test(m.name) && m.remote) found.push(c.id); }
    else if(["SECTION","FRAME","GROUP"].includes(c.type)) await scan(c,d+1);
  }
}
```
좌표(섹션 원점 기준 x,y)로 1:1 대응시켜 값을 옮긴다. 전수 diff 로 검증한다.

```js
const a = vals(orig).slice().sort().join("|");
const b = vals(mine).slice().sort().join("|");
if (a !== b) diff.push({id: mine.id, orig: vals(orig), now: vals(mine)});
```

---

## 7. 절대 금지

- **`visible = false`** — 숨긴 노드는 다시 못 찾는다. 비울 땐 `characters = ""`
- **백업 없이 `swapComponent()`** — 텍스트가 기본값으로 날아간다
- **미사용 컴포넌트·숨김 레이어 삭제** — 사용자가 직접 확인 후 처리
- **구조가 다른데 일괄 스왑** — 반드시 1장 시험 후 손실을 보고하고 승인받는다
- 숨김 레이어(`visible:false`)는 **컴포넌트 옵션이 꺼진 정상 상태**인 경우가 많다. 잔여물로 단정하지 말 것

---

## 8. 참조 (THE H 디자인 파일)

파일 `KGtQP6j8Tm1affFKSj7hGg` · 페이지 `THE H` = `8908:18388`

| 항목 | 노드 |
|---|---|
| 작업 섹션 `홈-최신정보 / 즐겨찾기` | `55420:46654` (46 인스턴스) |
| 원본(이전 버전) 같은 이름 섹션 | `8909:135300` (48 인스턴스) |
| 로컬 세트 `dash-card` | `55144:290440` — community `765:96352` / community2 `765:96359` / community3 `765:96366` |
| 로컬 `dash-card/contents3` | `765:96518` |
| 끊긴 라이브러리 키 | community2 `61f322619e7484125c89278fc7b9c0a049f6ed5a` · community3 `6b3fca0cb1c6abc5eb34cdeea360007513ab78b2` |

작업 결과: remote 0 / local 46. 빈 2행이 남은 21장은 사용자가 UI 에서 삭제해야 한다.
