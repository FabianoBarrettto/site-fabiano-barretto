# Como cadastrar um imóvel no site

Todos os imóveis ficam em **`dados/imoveis.json`**. Não é preciso mexer no HTML.

## 1. Fotos

| Item | Padrão |
|---|---|
| Pasta | `img/imoveis/<id-do-imovel>/` (ex.: `img/imoveis/casa-2-quartos-umbu-01/`) |
| Nomes | `01.webp`, `02.webp`, … (a `01` é a capa) e `planta.webp` |
| Formato | **WebP**, qualidade ~80 |
| Tamanho | **1200 × 900 px** (proporção 4:3, deitada) |
| Peso | até **200 KB** cada (ideal 80–150 KB) |
| Quantidade | 4 a 10 fotos: fachada primeiro, depois sala, cozinha, quartos, banheiro, área externa |

Não use fotos com pessoas, placas de outras imobiliárias, logotipos da Caixa ou do Governo nem dados de clientes. O repositório é público.

## 2. Dados (copie o bloco `_modelo` para dentro da lista `imoveis`)

| Campo | O que colocar | Obrigatório |
|---|---|---|
| `id` | identificador sem espaços nem acentos, usado no endereço (`imovel.html?id=...`) e no nome da pasta de fotos | sim |
| `exemplo` | sempre `false` para imóvel real | sim |
| `destaque` | `true` para aparecer na página inicial (no máximo 3) | sim |
| `titulo` | ex.: "Casa de 2 quartos com pátio" | sim |
| `tipo` | Casa, Apartamento ou Sobrado | sim |
| `bairro` / `cidade` | bairro e cidade (o filtro de bairro usa esse nome, então escreva sempre igual) | sim |
| `valorAPartir` | número em reais, sem pontos (ex.: `195000`) | sim |
| `quartos`, `banheiros`, `vagas` | números | sim |
| `areaM2` | área privativa em m² (número) | sim |
| `descricao` | 2 a 4 frases | sim |
| `caracteristicas` | lista curta de pontos fortes | sim |
| `imagens` | lista com `src` (caminho da foto) e `alt` (descrição da foto para quem não enxerga) | sim |
| `planta` | `src` e `alt` da planta | não |

Valores são sempre "a partir de" e o site já mostra "sujeito à aprovação de crédito". Não escreva subsídio, juros nem promessas de aprovação na descrição.

## 3. Depois de cadastrar

1. Quando entrar o primeiro imóvel real, apague os 3 blocos com `"exemplo": true` (e as imagens `img/exemplo-*.svg`).
2. Adicione a URL do imóvel no `sitemap.xml` (`https://fabianobarrettoimoveis.com.br/imovel.html?id=<id>`).
3. Confira no navegador (celular e computador), registre no `CHANGELOG.md` e sincronize com o GitHub. **Cada envio vai direto para o ar.**
