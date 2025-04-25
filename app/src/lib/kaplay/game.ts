import { getKaplay } from '.';
import { frogGodHeight, WORLD_HEIGHT } from './constants';
import { getLoggedInUserID } from '$lib/pb/users';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WorldFactory } from './factory_world';
import { PlayerFactory } from './factory_player';

const init = async (name: string) => {
	const k = getKaplay();

	k.loadSprite('bean', 'https://play.kaplayjs.com/sprites/bean.png');

	WorldFactory.generateWorld(WORLD_HEIGHT, frogGodHeight);

	const { eventManager } = await PlayerFactory.createLocalPlayer(getLoggedInUserID(), 0, 0)
	const spawnedPlayers: string[] = [];
	Conduit.on(GameEventTypes.PLAYER_SPAWNED, async (e) => {
		if (e.id === getLoggedInUserID() || spawnedPlayers.includes(e.id)) return;
		await PlayerFactory.createRemotePlayer(e.id, e.position.x, e.position.y);
		spawnedPlayers.push(e.id);
	})


  return () => eventManager.shutdown();
};

export { init };
