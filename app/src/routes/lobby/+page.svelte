<script lang="ts">
	import { page } from '$app/state';
	import { onMount, onDestroy } from 'svelte';
	import { fetchSingleLobby, joinLobby, updateLobby } from '$lib/pb/lobbies';
	import { goto } from '$app/navigation';
	import lobbyBackground from '$lib/images/title4.png';
	import { pb } from '$lib/pb/pocketbase';
	import { getUserById } from '$lib/pb/users';
	import { getUserProfile } from '$lib/pb/profiles';
	import type { LobbiesRecord } from '$lib/pb/types/pocketbase';

	let lobbyId: string | null = null;
	let lobby: LobbiesRecord | null = null;
	let players: { id: string; name: string; sprite: string }[] = [];
	let isLoading = true;
	let subscription: { unsubscribe: () => void } | null = null;
	let isLobbyOwner = false;
	let sprite = 'bean';

	lobbyId = page.url.searchParams.get('id');

	async function loadPlayers() {
		if (!lobby || !lobby.players) return;

		const playerPromises = lobby.players.map(async (playerId) => {
			try {
				const user = await getUserById(playerId);
				const profile = await getUserProfile(playerId);
				return {
					id: playerId,
					name: user.name || 'Unknown Player',
					sprite: profile.sprite || 'bean'
				};
			} catch (error) {
				console.error('Error fetching player:', error);
				return {
					id: playerId,
					name: 'Unknown Player',
					sprite: 'bean'
				};
			}
		});

		players = await Promise.all(playerPromises);
	}

	async function startGame() {
		if (!lobby || !isLobbyOwner) return;

		try {
			await updateLobby(lobby.id, { is_started: true });
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	function goToProfile() {
		goto('/profile');
	}

	onMount(async () => {
		await new Promise((resolve) => setTimeout(resolve, 50));
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}

		const profile = await getUserProfile(pb.authStore.record?.id ?? '');
		sprite = profile.sprite ?? 'bean';

		if (lobbyId) {
			try {
				await joinLobby(lobbyId);
				lobby = await fetchSingleLobby(lobbyId);
				
				isLobbyOwner = lobby.host === pb.authStore.model?.id;
				
				if (lobby.is_started) {
					goto('/game');
					return;
				}

				let sub = await pb.collection('lobbies').subscribe(lobbyId, async (e) => {
					if (e.action === 'update') {
						lobby = e.record;
						
						isLobbyOwner = lobby.host === pb.authStore.model?.id;
						
						if (lobby.is_started) {
							goto('/game');
							return;
						}
						
						await loadPlayers();
					}
				});
				
				subscription = {
					unsubscribe: () => sub()
				};

				await loadPlayers();
			} catch (error) {
				console.error('Error joining or fetching lobby:', error);
				goto('/');
			} finally {
				isLoading = false;
			}
		}
	});

	onDestroy(() => {
		if (subscription) {
			subscription.unsubscribe();
		}
	});
</script>

<div class="lobby-container">
	<div class="form-box">
		<h1 class="lobby-title">Welcome to the Lobby!</h1>
		
		{#if isLoading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Loading...</p>
			</div>
		{:else if lobby}
			<div class="lobby-info">
				<p class="lobby-name">You're In Lobby: {lobby.name}</p>
				<p class="player-count">Waiting Players: {lobby.players?.length || 0} / 10</p>
				
				<div class="status-message">
					{#if isLobbyOwner}
						<p>You are the host. Start the game when ready!</p>
						<button class="start-button" on:click={startGame}>Start Game</button>
					{:else}
						<p>Waiting for host to start the game...</p>
					{/if}
				</div>
				
				<div class="player-list-container">
					<h2>Players in Lobby</h2>
					<div class="player-list">
						{#each players as player}
							<div class="player-item">
								<div class="player-avatar">
									<img src={`https://play.kaplayjs.com/${player.sprite}.png`} alt="Player avatar" />
								</div>
								<div class="player-name">{player.name}</div>
							</div>
						{/each}
					</div>
				</div>
				
				<div class="profile-button-container">
					<button class="profile-button" on:click={goToProfile}>Change Avatar</button>
				</div>
			</div>
		{:else}
			<p class="error-message">Error loading lobby information</p>
		{/if}
	</div>
	<div class="lobby-background" style="background-image: url({lobbyBackground});"></div>
</div>

<style>
	.lobby-container {
		display: flex;
		min-height: 100vh;
		width: 100%;
	}

	.lobby-background {
		flex: 1;
		background-size: cover;
		background-position: center;
	}

	.form-box {
		background: rgb(58, 1, 1);
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		width: 50%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow-y: auto;
	}
	
	.lobby-title {
		font-family: 'FrogFont', sans-serif;
		color: white;
		font-size: 2.5rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}
	
	.lobby-info {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	
	.lobby-name, .player-count {
		font-family: 'FrogFont', sans-serif;
		color: white;
		margin-bottom: 0.5rem;
		font-size: 1.2rem;
	}
	
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		font-family: 'FrogFont', sans-serif;
	}
	
	.loading-spinner {
		border: 4px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top: 4px solid #f4c03f;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}
	
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	
	.error-message {
		color: #ff6b6b;
		font-family: 'FrogFont', sans-serif;
	}
	
	.status-message {
		margin: 1.5rem 0;
		color: #f4c03f;
		text-align: center;
		font-family: 'FrogFont', sans-serif;
	}
	
	.start-button {
		background-color: #4caf50;
		color: white;
		padding: 0.8rem 1.5rem;
		font-size: 1.2rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: bold;
		font-family: 'FrogFont', sans-serif;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		margin-top: 1rem;
	}
	
	.start-button:hover {
		background-color: #45a049;
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
	}
	
	.start-button:active {
		transform: translateY(0);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.player-list-container {
		width: 100%;
		margin: 1.5rem 0;
	}
	
	.player-list-container h2 {
		color: white;
		font-family: 'FrogFont', sans-serif;
		text-align: center;
		margin-bottom: 1rem;
	}
	
	.player-list {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		justify-content: center;
	}
	
	.player-item {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 8px;
		padding: 0.8rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		min-width: 120px;
	}
	
	.player-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	
	.player-avatar {
		width: 40px;
		height: 40px;
		overflow: hidden;
	}
	
	.player-avatar img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	
	.player-name {
		font-weight: bold;
		color: white;
	}
	
	.profile-button-container {
		margin-top: 1.5rem;
	}
	
	.profile-button {
		background-color: #f4c03f;
		color: #1a2e12;
		padding: 0.8rem 1.5rem;
		font-size: 1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: bold;
		font-family: 'FrogFont', sans-serif;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.profile-button:hover {
		background-color: #f7d06a;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	
	.profile-button:active {
		transform: translateY(0);
	}
</style>
