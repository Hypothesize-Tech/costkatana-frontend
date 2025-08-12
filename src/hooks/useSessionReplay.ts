import { useCallback } from 'react';
import { useMixpanel } from './useMixpanel';

/**
 * Custom hook for working with Mixpanel Session Replay
 */
export const useSessionReplay = () => {
  const { 
    startSessionRecording, 
    stopSessionRecording, 
    getSessionRecordingProperties, 
    getSessionReplayUrl,
    isSessionRecordingActive
  } = useMixpanel();

  /**
   * Get CSS classes for masking sensitive content in Session Replay
   */
  const getMaskClass = useCallback(() => {
    return 'mp-mask';
  }, []);

  /**
   * Get CSS classes for blocking sensitive content in Session Replay
   */
  const getBlockClass = useCallback(() => {
    return 'mp-block';
  }, []);

  /**
   * Get the current Replay ID if a session is being recorded
   */
  const getReplayId = useCallback(() => {
    const props = getSessionRecordingProperties();
    return props ? props.$mp_replay_id : null;
  }, [getSessionRecordingProperties]);

  /**
   * Get a shareable URL to view the current session replay
   */
  const getReplayUrl = useCallback(() => {
    return getSessionReplayUrl();
  }, [getSessionReplayUrl]);

  return {
    // Session recording controls
    startRecording: startSessionRecording,
    stopRecording: stopSessionRecording,
    isRecording: isSessionRecordingActive,
    
    // Content privacy controls
    getMaskClass,
    getBlockClass,
    
    // Session replay metadata
    getReplayId,
    getReplayUrl
  };
};

export default useSessionReplay;
