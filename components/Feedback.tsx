import React from 'react';

interface FeedbackProps {
  message: string | null;
  type: 'info' | 'success' | 'error';
}

const Feedback: React.FC<FeedbackProps> = ({ message, type }) => {
  if (!message) return null;

  const colorClass = type === 'error' ? 'text-off-black' : 'text-light-gray';

  return (
    <div className="px-6 pb-4 text-sm">
      <p className={colorClass}>{message}</p>
    </div>
  );
};

export default Feedback;