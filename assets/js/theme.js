// ─── GELOCCI THEME TOGGLE ────────────────────────────────────
// Tema escuro é o padrão. A preferência do usuário é preservada no localStorage.
// O Chart.js lê as cores das variáveis CSS, evitando divergência entre tema claro/escuro.

(function () {
  const STORAGE_KEY = 'gelocci-theme';
  const LIGHT_CLASS = 'light-mode';

  function getStoredPreference() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }

  function getPreference() {
    return getStoredPreference() || 'dark';
  }

  function getThemeFromDom() {
    return document.documentElement.classList.contains(LIGHT_CLASS) ? 'light' : 'dark';
  }

  function readCssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function getChartColors() {
    // Cores explícitas e com alto contraste. Não dependem de CSS cacheado.
    const isLight = getThemeFromDom() === 'light';
    return isLight
      ? {
          text: '#24332D',
          grid: 'rgba(36, 51, 45, 0.14)',
          border: 'rgba(36, 51, 45, 0.28)',
          tooltipBg: '#FFFFFF',
          tooltipBorder: 'rgba(36, 51, 45, 0.22)',
          tooltipTitle: '#111827',
          tooltipBody: '#24332D'
        }
      : {
          text: '#DDE7E2',
          grid: 'rgba(221, 231, 226, 0.13)',
          border: 'rgba(221, 231, 226, 0.26)',
          tooltipBg: '#111815',
          tooltipBorder: 'rgba(221, 231, 226, 0.22)',
          tooltipTitle: '#FFFFFF',
          tooltipBody: '#DDE7E2'
        };
  }

  function applyChartDefaults() {
    if (!window.Chart) return;
    const c = getChartColors();
    Chart.defaults.color = c.text;
    Chart.defaults.borderColor = c.grid;
    if (Chart.defaults.plugins && Chart.defaults.plugins.legend && Chart.defaults.plugins.legend.labels) {
      Chart.defaults.plugins.legend.labels.color = c.text;
    }
  }

  function applyThemeToOneChart(chart) {
    if (!chart || !chart.options) return;
    const c = getChartColors();

    chart.options.color = c.text;
    chart.options.borderColor = c.grid;

    chart.options.plugins = chart.options.plugins || {};
    chart.options.plugins.tooltip = chart.options.plugins.tooltip || {};
    Object.assign(chart.options.plugins.tooltip, {
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      titleColor: c.tooltipTitle,
      bodyColor: c.tooltipBody
    });

    chart.options.plugins.legend = chart.options.plugins.legend || {};
    chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
    chart.options.plugins.legend.labels.color = c.text;

    if (chart.options.scales) {
      Object.keys(chart.options.scales).forEach(axis => {
        const scale = chart.options.scales[axis];
        if (!scale) return;
        scale.ticks = scale.ticks || {};
        scale.grid = scale.grid || {};
        scale.border = scale.border || {};
        scale.title = scale.title || {};
        scale.ticks.color = c.text;
        scale.ticks.backdropColor = 'transparent';
        scale.grid.color = c.grid;
        scale.border.color = c.border;
        scale.title.color = c.text;
        if (scale.pointLabels) scale.pointLabels.color = c.text;
      });
    }

    if (typeof chart.update === 'function') chart.update('none');
  }

  function getAllCharts() {
    const charts = new Set();
    if (window.Chart && typeof Chart.getChart === 'function') {
      document.querySelectorAll('canvas').forEach(canvas => {
        const chart = Chart.getChart(canvas);
        if (chart) charts.add(chart);
      });
    }
    ['investmentChart', 'retirementChart'].forEach(name => {
      if (window[name]) charts.add(window[name]);
    });
    return Array.from(charts);
  }

  function refreshAllCharts() {
    applyChartDefaults();
    getAllCharts().forEach(chart => applyThemeToOneChart(chart));
  }

  function scheduleChartRefresh() {
    refreshAllCharts();
    requestAnimationFrame(refreshAllCharts);
    setTimeout(refreshAllCharts, 80);
  }

  function updateFavicon(theme) {
    const link = document.querySelector("link[rel='icon']");
    if (!link) return;
    const depth = window.location.pathname.replace(/\/$/, '').split('/').filter(Boolean).length;
    const base = depth === 0 ? '' : '../'.repeat(depth);
    link.href = theme === 'light'
      ? base + 'assets/imagens/favicon.ico'
      : base + 'assets/imagens/favicon-white.ico';
  }

  function updateToggleButtons(theme) {
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const icon = btn.querySelector('.theme-toggle-icon');
      const label = btn.querySelector('.theme-toggle-label');
      if (icon) icon.textContent = theme === 'light' ? '🌙' : '☀️';
      if (label) label.textContent = theme === 'light' ? 'Tema escuro' : 'Tema claro';
      btn.setAttribute('aria-label', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
      btn.setAttribute('title', theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro');
    });
  }

  function setDomTheme(theme) {
    const normalizedTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle(LIGHT_CLASS, normalizedTheme === 'light');
    document.documentElement.setAttribute('data-theme', normalizedTheme);
    return normalizedTheme;
  }

  function applyTheme(theme) {
    const normalizedTheme = setDomTheme(theme);
    updateToggleButtons(normalizedTheme);
    updateFavicon(normalizedTheme);
    scheduleChartRefresh();
    window.dispatchEvent(new CustomEvent('gelocci:themechange', { detail: { theme: normalizedTheme } }));
  }

  function toggleTheme() {
    const next = getThemeFromDom() === 'light' ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  function init() {
    applyTheme(getPreference());
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('.theme-toggle');
      if (btn) toggleTheme();
    });
  }

  setDomTheme(getPreference());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.gelocciToggleTheme = toggleTheme;
  window.gelociToggleTheme = toggleTheme;
  window.gelocciRefreshThemeToggle = function () { updateToggleButtons(getThemeFromDom()); };
  window.gelocciGetTheme = getThemeFromDom;
  window.gelocciGetChartColors = getChartColors;
  window.gelocciApplyThemeToChart = applyThemeToOneChart;
  window.gelocciRefreshAllCharts = scheduleChartRefresh;
})();
