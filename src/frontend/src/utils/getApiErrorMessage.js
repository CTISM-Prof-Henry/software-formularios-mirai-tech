const GENERIC_MESSAGES = {
  login: 'Nao foi possivel entrar agora. Revise seu SIAPE e sua senha e tente novamente.',
  cadastro: 'Nao foi possivel concluir o cadastro agora. Revise os dados informados e tente novamente.',
  recuperar_enviar: 'Nao foi possivel enviar o codigo agora. Tente novamente em instantes.',
  recuperar_validar: 'Nao foi possivel validar o codigo informado. Revise os digitos e tente novamente.',
  recuperar_redefinir: 'Nao foi possivel redefinir a senha agora. Tente novamente em instantes.',
  default: 'Nao foi possivel concluir esta acao agora. Tente novamente em instantes.',
};

function normalizeMessage(message) {
  if (!message) {
    return '';
  }

  if (Array.isArray(message)) {
    return message.join(' ');
  }

  if (typeof message === 'object') {
    const values = Object.values(message).flatMap((value) => (Array.isArray(value) ? value : [value]));
    return values.filter(Boolean).join(' ');
  }

  return String(message);
}

export function getApiErrorMessage(error, context = 'default') {
  const status = error?.response?.status;
  const backendMessage = normalizeMessage(error?.response?.data?.erro || error?.response?.data);

  if (backendMessage) {
    return backendMessage;
  }

  if (error?.code === 'ECONNABORTED') {
    return 'A solicitacao demorou mais do que o esperado. Tente novamente.';
  }

  if (!error?.response) {
    return 'Nao foi possivel se comunicar com o servidor. Verifique sua conexao e tente novamente.';
  }

  if (status === 401) {
    return 'Sua sessao nao esta valida para esta acao. Faca login novamente e tente outra vez.';
  }

  if (status === 403) {
    return 'Voce nao tem permissao para executar esta acao.';
  }

  if (status === 404) {
    return 'O recurso solicitado nao foi encontrado.';
  }

  if (status >= 500) {
    return 'O servidor encontrou um problema ao processar sua solicitacao. Tente novamente em instantes.';
  }

  return GENERIC_MESSAGES[context] || GENERIC_MESSAGES.default;
}
