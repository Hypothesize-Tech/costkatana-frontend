import React, { useState, useEffect } from 'react';
import { useSessionReplay } from '../../hooks/useSessionReplay';
import SessionReplayControl from '../common/SessionReplayControl';

const SessionReplayExample: React.FC = () => {
    const [showSensitiveContent, setShowSensitiveContent] = useState(false);
    const [replayId, setReplayId] = useState<string | null>(null);
    const [replayUrl, setReplayUrl] = useState<string | null>(null);
    const {
        startRecording,
        stopRecording,
        isRecording,
        getMaskClass,
        getBlockClass,
        getReplayId,
        getReplayUrl
    } = useSessionReplay();

    useEffect(() => {
        // Update the replay ID and URL when recording status changes
        if (isRecording) {
            setReplayId(getReplayId());
            setReplayUrl(getReplayUrl());
        } else {
            setReplayId(null);
            setReplayUrl(null);
        }
    }, [isRecording, getReplayId, getReplayUrl]);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Session Replay Controls</h2>

            <div className="mb-6">
                <p className="mb-2">Recording Status: <span className={isRecording ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    {isRecording ? "Active" : "Inactive"}
                </span></p>

                {replayId && (
                    <p className="mb-2 text-sm">
                        Replay ID: <code className="bg-gray-100 p-1 rounded">{replayId}</code>
                    </p>
                )}

                {replayUrl && (
                    <p className="mb-2 text-sm">
                        <a
                            href={replayUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            View Session Replay in Mixpanel
                        </a>
                    </p>
                )}
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
                >
                    Start Recording
                </button>

                <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className="px-4 py-2 bg-red-600 text-white rounded disabled:bg-gray-400"
                >
                    Stop Recording
                </button>
            </div>

            <hr className="my-6" />

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Content Privacy Controls</h3>

                <div className="mb-4">
                    <p className="mb-2">Text Masking Example:</p>
                    <p className={getMaskClass()}>
                        This text will be masked in the session replay (credit card: 4111-1111-1111-1111)
                    </p>
                </div>

                <div className="mb-4">
                    <p className="mb-2">Content Blocking Example:</p>
                    <div className={getBlockClass()} style={{ width: '200px', height: '100px', background: 'lightgray', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        This entire block will be hidden in the replay
                    </div>
                </div>
            </div>

            <hr className="my-6" />

            <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">Conditional Recording</h3>

                <button
                    onClick={() => setShowSensitiveContent(!showSensitiveContent)}
                    className="px-4 py-2 bg-blue-600 text-white rounded mb-4"
                >
                    {showSensitiveContent ? "Hide" : "Show"} Sensitive Content
                </button>

                {showSensitiveContent && (
                    <SessionReplayControl sensitiveContent={true}>
                        <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
                            <h4 className="font-bold">Sensitive Information</h4>
                            <p>This content will not be recorded in the session replay.</p>
                            <p>API Key: sk_test_abcdefghijklmnopqrstuvwxyz123456</p>
                            <p>Password: SuperSecretPassword123!</p>
                        </div>
                    </SessionReplayControl>
                )}
            </div>
        </div>
    );
};

export default SessionReplayExample;
