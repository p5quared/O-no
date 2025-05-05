import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { pb } from '$lib/pb/pocketbase';

export const load: PageLoad = async () => {
	// Check if user is authenticated
	if (!pb.authStore.isValid) {
		throw redirect(303, '/login');
	}

	return {};
};
