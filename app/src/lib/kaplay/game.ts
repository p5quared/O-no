import { getKaplay } from '.';
import { frogGodHeight, GROUND_HEIGHT, WORLD_HEIGHT } from './constants';
import { getLoggedInUserID } from '$lib/pb/users';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WorldFactory } from './factory_world';
import { PlayerFactory } from './factory_player';
import { goto } from '$app/navigation';

// TODO: This should probably dynamically generate a random valid spawn
const spawnPosition = () => { return {x: 80, y: WORLD_HEIGHT - GROUND_HEIGHT - 32} }

const init = async (name: string) => {
	const k = getKaplay();

	k.loadSprite('bean', 'https://play.kaplayjs.com/sprites/bean.png');

	WorldFactory.generateWorld(WORLD_HEIGHT, frogGodHeight);

	const localSpawn = spawnPosition();
	const { eventManager } = await PlayerFactory.createLocalPlayer(getLoggedInUserID(), localSpawn.x, localSpawn.y);
	const spawnedPlayers: string[] = [];
	Conduit.on(GameEventTypes.PLAYER_SPAWNED, async (e) => {
		if (e.id === getLoggedInUserID() || spawnedPlayers.includes(e.id)) return;
		await PlayerFactory.createRemotePlayer(e.id, e.position.x, e.position.y);
		spawnedPlayers.push(e.id);
	})

	Conduit.on(GameEventTypes.GAME_OVER, (e) => {
		goto('/gameover');
	})

	return () => eventManager.shutdown();
};

export { init };
