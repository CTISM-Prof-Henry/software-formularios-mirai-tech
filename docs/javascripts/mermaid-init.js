document.addEventListener('DOMContentLoaded', () => {
  if (!window.mermaid) return;

  document.querySelectorAll('pre.mermaid').forEach((block) => {
    const code = block.querySelector('code');
    const diagram = document.createElement('div');
    diagram.className = 'mermaid';
    diagram.textContent = code ? code.textContent : block.textContent;
    block.replaceWith(diagram);
  });

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
  });

  window.mermaid.run({
    querySelector: '.mermaid',
  });
});
