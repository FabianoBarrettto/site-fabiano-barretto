# Histórico de alterações — site Fabiano Barretto Imóveis

Responsável: agente dev-site (subordinado ao coordenador).

## 2026-11-14
- Pasta do projeto criada. Hospedagem escolhida: gratuita (Netlify, Cloudflare Pages ou GitHub Pages). Domínio ainda não registrado.
- Site v1 montado: início, imóveis (lista com filtros + página do imóvel lendo `dados/imoveis.json`, com 3 imóveis de exemplo marcados como tal), como funciona o MCMV, simulação, aviso de privacidade, `sitemap.xml` e `robots.txt` (com `DOMINIO_A_DEFINIR`).
- Simulação concluída: formulário (nome, WhatsApp, renda) abre o WhatsApp (51) 98573-8049 com a mensagem preenchida; caixa de consentimento com link para o aviso de privacidade; opções de renda alinhadas às 4 faixas conferidas (até R$ 3.200 / 5.000 / 9.600 / 13.000), com "sujeita à aprovação de crédito".
- Aviso de privacidade concluído: base legal, tempo de guarda, links externos, direitos do titular (incl. ANPD), mudanças no aviso e botão de WhatsApp. Link no rodapé de todas as páginas e no formulário.
- Página `404.html` criada no padrão do site (caminhos com "/" para funcionar em qualquer URL), com botões para o início, imóveis e WhatsApp, e `noindex`.
- Como funciona: removida a coluna "Valor máximo do imóvel" (tetos não conferidos); "Classe Média" virou "Faixa 4", conforme a Portaria MCID 333/2026.
- Verificado no navegador em 375 px e 1366 px: todas as páginas sem rolagem horizontal, sem erros no console, rodapé com CRECI/RS 82351-F e botão flutuante de WhatsApp. Sem commit (git não instalado).
