/*
 * Configuracao do Mermaid para o mkdocs-material.
 *
 * O mkdocs-material >= 8.2 carrega e inicializa o Mermaid automaticamente
 * ao detectar blocos "```mermaid" no conteudo. Este arquivo apenas ajusta
 * o tema para combinar com o tema claro/escuro do site.
 *
 * Nao e necessario carregar mermaid.min.js via extra_javascript;
 * o proprio tema cuida disso de forma integrada.
 */

window.mermaidConfig = {
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default',
};
