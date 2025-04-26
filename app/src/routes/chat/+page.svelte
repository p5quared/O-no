<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getChatMessages, subscribeToChatUpdates, sendChatMessage } from '$lib/pb/chat';
	import type { ChatMessage } from './types';
	import { pb } from '$lib/pb/pocketbase';
	let messages: ChatMessage[] = [];
	let newMessage = '';
	let unsubscribe: () => void;
	let chatContainer: HTMLDivElement;

	$: if (chatContainer && messages.length > 0) {
		setTimeout(() => {
			chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' });
		}, 0);
	}

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

<div class="mx-auto max-w-xl p-4">
	<h1 class="mb-6 text-center text-2xl font-bold">Chat Demo</h1>

	<div
		class="mb-4 h-[400px] overflow-y-auto rounded border border-gray-300 bg-gray-50 p-4"
		bind:this={chatContainer}
	>
		{#if messages.length === 0}
			<p class="mt-[180px] text-center text-gray-500">
				No messages yet. Be the first to say hello!
			</p>
		{:else}
			{#each messages as message}
				<div class="mb-3 rounded-lg bg-white p-3 shadow-sm">
					<span class="text-sm font-semibold text-gray-700">{message.name || 'Guest'}</span>

					<p class="m-0 mb-2 break-words">{message.content}</p>
					<span class="text-xs text-gray-500">{new Date(message.created).toLocaleTimeString()}</span
					>
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
			class="flex-1 rounded border border-gray-300 p-3"
		/>
		<button
			type="submit"
			class="rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700">Send</button
		>
	</form>
</div>
