export const ssr = false;
import { createUser } from '$lib/pb/users';
import { goto } from '$app/navigation';

let username = '';
let email = '';
let password = '';
let passwordConfirm = '';
let error = '';
let loading = false;
let successMessage = '';

async function handleSubmit() {
	loading = true;
	error = '';

	if (password !== passwordConfirm) {
		error = 'Passwords do not match!';
		loading = false;
		return false;
	}

	const result = await createUser({
		username,
		email,
		password,
		passwordConfirm
	});

	if (result.success) {
		successMessage = 'Account created!';
		setTimeout(() => goto('/login'), 1500);
	} else {
		error = result.error || 'Registration failed';
	}

	loading = false;
	return false;
}
