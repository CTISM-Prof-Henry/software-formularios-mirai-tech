/**
 * Ordem canônica das categorias de risco do SIGR.
 *
 * ATENÇÃO — fonte de verdade no backend:
 *   src/riscos/views.py → RiscoViewSet.CATEGORY_ORDER
 *
 * Se uma categoria for adicionada, removida ou renomeada, atualize
 * AMBOS os arquivos para mantê-los sincronizados.
 */
export const CATEGORY_ORDER = [
  'Operacional',
  'Estratégico',
  'Integridade',
  'Imagem',
  'Financeiro',
];
