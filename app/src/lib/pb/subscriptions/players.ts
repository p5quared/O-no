import type { GameID } from "$lib/constants";
import type { EventSubscriptionInstance } from "$lib/events/Subscriptions";
import { TABLES } from "../constants";
import { pb } from "../pocketbase";
import type { PlayerPositionsRecord, PlayerPositionsResponse } from "../types/pocketbase";

type PositionHandler = (pr: PlayerPositionsRecord) => void;
export const subscribeToPlayerPositions = (id: GameID, f: PositionHandler): EventSubscriptionInstance => {
  // TODO: Filter by game id when we add lobby support
  pb.collection(TABLES.PLAYER_POSITIONS).subscribe<PlayerPositionsResponse>('update', (e) => {
	f(e.record);
  })

  return {
	cancel: () => pb.collection(TABLES.PLAYER_POSITIONS).unsubscribe('update')
  }
}
