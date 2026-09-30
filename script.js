console.log("Sistema São Jorge Gás carregado!");

// BANCO DE DADOS LOCAL
let contagem = JSON.parse(localStorage.getItem("contagemGas")) || [];
let historico = JSON.parse(localStorage.getItem("historicoGas")) || [];

// FUNÇÕES AUXILIARES
function dinheiro(valor){ return Number(valor).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function numero(valor){ if(!valor) return 0; return Number(String(valor).replace(/\./g,"").replace(",",".")); }

// TROCA DE TELAS
function mostrarTela(id){
  document.querySelectorAll(".tela").forEach(tela=>tela.classList.add("escondido"));
  let abrir=document.getElementById(id);
  if(abrir){ abrir.classList.remove("escondido"); }
}

// CALCULADORA NOTA FISCAL
function calcularNota(){
  let tipo=document.getElementById("tipoGas").value;
  let valor=numero(document.getElementById("valorNota").value);
  let tabela=Number(document.getElementById("tabelaP13").value);
  if(valor<=0){ document.getElementById("resultadoNota").innerHTML="Digite um valor válido."; return; }
  let resultado;
  if(tipo==="P13"){ resultado=calcularP13(valor,tabela); }
  if(tipo==="P20"){ resultado=calcularProdutoFixo(valor,130,"P20"); }
  if(tipo==="P45"){ resultado=calcularProdutoFixo(valor,300,"P45"); }
  mostrarResultadoNota(resultado);
}
function calcularProdutoFixo(valor,preco,tipo){
  let quantidade=Math.floor(valor/preco);
  let total=quantidade*preco;
  return {tipo:tipo,itens:[{quantidade:quantidade,valor:preco}],total:total,sobra:Number((valor-total).toFixed(2))};
}
function calcularP13(valor,minimo){
  for(let quantidade=Math.floor(valor/minimo); quantidade>=0; quantidade--){
    let restante=Number((valor-(quantidade*minimo)).toFixed(2));
    let complemento=procurarComplemento(restante,minimo);
    if(complemento || restante===0){
      let itens=[];
      if(quantidade>0){ itens.push({quantidade:quantidade,valor:minimo}); }
      if(complemento){ itens.push(complemento); }
      return {tipo:"P13",itens:itens,total:valor,sobra:0};
    }
  }
  return null;
}
function procurarComplemento(valor,minimo){
  if(valor<=0){ return null; }
  for(let quantidade=1; quantidade<=200; quantidade++){
    let valorGas=Number((valor/quantidade).toFixed(2));
    if(valorGas>=minimo && valorGas<=120){ return {quantidade:quantidade,valor:valorGas}; }
  }
  return null;
}
function mostrarResultadoNota(resultado){
  let div=document.getElementById("resultadoNota");
  if(!resultado){ div.innerHTML="<h3>Não foi encontrada uma combinação.</h3>"; return; }
  let conta="";
  resultado.itens.forEach(item=>{ conta+=`${item.quantidade} x ${dinheiro(item.valor)} = ${dinheiro(item.quantidade*item.valor)}<br>`; });
  div.innerHTML=`<h3>Conta:</h3>${conta}<hr><h2>Total: ${dinheiro(resultado.total)}</h2><h3>Sobra: ${dinheiro(resultado.sobra)}</h3>`;
}

// CALCULADORA DE RAMPA
function calcularRampa(){
  let campos=[["rAltura","rFileira","rColuna"],["extraAltura1","extraFileira1","extraColuna1"],["extraAltura2","extraFileira2","extraColuna2"],["extraAltura3","extraFileira3","extraColuna3"],["extraAltura4","extraFileira4","extraColuna4"]];
  let total=0; let conta="";
  campos.forEach(campo=>{
    let altura=Number(document.getElementById(campo[0]).value)||0;
    let fileira=Number(document.getElementById(campo[1]).value)||0;
    let coluna=Number(document.getElementById(campo[2]).value)||0;
    if(altura && fileira && coluna){
      let resultado=altura*fileira*coluna;
      total+=resultado;
      conta+=`${altura} x ${fileira} x ${coluna} = ${resultado}<br>`;
    }
  });
  let resultadoDiv=document.getElementById("resultadoRampa");
  if(total===0){ resultadoDiv.innerHTML="Digite os valores da rampa."; return; }
  resultadoDiv.innerHTML=`<h3>Conta:</h3>${conta}<hr><h2>Total: ${total} botijões</h2>`;
  let tipo=document.getElementById("tipoRampa").value;
  contagem.push({produto:tipo,quantidade:total,data:new Date().toLocaleString("pt-BR")});
  salvarContagem(); mostrarContagem(); atualizarResumo();
}

// CONTAGEM MANUAL
function adicionarContagem(){
  let produto=document.getElementById("produtoContagem").value;
  let quantidade=Number(document.getElementById("quantidadeContagem").value);
  if(!quantidade){ alert("Informe a quantidade"); return; }
  contagem.push({produto:produto,quantidade:quantidade,data:new Date().toLocaleString("pt-BR")});
  salvarContagem(); mostrarContagem(); atualizarResumo();
}
function salvarContagem(){ localStorage.setItem("contagemGas",JSON.stringify(contagem)); }
function mostrarContagem(){
  let tabela=document.getElementById("tabelaContagem"); if(!tabela) return;
  tabela.innerHTML="";
  contagem.forEach((item,index)=>{ tabela.innerHTML+=`<tr><td>${item.produto}</td><td>${item.quantidade}</td><td><button onclick="removerContagem(${index})">X</button></td></tr>`; });
}
function removerContagem(index){ contagem.splice(index,1); salvarContagem(); mostrarContagem(); atualizarResumo(); }

// RESUMO
function atualizarResumo(){
  let resumo={"P13 Cheio":0,"P13 Vazio":0,"P20 Cheio":0,"P20 Vazio":0,"P45 Cheio":0,"P45 Vazio":0};
  contagem.forEach(item=>{ if(resumo[item.produto]!==undefined){ resumo[item.produto]+=item.quantidade; } });
  let html=""; let total=0;
  Object.keys(resumo).forEach(nome=>{ total+=resumo[nome]; html+=`<p><b>${nome}</b>: ${resumo[nome]}</p>`; });
  html+=`<hr><h2>Total Geral: ${total}</h2>`;
  let div=document.getElementById("resumo"); if(div){ div.innerHTML=html; }
  atualizarDashboard(resumo);
  return resumo;
}
function atualizarDashboard(resumo){
  let campos={
    "P13 Cheio":"dashP13Cheio",
    "P13 Vazio":"dashP13Vazio",
    "P20 Cheio":"dashP20Cheio",
    "P20 Vazio":"dashP20Vazio",
    "P45 Cheio":"dashP45Cheio",
    "P45 Vazio":"dashP45Vazio"
  };
  Object.keys(campos).forEach(nome=>{
    let elemento=document.getElementById(campos[nome]);
    if(elemento){ elemento.innerHTML=resumo[nome]; }
  });
  let total=Object.values(resumo).reduce((a,b)=>a+b,0);
  let totalElemento=document.getElementById("dashTotal");
  if(totalElemento){ totalElemento.innerHTML=total; }
}

// HISTÓRICO
function salvarHistorico(){
  let resumo=atualizarResumo();
  historico.push({data:new Date().toLocaleString("pt-BR"), resumo:resumo});
  localStorage.setItem("historicoGas",JSON.stringify(historico));
  mostrarHistorico();
}
function mostrarHistorico(){
  let div=document.getElementById("listaHistorico"); if(!div) return;
  div.innerHTML="";
  historico.forEach(item=>{
    div.innerHTML += `<div class="resultado"><b>${item.data}</b><br><br>${JSON.stringify(item.resumo)}</div>`;
  });
}

// PDF
function gerarPDF(){
  const {jsPDF}=window.jspdf;
  let pdf=new jsPDF();
  let resumo=atualizarResumo();
  pdf.text("São Jorge Gás - Fechamento",10,20);
  let y=40;
  Object.keys(resumo).forEach(nome=>{
    pdf.text(`${nome}: ${resumo[nome]}`,10,y);
    y+=10;
  });
  pdf.save("fechamento-gas.pdf");
}

// BACKUP
function exportarBackup(){
  let dados={contagem:contagem,historico:historico};
  let arquivo=new Blob([JSON.stringify(dados,null,2)],{type:"application/json"});
  let link=document.createElement("a");
  link.href=URL.createObjectURL(arquivo);
  link.download="backup-sao-jorge.json";
  link.click();
}

// ==========================================================
// IA SÃO JORGE — Adicionada sem alterar funções existentes
// ==========================================================
const IASaoJorge = {
  ultimoContexto: null,
  memoriaConversa: [],
  maxMemoria: 30,

  intencoes: {
    calcular: t => /calcule|quanto é|quanto dá|resultado|calcula|faz a conta|=|quanto fica|total|soma|multiplica|divide/.test(t) || /\d/.test(t),
    explicar: t => /explica|como|passo a passo|de onde vem|por que|entender|me mostre|qual a lógica/.test(t),
    duvida: t => /o que é|pra que serve|como funciona|diferença/.test(t),
    notaFiscal: t => /nota|nf|nota fiscal|faturar|emitir|valor|preço|venda|cliente|quantidade|unitário/.test(t),
    rampa: t => /rampa|empilhar|estocar|altura|fileira|coluna|bloco|prateleira|disposição|arrumar/.test(t),
    contagem: t => /contagem|contar|estoque|cheio|vazio|quantidade|conferir|fechamento|balanço|inventário/.test(t),
    historico: t => /historico|registro|salvo|passado|pdf|backup|comparar|período|mês|semana/.test(t),
    dashboard: t => /dashboard|resumo|painel|geral|totais|gráfico|visão|panorama|situação/.test(t),
    melhorar: t => /melhorar|aprimorar|otimizar|ajustar|corrigir|solução|dica|ideia|sugestão|aperfeiçoar/.test(t),
    erro: t => /erro|errado|deu problema|não funciona|falha|diferença|inconsistente/.test(t),
    ajuda: t => /ajuda|socorro|não entendi|comando|o que você faz|quem é/.test(t),
    despedida: t => /obrigado|obrigada|valeu|até|tchau|foi isso/.test(t)
  },

  conhecimento: {
    notaFiscal: {
      titulo: "📄 Nota Fiscal",
      descricao: "Documento oficial que registra a saída de gás da empresa, com valores, quantidades e tipos de produto.",
      passos: [
        "Escolha o tipo de gás (P13, P20, P45...)",
        "Selecione a tabela de preços vigente",
        "Informe o valor da nota",
        "O sistema calcula automaticamente a quantidade",
        "Confere com a contagem de estoque antes de emitir"
      ],
      formula: "Quantidade = Valor Total ÷ Valor Unitário",
      exemplo: "R$ 120,00 ÷ R$ 80,00 = 1,5 botijão P13",
      dicas: [
        "Confira sempre se a tabela está com o valor correto",
        "O P13 faz combinações diferentes de preço",
        "P20 é sempre R$ 130,00 e P45 sempre R$ 300,00"
      ]
    },
    rampa: {
      titulo: "🚛 Rampa — Empilhamento",
      descricao: "Organização e contagem de botijões dispostos em camadas.",
      passos: [
        "Altura = quantas camadas empilhadas",
        "Fileira = quantos na profundidade",
        "Coluna = quantos na largura",
        "Total = Altura × Fileira × Coluna",
        "Some as partes extras separadamente"
      ],
      formula: "A × F × C = Total",
      exemplo: "3 × 4 × 5 = 60 botijões",
      dicas: [
        "Preencha os 3 campos para cada bloco",
        "Parte extra só conta se todos os 3 forem preenchidos",
        "O total já vai para a contagem automaticamente"
      ]
    },
    contagem: {
      titulo: "📦 Contagem de Estoque",
      descricao: "Registro manual de todos os botijões, separados por tipo e estado.",
      passos: [
        "Escolha o produto (P13 Cheio, P13 Vazio, etc.)",
        "Digite a quantidade encontrada",
        "Clique em Adicionar",
        "Aparece na tabela e no resumo",
        "Confere com o dashboard automaticamente"
      ],
      formula: "Total = soma de todos os itens",
      exemplo: "P13 Cheio: 50 + P13 Vazio: 30 = 80",
      dicas: [
        "Conte separadamente por local: rampa + interno",
        "Cheios e vazios são contagens diferentes",
        "Clique no X para remover um lançamento errado"
      ]
    },
    historico: {
      titulo: "📜 Histórico de Fechamentos",
      descricao: "Registro de todos os fechamentos salvos com data e resumo.",
      passos: [
        "Feche a contagem do dia",
        "Clique em Salvar Fechamento",
        "Gere PDF para impressão ou envio",
        "Exporte backup para guardar",
        "Compare dias anteriores"
      ],
      formula: "Salvo no computador automaticamente",
      exemplo: "30/09/2026 — P13 Cheio: 45, P13 Vazio: 22...",
      dicas: [
        "Salve todo dia no final do expediente",
        "Baixe o PDF e guarde em pasta",
        "Exportar backup dá um arquivo de segurança"
      ]
    },
    dashboard: {
      titulo: "📊 Painel Geral",
      descricao: "Visão rápida do estoque atual em tempo real.",
      passos: [
        "Mostra P13, P20 e P45 separados",
        "Cheios e Vazios em colunas próprias",
        "Total geral no rodapé",
        "Atualiza quando adiciona contagem",
        "Confere com o fechamento anterior"
      ],
      formula: "Atualiza junto com a contagem",
      exemplo: "P13 Cheio: 50 | P13 Vazio: 30 → Total: 80",
      dicas: [
        "Verifique sempre os números no início do dia",
        "Se não aparecer nada, refaça a contagem",
        "Compara com o dia anterior no Histórico"
      ]
    }
  },

  processar(perguntaBruta) {
    const pergunta = perguntaBruta.trim();
    if (!pergunta) return null;

    this.memoriaConversa.push({ tipo: "usuario", texto: pergunta });
    if (this.memoriaConversa.length > this.maxMemoria) this.memoriaConversa.shift();

    const texto = pergunta.toLowerCase();
    let resposta = "";

    if (this.intencoes.notaFiscal(texto)) this.ultimoContexto = "notaFiscal";
    else if (this.intencoes.rampa(texto)) this.ultimoContexto = "rampa";
    else if (this.intencoes.contagem(texto)) this.ultimoContexto = "contagem";
    else if (this.intencoes.historico(texto)) this.ultimoContexto = "historico";
    else if (this.intencoes.dashboard(texto)) this.ultimoContexto = "dashboard";

    if (this.intencoes.despedida(texto)) {
      resposta = "🤖 De nada! Fico feliz em ajudar! 💚<br>Sempre que precisar, é só chamar! Bom trabalho e até breve! 👋😊";
      this.memoriaConversa = [];
      this.ultimoContexto = null;
      return this.criarBloco(pergunta, resposta);
    }

    if (this.intencoes.ajuda(texto)) {
      resposta = this.gerarAjudaCompleta();
    }
    else if (this.intencoes.calcular(texto) || this.intencoes.explicar(texto)) {
      resposta = this.processarCalculoOuExplicacao(texto);
    }
    else if (this.intencoes.duvida(texto) || this.ultimoContexto) {
      resposta = this.gerarExplicacaoContexto(texto);
    }
    else if (this.intencoes.melhorar(texto)) {
      resposta = this.gerarRespostaMelhoria(texto);
    }
    else if (this.intencoes.erro(texto)) {
      resposta = this.gerarRespostaErro(texto);
    }
    else {
      resposta = this.gerarRespostaNaoEntendido();
    }

    resposta = this.adicionarSugestaoProativa(resposta);
    this.memoriaConversa.push({ tipo: "ia", texto: resposta });
    return this.criarBloco(pergunta, resposta);
  },

  processarCalculoOuExplicacao(texto) {
    const conta = this.extrairConta(texto);
    if (conta) {
      const { passos, resultado, aviso } = this.calcularPassoAPasso(conta);
      let resposta = "🧮 <b>Cálculo Passo a Passo</b><br>═══════════════════════════<br>";
      passos.forEach(p => resposta += `${p}<br>`);
      resposta += "═══════════════════════════<br>✅ <b>Resultado Final:</b> " + resultado + "<br>";
      if (aviso) resposta += `⚠️ ${aviso}<br>`;
      if (this.ultimoContexto === "rampa") {
        resposta += `<br>📦 Cabem <b>${resultado} botijões</b> nessa disposição!`;
      }
      return resposta;
    }
    if (this.intencoes.explicar(texto) && this.ultimoContexto) {
      return this.gerarExplicacaoConceito(this.ultimoContexto);
    }
    return "🤔 Não achei os números da conta.<br>📌 Tente: <b>3 × 4 × 5</b> ou <b>calcule 120 ÷ 15</b>";
  },

  extrairConta(texto) {
    let tratado = texto.replace(/vezes/g,"*").replace(/x/gi,"*").replace(/dividido por/g,"/")
      .replace(/mais/g,"+").replace(/menos/g,"-").replace(/por/g,"*")
      .replace(/calcule|quanto é|resultado|=/g,"").trim();
    const match = tratado.match(/[\d.,+\-*/\s]+/);
    if (match) return match[0].replace(/\s+/g,"").replace(/,/g,".");
    return null;
  },

  calcularPassoAPasso(expressao) {
    const passos = [];
    let aviso = "";
    if (!/^[\d+\-*/.()]+$/.test(expressao)) {
      return { passos: [], resultado: "Inválido", aviso: "Caracteres não reconhecidos." };
    }
    const formato = expressao.replace(/\*/g," × ").replace(/\//g," ÷ ");
    passos.push(`📝 Fórmula: ${formato}`);
    try {
      const partes = expressao.split(/([+\-*/])/);
      if (partes.length > 1) {
        let parcial = parseFloat(partes[0]);
        for (let i = 1; i < partes.length; i += 2) {
          const op = partes[i], prox = parseFloat(partes[i+1]);
          const opSimb = op==="*"?"×":op==="/"?"÷":op;
          const calc = eval(`${parcial} ${op} ${prox}`);
          passos.push(`➡️ ${parcial} ${opSimb} ${prox} = ${calc}`);
          parcial = calc;
        }
      }
      const resultado = eval(expressao);
      if (!isFinite(resultado) || isNaN(resultado)) {
        return { passos, resultado: "Inválido", aviso: "Verifique os números." };
      }
      if (resultado === 0) aviso = "⚠️ Resultado zero — conferiu os números?";
      return { passos, resultado, aviso };
    } catch {
      return { passos, resultado: "Erro", aviso: "Não consegui calcular." };
    }
  },

  gerarExplicacaoContexto(texto) {
    const modulos = ["notaFiscal","rampa","contagem","historico","dashboard"];
    let modulo = this.ultimoContexto;
    for (const m of modulos) if (this.intencoes[m](texto)) { modulo = m; break; }
    if (!modulo || !this.conhecimento[modulo]) return this.gerarRespostaNaoEntendido();
    return this.gerarExplicacaoConceito(modulo);
  },

  gerarExplicacaoConceito(modulo) {
    const info = this.conhecimento[modulo];
    let resposta = `<b>${info.titulo}</b><br>═══════════════════════════<br>`;
    resposta += `📌 ${info.descricao}<br><br>📝 Como fazer:<br>`;
    info.passos.forEach((p,i) => resposta += `${i+1}. ${p}<br>`);
    resposta += `<br>🧮 Fórmula: ${info.formula}<br>💡 Exemplo: ${info.exemplo}<br><br>✅ Dicas:<br>`;
    info.dicas.forEach(d => resposta += `• ${d}<br>`);
    return resposta;
  },

  gerarRespostaMelhoria(texto) {
    let alvo = null;
    if (/nota/.test(texto)) alvo = "notaFiscal";
    else if (/rampa/.test(texto)) alvo = "rampa";
    else if (/contagem/.test(texto)) alvo = "contagem";
    else if (/historico/.test(texto)) alvo = "historico";
    else if (/dashboard/.test(texto)) alvo = "dashboard";
    if (!alvo && this.ultimoContexto) alvo = this.ultimoContexto;
    if (alvo) {
      const dicas = {
        notaFiscal: ["Confira a tabela antes de calcular", "P13 pode combinar valores diferentes", "P20=130 e P45=300 são fixos", "Confere com a contagem física"],
        rampa: ["Meça antes de arrumar", "A×F×C = Total", "Não esqueça as partes extras", "Confere o tipo antes de adicionar"],
        contagem: ["Conte separado por tipo e estado", "Anote na hora", "Confere rampa + interno", "Compara com o dia anterior"],
        historico: ["Salve todo dia", "Gere PDF e guarde", "Faça backup semanal", "Compare períodos"],
        dashboard: ["Confira no início do dia", "Atualiza com a contagem", "Verifique totais fazendo sentido", "Investiga variações grandes"]
      };
      let resposta = `<b>Melhorias — ${this.conhecimento[alvo].titulo}</b><br>`;
      dicas[alvo].forEach(d => resposta += `✅ ${d}<br>`);
      return resposta;
    }
    return "🔧 Me diga o que quer melhorar: nota, rampa, contagem, histórico ou dashboard?";
  },

  gerarRespostaErro(texto) {
    let prob = null;
    if (/nota|valor|diferença/.test(texto)) prob = "notaFiscal";
    else if (/rampa|conta/.test(texto)) prob = "rampa";
    else if (/contagem/.test(texto)) prob = "contagem";
    else if (/salvar|pdf/.test(texto)) prob = "historico";
    if (!prob && this.ultimoContexto) prob = this.ultimoContexto;
    const sol = {
      notaFiscal: "🔍 Confere: valor da tabela, tipo de gás, valor digitado. P13 combina valores diferentes.",
      rampa: "🔍 Confere: Altura, Fileira e Coluna preenchidos. Partes extras precisam dos 3 números.",
      contagem: "🔍 Confere: produto certo, quantidade positiva. Remova lançamentos errados com o X.",
      historico: "🔍 Confere: contagem preenchida antes de salvar. PDF precisa do jsPDF carregado."
    };
    return sol[prob] || "🔍 Me explica o que aconteceu: qual aba? O que deu errado?";
  },

  gerarAjudaCompleta() {
    return "🤖 <b>Sou o Assistente São Jorge!</b> 💚<br>═══════════════════════════<br>" +
      "Posso te ajudar com:<br><br>" +
      "📐 <b>Cálculos</b> → digite: 3 × 4 × 5<br>" +
      "📄 <b>Nota Fiscal</b> → como funciona<br>" +
      "🚛 <b>Rampa</b> → fórmula e conferência<br>" +
      "📦 <b>Contagem</b> → dicas e lançamento<br>" +
      "📜 <b>Histórico</b> → salvar, PDF, backup<br>" +
      "📊 <b>Dashboard</b> → entender os números<br><br>" +
      "Digite <b>ajuda</b> a qualquer momento! Em que posso ajudar? 😊";
  },

  gerarRespostaNaoEntendido() {
    let r = "🤔 Ainda não entendi bem 😅<br>";
    r += "Pergunte sobre: Nota • Rampa • Contagem • Histórico • Dashboard<br>";
    r += "Ou faça uma conta: ex. 15 × 8<br>";
    if (this.ultimoContexto) {
      r += `<br>💡 Falando sobre <b>${this.conhecimento[this.ultimoContexto]?.titulo || this.ultimoContexto}</b>? Quer continuar?`;
    }
    return r;
  },

  adicionarSugestaoProativa(resposta) {
    if (this.ultimoContexto === "contagem" && !resposta.includes("fechamento")) {
      resposta += "<br><br>💡 Depois de contar, salve no Histórico para não perder!";
    }
    if (this.ultimoContexto === "rampa" && !resposta.includes("extra")) {
      resposta += "<br><br>💡 Tem partes extras? Preencha os campos e some junto!";
    }
    return resposta;
  },

  criarBloco(pergunta, resposta) {
    return `<p><b>Você:</b> ${pergunta}</p><p><b>São Jorge 💚:</b> ${resposta}</p><hr>`;
  }
};

// FUNÇÃO PRINCIPAL — LIGADA AO BOTÃO E TECLADO
function perguntarIA() {
  const campo = document.getElementById("perguntaIA");
  const chat = document.getElementById("chatIA");
  if (!campo || !chat) return;
  const bloco = IASaoJorge.processar(campo.value);
  if (bloco) {
    chat.innerHTML += bloco;
    campo.value = "";
    chat.scrollTop = chat.scrollHeight;
  }
}

// INICIALIZAÇÃO
window.onload = function(){
  mostrarContagem();
  atualizarResumo();
  mostrarHistorico();
  mostrarTela("dashboard");
  console.log("✅ IA São Jorge pronta!");
};
