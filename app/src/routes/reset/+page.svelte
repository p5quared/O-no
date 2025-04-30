<script lang="ts">
	import { goto } from '$app/navigation';
	import { TABLES } from '$lib/pb/constants';
	import { pb } from '$lib/pb/pocketbase';
	import type { LobbiesRecord } from '$lib/pb/types/pocketbase';
	import { onMount } from 'svelte';

	async function resetGame() {
		for (const table of [TABLES.PLAYER_POSITIONS, TABLES.GAME_EVENTS, TABLES.LOBBIES]) {
			try {
				const records = await pb.collection(table).getFullList();
				if (records.length === 0) {
					console.log(`No records found in ${table}`);
					continue;
				}
				const batches = Math.ceil(records.length / 1000);
				for (let i = 0; i < batches; i++) {
					const batch = records.slice(i * 1000, (i + 1) * 1000);
					await Promise.all(
						batch.map(async (record) => await pb.collection(table).delete(record.id))
					)
						.then(() => {
							console.log(`Deleted ${batch.length} records from ${table}`);
						})
						.catch((error) => {
							console.error(`Error deleting records from ${table}:`, error);
						});
				}
			} catch (error) {
				console.error(`Error deleting from ${table}:`, error);
			}
		}
		console.log('Game reset!');

		await pb.collection(TABLES.LOBBIES).create<LobbiesRecord>({
			host: pb.authStore.model?.id,
			name: 'Demo',
			is_started: false
		});

		goto('/demo');
	}

	onMount(resetGame);
</script>
