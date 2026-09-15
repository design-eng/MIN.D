#!/usr/bin/env python3
"""듣는 사람 기록지 집계

  python3 scripts/집계-기록지.py <기록지가_있는_폴더> [출력.html]

폴더 안의 .xlsx 를 모두 읽어
  · 제출자(평가자) 명단
  · 발표자별 항목 평균 · 합계 평균 · 100점 환산 평균
  · 미제출자
를 A4 한 장짜리 HTML 로 낸다. 학생마다 파일을 조금씩 다르게 저장하므로
셀 좌표가 아니라 머리글 글자를 찾아 열을 잡는다.
"""
import sys, os, re, glob, statistics, html, datetime
from openpyxl import load_workbook

ITEMS = ["서비스", "일관성", "완결성", "장면", "작업량"]


def cells(ws):
    return [[("" if c.value is None else str(c.value)).strip() for c in row]
            for row in ws.iter_rows()]


def find(grid, *needles):
    """머리글 글자가 모두 들어 있는 행의 번호를 돌려준다."""
    for i, row in enumerate(grid):
        joined = " ".join(row)
        if all(n in joined for n in needles):
            return i
    return None


# 학생들이 "01이민서", "01반 이민서", "강 산", "20211469강산" 처럼 제각각 적는다.
# 숫자·공백·분반 표기를 떼어 같은 사람으로 모은다.
def norm(v):
    t = re.sub(r"\(.*?\)", "", str(v or ""))
    t = re.sub(r"\d+", "", t)
    t = t.replace("분반", "").replace("반", "")
    return re.sub(r"\s+", "", t).strip()


def num(v):
    try:
        f = float(str(v).replace(",", ""))
        return f
    except ValueError:
        return None


def read_one(path):
    """기록지 한 장 → {평가자, 학번, 점수: {발표자: [항목5개], ...}}"""
    ws = load_workbook(path, data_only=True).active
    grid = cells(ws)

    학번 = 이름 = ""
    # "2. 학번_이름으로 저장" 같은 안내문이 아니라 칸 값이 정확히 "학번"·"이름"인 행을 찾는다
    for row in grid:
        if "학번" in row or "이름" in row:
            for j, v in enumerate(row):
                if v == "학번" and not 학번:
                    학번 = next((x for x in row[j + 1:j + 4] if x), "")
                if v == "이름" and not 이름:
                    이름 = next((x for x in row[j + 1:j + 4] if x), "")
        if 학번 and 이름:
            break
    학번 = re.sub(r"\.0$", "", 학번)   # 엑셀이 숫자로 읽어 20221564.0 처럼 나오는 것을 다듬는다

    # 안내 문구("발표자마다 … 합계와 …")가 아니라 칸 값이 정확히 "발표자"인 행이 표 머리글이다
    h = None
    for i, row in enumerate(grid):
        if "발표자" in row and any("합계" in v for v in row):
            h = i
            break
    if h is None:
        raise ValueError("표 머리글(발표자·합계) 행을 찾지 못했습니다")
    head = grid[h]
    c발표자 = head.index("발표자")
    c합계 = next(j for j in range(c발표자 + 1, len(head)) if "합계" in head[j])
    항목열 = [j for j in range(c발표자 + 1, c합계)]
    if not 항목열:
        raise ValueError("항목 열을 찾지 못했습니다")

    # 표 본문은 머리글 바로 아래부터 No. 칸이 빈 줄을 만날 때까지다.
    # 그 아래 "가장 높은/낮은 발표" 구역도 01~07 번호를 쓰므로 여기서 끊지 않으면 섞인다.
    c번호 = c발표자 - 1 if c발표자 > 0 else None
    점수 = {}
    for row in grid[h + 1:]:
        번호 = row[c번호].strip() if (c번호 is not None and c번호 < len(row)) else ""
        if not 번호:
            break
        if len(row) <= c발표자:
            continue
        name = norm(row[c발표자])
        # 아래쪽 "가장 높은/낮은 발표" 구역의 안내 문장이 섞여 들어오는 파일이 있다.
        # 사람 이름은 길어야 다섯 자다.
        if not name or len(name) > 6:
            continue
        vals = [num(row[j]) if j < len(row) else None for j in 항목열]
        점수[name] = vals
    return {"파일": os.path.basename(path), "학번": 학번, "이름": 이름, "점수": 점수}


def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    folder = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(folder, "기록지_집계.html")

    paths = sorted(glob.glob(os.path.join(folder, "*.xlsx")))
    paths = [p for p in paths if not os.path.basename(p).startswith("~$")]
    if not paths:
        print("xlsx 가 없습니다:", folder); sys.exit(1)

    기록 = []
    오류 = []
    중복 = []
    본 = {}
    for p in paths:
        try:
            r = read_one(p)
        except Exception as e:
            오류.append((os.path.basename(p), str(e)))
            continue
        키 = (r["이름"] or r["파일"]).strip()
        채운수 = sum(1 for v in r["점수"].values() if v and any(x is not None for x in v))
        if 키 in 본:
            앞 = 기록[본[키]]
            앞채움 = sum(1 for v in 앞["점수"].values() if v and any(x is not None for x in v))
            중복.append((키, 앞["파일"] if 앞채움 >= 채운수 else r["파일"]))
            if 채운수 > 앞채움:
                기록[본[키]] = r
            continue
        본[키] = len(기록)
        기록.append(r)

    # 한 장에만 나오는 이름이 흔한 이름과 한 글자만 다르면 오타로 보고 합친다
    from collections import Counter
    등장 = Counter(n for r in 기록 for n in r["점수"])
    흔한 = [n for n, c in 등장.items() if c >= 5]
    합친것 = []
    for 변형, c in list(등장.items()):
        if c > 1 or 변형 in 흔한:
            continue
        for 기준이름 in 흔한:
            if len(기준이름) == len(변형) and sum(a != b for a, b in zip(기준이름, 변형)) == 1:
                for r in 기록:
                    if 변형 in r["점수"]:
                        vals = r["점수"].pop(변형)
                        r["점수"].setdefault(기준이름, vals)
                합친것.append((변형, 기준이름))
                break

    # 분반이 둘이라 기록지마다 발표자 목록이 다르다. 모든 기록지의 이름을 합쳐 쓰고,
    # 몇 명이 평가했는지(평가수)로 어느 분반인지 구분되게 둔다.
    발표자, 본 = [], set()
    for r in 기록:
        for n in r["점수"]:
            if n not in 본:
                본.add(n); 발표자.append(n)

    범위밖 = []
    for r in 기록:
        for name, vals in r["점수"].items():
            for i, v in enumerate(vals):
                if v is not None and not (1 <= v <= 5):
                    범위밖.append((r["이름"] or r["파일"], name, v))
                    vals[i] = None

    표 = []
    for name in 발표자:
        칸 = [[] for _ in ITEMS]
        합계들 = []
        for r in 기록:
            vals = r["점수"].get(name)
            if not vals or all(v is None for v in vals):
                continue
            채움 = [v for v in vals if v is not None]
            for i, v in enumerate(vals):
                if v is not None and i < len(칸):
                    칸[i].append(v)
            if len(채움) == len(ITEMS):
                합계들.append(sum(채움))
        평균항목 = [round(statistics.mean(c), 2) if c else None for c in 칸]
        평균합계 = round(statistics.mean(합계들), 2) if 합계들 else None
        표.append({
            "발표자": name, "항목": 평균항목, "합계": 평균합계,
            "환산": round(평균합계 * 4, 1) if 평균합계 is not None else None,
            "평가수": len(합계들),
        })

    채점된 = [r for r in 표 if r["환산"] is not None]
    전체평균 = round(statistics.mean([r["환산"] for r in 채점된]), 1) if 채점된 else None

    제출자 = [(r["학번"], r["이름"] or r["파일"]) for r in 기록]
    제출이름 = {n for _, n in 제출자}
    미제출 = [n for n in 발표자 if n not in 제출이름]

    e = html.escape
    rows = "".join(
        f"<tr><td class='p'>{i+1:02d}</td><td class='n'>{e(r['발표자'])}</td>"
        + "".join(f"<td>{'' if v is None else v}</td>" for v in r["항목"])
        + f"<td class='s'>{'' if r['합계'] is None else r['합계']}</td>"
        f"<td class='c'>{'' if r['환산'] is None else r['환산']}</td>"
        f"<td class='k'>{r['평가수']}</td></tr>"
        for i, r in enumerate(sorted(표, key=lambda x: (x["환산"] is None, -(x["환산"] or 0)))))

    제출목록 = " · ".join(f"<b>{e(n)}</b>{(' ' + e(h)) if h else ''}" for h, n in sorted(제출자, key=lambda x: x[1]))
    미제출목록 = " · ".join(e(n) for n in 미제출) or "없음"
    오류목록 = " · ".join(f"{e(f)} ({e(m)})" for f, m in 오류)

    doc = f"""<meta charset="utf-8"><title>기록지 집계</title><style>
 @page {{ size: A4; margin: 10mm 11mm; }}
 body {{ font-family: Pretendard, sans-serif; color:#111; font-size:7.4pt; line-height:1.26; }}
 .rail {{ display:flex; justify-content:space-between; font-size:7.6pt; letter-spacing:1.6px; color:#8A8A8A; }}
 .rule {{ border-top:2px solid #111; margin:5px 0 10px; }}
 h1 {{ font-size:15pt; font-weight:600; margin:0 0 3px; }}
 .meta {{ color:#6E6E6E; margin-bottom:7px; }}
 h2 {{ font-size:8pt; letter-spacing:1.6px; color:#8A8A8A; font-weight:600;
       border-bottom:1px solid #111; padding-bottom:3px; margin:0 0 6px; }}
 table {{ width:100%; border-collapse:collapse; }}
 th, td {{ padding:0.6px 5px 0.6px 0; border-bottom:1px solid #EDEDED; text-align:right;
           font-variant-numeric:tabular-nums; }}
 th {{ font-size:7.6pt; color:#6E6E6E; font-weight:500; border-bottom:1px solid #111; }}
 th:nth-child(2), td.n {{ text-align:left; }}
 td.p {{ color:#9B9B9B; }} td.n {{ font-weight:600; }}
 td.s {{ font-weight:600; }} td.c {{ font-weight:700; font-size:9pt; }}
 td.k {{ color:#9B9B9B; }}
 .two {{ margin-top:9px; }}
 .two section {{ margin-bottom:6px; }}
 .list {{ line-height:1.5; }}
 .note {{ margin-top:7px; padding-top:5px; border-top:1.4px solid #111; color:#6E6E6E;
          font-size:6.8pt; line-height:1.34; }}
</style>
<div class="rail"><span>서비스디자인 · 듣는 사람 기록지</span><span>집계 {datetime.date.today()}</span></div>
<div class="rule"></div>
<h1>발표 평가 집계</h1>
<div class="meta">제출 {len(기록)}장 · 발표자 {len(발표자)}명 · 채점된 발표자 {len(채점된)}명
{f' · 전체 평균 {전체평균}점' if 전체평균 is not None else ''}</div>

<h2>발표자별 평균 — 환산 점수 높은 순</h2>
<table>
<tr><th></th><th>발표자</th><th>서비스</th><th>일관성</th><th>완결성</th><th>장면</th><th>작업량</th>
    <th>합계/25</th><th>환산/100</th><th>평가수</th></tr>
{rows}
</table>

<div class="two">
  <section><h2>제출자 {len(기록)}명</h2><div class="list">{제출목록}</div></section>
  <section><h2>미제출 {len(미제출)}명 — 발표자 명단과 대조</h2><div class="list">{미제출목록}</div></section>
  {f'<section><h2>읽지 못한 파일</h2><div class="list">{오류목록}</div></section>' if 오류 else ''}
</div>

<div class="note">{('오타로 보이는 이름을 합쳤습니다 — ' + ' · '.join(f'{a} → {b}' for a, b in 합친것) + '. ') if 합친것 else ''}{(f'1~5 밖의 값 {len(범위밖)}건은 빼고 계산했습니다 — ' + ' · '.join(f'{a}→{b} {c:g}' for a, b, c in 범위밖[:6]) + '. ') if 범위밖 else ''}항목 평균은 그 항목을 채운 기록지, 합계·환산 평균과 평가수는
다섯 항목을 모두 채운 기록지 기준입니다. 미제출은 이름 표기가 다르면 어긋날 수 있습니다.</div>
"""
    with open(out, "w", encoding="utf-8") as f:
        f.write(doc)
    print("생성:", out)
    print(f"  제출 {len(기록)}장 · 발표자 {len(발표자)}명 · 채점 {len(채점된)}명"
          + (f" · 전체 평균 {전체평균}" if 전체평균 is not None else ""))
    if 중복:
        print("  같은 사람이 여러 번 제출(뒤엣것 제외):",
              ", ".join(f"{n}({os.path.basename(f)})" for n, f in 중복))
    if 오류:
        print("  읽지 못한 파일:", ", ".join(f for f, _ in 오류))


if __name__ == "__main__":
    main()
