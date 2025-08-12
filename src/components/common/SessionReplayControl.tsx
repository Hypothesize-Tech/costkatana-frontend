import React, { useEffect, useRef } from 'react';
import { useMixpanel } from '../../hooks/useMixpanel';

interface SessionReplayControlProps {
    children: React.ReactNode;
    record?: boolean;
    sensitiveContent?: boolean;
}

/**
 * Component to control Mixpanel Session Replay recording for specific sections
 * 
 * @param {React.ReactNode} children - Child components to render
 * @param {boolean} record - If true, forces recording to start for this section. If false, forces recording to stop.
 * @param {boolean} sensitiveContent - If true, stops recording for sensitive content (overrides record prop)
 */
export const SessionReplayControl: React.FC<SessionReplayControlProps> = ({
    children,
    record = true,
    sensitiveContent = false
}) => {
    const { startSessionRecording, stopSessionRecording } = useMixpanel();
    const prevStateRef = useRef<boolean | null>(null);

    useEffect(() => {
        // Sensitive content always stops recording regardless of record prop
        if (sensitiveContent) {
            stopSessionRecording();
            return;
        }

        // Start or stop recording based on record prop
        if (record) {
            startSessionRecording();
            prevStateRef.current = true;
        } else {
            stopSessionRecording();
            prevStateRef.current = false;
        }

        // Cleanup function to restore previous state if component unmounts
        return () => {
            if (prevStateRef.current === true) {
                startSessionRecording();
            } else if (prevStateRef.current === false) {
                stopSessionRecording();
            }
        };
    }, [record, sensitiveContent, startSessionRecording, stopSessionRecording]);

    return <>{children}</>;
};

export default SessionReplayControl;
