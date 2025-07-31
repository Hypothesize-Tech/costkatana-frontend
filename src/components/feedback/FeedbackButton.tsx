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
                    p-1 rounded-full transition-colors duration-200 
                    ${rating === true
                        ? 'text-green-600 bg-green-50 hover:bg-green-100'
                        : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
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
                    p-1 rounded-full transition-colors duration-200 
                    ${rating === false
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">
                            {rating ? 'What made this response helpful?' : 'How can we improve this response?'}
                        </h3>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Your feedback helps us improve..."
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                            autoFocus
                        />

                        <div className="flex justify-end space-x-3 mt-4">
                            <button
                                onClick={handleCancel}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCommentSubmit}
                                disabled={isSubmitting}
                                className={`
                                    px-4 py-2 rounded-md text-white font-medium
                                    ${rating
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Status */}
            {rating !== null && !showComment && (
                <span className="text-xs text-gray-500">
                    Thank you for your feedback!
                </span>
            )}
        </div>
    );
};