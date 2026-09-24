/**
 * Confirmação de presença -> Google Planilha
 * 1. Crie uma planilha no Google Sheets.
 * 2. Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Implantar > Nova implantação > Tipo: App da Web
 *    Executar como: Eu | Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL gerada (termina em /exec) para rsvpEndpoint em js/config.js.
 */
var ABA = "Confirmações";
var COLUNAS = ["Data/hora", "Nome", "Vai?", "Adultos", "Crianças", "Acompanhantes", "E-mail", "Telefone", "Observações"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var p = e.parameter || {};
    if (p.site) return resposta({ ok: false }); // robô caiu na armadilha
    var aba = obterAba();
    aba.appendRow([
      new Date(),
      limpar(p.nome),
      p.vai === "sim" ? "Sim" : "Não",
      Number(p.adultos || 0),
      Number(p.criancas || 0),
      limpar(p.acompanhantes),
      limpar(p.email),
      limpar(p.telefone),
      limpar(p.obs)
    ]);
    return resposta({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function obterAba() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var aba = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
  if (aba.getLastRow() === 0) {
    aba.appendRow(COLUNAS);
    aba.setFrozenRows(1);
  }
  return aba;
}

// Evita que um texto começando com "=" vire fórmula na planilha
function limpar(v) {
  v = String(v || "").slice(0, 500);
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
