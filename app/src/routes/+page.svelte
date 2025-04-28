<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	import { goto, invalidateAll } from '$app/navigation';
	import homepageBackground from '$lib/images/swamp.png';
	import { fetchAllLobbies, createLobby, subscribeToLobbies } from '$lib/pb/lobbies';
	import { onMount } from 'svelte';
	import { TABLES } from '$lib/pb/constants';
	import Header from './Header.svelte';
	import { page } from '$app/state';

	let sounds: { [key: string]: HTMLAudioElement } = {};
	let frogInterval: number;

	onMount(() => {
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}

		// Setup sounds
		sounds = {
			forest: Object.assign(new Audio('/forest.wav'), { volume: 0.7, loop: true }),
			frog: Object.assign(new Audio('/frog.mp3'), { volume: 0.05 })
		};

		// Start playback
		sounds.forest.play().catch(console.error);
		sounds.forest.addEventListener('ended', () => sounds.forest.play().catch(console.error));
		const playFrog = () => sounds.frog.play().catch(console.error);
		playFrog();
		frogInterval = setInterval(playFrog, 25000);

		alert('Start resets the game!');
		alert("When you join/start, scroll down and click inside the canvas to play. Sorry about the buggy window. We're working on it");

		return () => {
			Object.values(sounds).forEach((sound) => sound.pause());
			clearInterval(frogInterval);
		};
	});

	let newLobbyName = '';
	let lobbies: any[] = [];
	async function handleCreateLobby() {
		if (newLobbyName.trim()) {
			try {
				await createLobby(newLobbyName.trim());
				lobbies = await fetchAllLobbies();
				newLobbyName = '';
			} catch (error) {
				console.error('Error creating lobby:', error);
			}
		}
	}

	onMount(async () => {
		try {
			lobbies = await fetchAllLobbies();
			subscribeToLobbies((e: any) => {
				if (e.action === 'create') {
					lobbies = [...lobbies, e.record];
				} else if (e.action === 'update') {
					const index = lobbies.findIndex((lobby) => lobby.id === e.record.id);
					if (index !== -1) {
						lobbies[index] = e.record;
					}
				} else if (e.action === 'delete') {
					lobbies = lobbies.filter((lobby) => lobby.id !== e.record.id);
				}
			});
		} catch (error) {
			console.error('Error Fetching All the Lobbies:', error);
		}
	});

	async function handleJoinLobby(lobbyId: string) {
		goto(`/lobby?id=${lobbyId}`);
	}

	function joinGame() {
		goto('/demo-game');
	}

	async function resetGame() {
		for (const table of [TABLES.PLAYER_POSITIONS, TABLES.GAME_EVENTS]) {
			try {
				const records = await pb.collection(table).getFullList();
				if (records.length === 0) {
									console.log(`No records found in ${table}`);
									continue;
								}
				for (const record of records) {
					console.log(`Deleting record ${record.id} from ${table}`);
					await pb.collection(table).delete(record.id);
				}
			} catch (error) {
				console.error(`Error deleting from ${table}:`, error);
			}
		}
		console.log('Game reset!');

		// INFO: Need to force refresh
		window.location.href = '/demo-game';
	}
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

	{#if !['/login', '/registration'].includes(page.url.pathname)}
	<Header />

	{/if}

<section class="lobby-page" style="background-image: url({homepageBackground});">
	<div class="form-box mx-auto max-w-md p-4">
		<h1 style="font-family: 'FrogFont', sans-serif; color: #212e1d;">Welcome, Frog!</h1>
		<h2 style="font-family: 'FrogFont', sans-serif; color: #212e1d;">
			Click "Start" to Reset the Game!
		</h2>
		<button
			class="create-btn"
			style="font-family: 'FrogFont', sans-serif; color: #212e1d;"
			on:click={resetGame}>Start</button
		>
		<h2 style="font-family: 'FrogFont', sans-serif; color: #212e1d;">
			Click "Join" to Go to Existing Game!
		</h2>
		<button
			class="create-btn"
			style="font-family: 'FrogFont', sans-serif; color: #212e1d;"
			on:click={joinGame}>Join</button
		>

		<!-- REMOVED FOR TEMP LOBBY: 
        <h1 style="font-family: 'FrogFont', sans-serif;">Join a Lobby! </h1>

        <div class="lobby-list">
            {#each lobbies as lobby}
				<div class="lobby-card">
					<div>
						<p style="font-weight: bold;">{lobby.name}</p>
						<p>Players {lobby.players?.length || 0}/10</p>
					</div>
					<button class="join-btn" on:click={() => handleJoinLobby(lobby.id)}>Join</button>
				</div>
				
            {/each}
        </div>

		<button class="create-btn" style="font-family: 'FrogFont', sans-serif;" on:click={handleCreateLobby}>New Lobby</button>
		<input
			type="text"
			bind:value={newLobbyName}
			placeholder="New Lobby Name"
			class="rounded"
			style="color:black;"
		/>
-->
	</div>
</section>

<style>
	.lobby-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: white;
		background-position: center;
		background-size: cover;
		overflow: hidden;
	}
	.form-box {
		background: rgba(120, 114, 47, 0.8);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		width: 600px;
	}
	.lobby-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 650px;
		margin-bottom: 2rem;
		margin-top: 2rem;
		height: 400px;
		overflow-y: auto;
	}
	.lobby-card {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}
	.join-btn {
		background-color: #f4c03f;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.create-btn {
		background-color: #f4c03f;
		color: white;
		padding: 0.75rem 1.25rem;
		font-size: 1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		margin-bottom: 10px;
	}
</style>
