import React from 'react';
import { useFeedback } from '../../context/FeedbackContext';
import './styles.css';

const TITLES = {
  success: 'Sucesso',
  error: 'Nao foi possivel concluir',
  warning: 'Atencao',
  info: 'Aviso',
};

const ICONS = {
  success: '✓',
  error: '!',
  warning: '!',
  info: 'i',
};

const FeedbackToast = () => {
  const { feedback, hideFeedback } = useFeedback();

  if (!feedback?.message) {
    return null;
  }

  const title = feedback.title || TITLES[feedback.type] || TITLES.info;

  return (
    <div className="feedback-toast-viewport" role="status" aria-live="polite">
      <div className={`feedback-toast-card ${feedback.type}`}>
        <div className="feedback-toast-icon" aria-hidden="true">
          {ICONS[feedback.type] || ICONS.info}
        </div>
        <div className="feedback-toast-copy">
          <strong>{title}</strong>
          <span>{feedback.message}</span>
        </div>
        <button
          type="button"
          className="feedback-toast-close"
          onClick={hideFeedback}
          aria-label="Fechar mensagem"
        >
          x
        </button>
      </div>
    </div>
  );
};

export default FeedbackToast;
