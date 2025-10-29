import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { teamService } from '../services/team.service';
import { useAuth } from '../contexts/AuthContext';

type InviteStatus = 'checking' | 'success' | 'error' | 'unauthorized';

export const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<InviteStatus>('checking');
  const [message, setMessage] = useState('Verifying invitation...');
  const [workspaceName, setWorkspaceName] = useState<string>('');

  useEffect(() => {
    const acceptInvite = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link');
        return;
      }

      // Check if user is authenticated using auth context
      if (!isAuthenticated) {
        setStatus('unauthorized');
        setMessage('Please log in to accept this invitation');
        // Redirect to login with return URL
        setTimeout(() => {
          navigate(`/login?returnUrl=/accept-invite/${token}`);
        }, 2000);
        return;
      }

      try {
        const [result] = await Promise.all([
          teamService.acceptInvitation(token),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);

        setStatus('success');
        setMessage('You have successfully joined the workspace!');
        setWorkspaceName(result.userId?.name || 'the team');

        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        setStatus('error');

        const errorMessage = err.response?.data?.message;
        if (errorMessage?.includes('expired')) {
          setMessage('This invitation has expired. Please request a new invitation.');
        } else if (errorMessage?.includes('already')) {
          setMessage('You are already a member of this workspace.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else if (errorMessage?.includes('Email mismatch')) {
          setMessage('Please sign in with the email address that received the invitation.');
        } else {
          setMessage(errorMessage || 'Failed to accept invitation. Please try again or contact support.');
        }
      }
    };

    acceptInvite();
  }, [token, navigate, isAuthenticated, authLoading]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Glass morphism card */}
        <div className="glass rounded-2xl shadow-2xl p-8 border border-primary-200/30 backdrop-blur-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {status === 'checking' && (
              <div className="relative">
                <ClockIcon className="w-20 h-20 text-primary-500 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            {status === 'success' && (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-accent glow-accent flex items-center justify-center">
                  <CheckCircleIcon className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
            )}
            {(status === 'error' || status === 'unauthorized') && (
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                  <XCircleIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-display font-bold text-center mb-4 gradient-text">
            {status === 'checking' && 'Accepting Invitation'}
            {status === 'success' && 'Welcome Aboard!'}
            {status === 'error' && 'Invitation Error'}
            {status === 'unauthorized' && 'Login Required'}
          </h1>

          {/* Message */}
          <p className="text-center text-secondary mb-6 text-base">
            {message}
          </p>

          {/* Success Details */}
          {status === 'success' && workspaceName && (
            <div className="mb-6 glass rounded-xl p-4 border border-primary-500/30 glow-accent-sm">
              <p className="text-sm text-primary text-center">
                You've joined <strong className="gradient-text">{workspaceName}</strong>
              </p>
              <p className="text-xs text-secondary text-center mt-2">
                ⏱️ Redirecting to dashboard in 3 seconds...
              </p>
            </div>
          )}

          {/* Unauthorized Details */}
          {status === 'unauthorized' && (
            <div className="mb-6 glass rounded-xl p-4 border border-yellow-500/30">
              <p className="text-sm text-primary text-center">
                🔒 You need to be logged in to accept team invitations.
              </p>
              <p className="text-xs text-secondary text-center mt-2">
                Redirecting to login...
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {status === 'success' && (
              <button
                onClick={handleBackToDashboard}
                className="btn-gradient w-full py-3 px-4 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Go to Dashboard
              </button>
            )}

            {status === 'error' && (
              <button
                onClick={handleBackToDashboard}
                className="w-full py-3 px-4 glass-hover rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 text-primary border border-primary-200/30"
              >
                Back to Dashboard
              </button>
            )}

            {status === 'unauthorized' && (
              <button
                onClick={handleBackToLogin}
                className="btn-gradient w-full py-3 px-4 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Go to Login
              </button>
            )}
          </div>

          {/* Footer Note */}
          {status === 'error' && (
            <p className="text-xs text-center text-secondary mt-6">
              Need help? Contact your workspace administrator or{' '}
              <a href="mailto:support@costkatana.com" className="text-primary-500 hover:underline font-medium">
                support
              </a>
            </p>
          )}
        </div>

        {/* Cost Katana branding */}
        <div className="text-center mt-6">
          <p className="text-sm text-secondary">
            Powered by <span className="font-display font-bold gradient-text">Cost Katana</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvite;
