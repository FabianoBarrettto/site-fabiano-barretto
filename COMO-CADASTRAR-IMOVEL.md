# Como cadastrar um imóvel no site

Todos os imóveis ficam em **`dados/imoveis.json`**. Não é preciso mexer no HTML.

## 1. Fotos

| Item | Padrão |
|---|---|
| Pasta | `img/imoveis/<id-do-imovel>/` (ex.: `img/imoveis/casa-2-quartos-umbu-01/`) |
| Nomes | `01.webp`, `02.webp`, … (a `01` é a capa) e `planta.webp` |
| Formato | **WebP**, qualidade ~80, sem metadados (EXIF/GPS), com a marca d'água do logo no canto inferior direito |
| Tamanho | **1200 × 900 px** (proporção 4:3, deitada) |
| Peso | até **200 KB** cada (ideal 80–150 KB) |
| Quantidade | 4 a 10 fotos: fachada primeiro, depois sala, cozinha, quartos, banheiro, área externa |

Não use fotos com pessoas, placas de outras imobiliárias, logotipos da Caixa ou do Governo nem dados de clientes. O repositório é público.

## 1b. Vídeo

| Item | Padrão |
|---|---|
| Arquivo | `img/imoveis/<id>/video.mp4` (H.264 + AAC, vem tratado pelo Designer) |
| Formato | vertical (9:16), até ~1 minuto, de preferência até 10 MB |
| Capa | `img/imoveis/<id>/poster.jpg` (primeiro quadro bonito do vídeo) |
| Metadados | tirar sempre (vídeo de celular guarda a localização): `ffmpeg -i entrada.mp4 -map_metadata -1 -c copy -movflags +faststart video.mp4` |

| Mini-player | `img/imoveis/<id>/video-mini.mp4`: 360×640, 15 a 20 s dos melhores trechos (sem abertura nem cartão final), sem áudio, até ~3 MB. Ex.: `ffmpeg -i video.mp4 -filter_complex "[0:v]trim=1.5:11.5,setpts=PTS-STARTPTS[a];[0:v]trim=16:24,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1,scale=360:640[v]" -map "[v]" -an -c:v libx264 -crf 27 -movflags +faststart -map_metadata -1 video-mini.mp4` |

**Padrão para todo imóvel com vídeo** (aprovado pelo usuário em 2026-11-15): o mini-player é automático. Basta preencher `video` com `arquivo`, `poster` e `mini`. O Designer entrega `site.mp4`, `poster.jpg` e, de preferência, o `video-mini.mp4`; se o mini não vier, gere-o com o comando acima, escolhendo os trechos. Com `mini`, a página do imóvel mostra um mini-player no canto inferior esquerdo, sem som e em loop, que abre o vídeo completo ao ser tocado. Ele pode ser fechado no X e não roda sozinho para quem pede menos movimento ou economia de dados. A seção "Vídeo do imóvel" abaixo da galeria não toca sozinha e só baixa o vídeo quando a pessoa aperta o play.

## 2. Dados (copie o bloco `_modelo` para dentro da lista `imoveis`)

| Campo | O que colocar | Obrigatório |
|---|---|---|
| `id` | identificador sem espaços nem acentos, usado no endereço (`imovel.html?id=...`) e no nome da pasta de fotos | sim |
| `categoria` | `mcmv` (Minha Casa Minha Vida) ou `medio-alto` (médio e alto padrão). Define em qual faixa da página inicial e em qual filtro o imóvel aparece | sim |
| `destaque` | `true` para aparecer na página inicial. A faixa do MCMV mostra todos, dos mais novos (últimos do cadastro) para os mais antigos; a de médio e alto padrão mostra até 3. Use `false` para tirar um imóvel da página inicial sem apagá-lo | sim |
| `etiqueta` | texto curto que aparece no canto da foto, ex.: "Aceita FGTS", "Pronto para morar", "Na planta", "Condomínio fechado" | não |
| `titulo` | ex.: "Casa de 2 quartos com pátio" | sim |
| `tipo` | Casa, Apartamento ou Sobrado | sim |
| `bairro` / `cidade` | bairro e cidade (o filtro de bairro usa esse nome, então escreva sempre igual) | sim |
| `valorAPartir` | número em reais, sem pontos (ex.: `195000`). Sem valor definido, escreva `"consulte"`: o site mostra "Consulte" no card e na página, e o imóvel só aparece na busca com "Qualquer valor" | sim |
| `quartos`, `banheiros`, `vagas` | números. `vagas` também aceita texto, ex.: `"Vaga rotativa"` (aparece como "Garagem") | sim |
| `areaM2` | área privativa em m²: número (`48`) ou faixa em texto (`"28 a 32"`) | sim |
| `nota` | observação em letra pequena abaixo das características, ex.: `"*Sujeito à análise de crédito."` | não |
| `descricao` | 2 a 4 frases | sim |
| `caracteristicas` | lista curta de pontos fortes | sim |
| `imagens` | lista com `src` (caminho da foto) e `alt` (descrição da foto para quem não enxerga) | sim |
| `planta` | `src` e `alt` da planta | não |
| `video` | vídeo próprio do imóvel: `{ "arquivo": "img/imoveis/<id>/video.mp4", "poster": "img/imoveis/<id>/poster.jpg", "mini": "img/imoveis/<id>/video-mini.mp4", "largura": 720, "altura": 1280 }` (largura e altura do vídeo, para o player não pular de tamanho). Aparece abaixo da galeria, com o título "Vídeo do imóvel", e o card ganha o selo "▶ Vídeo" | não |
| `youtube` | link de vídeo no YouTube (`https://youtu.be/...`). Mostra só a capa; o player do YouTube carrega quando a pessoa clica | não |
| `inteira` (dentro de `imagens`) | versão 4:5 da foto, para a galeria mostrar o imóvel sem corte (ex.: fachadas) | não |

Valores são sempre "a partir de" e o site já mostra "sujeito à aprovação de crédito". Não escreva subsídio, juros nem promessas de aprovação na descrição.

## 3. Depois de cadastrar

1. O site só mostra imóveis reais. Se uma categoria ficar sem imóveis, a página inicial esconde a faixa de médio e alto padrão (fica o texto com o botão "Atendimento exclusivo") e mostra uma mensagem com o WhatsApp na faixa do MCMV, na busca e na página de imóveis. Para tirar um imóvel vendido, apague o bloco dele, a pasta de fotos e a URL do `sitemap.xml`.
2. Adicione a URL do imóvel no `sitemap.xml` (`https://fabianobarrettoimoveis.com.br/imovel.html?id=<id>`).
3. Confira no navegador (celular e computador), registre no `CHANGELOG.md` e sincronize com o GitHub. **Cada envio vai direto para o ar.**
