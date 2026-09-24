# Site de casamento Isa & Kevin

Site estático (HTML, CSS e JS puros), pronto para GitHub Pages. Nada para compilar.

```
index.html          página única com todas as seções
css/style.css       visual
js/config.js        DATA, LOCAL, PIX, RSVP E PRESENTES: editem aqui
js/main.js          lógica (contagem, confirmação, Pix/QR Code)
img/flores/         ilustrações convertidas para WebP, nomes sem acento
img/fotos/          fotos do casal (hoje são placeholders, ver passo 2)
apps-script/Code.gs script que grava as confirmações numa Google Planilha
CNAME               domínio próprio
```

## 1. Publicar no GitHub Pages

1. Crie um repositório (ex.: `casamento`) e suba todos os arquivos desta pasta, incluindo `.nojekyll` e `CNAME`.
2. Settings > Pages > Source: "Deploy from a branch", branch `main`, pasta `/ (root)`.
3. Edite o arquivo `CNAME` com o domínio de vocês (uma linha só, ex.: `isaekevin.com.br`).
4. No painel do domínio (Registro.br ou outro), crie os registros DNS:
   - Domínio raiz: 4 registros **A** apontando para `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: um **CNAME** apontando para `SEU-USUARIO.github.io`
5. Depois que o DNS propagar, marque "Enforce HTTPS" em Settings > Pages.

## 2. Trazer as fotos do site antigo

Rode dentro da pasta do projeto (Mac/Linux ou Git Bash no Windows):

```bash
B=https://cdn-assets-legacy.casar.com
curl -L -o img/fotos/capa.jpg               "$B/thumb/autoxautox1xx0,1063,2252,2252/dados/temp/69e18c03736d91776389123.jpg"
curl -L -o img/fotos/primeiro-eu-te-amo.jpg "$B/dados/sitenoivos/wed1204972/paginas/f0nHx_1775935045.jpg"
curl -L -o img/fotos/gincana.jpg            "$B/dados/sitenoivos/wed1204972/paginas/igO4S_1775935138.jpg"
curl -L -o img/fotos/pedido.jpg             "$B/dados/sitenoivos/wed1204972/paginas/URM9z_1775935702.jpg"
curl -L -o img/fotos/vamos-nos-casar.png    "$B/dados/sitenoivos/wed1204972/paginas/T1KNG_1775935936.png"
curl -L -o img/fotos/local.jpg              "$B/dados/sitenoivos/wed1204972/paginas/s8JMH_1784408931.jpg"
```

Se preferirem fotos originais em alta, reduzam para no máximo 1600 px no lado maior antes de subir (ex.: squoosh.app). Mantenham os mesmos nomes de arquivo.

## 3. Confirmação de presença

GitHub Pages não guarda dados, então as respostas vão para uma Google Planilha:

1. Crie uma planilha no Google Sheets.
2. Extensões > Apps Script, cole o conteúdo de `apps-script/Code.gs`, salve.
3. Implantar > Nova implantação > App da Web. Executar como: **Eu**. Acesso: **Qualquer pessoa**. Autorize.
4. Copie a URL que termina em `/exec` para `rsvpEndpoint` em `js/config.js`.
5. Teste enviando uma confirmação pelo site e confira a aba "Confirmações".

Se alterarem o script depois, é preciso fazer uma **nova versão** da implantação (Gerenciar implantações > editar > Nova versão); senão a URL continua rodando o código antigo.

## 4. Pix

A lista de presentes gera QR Code e "copia e cola" com o valor já preenchido, a partir da chave em `js/config.js`. **Antes de divulgar o site, façam um Pix de teste de R$ 1 pelo QR Code** em pelo menos dois bancos diferentes para confirmar que chega na conta certa.

## 5. Editar conteúdo

- Local, data, chave Pix, presentes: `js/config.js`.
- Textos da história e da cerimônia: direto no `index.html`, cada capítulo é um bloco `<article class="capitulo">`.
- Para trocar a flor de um capítulo, troque o `src` da imagem e o texto da etiqueta logo abaixo.
