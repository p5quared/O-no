<script lang="ts">
	import { Conduit } from "$lib/events";
	import { GameEventTypes } from "$lib/events/EventTypes";

	const events = []
Conduit.on(GameEventTypes.PLAYER_MOVED, e => events.push(e));
</script>

{#if events.length > 0}
	<div class="flex-2/5">
		{#each events as event}
			<div class="event">
				{JSON.stringify(event)}
			</div>
		{/each}
	</div>
{/if}

