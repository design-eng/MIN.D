#!/usr/bin/env python3
"""장표에 들어간 글자가 PDF 에 전부 나왔는지 대조한다.

  python3 check.py <PDF 가 있는 폴더> <pptx ...>

슬라이드 XML 의 <a:t> 를 모아 글자 다중집합을 만들고, 같은 이름의 PDF 에서
뽑은 글자 다중집합과 비교한다. 노트(대본)는 제외한다.
"""
import sys, os, re, zipfile, subprocess
from collections import Counter

def pptx_chars(path):
    z = zipfile.ZipFile(path)
    names = sorted(n for n in z.namelist()
                   if re.match(r"ppt/slides/slide\d+\.xml$", n))
    txt = []
    for n in names:
        xml = z.read(n).decode("utf-8")
        txt += re.findall(r"<a:t>(.*?)</a:t>", xml, re.S)
    s = "".join(txt)
    for a, b in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&apos;", "'")):
        s = s.replace(a, b)
    return len(names), s

def pdf_chars(path):
    out = subprocess.run(["pdftotext", "-q", path, "-"], capture_output=True)
    return out.stdout.decode("utf-8", "replace")

def norm(s):
    return Counter(re.sub(r"\s+", "", s))

bad = 0
pdfdir = sys.argv[1]
for pptx in sys.argv[2:]:
    base = os.path.splitext(os.path.basename(pptx))[0]
    pdf = os.path.join(pdfdir, base + ".pdf")
    if not os.path.exists(pdf):
        print(f"[건너뜀] PDF 없음: {pdf}"); bad += 1; continue
    n, ptext = pptx_chars(pptx)
    a, b = norm(ptext), norm(pdf_chars(pdf))
    missing = a - b            # 장표에 있는데 PDF 에 없는 글자
    extra = b - a              # PDF 에만 있는 글자
    tag = "OK " if not missing else "!! "
    print(f"{tag}{base}  슬라이드 {n}장 · 글자 {sum(a.values())}자")
    if missing:
        print("   빠진 글자:", "".join(f"{c}×{k} " for c, k in missing.most_common(20)))
        bad += 1
    if extra:
        print("   PDF 에만:", "".join(f"{c}×{k} " for c, k in extra.most_common(10)))
print("결과:", "이상 없음" if not bad else f"확인 필요 {bad}건")
sys.exit(1 if bad else 0)
