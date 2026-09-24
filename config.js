/*
  CONFIGURAÇÃO DO SITE
  Tudo que muda com frequência mora aqui. Editem este arquivo
  e façam commit; não é preciso mexer no HTML.
*/
window.SITE_CONFIG = {
  // Data e hora da cerimônia (horário de Brasília, -03:00)
  dataCasamento: "2027-04-11T10:00:00-03:00",

  // Local da cerimônia
  local: {
    nome: "",        // ex.: "Chácara Tal"  (deixe vazio para esconder)
    endereco: "",    // ex.: "Rua X, 123, Bairro, Curitiba - PR" (preenchido => mostra o mapa)
    googlePlaceId: "ChIJZxewalzh3JQRQEjkQxZiP2M" // mesmo local do site antigo
  },

  // Confirmação de presença: URL do Web App do Google Apps Script
  // (veja README.md, seção "Confirmação de presença")
  rsvpEndpoint: "",

  // Pix
  pix: {
    chave: "casamento.kevinisa@gmail.com",
    nomeRecebedor: "ISA E KEVIN", // até 25 caracteres, sem acento
    cidade: "CURITIBA"            // até 15 caracteres, sem acento
  },

  // Lista de presentes ilustrativa. Os nomes são brincadeira; o valor
  // vai direto para o Pix. Editem à vontade.
  presentes: [
    { nome: "Um café depois do date, como no primeiro", valor: 35 },
    { nome: "Rodada de chopp pilsen para os noivos", valor: 60 },
    { nome: "Velas para a próxima queda de luz", valor: 80 },
    { nome: "Jantar mexicano em homenagem ao primeiro encontro", valor: 150 },
    { nome: "Um mês de conta da Copel", valor: 250 },
    { nome: "Passeio na lua de mel", valor: 300 },
    { nome: "Uma diária de hotel na lua de mel", valor: 500 },
    { nome: "Passagem para a lua de mel", valor: 1000 }
  ]
};
