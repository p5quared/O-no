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

<div class="chat-container">
	<h1>Chat Demo</h1>
	
	<div class="messages">
		{#if messages.length === 0}
			<p class="empty-state">No messages yet. Be the first to say hello!</p>
		{:else}
			{#each messages as message}
				<div class="message">
					<p class="content">{message.content}</p>
					<span class="time">{new Date(message.created).toLocaleTimeString()}</span>
				</div>
			{/each}
		{/if}
	</div>
	
	<form on:submit|preventDefault={handleSendMessage} class="message-form">
		<input 
			type="text" 
			bind:value={newMessage} 
			placeholder="Type a message..." 
			autocomplete="off"
		/>
		<button type="submit">Send</button>
	</form>
</div>

<style>
	.chat-container {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}
	
	h1 {
		text-align: center;
		margin-bottom: 1.5rem;
	}
	
	.messages {
		height: 400px;
		overflow-y: auto;
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 1rem;
		margin-bottom: 1rem;
		background: #f9f9f9;
	}
	
	.empty-state {
		color: #666;
		text-align: center;
		margin-top: 180px;
	}
	
	.message {
		background: white;
		border-radius: 8px;
		padding: 0.75rem;
		margin-bottom: 0.75rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	}
	
	.content {
		margin: 0 0 0.5rem 0;
		word-break: break-word;
	}
	
	.time {
		font-size: 0.8rem;
		color: #666;
	}
	
	.message-form {
		display: flex;
		gap: 0.5rem;
	}
	
	input {
		flex: 1;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
	
	button {
		padding: 0.75rem 1.5rem;
		background: #4f46e5;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-weight: bold;
	}
	
	button:hover {
		background: #4338ca;
	}
</style>
