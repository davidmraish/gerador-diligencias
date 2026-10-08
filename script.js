"use strict";

/* =====================================================================
   GERADOR DE DILIGÊNCIAS – CGP/PMCE
   JavaScript puro. Sem servidor, sem internet, sem instalação.

   ÍNDICE
   1. TEXTOS DO DOCUMENTO  <-- é AQUI que você edita o modelo
   2. Estado e utilitários
   3. Diligências dinâmicas
   4. Montagem do documento
   5. Validação
   6. Impressão (PDF), limpar e rascunho
   7. Inicialização
   ===================================================================== */


/* =====================================================================
   1. TEXTOS DO DOCUMENTO
   Tudo que aparece escrito no PDF está neste bloco.
   Os trechos {{ASSIM}} são substituídos pelos dados do formulário.
   ===================================================================== */

// Configurações fixas
const CIDADE = "Fortaleza";
const TEXTO_PERIODO_PADRAO = "De acordo com a lotação no SAPM";   // período automático da 2ª diligência em diante

// Assinantes pré-cadastrados (aparecem na lista "QUEM ASSINA").
// Para incluir outro assinante fixo, copie o bloco { ... } e mude os dados.
const ASSINANTES = [
  {
    id: "asmenha",
    rotulo: "CEL ASMENHA – Coordenadora de Gestão de Pessoas da PMCE",
    nome: "Francisca ASMENHA Cruz Furtado Torquato",
    posto: "CEL QOPM",
    cargo: "COORDENADORA DE GESTÃO DE PESSOAS DA PMCE",
    mf: "10851319"
  }
];

// Cabeçalho (repete em todas as páginas)
const CABECALHO = `
  <img src="img/logo-cabecalho.png" alt="">
  <p class="numci">Diligência {{NUM_CI}}</p>
`;

// Rodapé (repete em todas as páginas)
const RODAPE = `
  <p><b>COORDENADORIA DE GESTÃO DE PESSOAS DA POLÍCIA MILITAR DO CEARÁ</b></p>
  <p>Av. Aguanambi, 2280 - ANEXO – Fátima • CEP 60.055-400 • Fortaleza / CE</p>
  <p>Fone: (85) 3101-4934 • e-mail: celuladepessoal.cgp@policiamilitar.ce.gov.br</p>
  <img src="img/faixa-rodape.png" alt="">
`;

// Texto de cada diligência: {{N}} = número, {{UNIDADE}}, {{PERIODO}}
const MODELO_DILIGENCIA = `
  <div class="dil">
    <p><b>{{N}}ª DILIGÊNCIA – {{UNIDADE}}</b></p>
    <p><b>Período:</b> {{PERIODO}}</p>
    <p><b>Prazo para resposta:</b> Conforme prazo do NUP</p>
  </div>
`;

// Corpo do documento
const MODELO = `
  <p class="data">Fortaleza, {{DATA}}</p>

  <p class="rec">Em atenção ao Ofício nº {{OFICIO}}, que solicita informações funcionais sobre as férias não gozadas do Policial Militar <b>{{NOME_PM}}, MF {{MF_PM}}</b>, para subsidiar a defesa do Estado em juízo, informamos que, diante da complexidade temporal e da necessidade de consulta às diversas unidades onde o referido militar prestou serviços durante seus anos de atividade ({{PERIODO_PM}}), será necessário encaminhar diligências específicas para cada destino como no demonstrado nas diligências a seguir conforme espelho do SAPM das transferências do policial militar ao final deste documento.</p>
  <p class="v">&nbsp;</p>

  <p class="tit">CRONOGRAMA DE DILIGÊNCIAS</p>
  <p class="v">&nbsp;</p>

  <p class="rec">Com base no histórico funcional apresentado e observando a <b>URGÊNCIA</b> do prazo processual, determinamos o seguinte cronograma de diligências, com <b>prazo de 03 (três) dias</b> para cada unidade.</p>
  <p class="rec"><b>Caso alguma unidade aqui mencionada em que o militar tenha servido, tenha sido desativada, extinta ou reestruturada,</b> solicita-se em ato continuo que a presente diligência seja <b>encaminhada imediatamente</b> ao Batalhão ao qual a referida unidade esteja <b>atualmente vinculada</b>, para que sejam prestadas as informações solicitadas pela PGE.</p>
  <p class="v">&nbsp;</p>

  {{DILIGENCIAS}}
  <p class="v">&nbsp;</p>

  <p class="rec2 largo-d">Às unidades acima citadas, solicita-se informações detalhadas sobre a permanência do militar nesta sobre registro de <b>concessão, e principalmente ao efetivo gozo de férias registrados, referentes ao período em que o militar esteve de serviço do militar</b>, remete-se os pedidos com a finalidade de buscar nos arquivo das referidas unidades as informações:</p>
  <p class="v">&nbsp;</p>
  <ul>
    <li class="sem-d">Registros de concessão de férias durante sua lotação (<b>ANEXAR</b>: BOLETIM INTERNO, BCG, LIVROS E QUALQUER DOCUMENTO QUE CONTENHA INFORMAÇÕES SOBRE O EFETIVO GOZO);</li>
    <li class="sem-d">Comprovação documental de gozo ou não gozo das férias regulamentares;</li>
    <li class="sem-d"><b>Se há COMPROVAÇÃO DE GOZO EFETIVO das férias concedidas;</b></li>
    <li class="sem-d">Documentação que comprove ou não o usufruto das férias do referido ano;</li>
    <li class="sem-d">Atos administrativos que justifiquem o não gozo, se houver.</li>
  </ul>
  <p class="v">&nbsp;</p>

  <p class="negrito">RESUMIDO DAS UNIDADES:</p>
  {{RESUMO_UNIDADES}}
  <p class="v">&nbsp;</p>

  {{ESPELHO_SAPM}}

  <p class="tit tit14">QUESTÕES ESPECÍFICAS A SEREM ESCLARECIDAS:</p>
  <p class="v">&nbsp;</p>
  <p class="rec2">Conforme solicitado no Ofício da PGE, cada unidade deve informar obrigatoriamente INFORMAÇÕES SOBRE O GOZO DAS FÉRIAS:</p>
  <p class="v">&nbsp;</p>
  <ol>
    <li><b>Se as férias não gozadas foram averbadas como tempo de serviço ou utilizadas para alguma outra finalidade</b></li>
    <li><b>Se o militar subscreveu declaração abdicando do gozo de eventuais férias não gozadas</b></li>
    <li><b>Informações adicionais incluindo frequência e/ou escala de serviço nos períodos de férias concedidas e não gozadas</b></li>
    <li><b>Se houve pagamento de terço férias dos períodos</b></li>
  </ol>
  <p class="v">&nbsp;</p>

  <p class="tit tit14">INSTRUÇÕES GERAIS PARA TODAS AS UNIDADES:</p>
  <p class="v">&nbsp;</p>
  <ol>
    <li><b>URGÊNCIA:</b> Considerando o prazo processual exíguo, cada unidade terá <b>APENAS 3 (TRÊS) DIAS</b> para resposta;</li>
    <li><b>DOCUMENTAÇÃO:</b> Anexar cópias de todos os documentos que comprovem as informações prestadas (BOLETIM INTERNO, BCG, LIVROS E QUALQUER DOCUMENTO QUE CONTENHA INFORMAÇÕES SOBRE O EFETIVO GOZO);</li>
    <li><b>COMPILAÇÃO:</b> Após cada resposta, os autos devem seguir fidedignamente a ordem das DILIGÊNCIAS, preliminarmente elencadas e somente aí retornarão à <b>CGP/CCP</b> para compilação das informações antes de seguir para a PGE;</li>
    <li><b>TRAMITAÇÃO:</b> O NUP seguirá a ordem estabelecida, retornando automaticamente à <b>PGE</b> após todas as diligências.</li>
  </ol>
  <p class="v">&nbsp;</p>

  <div class="final">
    <p class="tit tit14">PERÍODOS ESPECÍFICOS EM ANÁLISE:</p>
    <p class="v">&nbsp;</p>
    {{PERIODOS_ESPECIFICOS}}
    <p class="rec">Ressaltamos que o não cumprimento dos prazos estabelecidos poderá comprometer a defesa judicial do Estado do Ceará no referido processo.</p>

    <div class="assinatura">
      <p class="espaco-ass-topo">Atenciosamente,</p>
      <div class="espaco-ass"></div>
      <p class="ass">{{ASSINANTE}} – <b>{{POSTO_ASSINANTE}}</b></p>
      <p class="ass"><b>{{CARGO_ASSINANTE}}</b></p>
      <p class="ass">MF {{MF_ASSINANTE}}</p>
    </div>
  </div>
`;

// Seção do espelho do SAPM (só aparece se houver imagem)
const MODELO_ESPELHO = `
  <div class="espelho">
    <p class="c negrito">ESPELHO DO SAPM DAS TRANSFERÊNCIAS DO POLICIAL MILITAR</p>
    <p class="v">&nbsp;</p>
    {{IMAGEM_SAPM}}
    <p class="v">&nbsp;</p>
  </div>
`;


/* =====================================================================
   2. ESTADO E UTILITÁRIOS
   ===================================================================== */

const $ = (id) => document.getElementById(id);

const CAMPOS = ["numCi", "data", "nomePm", "mfPm", "ingresso", "saida",
                "oficio", "periodosEsp", "assNome", "assPosto", "assCargo", "assMf"];

const ROTULOS = {
  numCi: "NUM-CI", nomePm: "Nome do Policial Militar", mfPm: "Matrícula / MF do Policial Militar",
  ingresso: "Data de ingresso", saida: "Data de saída", oficio: "Número do Ofício",
  assNome: "Nome do assinante", assPosto: "Posto / Graduação do assinante",
  assCargo: "Cargo do assinante", assMf: "MF do assinante"
};

const CHAVE_RASCUNHO = "gerador-diligencias-rascunho";

function novaDiligencia() { return { unidade: "", periodo: "", manual: false }; }
let diligencias = [novaDiligencia()];
let imagemSapm = "";   // imagem em base64, fica só na memória do navegador

function esc(texto) {
  return String(texto == null ? "" : texto)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function hojeISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}

function formatarData(iso) {            // 2026-10-07 -> 07/10/2026
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return d + "/" + m + "/" + a;
}

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
               "agosto", "setembro", "outubro", "novembro", "dezembro"];

function formatarDataExtensa(iso) {     // 2026-10-08 -> 08 de outubro de 2026
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return d + " de " + MESES[Number(m) - 1] + " de " + a;
}

function preencher(modelo, mapa) {      // troca {{CHAVE}} pelo valor
  return modelo.replace(/\{\{(\w+)\}\}/g, (achou, chave) =>
    Object.prototype.hasOwnProperty.call(mapa, chave) ? mapa[chave] : achou);
}

function lerFormulario() {
  const v = {};
  CAMPOS.forEach((id) => { v[id] = $(id).value.trim(); });
  return v;
}

function mostrarMensagem(tipo, titulo, lista) {
  const caixa = $("mensagem");
  let html = "<strong>" + esc(titulo) + "</strong>";
  if (lista && lista.length) {
    html += "<ul>" + lista.map((i) => "<li>" + esc(i) + "</li>").join("") + "</ul>";
  }
  caixa.className = "mensagem " + tipo;
  caixa.innerHTML = html;
  caixa.hidden = false;
  caixa.scrollIntoView({ behavior: "smooth", block: "center" });
}

function esconderMensagem() { $("mensagem").hidden = true; }


/* =====================================================================
   3. DILIGÊNCIAS DINÂMICAS
   ===================================================================== */

// Período automático: 1ª diligência = data de ingresso; demais = texto padrão do SAPM.
// Só vale enquanto a pessoa não edita o campo (d.manual = false).
function periodoAutomatico(i) {
  return i === 0 ? formatarData($("ingresso").value) : TEXTO_PERIODO_PADRAO;
}

function aplicarPeriodosAutomaticos() {
  diligencias.forEach((d, i) => {
    if (d.manual) return;
    d.periodo = periodoAutomatico(i);
    const campo = document.querySelector('#listaDilig [data-i="' + i + '"][data-campo="periodo"]');
    if (campo) campo.value = d.periodo;
  });
}

function desenharDiligencias() {
  aplicarPeriodosAutomaticos();
  const caixa = $("listaDilig");
  caixa.innerHTML = "";

  diligencias.forEach((d, i) => {
    const cartao = document.createElement("div");
    cartao.className = "dilig";
    cartao.innerHTML =
      '<div class="dilig-topo"><strong>DILIGÊNCIA ' + (i + 1) + '</strong>' +
      '<button type="button" class="btn-link" data-remover="' + i + '">REMOVER</button></div>' +
      '<div class="grade">' +
      '<label>UNIDADE / LOCAL <span class="obr">*</span>' +
      '<input type="text" data-i="' + i + '" data-campo="unidade" placeholder="Ex.: 3º CPG"></label>' +
      '<label>PERÍODO <span class="obr">*</span>' +
      '<input type="text" data-i="' + i + '" data-campo="periodo" placeholder="Automático (pode editar)"></label>' +
      '</div>';
    caixa.appendChild(cartao);
    cartao.querySelector('[data-campo="unidade"]').value = d.unidade;
    cartao.querySelector('[data-campo="periodo"]').value = d.periodo;
  });
}

function adicionarDiligencia() {
  diligencias.push(novaDiligencia());
  desenharDiligencias();
  atualizar();
  const campos = document.querySelectorAll('#listaDilig [data-campo="unidade"]');
  if (campos.length) campos[campos.length - 1].focus();
}

function removerDiligencia(indice) {
  diligencias.splice(indice, 1);        // a numeração é refeita sozinha
  desenharDiligencias();
  atualizar();
}


/* =====================================================================
   4. MONTAGEM DO DOCUMENTO
   ===================================================================== */

function htmlNomeAssinante(nome) {
  // Palavras só em MAIÚSCULAS (nome de guerra) saem em negrito, como no modelo
  return nome.split(/\s+/).map((p) =>
    /^[A-ZÀ-ÖØ-Þ]{2,}$/.test(p) ? "<b>" + esc(p) + "</b>" : esc(p)).join(" ");
}

function htmlDiligencias(lista) {
  return lista.map((d, i) => preencher(MODELO_DILIGENCIA, {
    N: i + 1, UNIDADE: esc(d.unidade), PERIODO: esc(d.periodo)
  })).join('<p class="v">&nbsp;</p>');
}

function htmlResumo(lista) {
  const itens = lista.map((d) => "<li>" + esc(d.unidade) + ":</li>");
  itens.push("<li>Retorno PGE:</li>");
  return '<ul class="resumo">' + itens.join("") + "</ul>";
}

function htmlPeriodosEspecificos(texto) {
  if (!texto) return "";
  const paragrafos = texto.split(/\n+/).map((t) => '<p class="rec">' + esc(t) + "</p>").join("");
  return paragrafos + '<p class="v">&nbsp;</p>';
}

function montarDocumento() {
  const v = lerFormulario();
  const periodoPm = formatarData(v.ingresso) + " a " + formatarData(v.saida);

  const espelho = imagemSapm
    ? preencher(MODELO_ESPELHO, { IMAGEM_SAPM: '<img src="' + imagemSapm + '" alt="Espelho do SAPM">' })
    : "";

  const mapa = {
    NUM_CI: esc(v.numCi),
    DATA: esc(formatarDataExtensa(v.data)),
    OFICIO: esc(v.oficio),
    NOME_PM: esc(v.nomePm),
    MF_PM: esc(v.mfPm),
    DATA_INGRESSO: esc(formatarData(v.ingresso)),
    DATA_SAIDA: esc(formatarData(v.saida)),
    PERIODO_PM: esc(periodoPm),
    DILIGENCIAS: htmlDiligencias(diligencias),
    RESUMO_UNIDADES: htmlResumo(diligencias),
    PERIODOS_ESPECIFICOS: htmlPeriodosEspecificos(v.periodosEsp),
    ESPELHO_SAPM: espelho,
    ASSINANTE: htmlNomeAssinante(v.assNome),
    POSTO_ASSINANTE: esc(v.assPosto),
    CARGO_ASSINANTE: esc(v.assCargo),
    MF_ASSINANTE: esc(v.assMf)
  };

  // Cabeçalho e rodapé são tabelas (thead/tfoot) para repetir em toda página impressa
  return '<table class="pagina">' +
    '<thead><tr><td class="cab">' + preencher(CABECALHO, mapa) + "</td></tr></thead>" +
    '<tfoot><tr><td class="rod"><div class="rod-tela">' + RODAPE + "</div></td></tr></tfoot>" +
    '<tbody><tr><td class="corpo">' + preencher(MODELO, mapa) + "</td></tr></tbody>" +
    "</table>" +
    // cópia do rodapé usada só na impressão (fica fixa na base de cada página)
    '<div class="rod-fixo">' + RODAPE + "</div>";
}

function atualizar() {
  $("folha").innerHTML = montarDocumento();
  $("avisoSemSapm").hidden = !!imagemSapm;
}


/* =====================================================================
   5. VALIDAÇÃO
   ===================================================================== */

function validar() {
  const v = lerFormulario();
  const erros = [];

  ["numCi", "nomePm", "mfPm", "ingresso", "saida", "oficio"].forEach((id) => {
    if (!v[id]) erros.push("Falta preencher: " + ROTULOS[id]);
  });

  if (v.ingresso && v.saida && v.saida < v.ingresso) {
    erros.push("A data de saída não pode ser anterior à data de ingresso.");
  }

  if (diligencias.length === 0) {
    erros.push("Adicione pelo menos uma diligência.");
  }
  diligencias.forEach((d, i) => {
    if (!d.unidade.trim()) erros.push("Diligência " + (i + 1) + ": falta a Unidade / Local.");
    if (!d.periodo.trim()) erros.push("Diligência " + (i + 1) + ": falta o Período.");
  });

  ["assNome", "assPosto", "assCargo", "assMf"].forEach((id) => {
    if (!v[id]) erros.push("Falta preencher: " + ROTULOS[id]);
  });

  return erros;
}


/* =====================================================================
   6. IMPRESSÃO (PDF), LIMPAR E RASCUNHO
   ===================================================================== */

function visualizar() {
  atualizar();
  const erros = validar();
  if (erros.length) {
    mostrarMensagem("erro", "O documento foi montado, mas ainda há pendências:", erros);
  } else {
    esconderMensagem();
  }
  $("areaPrevia").scrollIntoView({ behavior: "smooth", block: "start" });
}

function gerarPdf() {
  const erros = validar();
  if (erros.length) {
    mostrarMensagem("erro", "Não foi possível gerar o PDF. Corrija:", erros);
    return;                                   // NÃO chama window.print()
  }
  esconderMensagem();
  atualizar();

  // O Chrome usa o título da página como nome sugerido do arquivo PDF
  const tituloOriginal = document.title;
  const numero = $("numCi").value.trim().replace(/[^\w-]+/g, "-");
  document.title = "Diligencia_" + numero;
  window.scrollTo(0, 0);                      // evita falha do rodapé fixo ao imprimir rolado
  window.print();
  document.title = tituloOriginal;
}

function limpar() {
  if (!confirm("Tem certeza que deseja limpar o formulário?")) return;
  CAMPOS.forEach((id) => { $(id).value = ""; });
  $("data").value = hojeISO();
  diligencias = [novaDiligencia()];
  $("assSelect").value = ASSINANTES[0].id;
  aplicarAssinante();
  removerImagem();
  desenharDiligencias();
  esconderMensagem();
  atualizar();
}

/* ---- imagem do SAPM ---- */
function carregarImagem(arquivo) {
  if (!arquivo) return;
  const tiposOk = ["image/png", "image/jpeg"];
  if (!tiposOk.includes(arquivo.type)) {
    $("arqSapm").value = "";
    mostrarMensagem("erro", "Formato não aceito. Use uma imagem PNG, JPG ou JPEG.");
    return;
  }
  const leitor = new FileReader();
  leitor.onload = () => {
    imagemSapm = leitor.result;
    mostrarMiniatura();
    atualizar();
  };
  leitor.readAsDataURL(arquivo);
}

function mostrarMiniatura() {
  $("sapmInfo").hidden = !imagemSapm;
  $("sapmMiniatura").src = imagemSapm || "";
}

function removerImagem() {
  imagemSapm = "";
  $("arqSapm").value = "";
  mostrarMiniatura();
  atualizar();
}

/* ---- rascunho (localStorage: fica só neste navegador) ---- */
function salvarRascunho() {
  const dados = { campos: lerFormulario(), diligencias: diligencias, imagem: imagemSapm, assinante: $("assSelect").value };
  try {
    localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
    mostrarMensagem("ok", "Rascunho salvo neste navegador.");
  } catch (e) {
    // imagem muito grande para o limite do navegador: tenta salvar sem a imagem
    try {
      dados.imagem = "";
      localStorage.setItem(CHAVE_RASCUNHO, JSON.stringify(dados));
      mostrarMensagem("ok", "Rascunho salvo, mas SEM a imagem do SAPM (arquivo grande demais). Anexe a imagem novamente depois de carregar.");
    } catch (e2) {
      mostrarMensagem("erro", "Não foi possível salvar o rascunho neste navegador.");
    }
  }
}

function carregarRascunho() {
  let dados = null;
  try { dados = JSON.parse(localStorage.getItem(CHAVE_RASCUNHO)); } catch (e) { dados = null; }
  if (!dados) {
    mostrarMensagem("erro", "Não há rascunho salvo neste navegador.");
    return;
  }
  CAMPOS.forEach((id) => { $(id).value = (dados.campos && dados.campos[id]) || ""; });
  diligencias = Array.isArray(dados.diligencias) && dados.diligencias.length
    ? dados.diligencias.map((d) => ({
        unidade: d.unidade || "", periodo: d.periodo || "",
        manual: d.manual !== undefined ? !!d.manual : !!d.periodo
      }))
    : [novaDiligencia()];
  $("assSelect").value = dados.assinante || "outro";
  aplicarAssinante();
  imagemSapm = dados.imagem || "";
  $("arqSapm").value = "";
  mostrarMiniatura();
  desenharDiligencias();
  atualizar();
  mostrarMensagem("ok", "Rascunho carregado.");
}


/* ---- assinante: lista pré-cadastrada + opção "outro" ---- */
function montarListaAssinantes() {
  const sel = $("assSelect");
  sel.innerHTML = "";
  ASSINANTES.forEach((a) => {
    const op = document.createElement("option");
    op.value = a.id; op.textContent = a.rotulo;
    sel.appendChild(op);
  });
  const outro = document.createElement("option");
  outro.value = "outro"; outro.textContent = "Outro (digitar manualmente)";
  sel.appendChild(outro);
}

function aplicarAssinante() {
  const pre = ASSINANTES.find((a) => a.id === $("assSelect").value);
  if (pre) {
    $("assNome").value = pre.nome; $("assPosto").value = pre.posto;
    $("assCargo").value = pre.cargo; $("assMf").value = pre.mf;
    $("assResumo").textContent = pre.nome + " – " + pre.posto + " · " + pre.cargo + " · MF " + pre.mf;
  }
  $("assResumo").hidden = !pre;
  $("assManual").hidden = !!pre;
}


/* =====================================================================
   7. INICIALIZAÇÃO
   ===================================================================== */

function iniciar() {
  $("data").value = hojeISO();                 // data de hoje (pode ser alterada)
  montarListaAssinantes();
  $("assSelect").value = ASSINANTES[0].id;     // padrão: primeiro assinante da lista
  aplicarAssinante();
  desenharDiligencias();

  $("assSelect").addEventListener("change", () => {
    if ($("assSelect").value === "outro") {    // limpa para digitar outro assinante
      ["assNome", "assPosto", "assCargo", "assMf"].forEach((id) => { $(id).value = ""; });
    }
    aplicarAssinante();
    atualizar();
  });

  // ao mudar o ingresso, a 1ª diligência acompanha (se não foi editada à mão)
  $("ingresso").addEventListener("input", () => { aplicarPeriodosAutomaticos(); atualizar(); });

  // atualiza a prévia enquanto o usuário digita
  CAMPOS.forEach((id) => $(id).addEventListener("input", atualizar));

  $("listaDilig").addEventListener("input", (ev) => {
    const alvo = ev.target;
    if (alvo.dataset && alvo.dataset.campo) {
      const d = diligencias[Number(alvo.dataset.i)];
      d[alvo.dataset.campo] = alvo.value;
      if (alvo.dataset.campo === "periodo") d.manual = alvo.value.trim() !== "";
      atualizar();
    }
  });
  // se o período for apagado, volta ao valor automático
  $("listaDilig").addEventListener("change", (ev) => {
    const alvo = ev.target;
    if (alvo.dataset && alvo.dataset.campo === "periodo" && alvo.value.trim() === "") {
      diligencias[Number(alvo.dataset.i)].manual = false;
      aplicarPeriodosAutomaticos();
      atualizar();
    }
  });
  $("listaDilig").addEventListener("click", (ev) => {
    const indice = ev.target.dataset && ev.target.dataset.remover;
    if (indice !== undefined) removerDiligencia(Number(indice));
  });

  $("btnAddDilig").addEventListener("click", adicionarDiligencia);
  $("arqSapm").addEventListener("change", (ev) => carregarImagem(ev.target.files[0]));
  $("btnRemoverSapm").addEventListener("click", removerImagem);

  $("btnVisualizar").addEventListener("click", visualizar);
  $("btnPdf").addEventListener("click", gerarPdf);
  $("btnLimpar").addEventListener("click", limpar);
  $("btnSalvar").addEventListener("click", salvarRascunho);
  $("btnCarregar").addEventListener("click", carregarRascunho);

  // Também vale para Ctrl+P: sempre voltar ao topo antes de imprimir
  window.addEventListener("beforeprint", () => window.scrollTo(0, 0));

  atualizar();
}

iniciar();
