import React from 'react';
import { DEFAULT_AVATAR_URL } from '../constants';

interface PreviewProps {
  content: string;
  username: string;
  avatarUrl: string;
}

const Preview: React.FC<PreviewProps> = ({ content, username, avatarUrl }) => {
  // Format current time like Discord: "Today at X:XX PM"
  const now = new Date();
  const timeString = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const displayAvatar = avatarUrl.trim() || DEFAULT_AVATAR_URL;
  const displayUsername = username.trim() || "Spidey Bot";

  return (
    <div className="bg-discord-bg w-full rounded-md border border-discord-divider overflow-hidden flex flex-col">
      <div className="bg-discord-sidebar px-4 py-2 text-xs font-bold text-discord-text-muted uppercase tracking-wide border-b border-discord-divider">
        Preview
      </div>
      <div className="p-4 flex hover:bg-discord-element/30 transition-colors">
        {/* Avatar */}
        <div className="mr-4 mt-0.5 flex-shrink-0">
          <img 
            src={displayAvatar} 
            alt="User Avatar" 
            className="w-10 h-10 rounded-full bg-discord-sidebar object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_AVATAR_URL;
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-0.5">
            <span className="text-white hover:underline cursor-pointer font-medium mr-2">
              {displayUsername}
            </span>
            <span className="px-1.5 rounded-[3px] bg-discord-blurple text-[0.625rem] text-white font-medium leading-4 h-[15px] flex items-center mr-2">
              BOT
            </span>
            <span className="text-xs text-discord-text-muted cursor-default">
              {timeString}
            </span>
          </div>
          
          <div className="text-discord-text whitespace-pre-wrap break-words leading-[1.375rem]">
            {content || <span className="text-discord-text-muted italic opacity-50">Message preview will appear here...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;
