<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getChatMessages, subscribeToChatUpdates, sendChatMessage } from '$lib/pb/chat';
	import type { ChatMessage } from './types';

	let messages: ChatMessage[] = [];
	let newMessage = '';
	let unsubscribe: () => void;

	onMount(async () => {
		const initialMessages = await getChatMessages();
		messages = initialMessages;

		unsubscribe = await subscribeToChatUpdates((newMsg) => {
			messages = [...messages, newMsg];
		});
	});

	onDestroy(() => {
		if (unsubscribe) unsubscribe();
	});

	async function handleSendMessage() {
		await sendChatMessage(newMessage);
		newMessage = '';
	}
</script>

<svelte:head>
	<title>Chat Demo</title>
</svelte:head>

<div class="max-w-xl mx-auto p-4">
	<h1 class="text-center text-2xl font-bold mb-6">Chat Demo</h1>
	
	<div class="h-[400px] overflow-y-auto border border-gray-300 rounded p-4 mb-4 bg-gray-50">
		{#if messages.length === 0}
			<p class="text-gray-500 text-center mt-[180px]">No messages yet. Be the first to say hello!</p>
		{:else}
			{#each messages as message}
				<div class="bg-white rounded-lg p-3 mb-3 shadow-sm">
					<p class="m-0 mb-2 break-words">{message.content}</p>
					<span class="text-xs text-gray-500">{new Date(message.created).toLocaleTimeString()}</span>
				</div>
			{/each}
		{/if}
	</div>
	
	<form on:submit|preventDefault={handleSendMessage} class="flex gap-2">
		<input 
			type="text" 
			bind:value={newMessage} 
			placeholder="Type a message..." 
			autocomplete="off"
			class="flex-1 p-3 border border-gray-300 rounded"
		/>
		<button type="submit" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">Send</button>
	</form>
</div>

