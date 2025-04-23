<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	import { goto } from '$app/navigation';
	import homepageBackground from '$lib/images/title1.png';

	if (!pb.authStore.isValid) {
		//goto('/login'); //temporarily disabling this for now so that I can work on the page as a whole
	}
	

	import { onMount } from 'svelte';
    import { fetchLobbies, createLobby, subscribeToLobbies } from '$lib/pb/lobbies';
	let lobbies = [];

	async function handleCreateLobby() {
        const name = prompt("Enter lobby name:");
        if (name) {
            try {
                await createLobby(name);
                lobbies = await fetchLobbies();
            } catch (error) {
                console.error("Error creating lobby:", error);
            }
        }
    }
	onMount(async () => {
        try {
            lobbies = await fetchLobbies();
            subscribeToLobbies((e) => {
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
            console.error("Error fetching lobbies:", error);
        }
    });


</script>



<svelte:head>
	<title>Home</title>
</svelte:head>

<section class="lobby-page" style="background-image: url({homepageBackground});">
	<div class="mx-auto max-w-md p-4 form-box">


    
        <h1>
            Join a Lobby! 
            <button class="create-btn" on:click={handleCreateLobby}>New Lobby</button>
        </h1>

        <div class="lobby-list">
            {#each lobbies as lobby}
                <div class="lobby-card">
                    <p style="font-weight: bold;">{lobby.name}</p>



                    <button class="join-btn">Join</button>
                </div>
            {/each}
        </div>
	
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
		background: rgba(128, 116, 41, .8);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
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
		background: rgba(55, 32, 4, .95);
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
	}
	.join-btn {
		background-color: #de7a04;
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
