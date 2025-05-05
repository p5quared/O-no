import { getKaplay, KAPLAY_SPRITES } from '.';
import { frogGodHeight, GROUND_HEIGHT, WORLD_HEIGHT } from './constants';
import { getLoggedInUserID } from '$lib/pb/users';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WorldFactory } from './factory_world';
import { PlayerFactory } from './factory_player';
import { LeaderboardFactory } from './LeaderboardFactory';
import { wsClient } from '$lib/ws/ws';
import { pb } from '$lib/pb/pocketbase';

// TODO: This should probably dynamically generate a random valid spawn
const spawnPosition = () => {
	return { x: 80, y: WORLD_HEIGHT - GROUND_HEIGHT - 32 };
};

export let latestLeaderboard: { name: string; y: number }[] = [];

const playerHeights: Record<string, number> = {};
const playerNames: Record<string, string> = {};

async function loadUserName(id: string) {
	try {
		const user = await pb.collection('users').getOne(id);
		playerNames[id] = user.name;
	} catch (err) {
		console.warn('Failed to load user name for', id, err);
		playerNames[id] = '???';
	}
}

//import PocketBase from 'pocketbase'; (whoops I, Arianna, added this but it may be uncessesary!!!)

//const pb = new PocketBase('http://127.0.0.1:8090'); (NOPE)

const init = async () => {
	const k = getKaplay();

	WorldFactory.generateWorld(WORLD_HEIGHT, frogGodHeight);

	//iterates over list of names of the sprites
	KAPLAY_SPRITES.forEach((sprite) => {
		k.loadSprite(sprite, `https://play.kaplayjs.com/${sprite}.png`);
	});
	//maybe load custom sprites here???? (NOPE)
	const custom_sprites = await pb.collection('custom_sprites').getFullList(); //get list of all custom sprites 

	custom_sprites.forEach((customSprite) => {
		let nameSprite= customSprite.sprite_name
		let myImage= customSprite.sprite_image
		let myUrl= pb.files.getURL(customSprite, myImage, {thumb: '50x50'})
		k.loadSprite(nameSprite, myUrl);
	});




	const localSpawn = spawnPosition();
	const { eventManager } = await PlayerFactory.createLocalPlayer(
		getLoggedInUserID(),
		localSpawn.x,
		localSpawn.y
	);
	await loadUserName(getLoggedInUserID());
	const spawnedPlayers: string[] = [];
	Conduit.on(GameEventTypes.PLAYER_SPAWNED, async (e) => {
		if (e.id === getLoggedInUserID() || spawnedPlayers.includes(e.id)) return;
		console.log('Spawning player', e.id, e.position.x, e.position.y);
		await loadUserName(e.id);
		await PlayerFactory.createRemotePlayer(e.id, e.position.x, e.position.y);
		spawnedPlayers.push(e.id);
	});
	await eventManager.emitExistingPositions();

	Conduit.on(GameEventTypes.GAME_OVER, (e) => {
		window.location.href = '/gameover';
	});

	wsClient.subscribeToMessages((m) => {
		playerHeights[m.id] = m.y;
		Conduit.emit(GameEventTypes.PLAYER_MOVED, {
			player_id: m.id,
			position: {
				x: m.x,
				y: m.y
			}
		});
	});

	setInterval(() => {
		const leaderboard = Object.entries(playerHeights)
			.map(([id, y]) => ({
				name: playerNames[id] ?? '???',
				y
			}))
			.sort((a, b) => a.y - b.y) // ascending: lower Y is higher up
			.slice(0, 10);

		latestLeaderboard = leaderboard;
		Conduit.emit(GameEventTypes.LEADERBOARD_UPDATE, leaderboard);
	}, 5000);

	Conduit.on(GameEventTypes.LEADERBOARD_UPDATE, (leaderboard) => {
		LeaderboardFactory.renderLeaderboard(leaderboard);
	});

	return () => eventManager.shutdown();
};

export { init };
