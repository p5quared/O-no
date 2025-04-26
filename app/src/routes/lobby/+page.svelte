<script lang="ts">
  import { pb } from '$lib/pb/pocketbase';
	import { page } from '$app/state';
	import { onMount, onDestroy  } from 'svelte';
	import { fetchSingleLobby, joinLobby, leaveLobby, subscribeToLobby } from '$lib/pb/lobbies';
  import { goto } from '$app/navigation';
  import lobbyBackground from '$lib/images/title4.png';


	let lobbyId:string | null = null;
	let lobby:any = null;

	lobbyId = page.url.searchParams.get('id');

 
  onMount(() => {
    let unsubscribe: (() => void) | null = null;
    if (lobbyId) {
      (async () => {
        try {
          await joinLobby(lobbyId);
          lobby = await fetchSingleLobby(lobbyId);
          //console.log('Lobby data:', lobby);
          unsubscribe = await subscribeToLobby(lobbyId, (updatedLobby: any) => {
            lobby = updatedLobby;
            //console.log('updated data',updatedLobby)
            if(updatedLobby.gameStarted===true){
              const username = pb.authStore.record?.username ?? 'anonymous';
              const myUrl = `/about?name=${encodeURIComponent(username)}&lobby=${encodeURIComponent(lobbyId)}`;
              goto(myUrl);
            }



          });
          
        } catch (error) {
          console.error("Error joining or fetching lobby:", error);
          goto('/');
        }
      })();

      const handleUnload = () => {
        leaveLobby(lobbyId);
      };
      window.addEventListener('beforeunload', handleUnload);
      return () => {
        window.removeEventListener('beforeunload', handleUnload);
        if (unsubscribe) unsubscribe();
      };
    }
  });


  onDestroy(async () => {
    if (lobbyId) {
      await leaveLobby(lobbyId);
    }
  });

  async function startGame() {
    if (!lobbyId) return;
    try {
      await pb.collection('lobbies').update(lobbyId, {gameStarted: true});
      setTimeout(async () => {
        try {
          await pb.collection('lobbies').delete(lobbyId);
          //console.log("Lobby deleted successfully");
        } catch (deleteErr) {
          console.error("Error deleting lobby:", deleteErr);
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  }







</script>



<div class="lobby-container">
  <div class="form-box">
    <h1 style="font-family: 'FrogFont', sans-serif; color:white;">Welcome to the Lobby!</h1>
    {#if lobby}
      <p style="font-family: 'FrogFont', sans-serif; color:white;">Your're In Lobby: {lobby.name}</p>
      <p style="font-family: 'FrogFont', sans-serif; color:white;">Waiting Players: {lobby.players.length} / 10</p>
      {#if lobby.expand?.host?.id === pb.authStore.record?.id}
        <button class="start-game-btn" style="font-family: 'FrogFont', sans-serif;" on:click={startGame}>Start Game!</button>
      {/if}

      <!--{#if lobby.players}
        <h2 style="font-family: 'FrogFont', sans-serif; color:white;">Players in Lobby:</h2>
        <ul>
          {#each lobby.expand.players as player}
            <li style="font-family: 'FrogFont', sans-serif; color:white;">{player.username}</li>
          {/each}
        </ul>
      {:else}
        <p style="font-family: 'FrogFont', sans-serif; color:white;">No other players in the lobby yet.</p>
      {/if} -->
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
  .start-game-btn {
		background-color: #fbd38c;
		color: black;
		padding: 0.75rem 1.25rem;
		font-size: 1rem;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		margin-bottom: 10px;
	}
</style>