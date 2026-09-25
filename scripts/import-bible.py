"""Create small, self-hosted chapter data from eBible's public-domain fraLSG HTML zip.

Usage: python scripts/import-bible.py /path/to/fraLSG_html.zip
Requires lxml only when regenerating the already included JSON files.
"""

import json
import re
import sys
import zipfile
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "public" / "bible-text"
CONTINUATION_CLASSES = {"p", "q", "q1", "q2", "q3", "m", "pi", "pi1", "pi2", "li", "li1", "li2", "d"}


def tokens(node):
    classes = node.get("class", "").split()
    if "notemark" in classes or "popup" in classes or "footnote" in classes:
        return
    if "verse" in classes:
        match = re.fullmatch(r"V(\d+)", node.get("id", ""))
        if match:
            yield ("verse", int(match.group(1)))
        return
    if node.text:
        yield ("text", node.text)
    for child in node:
        yield from tokens(child)
        if child.tail:
            yield ("text", child.tail)


def chapter_verses(raw, filename):
    document = html.fromstring(raw)
    main = document.xpath('//div[contains(concat(" ", normalize-space(@class), " "), " main ")]')[0]
    verses = {}
    current = None
    for block in main:
        has_verse = bool(block.xpath('.//span[contains(concat(" ",normalize-space(@class)," ")," verse ")]'))
        if not has_verse and (current is None or block.get("class", "") not in CONTINUATION_CLASSES):
            continue
        if current is not None:
            verses[current].append(" ")  # Keep paragraph and poetry lines separate.
        for kind, value in tokens(block):
            if kind == "verse":
                current = value
                if current in verses:
                    raise ValueError(f"Repeated verse in {filename}: {current}")
                verses[current] = []
            elif current is not None:
                verses[current].append(value)
    if not verses or sorted(verses) != list(range(1, max(verses) + 1)):
        raise ValueError(f"Missing verses in {filename}")
    result = [re.sub(r"\s+", " ", "".join(verses[number])).strip() for number in sorted(verses)]
    if any(not verse for verse in result):
        raise ValueError(f"Empty verse in {filename}")
    return result


def main(path):
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path) as archive:
        index = html.fromstring(archive.read("index.htm"))
        books = []
        total_chapters = total_verses = 0
        for link in index.xpath('//div[contains(@class,"bookList")]//a'):
            match = re.fullmatch(r"([A-Z0-9]{3})\d+\.htm", link.get("href", ""))
            if not match:
                continue
            code = match.group(1)
            filenames = [name for name in archive.namelist() if re.fullmatch(code + r"\d{2,3}\.htm", name) and int(name[3:-4]) > 0]
            filenames.sort(key=lambda name: int(name[3:-4]))
            numbers = [int(name[3:-4]) for name in filenames]
            if numbers != list(range(1, len(numbers) + 1)):
                raise ValueError(f"Missing chapters in {code}")
            chapters = [chapter_verses(archive.read(name), name) for name in filenames]
            (OUTPUT / f"{code}.json").write_text(json.dumps(chapters, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
            books.append({"code": code, "title": link.text_content().strip(), "chapters": len(chapters), "testament": "Ancien Testament" if len(books) < 39 else "Nouveau Testament"})
            total_chapters += len(chapters)
            total_verses += sum(map(len, chapters))
    if len(books) != 66 or total_chapters != 1189 or total_verses < 30000:
        raise ValueError(f"Unexpected corpus: {len(books)} books, {total_chapters} chapters, {total_verses} verses")
    (ROOT / "app" / "bible" / "books.ts").write_text("// Generated from the public-domain Louis Segond 1910 edition.\nexport const bibleBooks = " + json.dumps(books, ensure_ascii=False, separators=(",", ":")) + " as const;\n", encoding="utf-8")
    print(f"Created {len(books)} books, {total_chapters} chapters, {total_verses} verses")


if __name__ == "__main__":
    main(sys.argv[1])
