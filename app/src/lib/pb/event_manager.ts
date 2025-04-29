import type { PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import type { GameEvents, PlayerPosition } from "$lib/events/Events";
import { GameEventTypes } from "$lib/events/EventTypes";
import { SubscriptionManager } from "$lib/events/Subscriptions";
import { throttle } from "$lib/utils";
import { createGameEvent, subscribeToGameEventsTable } from "./game/subscriptions/events";
import { subscribetoPlayerPositionTable } from "./game/subscriptions/players";
import { deleteUserPositionRecordByUserId, listUserPositions, updateUserPositionRecord } from "./game/subscriptions/users";
import type { PlayerPositionsRecord } from "./types/pocketbase";

/**
 * This class connects our EventBus to the outside world,
 * allowing us to send and receive events over the network.
 */
export class PBEventManager {
	public playerID: PlayerID;
	private positionTableID: PlayerPositionsRecord['id'];
	private subscriptions = new SubscriptionManager();

	constructor(playerID: PlayerID, positionTableID: string) {
		this.playerID = playerID;
		this.positionTableID = positionTableID;
	}

	public async setup() {
		this.setupOutGoingEventSubscriptions();
		await this.setupIncomingEventSubscriptions();

	}

	public async shutdown() {
		this.subscriptions.cancelAll();
		await deleteUserPositionRecordByUserId(this.positionTableID);
		console.log("Cleaned up PB EventManager");
	}

	private async setupIncomingEventSubscriptions() {
		this.subscriptions.add(await this.subToPlayerPositionsTable())
		this.subscriptions.add(await this.subToGameEventsTable())
	}

	private setupOutGoingEventSubscriptions() {
		this.subscriptions.add(
			Conduit.on(GameEventTypes.PLAYER_MOVED, e => this.broadcastMovement(e))
		)
		this.subscriptions.add(
			Conduit.on(GameEventTypes.GAME_OVER, e => this.broadcastEvent(GameEventTypes.GAME_OVER, e))
		)
	}

	private async broadcastEvent<T extends GameEventTypes>(t: T, e: GameEvents[T]) {
		await createGameEvent(t, e);
	}

	private async broadcastMovement(e: GameEvents[GameEventTypes.PLAYER_MOVED]) {
		if (e.player_id === this.playerID) {
			this.throttledUpdatePositoin(this.positionTableID, e.position);
		}
	}

	private throttledUpdatePositoin = throttle(async (id: string, p: PlayerPosition) => {
		await updateUserPositionRecord(id, p)
	}, 50);

	private async subToGameEventsTable() {
		console.log("Subscribing to game events");
		return await subscribeToGameEventsTable((_, eventType, data) => {
			switch (eventType) {
				case GameEventTypes.GAME_OVER:
					let data_typed = data as GameEvents[GameEventTypes.GAME_OVER];
					if (data_typed.emit_by === this.playerID) return;
					Conduit.emit(GameEventTypes.GAME_OVER, data_typed);
			}
		})
	}

	private async subToPlayerPositionsTable() {
		console.log("Subscribing to player locations");
		return await subscribetoPlayerPositionTable((action, record) => {
			switch (action) {
				case 'create':
					Conduit.emit(GameEventTypes.PLAYER_SPAWNED, {
						id: record.user,
						position: {
							'x': record.x ?? -1, // WARN: Casting away undefined as these MUST exist, however pocketbase defaults to nullable number values
							'y': record.y ?? -1, // i.e. broadcast MUST set these
						}

					})
					break;
				case "update":
					// Removed in favor of ws system
					//Conduit.emit(GameEventTypes.PLAYER_MOVED, {
					//	player_id: record.user,
					//	position: {
					//		'x': record.x ?? -1, // WARN: Casting away undefined as these MUST exist, however pocketbase defaults to nullable number values
					//		'y': record.y ?? -1, // i.e. broadcast MUST set these
					//	}
					//})
					break;
				case "delete":
					Conduit.emit(GameEventTypes.PLAYER_QUIT, {
						id: record.id,
					})
					break;
			}
		})
	}

	// Emit the positions of all players already in the game
	// This is done at startup to ensure that we load all players
	// This could cause some double spawns?
	public async emitExistingPositions() {
		const existingPositions = await listUserPositions();
		for (const positionRecord of existingPositions) {
			Conduit.emit(GameEventTypes.PLAYER_SPAWNED, {
				id: positionRecord.user,
				position: {
					'x': positionRecord.x ?? -1, // WARN: Casting away undefined as these MUST exist, however pocketbase defaults to nullable number values
					'y': positionRecord.y ?? -1, // i.e. broadcast MUST set these
				}

			})
		}
	}
}
