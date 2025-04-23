import type { GameID, PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import type { GameEvents } from "$lib/events/Events";
import { GameEventTypes } from "$lib/events/EventTypes";
import { SubscriptionManager } from "$lib/events/Subscriptions";
import { TABLES } from "./constants";
import { subscribeToPositions } from "./game";
import { pb } from "./pocketbase";
import { subscribeToPlayerPositions } from "./subscriptions/players";
import type { PlayerPositionsRecord } from "./types/pocketbase";

/**
 * This class connects our EventBus to the outside world,
 * allowing us to send and receive events.
 */
export class PBEventManager {
	private gameID: GameID;
	private playerID: PlayerID;
	private positionTableID: PlayerPositionsRecord['id'] | undefined;
	private subscriptions = new SubscriptionManager();

	constructor(gameID: GameID, playerID: PlayerID) {
		this.gameID = gameID;
		this.playerID = playerID;

		this.setupOutGoingEvents();
		this.setupIncomingEvents();
	}

	private setupIncomingEvents() {
	  this.subscriptions.add(this.receivePlayerLocations())
	}

	private setupOutGoingEvents() {
		this.subscriptions.add(
			Conduit.on(GameEventTypes.PLAYER_MOVED, this.broadcastLocation)
		)
	}


	private broadcastLocation(e: GameEvents[GameEventTypes.PLAYER_MOVED]) {
		if (this.positionTableID !== undefined && e.id === this.playerID) {
			pb.collection(TABLES.PLAYER_POSITIONS).update(this.positionTableID, e.position)
		}
	}

  private receivePlayerLocations() {
	return subscribeToPlayerPositions(this.gameID, (e) => {
		if (e.user !== this.playerID) {
				Conduit.emit(GameEventTypes.PLAYER_MOVED, {
				id: e.user,
				position: {
				position_x: e.position_x ?? 0, // NOTE: Casting away as these MUST be set
				position_y: e.position_y ?? 0, // i.e. broadcast MUST have these
				velocity_x: e.velocity_x ?? 0,
				velocity_y: e.velocity_y ?? 0
				}
			  })
		}

	  })
  }
}
