<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { fetchSingleLobby, joinLobby} from '$lib/pb/lobbies';
  import { goto } from '$app/navigation';
  import lobbyBackground from '$lib/images/title4.png';
  import { pb } from '$lib/pb/pocketbase';


	let lobbyId:string | null = null;
	let lobby:any = null;

	lobbyId = page.url.searchParams.get('id');

  onMount(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    if (!pb.authStore.isValid) {
      goto('/login');
    }

    if (lobbyId) {
      try {
        await joinLobby(lobbyId);

        lobby = await fetchSingleLobby(lobbyId);
      } catch (error) {
        console.error("Error joining or fetching lobby:", error);
        goto('/');
      }
    }
  });

</script>



<div class="lobby-container">
  <div class="form-box">
    <h1 style="font-family: 'FrogFont', sans-serif; color:white;">Welcome to the Lobby!</h1>
    {#if lobby}
      <p style="font-family: 'FrogFont', sans-serif; color:white;">Your're In Lobby: {lobby.name}</p>
      <p style="font-family: 'FrogFont', sans-serif; color:white;">Waiting Players: {lobby.players.length} / 10</p>
      {:else}
      <p style="font-family: 'FrogFont', sans-serif; color:white;">Loading...</p>
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
  }
</style>
