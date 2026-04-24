import re, glob, os

pages = glob.glob('**/*.html', recursive=True) + ['index.html']
pages = list(set(p for p in pages if os.path.exists(p)))

utf8_no_bom = 'utf-8-sig'  # lê e remove BOM automaticamente

for page in pages:
    with open(page, 'r', encoding=utf8_no_bom) as f:
        content = f.read()
    original = content

    # Remove nav (minificado ou não)
    content = re.sub(r'<nav\b[^>]*>.*?</nav>', '', content, flags=re.DOTALL)
    # Remove nav-mobile-menu
    content = re.sub(r'<div[^>]+class="nav-mobile-menu"[^>]*>.*?</div>', '', content, flags=re.DOTALL)
    # Remove footer
    content = re.sub(r'<footer\b[^>]*>.*?</footer>', '', content, flags=re.DOTALL)
    # Remove script inline hamburger
    content = re.sub(r'<script>\s*(?:const|var|let)\s+hamburger.*?</script>', '', content, flags=re.DOTALL)

    # Insere placeholders
    if 'site-header' not in content:
        content = content.replace('<body', '<body', 1)
        # Insere após o <body...>
        content = re.sub(r'(<body[^>]*>)', r'\1\n<div id="site-header"></div>', content)

    if 'site-footer' not in content:
        content = content.replace('</body>', '<div id="site-footer"></div>\n</body>', 1)

    # Adiciona components.js
    if 'components.js' not in content:
        content = content.replace('</body>', '<script src="/assets/js/components.js"></script>\n</body>', 1)

    # Salva SEM BOM
    if content != original:
        with open(page, 'w', encoding='utf-8') as f:
            f.write(content)
        print('OK:', page)
    else:
        print('--:', page)
