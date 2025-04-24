import { TABLES } from "../constants";
import { pb } from "../pocketbase";
import type { PlayerPositionsRecord, PlayerPositionsResponse } from "../types/pocketbase";

type PocketbaseEvent = "create" | "update" | "delete";
type PositionHandler = (pr: PlayerPositionsRecord) => void;

const subscribetoPlayerPositions = (e_T: PocketbaseEvent) => async (f: PositionHandler) => {
	await pb.collection(TABLES.PLAYER_POSITIONS).subscribe<PlayerPositionsResponse>(e_T, (e) => {
		f(e.record);
	})
	return {
		cancel: () => pb.collection(TABLES.PLAYER_POSITIONS).unsubscribe(e_T)
	}
}

export const subscribeToPlayerPositionUpdates = subscribetoPlayerPositions("update");
export const subscribeToPlayerPositionCreates = subscribetoPlayerPositions("create");
export const subscribeToPlayerPositionDeletes = subscribetoPlayerPositions("delete");
