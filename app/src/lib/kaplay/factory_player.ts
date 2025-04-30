import type { PlayerID } from "$lib/constants";
import { PBEventManager } from "$lib/pb/event_manager";
import { createOrRecreateUserPositionRecord } from "$lib/pb/game/subscriptions/users";
import { getUserProfile, getUserSprite } from "$lib/pb/profiles";
import { getKaplay } from ".";
import { PlayerBuilder, type KaplayPlayerType } from "./builders";

export class PlayerFactory {
	static async createLocalPlayer(playerID: PlayerID, x: number, y: number): Promise<{
		entity: KaplayPlayerType;
		positionTableID: string;
		eventManager: PBEventManager;
	}> {
	  console.log("Spawned local player", playerID, x, y);
		const positionTableID = await createOrRecreateUserPositionRecord(playerID, x, y);
		const eventManager = new PBEventManager(playerID, positionTableID);
		await eventManager.setup();


		const k = getKaplay();
		const entity = await new PlayerBuilder()
			.withSprite(k.sprite(await getUserSprite(playerID)))
			.atPosition(x, y)
			.asLocalPlayer(playerID)
			.build();

		return { entity, positionTableID, eventManager };
	}

	static async createRemotePlayer(playerID: PlayerID, x: number, y: number): Promise<{
		entity: KaplayPlayerType;
	}> {
		console.log('Creating remote player', playerID, x, y);
		const k = getKaplay();
		const entity = await new PlayerBuilder()
			.withSprite(k.sprite(await getUserSprite(playerID)))
			.atPosition(x, y)
			.withID(playerID)
			.build();

		console.log("Spawned remote player", playerID, x, y);

		return { entity };
	}
}

