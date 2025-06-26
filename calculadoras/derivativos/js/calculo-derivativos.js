document.getElementById('form-derivativos').addEventListener('submit', function(e) {
    e.preventDefault();

    const S = parseFloat(document.getElementById('ativo').value);
    const K = parseFloat(document.getElementById('exercicio').value);
    const r = parseFloat(document.getElementById('taxa-juros').value) / 100;
    const sigma = parseFloat(document.getElementById('volatilidade').value) / 100;
    const T = parseFloat(document.getElementById('tempo').value);

    if (isNaN(S) || isNaN(K) || isNaN(r) || isNaN(sigma) || isNaN(T)) {
        alert('Por favor, preencha todos os campos corretamente.');
        return;
    }

    // Cálculo dos parâmetros d1 e d2
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);

    // Função de distribuição cumulativa da normal (aproximação)
    function N(x) {
        return (1 + erf(x / Math.sqrt(2))) / 2;
    }

    // Função de erro (aproximação numérica)
    function erf(x) {
        // Aproximação numérica da função de erro
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const sign = (x >= 0) ? 1 : -1;
        x = Math.abs(x);

        const t = 1 / (1 + p * x);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    // Preço da opção de compra (call)
    const callPrice = S * N(d1) - K * Math.exp(-r * T) * N(d2);

    document.getElementById('resultado').innerText = `Preço da Opção de Compra (Call): R$ ${callPrice.toFixed(2)}`;
});
