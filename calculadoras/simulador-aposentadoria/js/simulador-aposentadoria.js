/**
 * simulador-aposentadoria.js
 * Gelocci — Simulador de Aposentadoria por Renda Desejada
 * Lógica separada da apresentação (index.html)
 */

/* ── Utilitários ──────────────────────────────────────────── */
function showError(msg) {
  var b = document.getElementById('errorBanner');
  b.textContent = msg;
  b.classList.add('show');
}

function clearError() {
  var b = document.getElementById('errorBanner');
  b.textContent = '';
  b.classList.remove('show');
}

function fmt(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtN(v, d) {
  return v.toLocaleString('pt-BR', {
    minimumFractionDigits: d || 0,
    maximumFractionDigits: d || 0
  });
}

function parseField(id) {
  return parseFloat(
    document.getElementById(id).value.replace(/\./g, '').replace(',', '.')
  );
}

function anualizadaParaMensal(a) {
  return Math.pow(1 + a, 1 / 12) - 1;
}

function isLightMode() {
  return document.documentElement.classList.contains('light-mode')
    || document.documentElement.getAttribute('data-theme') === 'light';
}

/* ── Gráfico ──────────────────────────────────────────────── */
function buildChartOptions(labels, dataPatrimony, dataInvested) {
  var light = isLightMode();
  return {
    chart: {
      type: 'area', height: 420, background: 'transparent',
      toolbar: { show: false }, zoom: { enabled: false },
      animations: { enabled: false }, fontFamily: 'Outfit, sans-serif'
    },
    theme: { mode: light ? 'light' : 'dark' },
    series: [
      { name: 'Patrimônio acumulado', data: dataPatrimony },
      { name: 'Total investido',      data: dataInvested }
    ],
    colors: ['#00C853', '#C9A84C'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: light ? 0.22 : 0.18,
        opacityTo:   light ? 0.04 : 0.02,
        stops: [0, 95]
      }
    },
    stroke: { curve: 'smooth', width: 2 },
    markers: { size: 2, hover: { size: 5 } },
    xaxis: {
      categories: labels,
      title: { text: 'Tempo (anos)', style: { fontFamily: 'Outfit, sans-serif', fontSize: '11px' } },
      labels: { style: { fontFamily: 'Outfit, sans-serif', fontSize: '11px' } }
    },
    yaxis: {
      title: { text: 'Valor (R$)', style: { fontFamily: 'Outfit, sans-serif', fontSize: '11px' } },
      labels: {
        style: { fontFamily: 'Outfit, sans-serif', fontSize: '11px' },
        formatter: function (v) {
          if (v >= 1000000) return 'R$ ' + (v / 1000000).toFixed(1) + 'M';
          if (v >= 1000)    return 'R$ ' + (v / 1000).toFixed(0) + 'k';
          return 'R$ ' + v;
        }
      }
    },
    tooltip: {
      shared: true, intersect: false,
      theme: 'dark',
      style: { fontFamily: 'Outfit, sans-serif', fontSize: '13px' },
      y: { formatter: function (v) { return parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } }
    },
    legend: { show: false },
    grid: { borderColor: light ? 'rgba(36,51,45,0.14)' : 'rgba(221,231,226,0.13)' },
    dataLabels: { enabled: false }
  };
}

/* ── URL como estado ──────────────────────────────────────── */
function numToBr(val, decimals) {
  return parseFloat(val).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function pushStateFromForm() {
  var params = new URLSearchParams({
    idadeAtual:  document.getElementById('currentAge').value || '',
    idadeApo:    document.getElementById('retirementAge').value || '',
    expectativa: document.getElementById('lifeExpectancy').value || '',
    renda:       document.getElementById('desiredIncome').value.replace(/\./g, '').replace(',', '.') || '0',
    patrimonio:  document.getElementById('currentPatrimony').value.replace(/\./g, '').replace(',', '.') || '0',
    retorno:     document.getElementById('annualReturn').value.replace(',', '.') || '0',
    inflacao:    document.getElementById('annualInflation').value.replace(',', '.') || '0',
    modelo:      document.getElementById('withdrawalModel').value,
    decimo:      document.getElementById('include13th').value
  });
  history.replaceState(null, '', '?' + params.toString());
}

function loadFromURL() {
  var params = new URLSearchParams(window.location.search);
  if (!params.has('renda')) return false;

  var set = function (id, val) {
    var el = document.getElementById(id);
    if (el && val) el.value = val;
  };

  set('currentAge',      params.get('idadeAtual'));
  set('retirementAge',   params.get('idadeApo'));
  set('lifeExpectancy',  params.get('expectativa'));
  set('withdrawalModel', params.get('modelo'));
  set('include13th',     params.get('decimo'));

  var renda    = parseFloat(params.get('renda')      || 0);
  var patrim   = parseFloat(params.get('patrimonio') || 0);
  var retorno  = parseFloat(params.get('retorno')    || 0);
  var inflacao = parseFloat(params.get('inflacao')   || 0);

  if (renda)    $('#desiredIncome').val(numToBr(renda, 2)).trigger('input');
  if (patrim)   $('#currentPatrimony').val(numToBr(patrim, 2)).trigger('input');
  if (retorno)  $('#annualReturn').val(numToBr(retorno, 2)).trigger('input');
  if (inflacao) $('#annualInflation').val(numToBr(inflacao, 2)).trigger('input');

  return true;
}

/* ── Compartilhar ─────────────────────────────────────────── */
function compartilharURL() {
  var url = window.location.href;
  var btn = document.getElementById('btnShare');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function () {
      var original = btn.innerHTML;
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px;"><polyline points="20 6 9 17 4 12"/></svg> Copiado!';
      btn.style.color = 'var(--green)';
      btn.style.borderColor = 'var(--green)';
      setTimeout(function () {
        btn.innerHTML = original;
        btn.style.color = '';
        btn.style.borderColor = '';
      }, 2000);
    });
  } else {
    prompt('Copie a URL abaixo:', url);
  }
}

/* ── Cálculo principal ────────────────────────────────────── */
function simular() {
  clearError();
  pushStateFromForm();

  var currentAge      = parseInt(document.getElementById('currentAge').value);
  var retirementAge   = parseInt(document.getElementById('retirementAge').value);
  var lifeExpectancy  = parseInt(document.getElementById('lifeExpectancy').value);
  var desiredIncome   = parseField('desiredIncome');
  var currentPatrimony = parseField('currentPatrimony') || 0;
  var annualReturn    = parseField('annualReturn') / 100;
  var annualInflation = parseField('annualInflation') / 100;
  var withdrawalModel = document.getElementById('withdrawalModel').value;
  var include13th     = document.getElementById('include13th').value === 'yes';

  // Validações
  if (isNaN(currentAge) || currentAge < 18) {
    showError('⚠ Informe uma idade atual válida (mínimo 18 anos).'); return;
  }
  if (isNaN(retirementAge) || retirementAge <= currentAge) {
    showError('⚠ A idade de aposentadoria deve ser maior que a idade atual.'); return;
  }
  if (withdrawalModel === 'period' && (isNaN(lifeExpectancy) || lifeExpectancy <= retirementAge)) {
    showError('⚠ A expectativa de vida deve ser maior que a idade de aposentadoria.'); return;
  }
  if (isNaN(desiredIncome) || desiredIncome <= 0) {
    showError('⚠ Informe a renda mensal desejada.'); return;
  }
  if (isNaN(annualReturn) || annualReturn <= 0) {
    showError('⚠ Informe a taxa de rendimento.'); return;
  }
  if (isNaN(annualInflation) || annualInflation < 0) {
    showError('⚠ Informe a taxa de inflação.'); return;
  }

  var accMonths       = (retirementAge - currentAge) * 12;
  var usufMonths      = withdrawalModel === 'period' ? (lifeExpectancy - retirementAge) * 12 : null;
  var monthlyReturn   = anualizadaParaMensal(annualReturn);
  var monthlyInflation = anualizadaParaMensal(annualInflation);
  var monthlyRealReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1;
  var yearsToRetirement = retirementAge - currentAge;

  // Patrimônio necessário
  var futureIncome = desiredIncome * Math.pow(1 + annualInflation, yearsToRetirement);
  var requiredPatrimony;
  if (withdrawalModel === 'perpetual') {
    var perpetualMonthlyRate = Math.pow(1.04, 1 / 12) - 1;
    requiredPatrimony = futureIncome / perpetualMonthlyRate;
  } else {
    if (Math.abs(monthlyRealReturn) < 0.0000001) {
      requiredPatrimony = futureIncome * usufMonths;
    } else {
      requiredPatrimony = futureIncome * (1 - Math.pow(1 + monthlyRealReturn, -usufMonths)) / monthlyRealReturn;
    }
  }

  // Aporte mensal
  var projectedCurrentPatrimony = currentPatrimony * Math.pow(1 + monthlyReturn, accMonths);
  var netTarget = Math.max(0, requiredPatrimony - projectedCurrentPatrimony);
  var monthlyAporte;

  if (netTarget <= 0) {
    monthlyAporte = 0;
  } else {
    var x = (1 + monthlyInflation) / (1 + monthlyReturn);
    var sumFactor;
    if (Math.abs(x - 1) < 0.0000001) {
      sumFactor = accMonths * Math.pow(1 + monthlyReturn, accMonths - 1);
    } else {
      sumFactor = Math.pow(1 + monthlyReturn, accMonths - 1) * (Math.pow(x, accMonths) - 1) / (x - 1);
    }
    if (include13th) {
      var extra13 = 0;
      for (var y = 1; y <= yearsToRetirement; y++) {
        var k13 = y * 12 - 1;
        extra13 += Math.pow(1 + monthlyReturn, accMonths - 1 - k13) * Math.pow(1 + monthlyInflation, k13);
      }
      sumFactor += extra13;
    }
    monthlyAporte = netTarget / sumFactor;
  }

  // Série histórica para o gráfico
  var patrimony    = currentPatrimony;
  var contrib      = monthlyAporte;
  var totalInvested = currentPatrimony;
  var labels = [], dataPatrimony = [], dataInvested = [];
  var startYear = new Date().getFullYear();

  for (var m = 1; m <= accMonths; m++) {
    var extra = (m % 12 === 0 && include13th) ? contrib : 0;
    totalInvested += contrib + extra;
    patrimony = patrimony * (1 + monthlyReturn) + contrib + extra;
    if (m % 12 === 0) {
      labels.push(startYear + Math.floor(m / 12));
      dataPatrimony.push(parseFloat(patrimony.toFixed(2)));
      dataInvested.push(parseFloat(totalInvested.toFixed(2)));
      contrib *= (1 + annualInflation);
    }
  }

  var patrimonioPresente = requiredPatrimony / Math.pow(1 + annualInflation, yearsToRetirement);

  // Preenche resultados no DOM
  document.getElementById('resAporte').textContent = fmt(monthlyAporte);
  document.getElementById('resAporteSub').textContent =
    'Valor do 1º aporte hoje. Será reajustado anualmente pela inflação (' +
    fmtN(annualInflation * 100, 2) + '% a.a.) para manter o poder de compra.';
  document.getElementById('resPatrimonio').textContent = fmt(requiredPatrimony);
  document.getElementById('resPatrimonioPresente').textContent = fmt(patrimonioPresente);
  document.getElementById('resRendaFutura').textContent = fmt(futureIncome) + '/mês';
  document.getElementById('resRendaNota').textContent =
    'Equivale a ' + fmt(desiredIncome) + '/mês em valores de hoje — corrigido pela inflação de ' +
    fmtN(annualInflation * 100, 2) + '% a.a. por ' + yearsToRetirement + ' anos.';
  document.getElementById('resPeriodoAcum').textContent = yearsToRetirement + ' anos';
  document.getElementById('resPeriodoAcumSub').textContent = accMonths + ' meses de contribuição';

  if (withdrawalModel === 'perpetual') {
    document.getElementById('resPeriodoUsuf').textContent = 'Perpétua';
    document.getElementById('resPeriodoUsufSub').textContent = 'Patrimônio não se esgota';
  } else {
    document.getElementById('resPeriodoUsuf').textContent = (lifeExpectancy - retirementAge) + ' anos';
    document.getElementById('resPeriodoUsufSub').textContent = usufMonths + ' meses de renda';
  }

  document.getElementById('resTotalInvestido').textContent = fmt(totalInvested);
  document.getElementById('resRendimento').textContent = fmt(patrimony - totalInvested);

  // Gráfico
  if (window.retirementChart && typeof window.retirementChart.destroy === 'function') {
    window.retirementChart.destroy();
  }
  window.retirementChart = new ApexCharts(
    document.getElementById('retirementChart'),
    buildChartOptions(labels, dataPatrimony, dataInvested)
  );
  window.retirementChart.render();

  var rs = document.getElementById('resultsSection');
  rs.style.display = 'block';

  // Salvar no histórico global
  (function (entrada) {
    if (window.gelocciSalvarSimulacao) { gelocciSalvarSimulacao(entrada); }
    else { window._gelocciHistFila = window._gelocciHistFila || []; window._gelocciHistFila.push(entrada); }
  })({
    calculadora: 'Aposentadoria',
    valor: fmt(monthlyAporte) + '/mês',
    params: 'meta ' + fmt(desiredIncome) + ' · ' + yearsToRetirement + ' anos · ' + fmtN(annualReturn * 100, 2) + '% a.a.',
    url: window.location.href
  });

  requestAnimationFrame(function () {
    var offset = rs.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: offset, behavior: 'smooth' });
  });
}

/* ── Exportar PDF ─────────────────────────────────────────── */
async function exportarPDF() {
  const btn = document.getElementById('btnPdf');
  btn.classList.add('loading');
  btn.textContent = 'Gerando...';

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, margin = 18, contentW = 174;
  let y = 0;

  const fmtCampo = (id, pre) => { const v = document.getElementById(id).value || '0,00'; return pre + ' ' + v; };
  const fmtPct   = (id) => { const v = document.getElementById(id).value || '0,00'; return (v || '0,00') + '%'; };
  const g = (id) => document.getElementById(id).textContent;

  // Header
  doc.setFillColor(14, 31, 21); doc.rect(0, 0, W, 28, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(0, 200, 83);
  doc.text('Gelocci', margin, 17);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(107, 140, 118);
  doc.text('Inteligência Financeira', margin, 23);
  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text('Simulação gerada em ' + hoje, W - margin, 17, { align: 'right' });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(221, 231, 226);
  doc.text('Simulador de Aposentadoria', W - margin, 23, { align: 'right' });
  y = 38;

  // Card principal
  doc.setFillColor(14, 31, 21); doc.setDrawColor(0, 168, 68); doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 38, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(7); doc.setTextColor(0, 200, 83);
  doc.text('APORTE MENSAL NECESSÁRIO (HOJE)', margin + 8, y + 10);
  doc.setFontSize(24); doc.setTextColor(0, 200, 83);
  doc.text(g('resAporte'), margin + 8, y + 25);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 140, 118);
  doc.text(g('resAporteSub'), margin + 8, y + 33, { maxWidth: contentW - 16 });
  y += 46;

  // Cards secundários — linha 1
  const cW = (contentW - 8) / 2;
  [
    { l: 'PATRIMÔNIO NECESSÁRIO',      v: g('resPatrimonio'),        n: 'Valor nominal na aposentadoria' },
    { l: 'PATRIMÔNIO VALOR PRESENTE',  v: g('resPatrimonioPresente'), n: 'Equivalente em poder de compra hoje' }
  ].forEach((c, i) => {
    const cx = margin + i * (cW + 8);
    doc.setFillColor(245, 248, 246); doc.setDrawColor(210, 225, 215); doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, cW, 26, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(107, 140, 118);
    doc.text(c.l, cx + 6, y + 8);
    doc.setFontSize(12); doc.setTextColor(20, 30, 25);
    doc.text(c.v, cx + 6, y + 18);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(107, 140, 118);
    doc.text(c.n, cx + 6, y + 23, { maxWidth: cW - 8 });
  });
  y += 34;

  // Renda futura
  doc.setFillColor(245, 248, 246); doc.setDrawColor(210, 225, 215); doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentW, 26, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5); doc.setTextColor(107, 140, 118);
  doc.text('RENDA MENSAL NA APOSENTADORIA', margin + 6, y + 8);
  doc.setFontSize(13); doc.setTextColor(20, 30, 25);
  doc.text(g('resRendaFutura'), margin + 6, y + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(107, 140, 118);
  doc.text(g('resRendaNota'), margin + 6, y + 23, { maxWidth: contentW - 8 });
  y += 34;

  // Grid 4 cards
  const c4W = (contentW - 12) / 4;
  [
    { l: 'PERÍODO ACUMULAÇÃO', v: g('resPeriodoAcum'),    n: g('resPeriodoAcumSub') },
    { l: 'PERÍODO USUFRUTO',   v: g('resPeriodoUsuf'),    n: g('resPeriodoUsufSub') },
    { l: 'TOTAL INVESTIDO',    v: g('resTotalInvestido'), n: 'Soma de todos os aportes' },
    { l: 'RENDIMENTO GERADO',  v: g('resRendimento'),     n: 'Juros acumulados no período' }
  ].forEach((c, i) => {
    const cx = margin + i * (c4W + 4);
    doc.setFillColor(245, 248, 246); doc.setDrawColor(210, 225, 215); doc.setLineWidth(0.3);
    doc.roundedRect(cx, y, c4W, 24, 2, 2, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5); doc.setTextColor(107, 140, 118);
    doc.text(c.l, cx + 4, y + 7);
    doc.setFontSize(9); doc.setTextColor(20, 30, 25);
    doc.text(c.v, cx + 4, y + 15);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5); doc.setTextColor(107, 140, 118);
    doc.text(c.n, cx + 4, y + 20, { maxWidth: c4W - 6 });
  });
  y += 32;

  // Parâmetros
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20, 30, 25);
  doc.text('PARÂMETROS DA SIMULAÇÃO', margin, y + 6);
  doc.setDrawColor(0, 168, 68); doc.setLineWidth(0.4);
  doc.line(margin, y + 8, margin + contentW, y + 8);
  y += 12;

  const params = [
    ['Idade atual',      document.getElementById('currentAge').value + ' anos'],
    ['Aposentadoria',    document.getElementById('retirementAge').value + ' anos'],
    ['Expectativa vida', document.getElementById('lifeExpectancy').value + ' anos'],
    ['Renda desejada',   fmtCampo('desiredIncome', 'R$')],
    ['Patrimônio atual', fmtCampo('currentPatrimony', 'R$')],
    ['Retorno anual',    fmtPct('annualReturn')],
    ['Inflação anual',   fmtPct('annualInflation')],
    ['Modelo retirada',  document.getElementById('withdrawalModel').value === 'perpetual' ? 'Perpétua' : 'Período'],
    ['13º Salário',      document.getElementById('include13th').value === 'yes' ? 'Sim' : 'Não'],
  ];

  const colW = contentW / 3;
  params.forEach((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const px = margin + col * colW, py = y + row * 16;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 140, 118);
    doc.text(p[0], px, py);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(20, 30, 25);
    doc.text(p[1], px, py + 6);
  });
  y += Math.ceil(params.length / 3) * 16 + 8;

  // Gráfico
  try {
    const chartEl = document.querySelector('#retirementChart .apexcharts-canvas');
    if (chartEl) {
      const canvas = await html2canvas(chartEl, { backgroundColor: '#0E1F15', scale: 2, logging: false, useCORS: true });
      const imgH = contentW * (canvas.height / canvas.width);
      const pageH = doc.internal.pageSize.height;

      if (y + 20 + imgH > pageH - 20) {
        doc.setFillColor(14, 31, 21); doc.rect(0, pageH - 18, W, 18, 'F');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 140, 118);
        doc.text('gelocci.com.br  ·  Simulação estimada. Não constitui aconselhamento financeiro.', W / 2, pageH - 8, { align: 'center' });
        doc.addPage();
        y = 20;
      }

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20, 30, 25);
      doc.text('EVOLUÇÃO DO PATRIMÔNIO', margin, y + 6);
      doc.setDrawColor(0, 168, 68); doc.setLineWidth(0.4);
      doc.line(margin, y + 8, margin + contentW, y + 8);
      y += 12;
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, y, contentW, imgH);
      y += imgH + 8;
    }
  } catch (e) { console.warn('Gráfico não capturado:', e); }

  // Footer
  const pageH = doc.internal.pageSize.height;
  doc.setFillColor(14, 31, 21); doc.rect(0, pageH - 18, W, 18, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(107, 140, 118);
  doc.text('gelocci.com.br  ·  Simulação estimada. Não constitui aconselhamento financeiro.', W / 2, pageH - 8, { align: 'center' });

  doc.save('gelocci-simulador-aposentadoria.pdf');

  btn.classList.remove('loading');
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:13px;height:13px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Exportar PDF';
}

/* ── Tema: atualizar gráfico ao trocar dark/light ─────────── */
var _retirementThemeTimer = null;

function refreshRetirementChartTheme() {
  if (_retirementThemeTimer) clearTimeout(_retirementThemeTimer);
  _retirementThemeTimer = setTimeout(function () {
    _retirementThemeTimer = null;
    if (!window.retirementChart) return;
    var light = isLightMode();
    window.retirementChart.updateOptions({
      theme: { mode: light ? 'light' : 'dark' },
      tooltip: { theme: 'dark' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: light ? 0.22 : 0.18,
          opacityTo:   light ? 0.04 : 0.02,
          stops: [0, 95]
        }
      },
      grid: { borderColor: light ? 'rgba(36,51,45,0.14)' : 'rgba(221,231,226,0.13)' }
    });
  }, 50);
}

window.addEventListener('gelocci:themechange', refreshRetirementChartTheme);
new MutationObserver(refreshRetirementChartTheme).observe(document.documentElement, {
  attributes: true, attributeFilter: ['class', 'data-theme']
});

/* ── Inicialização ────────────────────────────────────────── */
$(document).ready(function () {
  $('#desiredIncome').mask('000.000.000,00', { reverse: true });
  $('#currentPatrimony').mask('000.000.000,00', { reverse: true });
  $('#annualReturn').mask('##0,00', { reverse: true });
  $('#annualInflation').mask('##0,00', { reverse: true });

  if (loadFromURL()) {
    simular();
  }
});
