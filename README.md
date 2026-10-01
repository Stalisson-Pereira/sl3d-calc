# SL Impressões 3D

Calculadora de custos e geração de orçamentos/faturas para impressão 3D.

## Estrutura

- `index.html` — estrutura da aplicação.
- `style.css` — estilos e responsividade.
- `script.js` — cálculos, moedas, PDF, WhatsApp e e-mail.

## Como usar

1. Extraia os três arquivos para a mesma pasta.
2. Abra `index.html` no navegador.
3. Preencha os dados.
4. O resumo é recalculado automaticamente.
5. Use os botões para gerar PDF, abrir WhatsApp, abrir e-mail ou fechar a venda com uma fatura.

## Dependências

Os PDFs usam jsPDF e jsPDF-AutoTable carregados por CDN no `index.html`. Portanto, a geração de PDF precisa de acesso à internet.

## Fórmula de custo

Material:
(preço do kg / 1000) × peso em gramas × (1 + falha/100)

Energia:
(potência em W / 1000) × tempo em horas × preço do kWh

Máquina:
depreciação/manutenção por hora × tempo

Mão de obra:
horas trabalhadas × valor da hora

Custo base:
material + energia + máquina + mão de obra + outros

Lucro:
custo base × margem/100

Desconto:
(preço base + lucro) × desconto/100

Preço unitário:
custo base + lucro - desconto

Total:
preço unitário × quantidade
