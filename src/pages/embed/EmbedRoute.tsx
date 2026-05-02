import React from 'react';
import { useParams } from 'react-router-dom';
import EmbedChat from '../../components/agentBuilder/chat/EmbedChat';

/**
 * Rendered inside the customer-side iframe (e.g.
 * `https://app.costkatana.ai/embed/dep_abc`). The widget loader at
 * `cdn.costkatana.ai/widget.js` injects an iframe pointing here.
 *
 * Brand-free by design — the embedding customer's theme drives the look.
 */
const EmbedRoute: React.FC = () => {
  const { deploymentId } = useParams<{ deploymentId: string }>();

  if (!deploymentId) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="text-xs text-danger-600">Missing deployment id.</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-white">
      <EmbedChat
        deploymentId={deploymentId}
        onClose={() => {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage(
              { type: 'costkatana-widget:close', deploymentId },
              '*',
            );
          }
        }}
      />
    </div>
  );
};

export default EmbedRoute;
