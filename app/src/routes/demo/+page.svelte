<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	import { goto } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { fetchAllLobbies, fetchSingleLobby, joinLobby, updateLobby } from '$lib/pb/lobbies';
	import homepageBackground from '$lib/images/swamp.png';
	import { getUserById } from '$lib/pb/users';
	import type { LobbiesRecord } from '$lib/pb/types/pocketbase';
	import { getUserProfile } from '$lib/pb/profiles';

	let currentLobby: LobbiesRecord | null = null;
	let players: { id: string; name: string; sprite: string }[] = [];
	let isLoading = true;
	let subscription: { unsubscribe: () => void } | null = null;
	let isLobbyOwner = false;

	async function loadPlayers() {
		if (!currentLobby || !currentLobby.players) return;
		
		const playerPromises = currentLobby.players.map(async (playerId) => {
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

	async function findOrJoinLobby() {
		try {
			const lobbies = await fetchAllLobbies();
			
			const openLobby = lobbies[0];
			
			if (openLobby) {
				currentLobby = await joinLobby(openLobby.id);
				
				isLobbyOwner = currentLobby.host === pb.authStore.model?.id;
				
				if (currentLobby.is_started) {
					goto('/demo-game');
					return;
				}
				
				let sub = await pb.collection('lobbies').subscribe(currentLobby.id, async (e) => {
					if (e.action === 'update') {
						currentLobby = e.record;
						
						isLobbyOwner = currentLobby.host === pb.authStore.model?.id;
						
						if (currentLobby.is_started) {
							goto('/demo-game');
							return;
						}
						
						await loadPlayers();
					}
				});
				subscription = {
				  unsubscribe: ()  => sub()
				};
				
				await loadPlayers();
			} else {
				console.log('No open lobby found');
				goto('/');
			}
		} catch (error) {
			console.error('Error finding or joining lobby:', error);
		} finally {
			isLoading = false;
		}
	}

	async function startGame() {
		if (!currentLobby || !isLobbyOwner) return;
		
		try {
			await updateLobby(currentLobby.id, { is_started: true });
		} catch (error) {
			console.error('Error starting game:', error);
		}
	}

	function goToProfile() {
		goto('/profile');
	}

	let sprite = 'bean'
	onMount(async () => {
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}
	  const profile = await getUserProfile(pb.authStore.record?.id ?? '');
	  sprite = profile.sprite ?? 'bean'
		
		await findOrJoinLobby();
	});

	onDestroy(() => {
		if (subscription) {
			subscription.unsubscribe();
		}
	});

</script>

<svelte:head>
	<title>Waiting Room</title>
</svelte:head>

<section class="waiting-room" style="background-image: url({homepageBackground});">
	<div class="forest-animations">
		<div class="jumping-frog frog1">🐸</div>
		<div class="jumping-frog frog2">🐸</div>
		<div class="jumping-frog frog3">🐸</div>
		
		<div class="lily-pad pad1"></div>
		<div class="lily-pad pad2"></div>
		
		<div class="firefly fly1"></div>
		<div class="firefly fly2"></div>
		<div class="firefly fly3"></div>
		<div class="firefly fly4"></div>
		<div class="firefly fly5"></div>
	</div>

	<div class="content-wrapper">
		{#if isLoading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Loading...</p>
			</div>
		{:else if currentLobby}
			<div class="waiting-container">
				<h1 class="page-title">Waiting Room</h1>
				
				<div class="status-message">
					{#if isLobbyOwner}
						<p>You are the host. Start the game when ready!</p>
						<button class="start-button" on:click={startGame}>
							Start Game
						</button>
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
									<img src={`https://play.kaplayjs.com/${player.sprite}.png`} />
								</div>
								<div class="player-name">{player.name}</div>
							</div>
						{/each}
					</div>
				</div>
				
				<div class="profile-button-container">
					<button class="profile-button" on:click={goToProfile}>
						Change Avatar
					</button>
				</div>
			</div>
		{:else}
			<div class="error-container">
				<p>No open lobby found. Redirecting to home...</p>
			</div>
		{/if}
	</div>
</section>

<style>
	.waiting-room {
		min-height: 100vh;
		color: white;
		background-position: center;
		background-size: cover;
		position: relative;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.content-wrapper {
		max-width: 800px;
		width: 100%;
		position: relative;
		z-index: 2;
		padding: 2rem;
	}
	
	.waiting-container {
		background: rgba(11, 25, 7, 0.8);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}
	
	.page-title {
		font-family: 'FrogFont', sans-serif;
		font-size: 3rem;
		margin-bottom: 1.5rem;
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		animation: float 3s ease-in-out infinite;
	}
	
	.status-message {
		font-size: 1.5rem;
		margin-bottom: 2rem;
		color: #f4c03f;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}
	
	.player-list-container {
		margin-bottom: 2rem;
	}
	
	.player-list-container h2 {
		font-size: 1.8rem;
		margin-bottom: 1rem;
		color: #f4c03f;
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
		padding: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		min-width: 150px;
	}
	
	.player-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
	
	.player-avatar {
		font-size: 1.5rem;
	}
	
	.player-name {
		font-weight: bold;
	}
	
	.profile-button-container {
		margin-top: 2rem;
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
	
	.start-button {
		background-color: #4CAF50;
		color: white;
		padding: 1rem 2rem;
		font-size: 1.2rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: bold;
		font-family: 'FrogFont', sans-serif;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		margin-top: 1rem;
		display: block;
		margin-left: auto;
		margin-right: auto;
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
	
	.loading-container, .error-container {
		background: rgba(11, 25, 7, 0.8);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
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
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Enhanced Background Animations */
	.forest-animations {
		position: absolute;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
	}
	
	.jumping-frog {
		position: absolute;
		font-size: 3.5rem;
		animation: jumpAround 20s linear infinite;
		opacity: 0.95;
		text-shadow: 0 0 15px rgba(0, 255, 0, 0.6);
		filter: drop-shadow(0 0 10px rgba(0, 200, 0, 0.8));
		z-index: 10;
	}
	
	.frog1 {
		left: 10%;
		top: 20%;
		animation-delay: 0s;
		font-size: 4rem;
	}
	
	.frog2 {
		right: 15%;
		top: 40%;
		animation-delay: -5s;
		font-size: 3.8rem;
	}
	
	.frog3 {
		left: 20%;
		bottom: 20%;
		animation-delay: -10s;
		transform: scaleX(-1);
		font-size: 4.2rem;
	}
	
	.lily-pad {
		position: absolute;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: radial-gradient(circle at 30% 30%, 
					rgba(0, 180, 0, 0.7),
					rgba(0, 140, 0, 0.4));
		animation: floatPad 15s ease-in-out infinite;
		box-shadow: 0 0 20px rgba(0, 200, 0, 0.4);
		z-index: 5;
	}
	
	.pad1 {
		left: 5%;
		bottom: 15%;
		animation-delay: -2s;
		width: 150px;
		height: 150px;
	}
	
	.pad2 {
		right: 10%;
		bottom: 25%;
		width: 180px;
		height: 180px;
		animation-delay: -7s;
	}
	
	.firefly {
		position: absolute;
		width: 8px;
		height: 8px;
		background: rgba(255, 255, 150, 1);
		border-radius: 50%;
		filter: blur(2px);
		box-shadow: 0 0 20px 8px rgba(255, 255, 100, 0.8);
		animation: flyAround 12s linear infinite;
		z-index: 8;
	}
	
	.fly1 { left: 10%; top: 30%; animation-delay: -1s; }
	.fly2 { right: 20%; top: 20%; animation-delay: -3s; }
	.fly3 { left: 40%; bottom: 30%; animation-delay: -5s; }
	.fly4 { right: 35%; top: 50%; animation-delay: -7s; }
	.fly5 { left: 25%; top: 60%; animation-delay: -9s; }
	
	@keyframes jumpAround {
		0% { transform: translate(0, 0) rotate(0deg) scale(1); }
		10% { transform: translate(30px, -80px) rotate(10deg) scale(1.05); }
		20% { transform: translate(100px, -20px) rotate(20deg) scale(1); }
		30% { transform: translate(150px, -60px) rotate(5deg) scale(0.95); }
		40% { transform: translate(200px, 0) rotate(0deg) scale(1); }
		50% { transform: translate(150px, -40px) rotate(-10deg) scale(1.05); }
		60% { transform: translate(100px, 30px) rotate(-20deg) scale(1); }
		70% { transform: translate(50px, -20px) rotate(-5deg) scale(0.95); }
		80% { transform: translate(30px, 20px) rotate(10deg) scale(1); }
		90% { transform: translate(10px, -30px) rotate(15deg) scale(1.02); }
		100% { transform: translate(0, 0) rotate(0deg) scale(1); }
	}
	
	@keyframes floatPad {
		0%, 100% { transform: translate(0, 0) rotate(0deg); }
		25% { transform: translate(10px, -15px) rotate(5deg); }
		50% { transform: translate(20px, 0) rotate(0deg); }
		75% { transform: translate(5px, 10px) rotate(-5deg); }
	}
	
	@keyframes flyAround {
		0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
		25% { transform: translate(50px, -30px) scale(1.5); opacity: 0.9; }
		50% { transform: translate(80px, 10px) scale(1); opacity: 0.4; }
		75% { transform: translate(20px, 30px) scale(1.2); opacity: 0.8; }
		100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
</style>
