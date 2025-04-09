<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase'; 

	

	let username = '';
    let email='';
	let password = '';
    let passwordConfirm= '';
	let errorMessage = '';
	let successMessage = '';

	async function register() {
		errorMessage = '';
		successMessage = '';
        
        if (password != passwordConfirm){
            errorMessage = "Passwords do not match!";
            console.error('Passwords Dont Match for User!');
			return;
        }

		try {
            //I added new fields to the "users" colleciton
			await pb.collection('users').create({
				username,
                email,
				password,
				passwordConfirm,
                authToken: ''
			});
			successMessage = 'Account created!';
            //Im assuming the login route will be /login, but CHANGE THIS if not
			setTimeout(() => goto('/login'), 1500);
            
		} catch (error: any) {
            
            console.error('Something Went Wrong, Account Not Created', error);

            if(error?.response?.data){
                let errors=error.response.data
                if(errors?.username){errorMessage=errorMessage+"Username: "+errors.username.message +" "}
                if(errors?.password){errorMessage=errorMessage+  "Password: "+errors.password.message +" "}
                if(errors?.email){errorMessage=errorMessage+  "Email: "+ errors.email.message +" "}
            }
            else{
                errorMessage="Something Went Wrong, No Account Created!"
            }
		}
	}



</script>







<svelte:head>
	<title>Registration</title>
</svelte:head>



<div class="max-w-md mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Registration</h1>

	<form on:submit|preventDefault={register} class="flex flex-col gap-4">
		<input
			type="text"
            bind:value={username}
			placeholder="Username"
			required
            autocomplete="off"
			class="flex-1 p-3 border border-gray-300 rounded"
		/>
        <input
			type="email"
            bind:value={email}
			placeholder="Email"
			required
            autocomplete="off"
			class="p-3 border border-gray-300 rounded"
		/>
		<input
			type="password"
            bind:value={password}
			placeholder="Password"
			required
            autocomplete="off"
			class="p-3 border border-gray-300 rounded"
		/>
        <input
            type="password"
            bind:value={passwordConfirm}
            placeholder="Confirm Password"
            required
            autocomplete="off"
            class="p-3 border border-gray-300 rounded"
        />
        <button type="submit" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded" style= "cursor:pointer">Register</button>


		{#if errorMessage}
			<p class="text-red-600">{errorMessage}</p>
		{/if}
		{#if successMessage}
			<p class="text-green-600">{successMessage}</p>
		{/if}


	</form>
</div>
