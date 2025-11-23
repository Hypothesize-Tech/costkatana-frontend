import React, { useEffect } from 'react';
import { useExtractionStream } from '../../hooks/useExtractionStream';

interface ExtractionMonitorProps {
    templateId: string;
    onStatusUpdate: (templateId: string, status: any) => void;
}

/**
 * Invisible component that monitors extraction status via SSE
 * and notifies parent when updates occur
 */
export const ExtractionMonitor: React.FC<ExtractionMonitorProps> = ({
    templateId,
    onStatusUpdate
}) => {
    const { status, isConnected } = useExtractionStream({
        templateId,
        onStatusUpdate: (extractionStatus) => {
            onStatusUpdate(templateId, extractionStatus);
        },
        autoConnect: true
    });

    // Silent monitoring - connection status tracked by hook
    useEffect(() => {
        // Connection is managed by the hook
    }, [isConnected, templateId]);

    // This component doesn't render anything
    return null;
};

