<script lang="ts">
	import { pb } from '$lib/pb/pocketbase';
	const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pb.authStore.model?.name || 'guest'}`;
	let fileInput: HTMLInputElement;

	async function handleImageChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const formData = new FormData();
		formData.append('avatar', file);
		await pb.collection('users').update(pb.authStore.model?.id, formData);
		window.location.reload();
	}
</script>

<div class="relative cursor-pointer" on:click={() => fileInput?.click()}>
	<img
		src={pb.authStore.model?.avatar
			? `${pb.baseUrl}/api/files/${pb.authStore.model.collectionId}/${pb.authStore.model.id}/${pb.authStore.model.avatar}`
			: defaultAvatar}
		alt="Profile"
		class="h-10 w-10 rounded-full border-2 border-white object-cover hover:opacity-80"
	/>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		on:change={handleImageChange}
	/>
</div>
