console.log("Sistema São Jorge Gás — Regras Operacionais Integradas!");

// ==========================================
// BANCO DE DADOS UNIFICADO (localStorage)
// ==========================================
let db = JSON.parse(localStorage.getItem("sj_gas_persistente")) || {
    valores_fiscais: [
        { id: 1, produto: 'P13', valor: 76.00, ativo: true },
        { id: 2, produto: 'P13', valor: 78.00, ativo: true },
        { id: 3, produto: 'P13', valor: 80.00, ativo: true },
        { id: 4, produto: 'P13', valor: 82.00, ativo: true },
        { id: 5, produto: 'P20', valor: 130.00, ativo: true },
        { id: 6, produto: 'P45', valor: 300.00, ativo: true }
    ],
    rampas: [
        {
            id: 101,
            nome: "RAMPA 01",
            observacoes: "",
            itens: [
                { id: 1001, produto: 'P13', situacao: 'CHEIO', fileiras: 4, qtd_fileira: 10 },
                { id: 1002, produto: 'P13', situacao: 'VAZIO', fileiras: 2, qtd_fileira: 10 }
            ]
        }
    ],
    historico: []
};

function salvarInstanciaBD() {
    localStorage.setItem("sj_gas_persistente", JSON.stringify(db));
    atualizarDashboardDados();
}

// --- FORMATADORES ---
function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function numero(valor) {
    if (!valor) return 0;
    return Number(String(valor).replace(/\./g, "").replace(",", "."));
}

// ==========================================
// CONTROLADOR DE TELAS
// ==========================================
function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach(t => t.classList.add("escondido"));
    let alvo = document.getElementById(id);
    if (alvo) alvo.classList.remove("escondido");

    if (id === 'nota') renderizarPrecosAdministrativos();
    if (id === 'rampa') renderizarPainelRampasDinamicas();
    if (id === 'dashboard') atualizarDashboardDados();
    if (id === 'historico') renderizarListaHistorico();
}

// ==========================================
// GESTÃO DE VALORES FISCAIS & CALCULADORA
// ==========================================
function renderizarPrecosAdministrativos() {
    const corpo = document.getElementById("tabelaValoresFiscais");
    if (!corpo) return;
    corpo.innerHTML = "";

    db.valores_fiscais.forEach(v => {
        const tr = document.createElement("tr");
        if (!v.ativo) tr.style.opacity = "0.4";

        tr.innerHTML = `
            <td style="font-weight:bold;">${v.produto}</td>
            <td>${dinheiro(v.valor)}</td>
            <td>
                <span class="status-badge-fiscal" style="background:${v.ativo ? '#2e7d32' : '#c62828'};" onclick="alternarStatusPreco(${v.id})">
                    ${v.ativo ? '● ATIVO (Na Tela)' : '○ OCULTO'}
                </span>
            </td>
            <td><button class="btn-sm-del" onclick="removerPrecoFiscal(${v.id})">X</button></td>
        `;
        corpo.appendChild(tr);
    });

    atualizarSelectCalculadora();
}

function atualizarSelectCalculadora() {
    const tipoAtual = document.getElementById("tipoGas").value;
    const selectCalc = document.getElementById("tabelaP13");
    if (!selectCalc) return;
    selectCalc.innerHTML = "";

    const filtrados = db.valores_fiscais.filter(v => v.ativo && v.produto === tipoAtual);
    filtrados.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.valor;
        opt.textContent = v.valor.toFixed(2);
        selectCalc.appendChild(opt);
    });
}

function adicionarValorFiscal() {
    const prod = document.getElementById("configTipoGas").value;
    const val = parseFloat(document.getElementById("novoValorFiscal").value);
    if (!val || val <= 0) return alert("Insira um valor numérico válido.");

    db.valores_fiscais.push({ id: Date.now(), produto: prod, valor: val, ativo: true });
    document.getElementById("novoValorFiscal").value = "";
    salvarInstanciaBD();
    renderizarPrecosAdministrativos();
}

function alternarStatusPreco(id) {
    const item = db.valores_fiscais.find(v => v.id === id);
    if (item) { item.ativo = !item.ativo; salvarInstanciaBD(); renderizarPrecosAdministrativos(); }
}

function removerPrecoFiscal(id) {
    db.valores_fiscais = db.valores_fiscais.filter(v => v.id !== id);
    salvarInstanciaBD();
    renderizarPrecosAdministrativos();
}

function calcularNota() {
    const tipo = document.getElementById("tipoGas").value;
    const valorTotal = numero(document.getElementById("valorNota").value);
    const precoTabela = parseFloat(document.getElementById("tabelaP13").value);
    const divRes = document.getElementById("resultadoNota");

    if (valorTotal <= 0 || isNaN(valorTotal)) {
        divRes.innerHTML = "Por favor, digite um valor flutuante válido.";
        return;
    }

    let resultado = null;
    if (tipo === "P13") resultado = algoritmoP13Inteligente(valorTotal, precoTabela || 76);
    if (tipo === "P20") resultado = algoritmoProdutoFixo(valorTotal, 130, "P20");
    if (tipo === "P45") resultado = algoritmoProdutoFixo(valorTotal, 300, "P45");

    if (!resultado) {
        divRes.innerHTML = "<h3>Combinação fiscal exata não encontrada para os tetos atuais.</h3>";
        return;
    }

    let logHtml = "";
    resultado.itens.forEach(i => {
        logHtml += `${i.quantidade} un. x ${dinheiro(i.valor)} = ${dinheiro(i.quantidade * i.valor)}<br>`;
    });

    divRes.innerHTML = `
        <h3>Conta:</h3>${logHtml}<hr style="border-color:#333;">
        <h2>Total: ${dinheiro(resultado.total)}</h2>
        <h3>Sobra Técnica: ${dinheiro(resultado.sobra)}</h3>
    `;
}

function algoritmoProdutoFixo(valor, preco, tipo) {
    let qtd = Math.floor(valor / preco);
    let tot = qtd * preco;
    return { tipo: tipo, itens: [{ quantidade: qtd, valor: preco }], total: tot, sobra: Number((valor - tot).toFixed(2)) };
}

function algoritmoP13Inteligente(valor, minimo) {
    for (let qtd = Math.floor(valor / minimo); qtd >= 0; qtd--) {
        let restante = Number((valor - (qtd * minimo)).toFixed(2));
        let comp = rastrearComplemento(restante, minimo);
        if (comp || restante === 0) {
            let itens = [];
            if (qtd > 0) itens.push({ quantidade: qtd, valor: minimo });
            if (comp) itens.push(comp);
            return { tipo: "P13", itens: itens, total: valor, sobra: 0 };
        }
    }
    return null;
}

function rastrearComplemento(valor, minimo) {
    if (valor <= 0) return null;
    for (let qtd = 1; qtd <= 200; qtd++) {
        let valorGas = Number((valor / qtd).toFixed(2));
        if (valorGas >= minimo && valorGas <= 120) return { quantidade: qtd, valor: valorGas };
    }
    return null;
}

// ==========================================
// MONITORAMENTO GEOMÉTRICO DE RAMPAS
// ==========================================
function renderizarPainelRampasDinamicas() {
    const container = document.getElementById("areaRampasDinamicas");
    if (!container) return;
    container.innerHTML = "";

    let totais = { P13_CHEIO: 0, P13_VAZIO: 0, P20_CHEIO: 0, P20_VAZIO: 0, P45_CHEIO: 0, P45_VAZIO: 0 };

    db.rampas.forEach(rampa => {
        const divBox = document.createElement("div");
        divBox.className = "container-rampa-modulo";

        let linhas = "";
        rampa.itens.forEach(i => {
            const totItem = i.fileiras * i.qtd_fileira;
            totais[`${i.produto}_${i.situacao}`] += totItem;

            linhas += `
                <tr>
                    <td style="font-weight:bold;">${i.produto}</td>
                    <td><span class="${i.situacao === 'CHEIO' ? 'badge-cheio' : 'badge-vazio'}">${i.situacao}</span></td>
                    <td><input type="number" style="width:65px; text-align:center;" value="${i.fileiras}" onchange="atualizarEspecificidadeLinha(${rampa.id}, ${i.id}, 'fileiras', this.value)"></td>
                    <td><input type="number" style="width:65px; text-align:center;" value="${i.qtd_fileira}" onchange="atualizarEspecificidadeLinha(${rampa.id}, ${i.id}, 'qtd_fileira', this.value)"></td>
                    <td style="font-weight:bold; color:#e00000;">${totItem}</td>
                    <td><button class="btn-sm-del" onclick="removerLinhaDireta(${rampa.id}, ${i.id})">X</button></td>
                </tr>
            `;
        });

        divBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px;">
                <h3 style="margin:0; text-transform:uppercase; color:#fff;">🚛 ${rampa.nome}</h3>
                <div>
                    <button onclick="duplicarRampaFisica(${rampa.id})" class="btn-secundario" style="padding:6px 12px; font-size:12px;">Duplicar</button>
                    <button onclick="removerRampaCompleta(${rampa.id})" class="btn-sm-del" style="padding:6px 12px; font-size:12px;">Remover</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr><th>Produto</th><th>Situação</th><th>Fileiras</th><th>Qtd/Fil</th><th>Total</th><th>Ação</th></tr>
                </thead>
                <tbody>${linhas || '<tr><td colspan="6" style="color:#aaa;">Rampa vazia. Lance itens abaixo.</td></tr>'}</tbody>
            </table>
            <div class="linha-adicionar-direto">
                <select id="addProd-${rampa.id}"><option>P13</option><option>P20</option><option>P45</option></select>
                <select id="addSit-${rampa.id}"><option value="CHEIO">🔴 CHEIO</option><option value="VAZIO">⚪ VAZIO</option></select>
                <input type="number" id="addFil-${rampa.id}" placeholder="Fil.">
                <input type="number" id="addQtd-${rampa.id}" placeholder="Qtd.">
                <button onclick="inserirLinhaNaRampa(${rampa.id})">＋ Inserir</button>
            </div>
        `;
        container.appendChild(divBox);
    });

