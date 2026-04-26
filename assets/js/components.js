// ─── GELOCCI COMPONENTS LOADER ───────────────────────────────
// Carrega header e footer dinamicamente em todas as páginas.
// Uso: adicionar <script src="/assets/js/components.js"></script>
// antes do </body> de cada página interna.

(function() {

  // Detecta a profundidade da página para montar o path correto
  // Ex: /calculadoras/simulador-inss/ → base = ../../
  function getBasePath() {
    const depth = window.location.pathname
      .replace(/\/$/, '')
      .split('/')
      .filter(Boolean).length;
    return depth === 0 ? '/' : '../'.repeat(depth);
  }

  const base = getBasePath();

  // ── Carrega o header ────────────────────────────────────────
  function carregarHeader() {
    const placeholder = document.getElementById('site-header');
    if (!placeholder) return;

    fetch(base + 'components/header.html')
      .then(r => r.text())
      .then(html => {
        placeholder.outerHTML = html;
        inicializarNav();
        if (window.gelocciRefreshThemeToggle) {
          window.gelocciRefreshThemeToggle();
        }
      })
      .catch(() => console.warn('Gelocci: header não carregado'));
  }

  // ── Carrega o footer ────────────────────────────────────────
  function carregarFooter() {
    const placeholder = document.getElementById('site-footer');
    if (!placeholder) return;

    fetch(base + 'components/footer.html')
      .then(r => r.text())
      .then(html => {
        placeholder.outerHTML = html;
      })
      .catch(() => console.warn('Gelocci: footer não carregado'));
  }

  // ── Inicializa o comportamento do nav (hamburger) ───────────
  function inicializarNav() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    window.closeMobileMenu = function() {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
    };
  }

  // ── Executa ao carregar o DOM ────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      carregarHeader();
      carregarFooter();
    });
  } else {
    carregarHeader();
    carregarFooter();
  }

})();
