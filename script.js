/* =========================================================
   SL IMPRESSÕES 3D — CALCULADORA
   ========================================================= */

"use strict";

const MOEDAS = {
  BRL: {
    locale: "pt-BR",
    cur: "BRL",
    sim: "R$",
    kWh: 0.75,
    hora: 30,
    deprec: 3.00,
    fil: {
      PLA: 89.90,
      PETG: 109.90,
      ABS: 99.90,
      ASA: 129.90,
      TPU: 149.90,
      NYLON: 189.90,
      Outro: 100
    }
  },
  EUR: {
    locale: "pt-PT",
    cur: "EUR",
    sim: "€",
    kWh: 0.28,
    hora: 15,
    deprec: 1.50,
    fil: {
      PLA: 18.00,
      PETG: 22.00,
      ABS: 20.00,
      ASA: 26.00,
      TPU: 30.00,
      NYLON: 38.00,
      Outro: 20
    }
  },
  USD: {
    locale: "en-US",
    cur: "USD",
    sim: "US$",
    kWh: 0.15,
    hora: 12,
    deprec: 1.00,
    fil: {
      PLA: 19.00,
      PETG: 23.00,
      ABS: 21.00,
      ASA: 27.00,
      TPU: 31.00,
      NYLON: 39.00,
      Outro: 21
    }
  }
};

let MOEDA = "BRL";
let okTimer = null;

const $ = (id) => document.getElementById(id);

const M = () => MOEDAS[MOEDA];

function val(id) {
  const element = $(id);
  if (!element) return 0;

  const number = parseFloat(String(element.value).replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

function txt(id) {
  return $(id)?.value?.trim() || "";
}

function fmt(value) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  return safeValue.toLocaleString(M().locale, {
    style: "currency",
    currency: M().cur
  });
}

function escapePdfText(value) {
  return String(value ?? "").replace(/[^\x20-\x7EÀ-ÿ]/g, "");
}

function setMoeda(moeda) {
  if (!MOEDAS[moeda]) return;

  MOEDA = moeda;

  ["BRL", "EUR", "USD"].forEach((codigo) => {
    const button = $("c" + codigo);
    if (button) button.classList.toggle("on", codigo === moeda);
  });

  $("kwh").value = M().kWh;
  $("valorHora").value = M().hora;
  $("deprec").value = M().deprec;
  $("hintCur").textContent = M().sim;

  preencherMaterial();
}

function preencherMaterial() {
  const material = $("material").value;
  const preco = M().fil[material] ?? M().fil.Outro;

  $("precoKg").value = Number(preco).toFixed(2);
  calcular();
}

function calcular() {
  const mat = (val("precoKg") / 1000) *
              val("peso") *
              (1 + val("falha") / 100);

  const ene = (val("watts") / 1000) *
              val("tempo") *
              val("kwh");

  const dep = val("deprec") * val("tempo");
  const trab = val("horasTrab") * val("valorHora");
  const ext = val("extras");

  const base = mat + ene + dep + trab + ext;
  const lucro = base * (val("margem") / 100);

  const percentualDesconto = Math.min(100, Math.max(0, val("desconto")));
  const desc = (base + lucro) * (percentualDesconto / 100);

  const unit = Math.max(0, base + lucro - desc);
  const qtd = Math.max(1, Math.floor(val("qtd") || 1));
  const total = unit * qtd;

  $("rMat").textContent = fmt(mat);
  $("rEne").textContent = fmt(ene);
  $("rDep").textContent = fmt(dep);
  $("rTrab").textContent = fmt(trab);
  $("rExt").textContent = fmt(ext);
  $("rBase").textContent = fmt(base);
  $("rLuc").textContent = "+" + fmt(lucro);
  $("rDesc").textContent = desc > 0 ? "−" + fmt(desc) : fmt(0);
  $("rUnit").textContent = fmt(unit);
  $("rQtd").textContent = "× " + qtd;
  $("rTotal").textContent = fmt(total);

  return {
    mat,
    ene,
    dep,
    trab,
    ext,
    base,
    lucro,
    desc,
    unit,
    qtd,
    total
  };
}

function hoje() {
  return new Date().toLocaleDateString(M().locale);
}

function prazo() {
  const data = new Date();
  data.setHours(12, 0, 0, 0);
  data.setDate(data.getDate() + Math.max(0, Math.floor(val("validade"))));

  return data.toLocaleDateString(M().locale);
}

function numeroDocumento(prefixo) {
  const data = new Date();
  const dataTexto =
    data.getFullYear().toString() +
    String(data.getMonth() + 1).padStart(2, "0") +
    String(data.getDate()).padStart(2, "0");

  const aleatorio = Math.floor(Math.random() * 900) + 100;

  return `${prefixo}-${dataTexto}-${aleatorio}`;
}

function numOrca() {
  return numeroDocumento("ORC");
}

function numFat() {
  return numeroDocumento("FAT");
}

function zapLimpo() {
  return txt("cliZap").replace(/\D/g, "");
}

function mostrarOk(msg) {
  const el = $("msgOk");

  clearTimeout(okTimer);
  el.textContent = msg;
  el.style.display = "block";

  okTimer = setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}

function obterDados() {
  const calculo = calcular();

  return {
    cliente: txt("cliNome") || "Cliente",
    peca: txt("cliPeca") || "Peça / Projeto",
    descricaoPeca: txt("descricaoPeca") || "Peça personalizada produzida sob encomenda.",
    whatsapp: txt("cliZap"),
    email: txt("cliEmail"),
    material: $("material").value,
    precoKg: val("precoKg"),
    peso: val("peso"),
    falha: val("falha"),
    tempo: val("tempo"),
    watts: val("watts"),
    horasTrab: val("horasTrab"),
    valorHora: val("valorHora"),
    kwh: val("kwh"),
    deprec: val("deprec"),
    extras: val("extras"),
    margem: val("margem"),
    desconto: val("desconto"),
    validade: val("validade"),
    ...calculo
  };
}

function validarPdf() {
  if (!window.jspdf?.jsPDF) {
    mostrarOk("A biblioteca de PDF ainda não carregou. Verifique sua conexão e tente novamente.");
    return false;
  }

  return true;
}

function adicionarCabecalho(doc, titulo, numero) {
  doc.setFillColor(10, 83, 66);
  doc.rect(0, 0, 210, 43, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("SL IMPRESSÕES 3D", 16, 17);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("FABRICAÇÃO DIGITAL SOB MEDIDA", 16, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(titulo, 194, 15, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(numero, 194, 23, { align: "right" });
  doc.text(`Emitido em ${hoje()}`, 194, 31, { align: "right" });
  doc.setTextColor(28, 36, 34);
}

function gerarDocumentoPDF(tipo) {
  if (!validarPdf()) return;

  const dados = obterDados();
  const doc = new window.jspdf.jsPDF();
  const ehFatura = tipo === "fatura";
  const numero = ehFatura ? numFat() : numOrca();
  const titulo = ehFatura ? "FATURA" : "ORÇAMENTO";

  adicionarCabecalho(doc, titulo, numero);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 122, 95);
  doc.text("DADOS DO CLIENTE", 16, 53);
  doc.setFillColor(245, 248, 246);
  doc.roundedRect(16, 57, 178, 27, 2, 2, "F");
  doc.setTextColor(28, 36, 34);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(escapePdfText(dados.cliente), 21, 66);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const contatos = [dados.whatsapp, dados.email].filter(Boolean).map(escapePdfText);
  doc.text(contatos.length ? contatos.join("  |  ") : "Obrigado por solicitar um orçamento.", 21, 75);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 122, 95);
  doc.text("PRODUTO / PROJETO", 16, 96);
  doc.setTextColor(28, 36, 34);
  doc.setFontSize(14);
  const nomeProjeto = doc.splitTextToSize(escapePdfText(dados.peca), 176);
  doc.text(nomeProjeto, 16, 105);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const descricao = doc.splitTextToSize(escapePdfText(dados.descricaoPeca), 176);
  const descricaoY = 105 + nomeProjeto.length * 6 + 2;
  doc.text(descricao, 16, descricaoY);

  let y = descricaoY + descricao.length * 4.5 + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 122, 95);
  doc.text("ESPECIFICAÇÕES DE PRODUÇÃO", 16, y);
  y += 4;

  const especificacoes = [
    ["Material", dados.material, "Peso estimado", `${dados.peso.toLocaleString(M().locale)} g`],
    ["Impressão 3D", `${dados.tempo.toLocaleString(M().locale)} h`, "Trabalho manual", `${dados.horasTrab.toLocaleString(M().locale)} h`]
  ];

  especificacoes.forEach((linha, index) => {
    const rowY = y + index * 12;
    doc.setFillColor(index % 2 === 0 ? 245 : 250, index % 2 === 0 ? 248 : 251, index % 2 === 0 ? 246 : 250);
    doc.roundedRect(16, rowY, 178, 10, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(104, 118, 111);
    doc.text(linha[0], 20, rowY + 6.5);
    doc.text(linha[2], 107, rowY + 6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(28, 36, 34);
    doc.text(escapePdfText(linha[1]), 56, rowY + 6.5);
    doc.text(escapePdfText(linha[3]), 151, rowY + 6.5);
  });

  y += especificacoes.length * 12 + 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(13, 122, 95);
  doc.text("INVESTIMENTO", 16, y);
  y += 4;

  if (typeof doc.autoTable === "function") {
    doc.autoTable({
      startY: y,
      head: [["Item", "Qtd.", "Valor unitário", "Subtotal"]],
      body: [[escapePdfText(dados.peca), String(dados.qtd), fmt(dados.unit), fmt(dados.total)]],
      theme: "striped",
      margin: { left: 16, right: 16 },
      columnStyles: {
        0: { cellWidth: 83 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 38, halign: "right" },
        3: { cellWidth: 39, halign: "right" }
      },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3.5,
        textColor: [38, 48, 43]
      },
      headStyles: {
        fillColor: [13, 122, 95],
        textColor: [255, 255, 255],
        fontStyle: "bold"
      },
      alternateRowStyles: { fillColor: [245, 248, 246] }
    });
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`${dados.qtd} × ${escapePdfText(dados.peca)}`, 18, y + 10);
    doc.text(fmt(dados.total), 192, y + 10, { align: "right" });
  }

  const finalY = doc.lastAutoTable?.finalY || y + 16;
  const totalY = finalY + 9;
  doc.setFillColor(10, 83, 66);
  doc.roundedRect(16, totalY, 178, 23, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("VALOR TOTAL", 22, totalY + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(fmt(dados.total), 188, totalY + 15, { align: "right" });

  doc.setTextColor(104, 118, 111);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const rodape = ehFatura
    ? "Documento de fechamento de venda. Obrigado pela preferência!"
    : `Orçamento válido por ${dados.validade} dia(s), até ${prazo()}.`;
  doc.text(rodape, 16, totalY + 34);
  doc.setDrawColor(226, 232, 228);
  doc.line(16, 282, 194, 282);
  doc.setFontSize(7.5);
  doc.text("SL Impressões 3D  |  Peças personalizadas com precisão", 105, 288, { align: "center" });

  const nomeSeguro = dados.peca
    .replace(/[^\wÀ-ÿ -]/g, "")
    .trim()
    .replace(/\s+/g, "-") || "peca";

  doc.save(`${numero}-${nomeSeguro}.pdf`);

  mostrarOk(`${ehFatura ? "Fatura" : "Orçamento"} gerado com sucesso.`);
}

function gerarOrcamentoPDF() {
  gerarDocumentoPDF("orcamento");
}

function gerarFaturaPDF() {
  const dados = obterDados();

  if (dados.total <= 0) {
    mostrarOk("O total da venda precisa ser maior que zero.");
    return;
  }

  gerarDocumentoPDF("fatura");
}

function montarMensagemWhatsApp(dados) {
  return [
    `Olá${dados.cliente !== "Cliente" ? `, ${dados.cliente}` : ""}!`,
    "",
    `Segue o orçamento para *${dados.peca}*.`,
    "",
    `Material: ${dados.material}`,
    `Quantidade: ${dados.qtd}`,
    `Preço unitário: ${fmt(dados.unit)}`,
    `Total: *${fmt(dados.total)}*`,
    "",
    `Validade: ${dados.validade} dia(s).`,
    "",
    "Obrigado!"
  ].join("\n");
}

function enviarWhatsApp() {
  const dados = obterDados();
  const telefone = zapLimpo();

  if (!telefone) {
    mostrarOk("Informe o número do WhatsApp do cliente com código do país.");
    $("cliZap").focus();
    return;
  }

  const mensagem = encodeURIComponent(montarMensagemWhatsApp(dados));
  const url = `https://wa.me/${telefone}?text=${mensagem}`;

  window.open(url, "_blank", "noopener,noreferrer");
  mostrarOk("WhatsApp aberto com a mensagem pronta.");
}

function enviarEmail() {
  const dados = obterDados();
  const email = txt("cliEmail");

  if (!email) {
    mostrarOk("Informe o e-mail do cliente para abrir a mensagem.");
    $("cliEmail").focus();
    return;
  }

  const assunto = `Orçamento — ${dados.peca}`;
  const corpo = [
    `Olá, ${dados.cliente !== "Cliente" ? dados.cliente : "tudo bem"}!`,
    "",
    `Segue o orçamento para ${dados.peca}.`,
    "",
    `Material: ${dados.material}`,
    `Quantidade: ${dados.qtd}`,
    `Valor unitário: ${fmt(dados.unit)}`,
    `Valor total: ${fmt(dados.total)}`,
    "",
    `Validade: ${dados.validade} dia(s).`,
    "",
    "Atenciosamente,",
    "SL Impressões 3D"
  ].join("\n");

  const url =
    `mailto:${encodeURIComponent(email)}` +
    `?subject=${encodeURIComponent(assunto)}` +
    `&body=${encodeURIComponent(corpo)}`;

  window.location.href = url;
  mostrarOk("Seu aplicativo de e-mail foi aberto com a mensagem preparada.");
}

function inicializar() {
  ["BRL", "EUR", "USD"].forEach((codigo) => {
    $(`c${codigo}`).addEventListener("click", () => setMoeda(codigo));
  });

  $("material").addEventListener("change", preencherMaterial);

  const campos = [
    "precoKg",
    "peso",
    "falha",
    "tempo",
    "watts",
    "qtd",
    "deprec",
    "horasTrab",
    "valorHora",
    "kwh",
    "extras",
    "margem",
    "desconto",
    "validade"
  ];

  campos.forEach((id) => {
    $(id).addEventListener("input", calcular);
    $(id).addEventListener("change", calcular);
  });

  $("btnOrcamento").addEventListener("click", gerarOrcamentoPDF);
  $("btnWhatsApp").addEventListener("click", enviarWhatsApp);
  $("btnEmail").addEventListener("click", enviarEmail);
  $("btnFatura").addEventListener("click", gerarFaturaPDF);

  setMoeda("BRL");
}

document.addEventListener("DOMContentLoaded", inicializar);
