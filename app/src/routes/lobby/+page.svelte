<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { fetchSingleLobby, joinLobby} from '$lib/pb/lobbies';
	import { getChatMessages, subscribeToChatUpdates, sendChatMessage } from '$lib/pb/chat';
	import type { ChatMessage } from '../chat/types';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';
	import lobbyBackground from '$lib/images/title4.png';

	let lobbyId = page.url.searchParams.get('id'), lobby = null, messages = [], newMessage = '', unsubscribe, chatContainer;

	$: chatContainer && messages.length > 0 && setTimeout(() => chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: 'smooth' }), 0);

	onMount(async () => {
		if (!lobbyId) return;
		try {
			await joinLobby(lobbyId);
			lobby = await fetchSingleLobby(lobbyId);
			messages = await getChatMessages();
			unsubscribe = await subscribeToChatUpdates(newMsg => messages = [...messages, newMsg]);
		} catch (error) {
			console.error("Error:", error);
			goto('/');
		}
	});

	onDestroy(() => unsubscribe?.());

	const handleSendMessage = async () => {
		await sendChatMessage(newMessage);
		newMessage = '';
	};
</script>

<div class="fullscreen-container">
	<div class="fire-gradient left"></div>
	<div class="fire-gradient right"></div>
	<div class="background-frame">
		{#each ['tl', 'tr', 'bl', 'br'] as pos}
			<div class="corner corner-{pos}"></div>
		{/each}
		<div class="bubble-effect"></div>
		<div class="game-background" style="background-image: url({lobbyBackground});"></div>
	</div>
	
	<div class="waiting-animation">
		<div class="waiting-text">Waiting for players to join...</div>
		<div class="dots-container">
			{#each Array(5) as _, i}
				<div class="dot" style="animation-delay: {i * 0.2}s"></div>
			{/each}
		</div>
	</div>
	
	<div class="content-overlay">
		<div class="lobby-info-panel">
			{#if lobby}
				{#each [['Lobby', lobby.name], ['Players', `${lobby.players.length} / 10`]] as [label, value]}
					<div class="info-item">
						<span class="label">{label}:</span>
						<span class="value">{value}</span>
					</div>
				{/each}
			{:else}
				<div class="loading">Loading...</div>
			{/if}
		</div>

		<div class="chat-container">
			<div class="chat-messages" bind:this={chatContainer}>
				{#if messages.length === 0}
					<p class="no-messages">Start the conversation!</p>
				{:else}
					{#each messages as message}
						<div class="message">
							<span class="username">{pb.authStore.model?.name || 'Guest'}</span>
							<p class="content">{message.content}</p>
						</div>
					{/each}
				{/if}
			</div>
			<form on:submit|preventDefault={handleSendMessage} class="chat-input">
				<input type="text" bind:value={newMessage} placeholder="Type a message..." autocomplete="off"/>
				<button type="submit">Send</button>
			</form>
		</div>
	</div>
</div>

<style>
	.fullscreen-container {
		position: fixed; inset: 0; width: 100vw; height: 100vh;
		background: rgb(58, 1, 1); display: flex; justify-content: center;
		align-items: center; overflow: hidden;
	}

	.fire-gradient {
		position: absolute; width: 25vw; height: 100vh;
		pointer-events: none;
	}

	.fire-gradient.left { left: 0; animation: fireLeft 3s infinite alternate; }
	.fire-gradient.right { right: 0; animation: fireRight 3s infinite alternate; }

	.background-frame {
		position: relative; width: 50%; height: 80vh;
		display: flex; justify-content: center; align-items: center;
		padding: 20px;
	}

	.game-background {
		width: 100%; height: 100%; background-size: contain;
		background-position: center; background-repeat: no-repeat;
		position: relative; z-index: 1; border-radius: 8px;
		box-shadow: 0 0 30px rgba(244, 192, 63, 0.2),
					inset 0 0 50px rgba(58, 1, 1, 0.5);
		animation: subtlePulse 4s ease-in-out infinite;
	}

	.corner {
		position: absolute; width: 30px; height: 30px;
		border: 3px solid #f4c03f; z-index: 3;
	}

	.corner-tl { top: 10px; left: 10px; border-right: none; border-bottom: none; }
	.corner-tr { top: 10px; right: 10px; border-left: none; border-bottom: none; }
	.corner-bl { bottom: 10px; left: 10px; border-right: none; border-top: none; }
	.corner-br { bottom: 10px; right: 10px; border-left: none; border-top: none; }

	.bubble-effect {
		position: absolute; inset: -20px;
		background: radial-gradient(circle at center,
			transparent 30%, rgba(58, 1, 1, 0.2) 70%, rgb(58, 1, 1) 100%);
		z-index: 2; pointer-events: none; opacity: 0.7;
		animation: bubblePulse 4s ease-in-out infinite;
	}

	.content-overlay {
		position: absolute; width: 100%; height: 100%;
		z-index: 3; pointer-events: none;
	}

	.lobby-info-panel, .chat-container {
		position: absolute; background: rgba(58, 1, 1, 0.85);
		border: 2px solid #f4c03f; border-radius: 12px;
		box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
		pointer-events: auto;
	}

	.lobby-info-panel {
		top: 20px; left: 20px; padding: 2rem;
		min-width: 300px; max-width: 350px;
	}

	.chat-container {
		right: 20px; bottom: 20px; width: 350px;
		max-height: 600px; display: flex;
		flex-direction: column; overflow: hidden;
		border-radius: 12px 12px 0 0;
	}

	.info-item, .message {
		background: rgba(0, 0, 0, 0.3);
		border-radius: 6px; padding: 0.8rem;
		margin-bottom: 1.2rem; border-left: 3px solid #f4c03f;
		color: white;
	}

	.info-item { display: flex; justify-content: space-between; align-items: center; }

	.label, .chat-title, .username {
		color: #f4c03f; font-family: 'FrogFont', sans-serif;
		font-size: 1.2em;
	}

	.value, .timestamp {
		background: rgba(0, 0, 0, 0.4);
		padding: 0.5rem 1rem; border-radius: 4px;
		border: 1px solid rgba(244, 192, 63, 0.3);
	}

	.chat-messages {
		flex-grow: 1; overflow-y: auto; padding: 10px;
		background: rgba(0, 0, 0, 0.2); max-height: 450px;
	}

	.chat-input {
		display: flex; padding: 10px; gap: 8px;
		background: rgba(0, 0, 0, 0.4);
		border-top: 1px solid rgba(244, 192, 63, 0.3);
	}

	.chat-input input {
		flex: 1; padding: 8px; border-radius: 4px;
		background: rgba(0, 0, 0, 0.6); color: white;
		border: 1px solid rgba(244, 192, 63, 0.3);
	}

	.chat-input button {
		background: #f4c03f; color: rgb(58, 1, 1);
		border: none; padding: 8px 16px; border-radius: 4px;
		font-weight: bold; cursor: pointer;
		transition: background 0.2s;
	}

	.chat-input button:hover { background: #e5b43a; }

	.waiting-animation {
		position: absolute; bottom: 20px; left: 50%;
		transform: translateX(-50%); display: flex;
		flex-direction: column; align-items: center; z-index: 3;
	}

	.waiting-text {
		color: #f4c03f; font-family: 'FrogFont', sans-serif;
		font-size: 1.2rem; margin-bottom: 10px;
		text-shadow: 0 0 10px rgba(255, 87, 34, 0.7);
	}

	.dots-container { display: flex; gap: 8px; }

	.dot {
		width: 10px; height: 10px;
		background-color: #f4c03f; border-radius: 50%;
		animation: dotPulse 1.4s infinite ease-in-out;
	}

	@keyframes fireLeft {
		0% { transform: translateX(-5px);
			background: linear-gradient(90deg, rgb(58, 1, 1) 0%, rgba(139, 3, 3, 0.8) 40%, transparent 100%); }
		100% { transform: translateX(5px);
			background: linear-gradient(90deg, rgb(58, 1, 1) 0%, rgba(255, 87, 34, 0.8) 40%, transparent 100%); }
	}

	@keyframes fireRight {
		0% { transform: translateX(5px);
			background: linear-gradient(-90deg, rgb(58, 1, 1) 0%, rgba(139, 3, 3, 0.8) 40%, transparent 100%); }
		100% { transform: translateX(-5px);
			background: linear-gradient(-90deg, rgb(58, 1, 1) 0%, rgba(255, 87, 34, 0.8) 40%, transparent 100%); }
	}

	@keyframes bubblePulse {
		0%, 100% { opacity: 0.7; transform: scale(1); }
		50% { opacity: 0.9; transform: scale(1.02); }
	}

	@keyframes dotPulse {
		0%, 100% { transform: scale(1); opacity: 0.5; box-shadow: 0 0 0 rgba(244, 192, 63, 0); }
		50% { transform: scale(1.5); opacity: 1; box-shadow: 0 0 10px rgba(244, 192, 63, 0.7); }
	}

	@keyframes subtlePulse {
		0%, 100% { box-shadow: 0 0 30px rgba(244, 192, 63, 0.2), inset 0 0 50px rgba(58, 1, 1, 0.5); }
		50% { box-shadow: 0 0 40px rgba(244, 192, 63, 0.3), inset 0 0 60px rgba(58, 1, 1, 0.6); }
	}
</style>