import { fail, redirect } from '@sveltejs/kit';
import { createUser } from '$lib/pb/users';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const username = data.get('username')?.toString() || '';
		const email = data.get('email')?.toString() || '';
		const password = data.get('password')?.toString() || '';
		const passwordConfirm = data.get('passwordConfirm')?.toString() || '';

		if (password !== passwordConfirm) {
			return fail(400, {
				error: 'Passwords do not match!',
				username,
				email
			});
		}

		const result = await createUser({
			username,
			email,
			password,
			passwordConfirm
		});

		if (result.success) {
			throw redirect(303, '/login');
		} else {
			return fail(400, {
				error: result.error,
				username,
				email
			});
		}
	}
};
