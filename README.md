# Mítica — Bestiário do Folclore Brasileiro

**Instituição:** IFPB — Campus Itaporanga  
**Turma:** Info 2 Vespertino

**Integrantes:**

- Jullya
- Marina
- Naylanne

Mítica é um bestiário do folclore brasileiro feito com HTML, CSS e JavaScript puro. Os personagens são carregados pelo `json-server` e os favoritos ficam salvos no `localStorage` do navegador.

## Requisitos

- Node.js 18 ou superior
- npm, instalado junto com o Node.js

## Instalação

Na pasta do projeto, execute:

```bash
npm ci
```

## Execução

Abra dois terminais na pasta do projeto.

No primeiro, inicie a API:

```bash
npm run api
```

A API ficará disponível em `http://localhost:3001/personagens`.

No segundo, inicie o servidor do frontend:

```bash
npm run dev
```

Abra `http://127.0.0.1:3000` no navegador.

## Comandos disponíveis

- `npm ci`: instala exatamente as dependências registradas no `package-lock.json`.
- `npm run api`: inicia o `json-server` usando o arquivo `db.json` da raiz.
- `npm run dev`: serve o frontend com o servidor HTTP incluído no projeto.

## Estrutura principal

- `index.html`: estrutura da página e templates dos cards, detalhes e favoritos.
- `style.css`: estilos responsivos em CSS puro.
- `app.js`: roteamento, busca, filtros, carregamento da API e favoritos.
- `db.json`: 50 personagens do folclore brasileiro.
- `server.js`: servidor local do frontend, sem dependências adicionais.

## Favoritos

Os IDs dos favoritos são armazenados no navegador com a chave `mitica:favoritos`. A API não armazena favoritos.

## Imagens

Os registros do banco possuem caminhos de imagem como `img/curupira.svg`. Quando uma imagem não está disponível, o frontend remove a imagem quebrada e mantém o emoji do personagem como alternativa visual.
