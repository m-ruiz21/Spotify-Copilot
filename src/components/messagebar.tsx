import React, { useState } from 'react';

interface MessageBarProps {
    onMessageSend: (message: string) => void;
    className?: string;
    maxLength?: number;
    minLength?: number;
}

const MessageBar: React.FC<MessageBarProps> = ({ onMessageSend, className, maxLength = 500, minLength = 1 }) => {
    const [message, setMessage] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(event.target.value);
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onMessageSend(message);
            setMessage('');
        }

        if (event.key === 'Enter' && event.shiftKey) {
            setMessage(message + '\n');
        }
    };

    const handleSubmit = () => {
        if (message.length >= minLength && message.length <= maxLength) {
            onMessageSend(message);
            setMessage('');
        }
    };

    return (
        <form
            className={`flex w-full flex-col ${className ?? ""}`}
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div className="flex w-full flex-1 flex-row rounded-xl p-3 text-white shadow-sm border-2 border-neutral-400">
                <textarea
                    rows={message.split(/\r|\n/).length > 3 ? message.split(/\r|\n/).length : 3}
                    className="flex-1 border-none bg-transparent focus:outline-none"
                    value={message}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                />
                <div className="flex h-full flex-col items-end justify-between">
                    <button
                        className="rounded-md bg-[#1DB954] px-3 py-1.5 text-sm text-white disabled:cursor-not-allowed disabled:bg-green-200"
                        disabled={message.length > maxLength || message.length < minLength}
                    >
                        Send
                    </button>
                    <span
                        className={`text-sm leading-none ${message.length > maxLength ? "text-red-500" : "text-neutral-400"}`}
                    >
                        {message.length.toString() + "/" + maxLength.toString()}
                    </span>
                </div>
            </div>
        </form>
    );
};

export default MessageBar;