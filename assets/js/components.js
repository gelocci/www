
// ── Histórico de simulações ──────────────────────────────────────────────────

const HIST_KEY = 'gelocci_historico';
const HIST_MAX = 10;

function gelocciTempoRelativo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)     return 'agora';
  if (diff < 3600)   return 'há ' + Math.floor(diff/60) + ' min';
  if (diff < 86400)  return 'há ' + Math.floor(diff/3600) + 'h';
  if (diff < 604800) return 'há ' + Math.floor(diff/86400) + ' dia' + (Math.floor(diff/86400)>1?'s':'');
  return new Date(ts).toLocaleDateString('pt-BR');
}

function gelocciGetHistorico() {
  try { return JSON.parse(localStorage.getItem(HIST_KEY) || '[]'); }
  catch(e) { return []; }
}

function gelocciRenderHistorico() {
  const hist  = gelocciGetHistorico();
  const list  = document.getElementById('navHistList');
  const empty = document.getElementById('navHistEmpty');
  const count = document.getElementById('navHistCount');
  if (!list) return;

  if (hist.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    if (count) count.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  if (count) { count.textContent = hist.length; count.style.display = 'inline'; }

  list.innerHTML = hist.map(h =>
    '<a class="nav-hist-item" href="' + h.url + '" onclick="document.getElementById(\'navHistDropdown\').classList.remove(\'open\')">' +
      '<div class="nav-hist-item-left">' +
        '<div class="nav-hist-item-tag">' + h.calculadora + '</div>' +
        '<div class="nav-hist-item-value">' + h.valor + '</div>' +
        '<div class="nav-hist-item-params">' + h.params + '</div>' +
      '</div>' +
      '<div class="nav-hist-item-time">' + gelocciTempoRelativo(h.ts) + '</div>' +
    '</a>'
  ).join('');
}

function gelocciSalvarSimulacao(entrada) {
  const hist = gelocciGetHistorico();
  hist.unshift({ ...entrada, ts: Date.now() });
  if (hist.length > HIST_MAX) hist.splice(HIST_MAX);
  localStorage.setItem(HIST_KEY, JSON.stringify(hist));
  gelocciRenderHistorico();
}

function gelocciLimparHistorico() {
  localStorage.removeItem(HIST_KEY);
  gelocciRenderHistorico();
  const dd = document.getElementById('navHistDropdown');
  if (dd) dd.classList.remove('open');
}

function gelocciToggleHistorico(e) {
  e.stopPropagation();
  const dd = document.getElementById('navHistDropdown');
  if (dd) dd.classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const dd  = document.getElementById('navHistDropdown');
  const btn = document.getElementById('navHistBtn');
  if (dd && !dd.contains(e.target) && btn && !btn.contains(e.target)) {
    dd.classList.remove('open');
  }
});

window.gelocciSalvarSimulacao = gelocciSalvarSimulacao;
window.gelocciLimparHistorico = gelocciLimparHistorico;
window.gelocciToggleHistorico = gelocciToggleHistorico;
window.gelocciRenderHistorico = gelocciRenderHistorico;

// Processar fila de chamadas pendentes
if (window._gelocciHistFila && window._gelocciHistFila.length) {
  window._gelocciHistFila.forEach(function(e) { gelocciSalvarSimulacao(e); });
  window._gelocciHistFila = [];
}

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
        if (window.gelocciRenderHistorico) window.gelocciRenderHistorico();
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
