<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	import { goto, invalidateAll } from '$app/navigation';
	import homepageBackground from '$lib/images/swamp.png';
	import { fetchAllLobbies, createLobby, subscribeToLobbies } from '$lib/pb/lobbies';
	import { onMount } from 'svelte';

	import Leaderboard from './Leaderboard.svelte';
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
            subscribeToLobbies((e:any) => {
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
            console.error("Error Fetching All the Lobbies:", error);
        }
    });
	
	// Generate team logo based on lobby name
	function getTeamLogoColors(lobbyId: string, lobbyName: string): {bgColor: string, circleColor: string, letter: string} {
		// Use white for background instead of brown/amber
		const bgColor = "#FFFFRR";
		
		// Array of circle colors (blue shades)
		const circleColors = [
			"#4169E1", // RoyalBlue
			"#1E90FF", // DodgerBlue
			"#00BFFF", // DeepSkyBlue
			"#87CEEB", // SkyBlue
			"#6495ED", // CornflowerBlue
			"#4682B4"  // SteelBlue
		];
		
		// Use hash of lobby ID to consistently select colors
		const hash = lobbyId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
		const circleColor = circleColors[hash % circleColors.length];
		
		// Get first letter of lobby name or use a default
		const letter = lobbyName ? lobbyName.charAt(0).toUpperCase() : "T";
		
		return { bgColor, circleColor, letter };
	}


	async function handleJoinLobby(lobbyId: string) {
		goto(`/lobby?id=${lobbyId}`);
	}

	function joinGame() {
		goto('/demo-game');
	}

	async function resetGame() {
		try {
			const records = await pb.collection(TABLES.PLAYER_POSITIONS).getFullList();
			if (records.length === 0) {
				console.log(`No records found in ${TABLES.PLAYER_POSITIONS}`);
			} else {
				for (const record of records) {
					console.log(`Deleting record ${record.id} from ${TABLES.PLAYER_POSITIONS}`);
					await pb.collection(TABLES.PLAYER_POSITIONS).delete(record.id);
				}
			}
		} catch (error) {
			console.error(`Error deleting from ${TABLES.PLAYER_POSITIONS}:`, error);
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
	<div class="forest-animations">
		<div class="jumping-frog frog1">🐸</div>
		<div class="jumping-frog frog2">🐸</div>
		<div class="jumping-frog frog3">🐸</div>
		<div class="jumping-frog frog4">🐸</div>
		<div class="jumping-frog frog5">🐸</div>
		
		<div class="lily-pad pad1"></div>
		<div class="lily-pad pad2"></div>
		<div class="lily-pad pad3"></div>
		
		<div class="firefly fly1"></div>
		<div class="firefly fly2"></div>
		<div class="firefly fly3"></div>
		<div class="firefly fly4"></div>
		<div class="firefly fly5"></div>
		<div class="firefly fly6"></div>
		<div class="firefly fly7"></div>
		
		<div class="water-ripple ripple1"></div>
		<div class="water-ripple ripple2"></div>
	</div>

	<div class="mx-auto p-8 content-wrapper">
		<h1 class="page-title">Join a Lobby!</h1>
		
		<div class="main-content">
			<div class="lobby-section">
				<div class="lobby-list-container">
					{#each lobbies as lobby, i}
						<div class="lobby-card" style="animation-delay: {i * 0.1}s">
							<div class="team-icon">
								{#if lobby.id}
									{@const logoColors = getTeamLogoColors(lobby.id, lobby.name)}
									<div class="team-logo" style="background-color: {logoColors.bgColor}">
										<div class="logo-circle" style="background-color: {logoColors.circleColor}">
											<span class="logo-letter">{logoColors.letter}</span>
										</div>
									</div>
								{/if}
							</div>
							<div class="lobby-info">
								<p class="lobby-name">{lobby.name}</p>
								<p class="lobby-players">Players {lobby.players?.length || 0}/10</p>
							</div>
							<button class="join-btn" on:click={() => handleJoinLobby(lobby.id)}>Join</button>
						</div>
					{/each}
					
					<div class="form-box mx-auto max-w-md p-4">
						<div class="text-center" style="margin-bottom: 1rem;">
							<p class="button-desc">Click "Start" to Reset the Game!</p>
							<button class="create-btn" on:click={resetGame}>Start</button>
							<p class="button-desc" style="margin-top: 1rem;">Click "Join" to Go to Existing Game!</p>
							<button class="create-btn" style="margin-left: 1rem;" on:click={joinGame}>Join</button>
						</div>
					</div>
				</div>

				<div class="create-lobby-section">
					<button class="create-btn" on:click={handleCreateLobby}>New Lobby</button>
					<div class="input-wrapper">
						<input
							type="text"
							bind:value={newLobbyName}
							placeholder="New Lobby Name"
							class="lobby-input"
						/>
					</div>
				</div>
			</div>
			
			<div class="leaderboard-section">
				<Leaderboard />
			</div>
		</div>
	</div>
	

</section>

<style>
	.lobby-page {
		min-height: 100vh;
		color: white;
		background-position: center;
		background-size: cover;
		position: relative;
		overflow: hidden;
		padding: 2rem 0;
	}
	
	.content-wrapper {
		max-width: 1000px;
		position: relative;
		z-index: 2;
		margin: 0 auto;
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
	
	.frog4 {
		right: 25%;
		bottom: 35%;
		animation-delay: -15s;
		font-size: 3.5rem;
	}
	
	.frog5 {
		left: 40%;
		top: 15%;
		animation-delay: -7s;
		font-size: 3.6rem;
		transform: scaleX(-1);
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
	
	.pad3 {
		left: 30%;
		bottom: 40%;
		width: 140px;
		height: 140px;
		animation-delay: -12s;
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
	.fly6 { right: 15%; bottom: 20%; animation-delay: -11s; }
	.fly7 { left: 60%; top: 40%; animation-delay: -2s; }
	
	.water-ripple {
		position: absolute;
		border-radius: 50%;
		border: 4px solid rgba(255, 255, 255, 0.6);
		animation: rippleEffect 8s linear infinite;
		opacity: 0;
		z-index: 4;
	}
	
	.ripple1 {
		left: 25%;
		bottom: 20%;
		animation-delay: -1s;
	}
	
	.ripple2 {
		right: 30%;
		bottom: 30%;
		animation-delay: -5s;
	}
	
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
	
	@keyframes rippleEffect {
		0% { width: 0; height: 0; opacity: 0.7; }
		100% { width: 200px; height: 200px; opacity: 0; }
	}
	
	.page-title {
		font-family: 'FrogFont', sans-serif;
		font-size: 3.5rem;
		text-align: center;
		margin-bottom: 2rem;
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
		animation: float 3s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% { transform: translateY(0); }
		50% { transform: translateY(-10px); }
	}
	
	.main-content {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
		justify-content: center;
	}
	
	.lobby-section {
		flex: 0 1 550px;
	}
	
	.lobby-list-container {
		background: rgba(11, 25, 7, 0.7);
		border-radius: 12px;
		padding: 1.5rem;
		height: 350px;
		overflow-y: auto;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin-bottom: 1.5rem;
	}
	
	.lobby-list-container::-webkit-scrollbar {
		width: 6px;
	}
	
	.lobby-list-container::-webkit-scrollbar-track {
		background: rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}
	
	.lobby-list-container::-webkit-scrollbar-thumb {
		background: rgba(76, 175, 80, 0.5);
		border-radius: 10px;
	}
	
	.lobby-card {
		background: rgba(33, 46, 29, 0.95);
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		margin-bottom: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		animation: slideIn 0.5s forwards;
		opacity: 0;
		transform: translateY(10px);
	}
	
	@keyframes slideIn {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	
	.lobby-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		background: rgba(33, 46, 29, 1);
	}
	
	.team-icon {
		width: 48px;
		height: 48px;
		margin-right: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.team-logo {
		width: 100%;
		height: 100%;
		border-radius: 6px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}
	
	.logo-circle {
		width: 75%;
		height: 75%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.logo-letter {
		color: white;
		font-weight: bold;
		font-size: 1.5rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}
	
	.lobby-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}
	
	.lobby-name {
		font-weight: bold;
		font-size: 1.2rem;
		color: #f4c03f;
	}
	
	.lobby-players {
		color: rgba(255, 255, 255, 0.8);
	}
	
	.join-btn {
		background-color: #f4c03f;
		color: #1a2e12;
		border: none;
		padding: 0.6rem 1.8rem;
		border-radius: 6px;
		cursor: pointer;
		font-weight: bold;
		transition: all 0.2s;
		font-size: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.join-btn:hover {
		background-color: #f7d06a;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	
	.join-btn:active {
		transform: translateY(0);
	}
	
	.create-lobby-section {
		display: flex;
		gap: 1rem;
		background: rgba(33, 46, 29, 0.95);
		padding: 1.5rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
	}
	
	.create-btn {
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
		white-space: nowrap;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}
	
	.create-btn:hover {
		background-color: #f7d06a;
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}
	
	.create-btn:active {
		transform: translateY(0);
	}
	
	.input-wrapper {
		flex: 1;
		position: relative;
	}
	
	.lobby-input {
		width: 100%;
		padding: 0.8rem 1rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.9);
		color: #1a2e12;
		font-size: 1rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
	}
	
	.lobby-input:focus {
		outline: none;
		border-color: #f4c03f;
		box-shadow: 0 0 0 2px rgba(244, 192, 63, 0.3);
	}
	
	.leaderboard-section {
		flex-shrink: 0;
	}
	
	.form-box {
		background: rgba(33, 46, 29, 0.8);
		border-radius: 8px;
		padding: 1rem;
		margin-top: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.button-desc {
		color: #f4c03f;
		font-family: 'FrogFont', sans-serif;
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	}
</style>
