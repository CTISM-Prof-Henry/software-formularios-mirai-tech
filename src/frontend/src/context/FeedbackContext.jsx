import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const FeedbackContext = createContext(null);

const AUTO_DISMISS_BY_TYPE = {
  success: 3200,
  info: 3200,
  warning: 4200,
  error: 5200,
};

export function FeedbackProvider({ children }) {
  const [feedback, setFeedback] = useState(null);
  const timeoutRef = useRef(null);

  const hideFeedback = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setFeedback(null);
  }, []);

  const showFeedback = useCallback((nextFeedback) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const payload = {
      id: Date.now(),
      type: nextFeedback?.type || 'info',
      title: nextFeedback?.title || '',
      message: nextFeedback?.message || '',
      persistent: Boolean(nextFeedback?.persistent),
    };

    setFeedback(payload);

    if (!payload.persistent) {
      const duration = AUTO_DISMISS_BY_TYPE[payload.type] || 3500;
      timeoutRef.current = setTimeout(() => {
        setFeedback(null);
        timeoutRef.current = null;
      }, duration);
    }
  }, []);

  const value = useMemo(() => ({
    feedback,
    showFeedback,
    hideFeedback,
  }), [feedback, hideFeedback, showFeedback]);

  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider');
  }

  return context;
}
