<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	import { goto } from '$app/navigation';
	import homepageBackground from '$lib/images/swamp.png';
	import { onMount } from 'svelte';
	import { TABLES } from '$lib/pb/constants';
	import type { PlayerPositionsResponse, PositionsResponse, UsersResponse } from '$lib/pb/types/pocketbase';
	import { page } from '$app/state';
	import { playerIsInLobby } from '$lib/pb/lobbies';

	async function getWinningPlayer(): Promise<string> {
		try {
			const lobbyId = page.params.lobbyId;
			type Expand = {
				user: UsersResponse;
			};
			const winner = await pb
				.collection(TABLES.PLAYER_POSITIONS)
				.getList<PlayerPositionsResponse<Expand>>(1, 1, {
					sort: 'y',
					expand: 'user'
				});

			if (lobbyId) {
				winner.items = winner.items.filter((item) => playerIsInLobby(lobbyId, item.user))
			}

			return winner.items[0].expand?.user.name ?? 'Unknown';
		} catch (error) {
			console.error('Error getting winning player:', error);
			return 'Unknown';
		}
	}

	let winnerName = 'Loading...';

	onMount(async () => {
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}

		// Get winner
		winnerName = await getWinningPlayer();
	});

	function backToHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Game Over</title>
</svelte:head>

<section class="game-over-page" style="background-image: url({homepageBackground});">
	<div class="form-box mx-auto max-w-md p-4">
		<h1 style="font-family: 'FrogFont', sans-serif; color: #212e1d;">Game Over!</h1>

		<div class="winner-box">
			<h2 style="font-family: 'FrogFont', sans-serif; color: #212e1d;">Winner:</h2>
			<p class="winner-name">{winnerName} won!</p>
		</div>

		<div class="button-group">
			<button
				class="create-btn"
				style="font-family: 'FrogFont', sans-serif; color: #212e1d;"
				on:click={backToHome}
			>
				Back to Home
			</button>
		</div>
	</div>
</section>

<style>
	.game-over-page {
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
		text-align: center;
	}

	.winner-box {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 8px;
		padding: 1.5rem;
		margin: 2rem 0;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}

	.winner-name {
		font-family: 'FrogFont', sans-serif;
		font-size: 2rem;
		color: #f4c03f;
		margin-top: 0.5rem;
	}

	.button-group {
		display: flex;
		justify-content: center;
		margin-top: 1.5rem;
	}

	.create-btn {
		background-color: #f4c03f;
		color: white;
		padding: 0.75rem 1.25rem;
		font-size: 1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		width: 70%;
	}

	.create-btn:hover {
		background-color: #e0b13a;
		transform: scale(1.05);
		transition: all 0.2s ease;
	}
</style>
