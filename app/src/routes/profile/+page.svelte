<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pb/pocketbase';
	import { goto } from '$app/navigation';
	import Header from '../Header.svelte';
	import profileBackground from '$lib/images/swamp.png';
	import { KAPLAY_SPRITES } from '$lib/kaplay';

	let currentSprite = '';
	let loading = true;
	let error = '';
	let profileId = '';
	let saveSuccess = false;

	onMount(async () => {
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}

		try {
			loading = true;
			// Try to get the user's profile
			const userId = pb.authStore.model?.id;
			if (!userId) {
				throw new Error('User not logged in');
			}

			// Get the profile for the current user
			const profiles = await pb.collection('profiles').getList(1, 1, {
				filter: `user="${userId}"`
			});

			if (profiles.items.length > 0) {
				// Profile exists, get current sprite
				const profile = profiles.items[0];
				profileId = profile.id;
				currentSprite = profile.sprite || KAPLAY_SPRITES[0];
			} else {
				// Create a new profile with default sprite
				const newProfile = await pb.collection('profiles').create({
					user: userId,
					sprite: KAPLAY_SPRITES[0]
				});
				profileId = newProfile.id;
				currentSprite = KAPLAY_SPRITES[0];
			}
		} catch (err) {
			console.error('Error loading profile:', err);
			error = 'Failed to load profile. Please try again.';
		} finally {
			loading = false;
		}
	});

	async function selectSprite(spriteName: string) {
		if (!profileId) return;

		try {
			await pb.collection('profiles').update(profileId, {
				sprite: spriteName
			});
			currentSprite = spriteName;
			saveSuccess = true;
			setTimeout(() => {
				saveSuccess = false;
			}, 3000);
		} catch (err) {
			console.error('Error updating sprite:', err);
			error = 'Failed to update sprite. Please try again.';
		}
	}

	function getSpriteUrl(spriteName: string) {
		// Construct the URL using the KaplayJS sprite path
		return `https://play.kaplayjs.com/sprites/${spriteName}.png`;
	}
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<section class="profile-page" style="background-image: url({profileBackground});">
	<div class="profile-box">
		<h1 style="font-family: 'FrogFont', sans-serif;">Choose Your Sprite</h1>

		{#if loading}
			<p style="font-family: 'FrogFont', sans-serif;">Loading your profile...</p>
		{:else if error}
			<p class="error" style="font-family: 'FrogFont', sans-serif;">{error}</p>
		{:else}
			{#if saveSuccess}
				<div class="success-message">
					<p style="font-family: 'FrogFont', sans-serif;">Sprite updated successfully!</p>
				</div>
			{/if}

			<div class="current-sprite">
				<h2 style="font-family: 'FrogFont', sans-serif;">Current Sprite</h2>
				<div class="sprite-preview">
					<img src={getSpriteUrl(currentSprite)} alt="Current sprite" />
					<p style="font-family: 'FrogFont', sans-serif;">{currentSprite}</p>
				</div>
			</div>

			<div class="sprite-selection">
				<h2 style="font-family: 'FrogFont', sans-serif;">Available Sprites</h2>
				<div class="sprite-grid">
					{#each KAPLAY_SPRITES as sprite}
						<div
							class="sprite-option"
							class:selected={currentSprite === sprite}
							on:click={() => selectSprite(sprite)}
						>
							<img src={getSpriteUrl(sprite)} alt={sprite} />
							<p style="font-family: 'FrogFont', sans-serif;">{sprite}</p>
						</div>
					{/each}
				</div>
			</div>

			<div class="return-button-container">
				<button class="return-button" on:click={() => goto('/demo')}> Return to Demo </button>
			</div>
		{/if}
	</div>
</section>

<style>
	.profile-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background-position: center;
		background-size: cover;
		padding: 2rem;
	}

	.profile-box {
		background: rgba(120, 114, 47, 0.9);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
		width: 100%;
		max-width: 800px;
		color: #212e1d;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	h2 {
		font-size: 1.5rem;
		margin: 1rem 0;
	}

	.current-sprite {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8px;
	}

	.sprite-preview {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.sprite-preview img {
		width: 100px;
		height: 100px;
		object-fit: contain;
		margin-bottom: 0.5rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		padding: 0.5rem;
	}

	.sprite-selection {
		width: 100%;
	}

	.sprite-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 1rem;
	}

	.sprite-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.sprite-option:hover {
		background: rgba(255, 255, 255, 0.4);
		transform: scale(1.05);
	}

	.sprite-option.selected {
		background: rgba(244, 192, 63, 0.6);
		border: 2px solid #212e1d;
	}

	.sprite-option img {
		width: 64px;
		height: 64px;
		object-fit: contain;
		margin-bottom: 0.5rem;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 8px;
		padding: 0.5rem;
	}

	.error {
		color: #721c24;
		background-color: #f8d7da;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.success-message {
		color: #155724;
		background-color: #d4edda;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.return-button-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}

	.return-button {
		background-color: #4a6741;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.75rem 1.5rem;
		font-family: 'FrogFont', sans-serif;
		font-size: 1.2rem;
		cursor: pointer;
		transition: background-color 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.return-button:hover {
		background-color: #5c7d52;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
</style>
