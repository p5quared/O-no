<script lang="ts">
    import { onMount } from 'svelte';
    import { pb } from '$lib/pb/pocketbase';

    interface User {
        username: string;
        score: number;
    }

    let users: User[] = [];

    async function loadUsers() {
        const records = await pb.collection('users').getFullList();
        console.log(records);
        users = records.map(user => ({
        username: user.username,  // use email as username
            score: user.score
        }));
    }

    onMount(loadUsers);

    $: sortedUsers = users.sort((a, b) => b.score - a.score);
</script>

<div class="board">
    <h3>Leaderboard</h3>
    {#each sortedUsers as {username, score}, i}
        <div class="player">
            <span>{i + 1}.</span>
            <span>{username}</span>
            <span>{score}</span>
        </div>
    {/each}
</div>

<style>
    .board {
        background: #2c2c2c;
        padding: 1rem;
        border-radius: 8px;
        width: 250px;
    }
    h3 {
        color: #fff;
        text-align: center;
        margin: 0 0 1rem 0;
    }
    .player {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
        padding: 0.5rem;
        color: #fff;
    }
    .player:hover {
        background: #3c3c3c;
        border-radius: 4px;
    }
</style> 
