function converterTaxa() {
    var taxa = parseFloat(document.getElementById('rateInput').value.replace(',', '.'));
    var periodo = document.getElementById('periodSelect').value;
    var resultDiv = document.getElementById('result');

    if (!isNaN(taxa)) {
        let resultadoHTML = '';
        // Cabeçalho da Tabela
        resultadoHTML += `
            <h3>Taxas Equivalentes:</h3>
            <table class="taxa-table">
                <thead>
                    <tr>
                        <th>Tipo de Juros</th>
                        <th>Mensal</th>
                        <th>Trimestral</th>
                        <th>Semestral</th>
                        <th>Anual</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        switch (periodo) {
            case 'monthly':
                resultadoHTML += `
                    <tr>
                        <td>Juros Simples</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 3)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 6)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 12)}</span>%</td>
                    </tr>
                    <tr>
                        <td>Juros Compostos</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 3)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 6)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 12)}</span>%</td>
                    </tr>
                `;
                break;
            case 'quarterly':
                resultadoHTML += `
                    <tr>
                        <td>Juros Simples</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/3)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 2)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 4)}</span>%</td>
                    </tr>
                    <tr>
                        <td>Juros Compostos</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/3)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 2)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 4)}</span>%</td>
                    </tr>
                `;
                break;
            case 'semiannual':
                resultadoHTML += `
                    <tr>
                        <td>Juros Simples</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/6)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/2)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 2)}</span>%</td>
                    </tr>
                    <tr>
                        <td>Juros Compostos</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/6)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/2)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 2)}</span>%</td>
                    </tr>
                `;
                break;
            case 'annual':
                resultadoHTML += `
                    <tr>
                        <td>Juros Simples</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/12)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/4)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1/2)}</span>%</td>
                        <td><span class="highlight">${jurosSimples(taxa, 1)}</span>%</td>
                    </tr>
                    <tr>
                        <td>Juros Compostos</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/12)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/4)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1/2)}</span>%</td>
                        <td><span class="highlight">${jurosCompostos(taxa, 1)}</span>%</td>
                    </tr>
                `;
                break;
            default:
                alert('Por favor, selecione um período válido.');
                return;
        }

        resultadoHTML += `</tbody></table>`;

        document.getElementById('result').innerHTML = resultadoHTML;

    } else {
        alert('Por favor, insira uma taxa válida.');
    }
}

function jurosSimples(taxa, periodo) {
    var resultado = (taxa * periodo);
    return formatarDecimal(resultado);
}

function jurosCompostos(taxa, periodo) {
    var resultado = ((((1 + taxa/100) ** periodo) - 1) * 100);
    return formatarDecimal(resultado);
}

function formatarDecimal(numero) {
    let formatter = new Intl.NumberFormat('pt-BR', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return formatter.format(numero);
}
