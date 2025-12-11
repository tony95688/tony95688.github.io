export interface DiscordWebhookPayload {
  content: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
}

export interface WebhookConfig {
  url: string;
  username: string;
  avatarUrl: string;
}

export interface MessageHistoryItem {
  id: string;
  content: string;
  timestamp: number;
  status: 'success' | 'failed';
}

export enum AIStyle {
  Professional = 'Professional',
  Friendly = 'Friendly',
  Funny = 'Funny',
  Concise = 'Concise',
  Announcement = 'Announcement'
}
