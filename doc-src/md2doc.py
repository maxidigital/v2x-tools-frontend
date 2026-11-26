"""Converts doc-src/faq.md and doc-src/changelog.md into pages in the docs style (public/doc/*.html).

Usage, from the repo root:
    python3 doc-src/md2doc.py doc-src/faq.md public/doc/faq.html faq
    python3 doc-src/md2doc.py doc-src/changelog.md public/doc/changelog.html changelog

Supports what these files use: ## / ### headings, paragraphs, "-" lists (2 spaces per level),
"> " notes, **bold**, `code` and [links](url). The nav must match the other /doc pages.
"""
import html, re, sys

NAV = [("/doc/", "Overview"), ("/doc/web-tools.html", "Web tools"), ("/doc/messages.html", "Building messages"),
       ("/doc/mcp.html", "AI assistants (MCP)"), ("/doc/api.html", "API reference"),
       ("/doc/faq.html", "FAQ"), ("/doc/changelog.html", "What's new")]

def slug(t):
    t = re.sub(r"[`*?]", "", t.lower())
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", t))

def fix_href(h):
    h = re.sub(r"^https://(v2x\.tools|tools\.asn1click\.com)/doc/", "/doc/", h)  # same-site links stay relative
    h = re.sub(r"^\./changelog", "/doc/changelog.html", h)
    h = re.sub(r"^\./faq", "/doc/faq.html", h)
    return h

def inline(t):
    out, last = [], 0
    for m in re.finditer(r"(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))", t):
        out.append(html.escape(t[last:m.start()], quote=False))
        tok = m.group(0)
        if tok.startswith("`"):
            out.append("<code>" + html.escape(tok[1:-1], quote=False) + "</code>")
        elif tok.startswith("**"):
            out.append("<strong>" + inline(tok[2:-2]) + "</strong>")
        else:
            label, href = re.match(r"^\[([^\]]+)\]\(([^)\s]+)\)$", tok).groups()
            out.append(f'<a href="{html.escape(fix_href(href))}">{inline(label)}</a>')
        last = m.end()
    out.append(html.escape(t[last:], quote=False))
    return "".join(out)

def ul(lines, ind="    "):
    # nested "-" lists, 2 spaces per level
    items = []
    stack = [(-1, items)]
    for l in lines:
        m = re.match(r"^(\s*)- (.*)$", l)
        if not m:
            stack[-1][1][-1][0] += " " + l.strip(); continue
        d = len(m.group(1))
        while len(stack) > 1 and d <= stack[-1][0]: stack.pop()
        it = [m.group(2), []]
        stack[-1][1].append(it); stack.append((d, it[1]))
    def render(its, pad):
        s = pad + "<ul>\n"
        for text, kids in its:
            s += pad + "    <li>" + inline(text)
            s += ("\n" + render(kids, pad + "        ") + pad + "    </li>\n") if kids else "</li>\n"
        return s + pad + "</ul>\n"
    return render(items, ind)

def convert(md, title, subtitle, active, description, toc):
    md = re.sub(r"<!--[\s\S]*?-->", "", md)
    md = re.sub(r"^(#{1,4} .*)$", r"\n\1\n", md, flags=re.M)
    blocks = [b.strip("\n") for b in re.split(r"\n\s*\n", md) if b.strip()]
    body, heads = [], []
    for b in blocks:
        lines = b.split("\n")
        h = re.match(r"^(#{1,4}) (.*)$", lines[0])
        if h and len(lines) == 1:
            lvl, t = len(h.group(1)), h.group(2)
            if lvl == 1: continue
            heads.append((lvl, t, slug(t)))
            body.append(f'    <h{lvl} id="{slug(t)}">{inline(t)}</h{lvl}>')
        elif all(l.startswith(">") for l in lines):
            body.append('    <div class="note">' + inline(" ".join(re.sub(r"^>\s?", "", l) for l in lines)) + "</div>")
        elif re.match(r"^\s*- ", lines[0]):
            body.append(ul(lines).rstrip("\n"))
        else:
            body.append("    <p>" + inline(" ".join(lines)) + "</p>")
    # the first paragraph (intro) goes above the index
    intro = ""
    if toc and body and body[0].startswith("    <p>"):
        intro = body.pop(0) + "\n\n"
    nav = " ".join(f'<a href="{h}"' + (' class="active"' if h == active else "") + f">{n}</a>" for h, n in NAV)
    toc_html = ""
    if toc:
        parts = []
        for lvl, t, i in heads:
            if lvl == 2: parts.append(f'        <h4><a href="#{i}">{inline(t)}</a></h4>')
            else: parts.append(f'        <a href="#{i}">{inline(t)}</a>')
        toc_html = '    <div class="toc faq-toc">\n' + "\n".join(parts) + "\n    </div>\n\n"
    extra_css = ("\n    <style>.faq-toc h4:first-child { margin-top: 0; } .faq-toc a { display: block; margin: 2px 0; } .faq-toc h4 a { color: #94a3b8; }</style>"
                 if toc else "")
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)} — asn1click docs</title>
    <meta name="description" content="{html.escape(description)}">
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/doc/doc.css">{extra_css}
    <script defer src="https://cloud.umami.is/script.js" data-exclude-hash="true" data-website-id="18b30b9d-90d2-4f01-9668-36985baa91c3"></script>
</head>
<body>
<div class="container">
    <div class="wordmark">asn1click <span>docs</span></div>
    <div class="subtitle">{html.escape(subtitle)}</div>
    <nav class="nav">{nav}</nav>

""" + intro + toc_html + "\n\n".join(body) + """

    <footer>
        asn1click — <a href="/">Web tools</a> · <a href="https://asn1click.com">asn1click.com</a> · a product of <a href="https://v2xnow.de">v2xnow</a> · Hosted in the EU.
    </footer>
</div>
</body>
</html>
"""

if __name__ == "__main__":
    src, out, kind = sys.argv[1], sys.argv[2], sys.argv[3]
    md = open(src, encoding="utf-8").read()
    if kind == "faq":
        page = convert(md, "FAQ", "Questions and answers", "/doc/faq.html",
                       "asn1click FAQ: privacy, supported ETSI messages, SAE J2735 vs ETSI DSRC, encodings (UPER, JER, XER), asn1c/Vanetza compatibility and known limitations.", True)
    else:
        page = convert(md, "What's new", "Changes to asn1click: web tools, API and MCP", "/doc/changelog.html",
                       "asn1click changelog: new ETSI message versions, encoding fixes, JER/XER changes and new API and MCP features.", False)
    open(out, "w", encoding="utf-8").write(page)
