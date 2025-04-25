<script lang="ts">
    import { onMount } from 'svelte';
    import { pb } from '$lib/pb/pocketbase';

    interface User {
        name: string;
        score: number;
        avatar?: string;
        id?: string;
        collectionId?: string;
    }

    let users: User[] = [];

    async function loadUsers() {
        const records = await pb.collection('users').getFullList();
        console.log(records);
        users = records.map(user => ({
            name: user.name,
            score: user.score,
            avatar: user.avatar,
            id: user.id,
            collectionId: user.collectionId
        }));
    }

    onMount(loadUsers);

    $: sortedUsers = users.sort((a, b) => b.score - a.score);

    // Generate avatar for users without profile pics
    function getAvatarUrl(user: User): string {
        if (user.avatar && user.id && user.collectionId) {
            return `${pb.baseUrl}/api/files/${user.collectionId}/${user.id}/${user.avatar}`;
        }
        return `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}&backgroundColor=4CAF50,8BC34A,CDDC39`;
    }
</script>

<div class="board">
    <div class="header">
        <div class="frog-icon">🐸</div>
        <h3>Leaderboard</h3>
        <div class="frog-icon">🐸</div>
    </div>
    
    <div class="player-list">
        {#each sortedUsers as user, i}
            <div class="player" style="animation-delay: {i * 0.1}s;">
                <div class="rank">
                    {i + 1}
                </div>
                <div class="user-info">
                    <div class="avatar" style="background-image: url('{getAvatarUrl(user)}')"></div>
                    <span class="name">{user.name}</span>
                </div>
                <div class="score-box">
                    <span class="score">{user.score}</span>
                </div>
            </div>
        {/each}
    </div>
    
    <div class="footer">
        <div class="lily-pad"></div>
        <div class="lily-pad"></div>
        <div class="lily-pad"></div>
    </div>
</div>

<style>
    .board {
        background: rgba(33, 46, 29, .95);
        padding: 1.5rem;
        border-radius: 12px;
        width: 400px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
    }
    
    .board::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 80px;
        background: linear-gradient(90deg, rgba(244, 192, 63, 0.15) 0%, rgba(76, 175, 80, 0.1) 100%);
        z-index: 0;
        border-radius: 12px 12px 0 0;
    }
    
    .header {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        z-index: 1;
    }
    
    .frog-icon {
        font-size: 1.5rem;
        margin: 0 0.8rem;
        animation: bounce 2s infinite alternate;
    }
    
    @keyframes bounce {
        0% { transform: translateY(0); }
        100% { transform: translateY(-5px); }
    }
    
    h3 {
        color: #fff;
        text-align: center;
        margin: 0;
        font-family: 'FrogFont', sans-serif;
        font-size: 1.8rem;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .player-list {
        position: relative;
        z-index: 1;
        max-height: 300px;
        overflow-y: auto;
        margin: 0 -0.5rem;
        padding: 0 0.5rem;
    }
    
    .player {
        display: grid;
        grid-template-columns: 40px 1fr 70px;
        gap: 0.8rem;
        padding: 0.8rem;
        color: #fff;
        background: rgba(255, 255, 255, 0.07);
        margin-bottom: 0.8rem;
        border-radius: 8px;
        align-items: center;
        border: 1px solid rgba(255, 255, 255, 0.05);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: all 0.2s ease;
        animation: slideIn 0.5s forwards;
        opacity: 0;
        transform: translateY(10px);
    }
    
    @keyframes slideIn {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .player:hover {
        background: rgba(255, 255, 255, 0.12);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
    
    .rank {
        width: 32px;
        height: 32px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #f4c03f;
        font-weight: bold;
        font-size: 1rem;
        background-color: rgba(76, 175, 80, 0.2);
        border-radius: 50%;
        position: relative;
        overflow: hidden;
    }
    
    .user-info {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        overflow: hidden;
    }
    
    .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
        border: 2px solid rgba(244, 192, 63, 0.5);
        flex-shrink: 0;
    }
    
    .name {
        font-weight: 500;
        color: white;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    
    .score-box {
        background: rgba(76, 175, 80, 0.2);
        padding: 0.4rem 0.8rem;
        border-radius: 25px;
        text-align: center;
    }
    
    .score {
        color: #f4c03f;
        font-weight: bold;
        font-size: 1.1rem;
    }
    
    .footer {
        display: flex;
        justify-content: space-between;
        margin-top: 1.5rem;
    }
    
    .lily-pad {
        width: 25px;
        height: 25px;
        background-color: rgba(76, 175, 80, 0.3);
        border-radius: 50%;
        position: relative;
    }
    
    .lily-pad::before {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 15px;
        height: 15px;
        background-color: rgba(76, 175, 80, 0.5);
        border-radius: 50%;
    }
    
    /* Custom scrollbar */
    .player-list::-webkit-scrollbar {
        width: 6px;
    }
    
    .player-list::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
    }
    
    .player-list::-webkit-scrollbar-thumb {
        background: rgba(76, 175, 80, 0.5);
        border-radius: 10px;
    }
</style> 
