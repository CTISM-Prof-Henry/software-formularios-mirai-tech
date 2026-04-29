export function getSetorLabel(setor, options = {}) {
  if (!setor) return '';

  const { completo = false } = options;

  if (completo && setor.label_completo) {
    return setor.label_completo;
  }

  if (setor.label_curto) {
    return setor.label_curto;
  }

  if (setor.sigla && setor.nome) {
    return `${setor.sigla} - ${setor.nome}`;
  }

  return setor.nome || setor.sigla || '';
}
