import { DiscordWebhookPayload } from '../types';

export const sendToDiscord = async (webhookUrl: string, payload: DiscordWebhookPayload): Promise<boolean> => {
  if (!webhookUrl) throw new Error("Webhook URL is required");
  if (!payload.content) throw new Error("Message content is required");

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      // Discord webhooks return 204 No Content on success, 
      // but sometimes 400 if payload is bad.
      const errorText = await response.text();
      console.error("Discord API Error:", errorText);
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Network Error:", error);
    throw error;
  }
};

export const validateWebhookUrl = (url: string): boolean => {
  const pattern = /^https:\/\/discord(app)?\.com\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+$/;
  return pattern.test(url);
};
