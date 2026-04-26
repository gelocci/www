document.getElementById('advancedCompoundInterestForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Captura os valores dos campos e aplica o valor padrão caso esteja vazio
    const initialDeposit = parseFloat(document.getElementById('initialDeposit').value.replace(/\./g, '').replace(',', '.')) || 0;
    const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value.replace(/\./g, '').replace(',', '.')) || 0;
    const monthlyInterest = parseFloat(document.getElementById('monthlyInterest').value) / 100 || 0; // Convertendo percentual para decimal
    const inflation = parseFloat(document.getElementById('inflation').value) / 100 || 0; // Convertendo percentual para decimal
    const period = parseInt(document.getElementById('period').value);
    const include13th = document.getElementById('include13th').value === 'yes';
    
    let accumulated = initialDeposit;
    let contributionValue = monthlyContribution;
    let contributionsTotal = 0;
    let labels = [];
    let dataAccumulated = [];
    let dataContributions = [];
    const year = new Date().getFullYear();

    for (let month = 1; month <= period * 12; month++) {
        if (month % 12 === 0) {
            contributionValue *= (1 + inflation);
        }

        let extraContribution = 0;
        if (month % 12 === 0 && include13th) {
            extraContribution = contributionValue;
        }

        contributionsTotal += contributionValue + extraContribution;
        accumulated = accumulated * (1 + monthlyInterest) + contributionValue + extraContribution;

        if (month % 12 === 0) {
            labels.push(`${year + Math.floor(month / 12)}`);
            dataAccumulated.push(accumulated.toFixed(2));
            dataContributions.push(contributionsTotal.toFixed(2));
        }
    }

    const presentValue = accumulated / Math.pow((1 + inflation), period);
    const monthlyRetirement = presentValue * 0.005;

    // Exibindo os resultados no padrão brasileiro
    const resultDiv = document.getElementById('result');
	resultDiv.style.display = 'block'; // Exibe o elemento #result
    resultDiv.innerHTML = `<p> <span style= "color: #4bc0c0;">Reserva Acumulada (R$):</span> ${accumulated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <p>Valor Presente (R$): ${presentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                           <p>Valor Mensal de Aposentadoria (R$): ${monthlyRetirement.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>`;

    // Configurando o gráfico com Chart.js
    const ctx = document.getElementById('investmentChart').getContext('2d');
    if (window.investmentChart && typeof window.investmentChart.destroy === 'function') {
        window.investmentChart.destroy();
    }

    // Detecta o tema ativo para colorir o gráfico corretamente
    const isLight = document.documentElement.classList.contains('light-mode');
    const chartTextColor   = isLight ? '#0B1411' : 'rgba(240,244,242,0.85)';
    const chartGridColor   = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(240,244,242,0.10)';
    const chartBorderColor = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(240,244,242,0.15)';

    window.investmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reserva Acumulada',
                data: dataAccumulated,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true
            }, {
                label: 'Contribuições Totais',
                data: dataContributions,
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: chartTextColor
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tempo (Anos)',
                        color: chartTextColor
                    },
                    ticks: {
                        color: chartTextColor
                    },
                    grid: {
                        color: chartGridColor
                    },
                    border: {
                        color: chartBorderColor
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Valor (R$)',
                        color: chartTextColor
                    },
                    ticks: {
                        color: chartTextColor
                    },
                    grid: {
                        color: chartGridColor
                    },
                    border: {
                        color: chartBorderColor
                    },
                    beginAtZero: true
                }
            }
        }
    });

    // Faz a rolagem suave para o gráfico
    document.getElementById('result').scrollIntoView({
        behavior: 'smooth', // Rolar suavemente
        block: 'start' // Centraliza o gráfico na tela
    });
});


// Formatação automática dos números durante a digitação
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', (event) => {
        const target = event.target;
        let value = target.value.replace(/\D/g, ''); // Remove qualquer caractere não numérico
        if (value) {
            // Formata o número com separadores de milhar e 2 casas decimais
            value = Number(value).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }
        target.value = value;
    });
});


const sectionCalculator = document.querySelector('.calculator');
const buttonCalculate = document.querySelector('.calculateButton');

function aumentarSection(event){
    event.preventDefault();
    sectionCalculator.style.width = '1200px';
 
}

sectionCalculator.addEventListener('submit', aumentarSection)