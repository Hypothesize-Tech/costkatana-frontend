import React, { useState } from 'react';
import { HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon, HandThumbDownIcon as HandThumbDownSolidIcon } from '@heroicons/react/24/solid';

interface FeedbackButtonProps {
  requestId: string;
  onFeedbackSubmit?: (requestId: string, rating: boolean, comment?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  requestId,
  onFeedbackSubmit,
  className = '',
  size = 'md'
}) => {
  const [rating, setRating] = useState<boolean | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleRating = async (newRating: boolean) => {
    if (rating === newRating) {
      // If clicking the same rating, show comment input
      setShowComment(true);
      return;
    }

    setRating(newRating);

    // Auto-submit simple feedback without comment
    if (onFeedbackSubmit && !showComment) {
      setIsSubmitting(true);
      try {
        await onFeedbackSubmit(requestId, newRating);
      } catch (error) {
        console.error('Failed to submit feedback:', error);
        setRating(null); // Reset on error
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCommentSubmit = async () => {
    if (rating === null || !onFeedbackSubmit) return;

    setIsSubmitting(true);
    try {
      await onFeedbackSubmit(requestId, rating, comment);
      setShowComment(false);
    } catch (error) {
      console.error('Failed to submit feedback with comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowComment(false);
    setComment('');
    setRating(null);
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      {/* Thumbs Up Button */}
      <button
        onClick={() => handleRating(true)}
        disabled={isSubmitting}
        className={`
                    p-1 rounded-full transition-all duration-300 hover:scale-110
                    ${rating === true
            ? 'text-success-600 bg-success-50 hover:bg-success-100 shadow-lg'
            : 'text-light-text-muted dark:text-dark-text-muted hover:text-success-500 hover:bg-success-50'
          }
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
        title="This response was helpful"
      >
        {rating === true ? (
          <HandThumbUpSolidIcon className={sizeClasses[size]} />
        ) : (
          <HandThumbUpIcon className={sizeClasses[size]} />
        )}
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={() => handleRating(false)}
        disabled={isSubmitting}
        className={`
                    p-1 rounded-full transition-all duration-300 hover:scale-110
                    ${rating === false
            ? 'text-danger-600 bg-danger-50 hover:bg-danger-100 shadow-lg'
            : 'text-light-text-muted dark:text-dark-text-muted hover:text-danger-500 hover:bg-danger-50'
          }
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
        title="This response was not helpful"
      >
        {rating === false ? (
          <HandThumbDownSolidIcon className={sizeClasses[size]} />
        ) : (
          <HandThumbDownIcon className={sizeClasses[size]} />
        )}
      </button>

      {/* Comment Input Modal */}
      {showComment && (
        <div className="fixed inset-0 bg-dark-bg/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-xl border border-primary-200/30 shadow-2xl backdrop-blur-xl bg-gradient-light-panel dark:bg-gradient-dark-panel p-8 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center mb-6">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 shadow-lg ${rating ? 'bg-gradient-success' : 'bg-gradient-danger'}`}>
                {rating ? (
                  <HandThumbUpIcon className="h-5 w-5 text-white" />
                ) : (
                  <HandThumbDownIcon className="h-5 w-5 text-white" />
                )}
              </div>
              <h3 className="text-xl font-display font-bold gradient-text-primary">
                {rating ? 'What made this response helpful?' : 'How can we improve this response?'}
              </h3>
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Your feedback helps us improve..."
              className="input w-full resize-none"
              rows={4}
              autoFocus
            />

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="btn-ghost px-4 py-2 font-display font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCommentSubmit}
                disabled={isSubmitting}
                className={`px-6 py-3 rounded-xl font-display font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${rating
                  ? 'bg-gradient-success text-white'
                  : 'bg-gradient-danger text-white'
                  }`}
              >
                {isSubmitting ? '⏳ Submitting...' : '✨ Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Status */}
      {rating !== null && !showComment && (
        <span className="text-xs font-display font-medium gradient-text-success animate-fade-in">
          ✨ Thank you for your feedback!
        </span>
      )}
    </div>
  );
};