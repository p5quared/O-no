<script lang="ts">
	import { Conduit } from "$lib/events";
	import { GameEventTypes } from "$lib/events/EventTypes";

	let events = [];
	
	Conduit.on(GameEventTypes.PLAYER_MOVED, e => {
		events = [...events, e];
		console.log("Player moved event:", e);
	});
</script>

<div class="game-log">
	<h2>Game Events</h2>
	{#if events.length > 0}
		<div class="events-container">
			{#each events as event}
				<div class="event">
					{JSON.stringify(event)}
				</div>
			{/each}
		</div>
	{:else}
		<div class="no-events">No events yet</div>
	{/if}
</div>

<style>
	.game-log {
		width: 20%;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 1rem;
		overflow-y: auto;
		border-left: 1px solid rgba(255, 255, 255, 0.2);
	}
	
	h2 {
		text-align: center;
		margin-bottom: 1rem;
		color: #f4c03f;
	}
	
	.events-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.event {
		background-color: rgba(50, 50, 50, 0.5);
		padding: 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		word-break: break-all;
		border-left: 3px solid #f4c03f;
	}
	
	.no-events {
		text-align: center;
		color: #aaa;
		padding: 2rem;
	}
</style>

