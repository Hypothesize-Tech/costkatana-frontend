import React from 'react';
import { ChatInterface } from '../components/chat/ChatInterface';

const Chat: React.FC = () => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
                <ChatInterface />
            </div>
        </div>
    );
};

export default Chat; 