import { getKaplay } from '.';
import { frogGodHeight, GROUND_HEIGHT, WORLD_HEIGHT } from './constants';
import { getLoggedInUserID } from '$lib/pb/users';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WorldFactory } from './factory_world';
import { PlayerFactory } from './factory_player';
import { wsClient } from '$lib/ws/ws';

// TODO: This should probably dynamically generate a random valid spawn
const spawnPosition = () => { return { x: 80, y: WORLD_HEIGHT - GROUND_HEIGHT - 32 } }

const init = async () => {
	const k = getKaplay();

	k.loadSprite('bean', 'https://play.kaplayjs.com/sprites/bean.png');

	WorldFactory.generateWorld(WORLD_HEIGHT, frogGodHeight);

	const localSpawn = spawnPosition();
	const { eventManager } = await PlayerFactory.createLocalPlayer(getLoggedInUserID(), localSpawn.x, localSpawn.y);
	const spawnedPlayers: string[] = [];
	Conduit.on(GameEventTypes.PLAYER_SPAWNED, async (e) => {
		if (e.id === getLoggedInUserID() || spawnedPlayers.includes(e.id)) return;
		console.log("Spawning player", e.id, e.position.x, e.position.y);
		await PlayerFactory.createRemotePlayer(e.id, e.position.x, e.position.y);
		spawnedPlayers.push(e.id);
	})
   await eventManager.emitExistingPositions();

	Conduit.on(GameEventTypes.GAME_OVER, (e) => {
		window.location.href = '/gameover';
	})

	wsClient.subscribeToMessages(m => {
		Conduit.emit(GameEventTypes.PLAYER_MOVED, {
			player_id: m.id,
			position: {
				x: m.x,
				y: m.y
			}
		})
	})

	return () => eventManager.shutdown();
};

export { init };
