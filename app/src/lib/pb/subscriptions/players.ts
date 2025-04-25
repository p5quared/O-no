import { TABLES } from "../constants";
import { pb } from "../pocketbase";
import type { PlayerPositionsRecord, PlayerPositionsResponse } from "../types/pocketbase";

export type PbTableEvent = "create" | "update" | "delete";
type PositionHandler = (action: PbTableEvent ,pr: PlayerPositionsRecord) => void;

export const subscribetoPlayerPositionTable = async (f: PositionHandler) => {
	await pb.collection(TABLES.PLAYER_POSITIONS).subscribe<PlayerPositionsResponse>("*", (e) => {
		f(e.action as PbTableEvent, e.record);
	})
	return {
		cancel: () => pb.collection(TABLES.PLAYER_POSITIONS).unsubscribe("*")
	}
}

