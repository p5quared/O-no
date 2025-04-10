import { pb } from './pocketbase';
import type { ChatMessage } from '../../routes/chat/types';

/**
 * Fetches the most recent chat messages
 * @param limit Maximum number of messages to fetch
 * @returns Array of chat messages
 */
export async function getChatMessages(limit = 50): Promise<ChatMessage[]> {
	try {
		const records = await pb.collection('chat').getList(1, limit, {
			sort: 'created'
		});
		return records.items as ChatMessage[];
	} catch (error) {
		console.error('Failed to fetch chat messages:', error);
		return [];
	}
}

/**
 * Subscribes to real-time chat updates
 * @param callback Function to call when new messages arrive
 * @returns Unsubscribe function
 */
export async function subscribeToChatUpdates(
	callback: (message: ChatMessage) => void
): Promise<() => void> {
	try {
		return await pb.collection('chat').subscribe('*', ({ action, record }) => {
			if (action === 'create') {
				callback(record as ChatMessage);
			}
		});
	} catch (error) {
		console.error('Failed to subscribe to chat updates:', error);
		return () => {}; // Return empty function if subscription fails
	}
}

/**
 * Sends a new chat message
 * @param content Message content
 * @returns The created message or null if failed
 */
export async function sendChatMessage(content: string): Promise<ChatMessage | null> {
	if (!content.trim()) return null;

	try {
		return (await pb.collection('chat').create({
			content
		})) as ChatMessage;
	} catch (error) {
		console.error('Failed to send message:', error);
		return null;
	}
}
