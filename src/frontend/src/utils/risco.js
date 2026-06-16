export function getAlertaPrazo(plano, hoje = new Date()) {
  const dataFim = plano.periodo_acao?.data_fim;
  if (!dataFim || plano.periodo_acao?.data_inicio === null) return null;

  const ref = new Date(hoje);
  ref.setHours(0, 0, 0, 0);

  const fim = new Date(dataFim);
  fim.setHours(0, 0, 0, 0);

  const dias = Math.round((fim - ref) / 86400000);
  if (dias < 0) return { tipo: 'atrasada', texto: 'Atrasada' };
  if (dias <= 7) return { tipo: 'vence-breve', texto: `Vence em ${dias}d` };
  return null;
}

export function getRiskColorClass(nivel) {
  if (nivel >= 20) return 'risk-extremo';
  if (nivel >= 12) return 'risk-alto';
  if (nivel >= 4) return 'risk-moderado';
  return 'risk-baixo';
}

export function getRiskLabel(nivel) {
  if (nivel >= 20) return 'Extremo';
  if (nivel >= 12) return 'Alto';
  if (nivel >= 4) return 'Moderado';
  return 'Baixo';
}
