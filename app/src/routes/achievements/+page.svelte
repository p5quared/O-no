<script lang="ts">
	import { onMount } from 'svelte';
	import { pb } from '$lib/pb/pocketbase';
	import { goto } from '$app/navigation';
	import { 
		getTotalPlaytime, 
		getFastestPlaytime, 
		getLongestPlaytime, 
		getCompletedGamesCount,
		formatPlaytime
	} from '$lib/pb/playtime';
	import { getUserScore } from '$lib/pb/users';

	// Achievement definitions
	const achievements = [
		{
			id: 'total_playtime_1',
			name: 'Time Traveler I',
			description: 'Play for a total of 30 minutes',
			icon: '⏱️',
			threshold: 30 * 60 * 1000, // 30 minutes in ms
			type: 'total_playtime'
		},
		{
			id: 'total_playtime_2',
			name: 'Time Traveler II',
			description: 'Play for a total of 2 hours',
			icon: '⏱️⏱️',
			threshold: 2 * 60 * 60 * 1000, // 2 hours in ms
			type: 'total_playtime'
		},
		{
			id: 'total_playtime_3',
			name: 'Time Traveler III',
			description: 'Play for a total of 5 hours',
			icon: '⏱️⏱️⏱️',
			threshold: 5 * 60 * 60 * 1000, // 5 hours in ms
			type: 'total_playtime'
		},
		{
			id: 'fast_game_1',
			name: 'Speed Runner I',
			description: 'Complete a game in under 10 minutes',
			icon: '🏃',
			threshold: 10 * 60 * 1000, // 10 minutes in ms
			type: 'fastest_game',
			compare: 'less'
		},
		{
			id: 'fast_game_2',
			name: 'Speed Runner II',
			description: 'Complete a game in under 5 minutes',
			icon: '🏃🏃',
			threshold: 5 * 60 * 1000, // 5 minutes in ms
			type: 'fastest_game',
			compare: 'less'
		},
		{
			id: 'fast_game_3',
			name: 'Speed Runner III',
			description: 'Complete a game in under 3 minutes',
			icon: '🏃🏃🏃',
			threshold: 3 * 60 * 1000, // 3 minutes in ms
			type: 'fastest_game',
			compare: 'less'
		},
		{
			id: 'long_game_1',
			name: 'Endurance I',
			description: 'Complete a game lasting over 15 minutes',
			icon: '🏆',
			threshold: 15 * 60 * 1000, // 15 minutes in ms
			type: 'longest_game',
			compare: 'greater'
		},
		{
			id: 'long_game_2',
			name: 'Endurance II',
			description: 'Complete a game lasting over 30 minutes',
			icon: '🏆🏆',
			threshold: 30 * 60 * 1000, // 30 minutes in ms
			type: 'longest_game',
			compare: 'greater'
		},
		{
			id: 'long_game_3',
			name: 'Endurance III',
			description: 'Complete a game lasting over 1 hour',
			icon: '🏆🏆🏆',
			threshold: 60 * 60 * 1000, // 1 hour in ms
			type: 'longest_game',
			compare: 'greater'
		},
		{
			id: 'games_completed_1',
			name: 'Persistent I',
			description: 'Complete 5 games',
			icon: '🎮',
			threshold: 5,
			type: 'games_completed'
		},
		{
			id: 'games_completed_2',
			name: 'Persistent II',
			description: 'Complete 15 games',
			icon: '🎮🎮',
			threshold: 15,
			type: 'games_completed'
		},
		{
			id: 'games_completed_3',
			name: 'Persistent III',
			description: 'Complete 30 games',
			icon: '🎮🎮🎮',
			threshold: 30,
			type: 'games_completed'
		},
		{
			id: 'wins_1',
			name: 'Winner I',
			description: 'Win 3 games',
			icon: '🥇',
			threshold: 3,
			type: 'wins'
		},
		{
			id: 'wins_2',
			name: 'Winner II',
			description: 'Win 10 games',
			icon: '🥇🥇',
			threshold: 10,
			type: 'wins'
		},
		{
			id: 'wins_3',
			name: 'Winner III',
			description: 'Win 25 games',
			icon: '🥇🥇🥇',
			threshold: 25,
			type: 'wins'
		}
	];

	let userAchievements = [];
	let totalPlaytime = 0;
	let fastestGame = null;
	let longestGame = null;
	let completedGames = 0;
	let userScore = 0;
	let loading = true;
	let userId = '';

	onMount(async () => {
		if (!pb.authStore.isValid) {
			goto('/login');
			return;
		}

		userId = pb.authStore.model.id;
		await loadUserStats();
	});

	async function loadUserStats() {
		loading = true;
		try {
			// Load all user stats
			totalPlaytime = await getTotalPlaytime(userId);
			fastestGame = await getFastestPlaytime(userId);
			longestGame = await getLongestPlaytime(userId);
			completedGames = await getCompletedGamesCount(userId);
			userScore = await getUserScore(userId);
			
			// Calculate which achievements are unlocked
			userAchievements = achievements.map(achievement => {
				let unlocked = false;
				let progress = 0;
				let maxProgress = achievement.threshold;
				
				switch (achievement.type) {
					case 'total_playtime':
						progress = totalPlaytime;
						unlocked = totalPlaytime >= achievement.threshold;
						break;
					case 'fastest_game':
						if (fastestGame !== null) {
							progress = fastestGame;
							unlocked = fastestGame <= achievement.threshold;
						}
						break;
					case 'longest_game':
						if (longestGame !== null) {
							progress = longestGame;
							unlocked = longestGame >= achievement.threshold;
						}
						break;
					case 'games_completed':
						progress = completedGames;
						unlocked = completedGames >= achievement.threshold;
						break;
					case 'wins':
						progress = userScore;
						unlocked = userScore >= achievement.threshold;
						break;
				}
				
				return {
					...achievement,
					unlocked,
					progress,
					maxProgress
				};
			});
		} catch (error) {
			console.error('Error loading user stats:', error);
		} finally {
			loading = false;
		}
	}

	function getProgressPercentage(achievement) {
		if (achievement.compare === 'less') {
			// For "less than" achievements (like fastest game), we need special handling
			if (achievement.progress === 0 || achievement.progress === null) return 0;
			// If already unlocked, show 100%
			if (achievement.unlocked) return 100;
			// Otherwise, show inverse progress (closer to threshold = more progress)
			const inverseProgress = Math.min(100, (achievement.maxProgress / achievement.progress) * 100);
			return inverseProgress;
		}
		
		// For regular "greater than" achievements
		return Math.min(100, (achievement.progress / achievement.maxProgress) * 100);
	}

	function formatProgressText(achievement) {
		switch (achievement.type) {
			case 'total_playtime':
			case 'fastest_game':
			case 'longest_game':
				return `${formatPlaytime(achievement.progress)} / ${formatPlaytime(achievement.maxProgress)}`;
			default:
				return `${achievement.progress} / ${achievement.maxProgress}`;
		}
	}
</script>

<svelte:head>
	<title>Achievements</title>
</svelte:head>

<div class="achievements-page">
	<div class="container">
		<div class="header-container">
			<button class="back-button" on:click={() => history.back()}>← Back</button>
			<h1 class="page-title">Your Achievements</h1>
		</div>
		
		{#if loading}
			<div class="loading">
				<p>Loading your achievements...</p>
				<div class="spinner"></div>
			</div>
		{:else}
			<div class="stats-summary">
				<div class="stat-card">
					<div class="stat-icon">⏱️</div>
					<div class="stat-info">
						<h3>Total Playtime</h3>
						<p>{formatPlaytime(totalPlaytime)}</p>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">🏃</div>
					<div class="stat-info">
						<h3>Fastest Game</h3>
						<p>{formatPlaytime(fastestGame)}</p>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">🏆</div>
					<div class="stat-info">
						<h3>Longest Game</h3>
						<p>{formatPlaytime(longestGame)}</p>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">🎮</div>
					<div class="stat-info">
						<h3>Games Completed</h3>
						<p>{completedGames}</p>
					</div>
				</div>
				
				<div class="stat-card">
					<div class="stat-icon">🥇</div>
					<div class="stat-info">
						<h3>Wins</h3>
						<p>{userScore}</p>
					</div>
				</div>
			</div>
			
			<div class="achievements-grid">
				{#each userAchievements as achievement}
					<div class="achievement-card {achievement.unlocked ? 'unlocked' : 'locked'}">
						<div class="achievement-icon">
							{achievement.icon}
						</div>
						<div class="achievement-info">
							<h3>{achievement.name}</h3>
							<p>{achievement.description}</p>
							<div class="progress-bar">
								<div 
									class="progress-fill" 
									style="width: {getProgressPercentage(achievement)}%"
								></div>
							</div>
							<div class="progress-text">
								{formatProgressText(achievement)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.achievements-page {
		min-height: 100vh;
		background: linear-gradient(to bottom, #1a2e12, #0a1a06);
		color: white;
		padding: 2rem 0;
	}
	
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1rem;
	}
	
	.header-container {
		display: flex;
		align-items: center;
		position: relative;
		margin-bottom: 2rem;
	}
	
	.back-button {
		position: absolute;
		left: 0;
		background-color: #34623f;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.back-button:hover {
		background-color: #4a8759;
	}
	
	.page-title {
		font-family: 'FrogFont', sans-serif;
		font-size: 3rem;
		text-align: center;
		width: 100%;
		color: #f4c03f;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 3rem;
	}
	
	.spinner {
		width: 50px;
		height: 50px;
		border: 5px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
		border-top-color: #f4c03f;
		animation: spin 1s ease-in-out infinite;
		margin-top: 1rem;
	}
	
	@keyframes spin {
		to { transform: rotate(360deg); }
	}
	
	.stats-summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 3rem;
	}
	
	.stat-card {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: transform 0.2s ease;
	}
	
	.stat-card:hover {
		transform: translateY(-5px);
	}
	
	.stat-icon {
		font-size: 2.5rem;
		margin-right: 1rem;
		color: #f4c03f;
	}
	
	.stat-info h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.1rem;
		color: #f4c03f;
	}
	
	.stat-info p {
		margin: 0;
		font-size: 1.2rem;
		font-weight: bold;
	}
	
	.achievements-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1.5rem;
	}
	
	.achievement-card {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}
	
	.achievement-card.unlocked {
		background: linear-gradient(135deg, rgba(33, 46, 29, 0.95), rgba(76, 175, 80, 0.3));
		border: 1px solid rgba(244, 192, 63, 0.3);
	}
	
	.achievement-card.locked {
		filter: grayscale(70%);
		opacity: 0.7;
	}
	
	.achievement-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
	}
	
	.achievement-icon {
		font-size: 2.5rem;
		margin-right: 1rem;
		color: #f4c03f;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 60px;
	}
	
	.achievement-info {
		flex: 1;
	}
	
	.achievement-info h3 {
		margin: 0 0 0.5rem 0;
		color: #f4c03f;
	}
	
	.achievement-info p {
		margin: 0 0 1rem 0;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.9);
	}
	
	.progress-bar {
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	
	.progress-fill {
		height: 100%;
		background: #f4c03f;
		border-radius: 4px;
		transition: width 0.5s ease;
	}
	
	.progress-text {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.7);
		text-align: right;
	}
	
	@media (max-width: 768px) {
		.stats-summary {
			grid-template-columns: repeat(2, 1fr);
		}
		
		.achievements-grid {
			grid-template-columns: 1fr;
		}
	}
	
	@media (max-width: 480px) {
		.stats-summary {
			grid-template-columns: 1fr;
		}
		
		.stat-card {
			padding: 1rem;
		}
		
		.achievement-card {
			padding: 1rem;
		}
	}
</style>
