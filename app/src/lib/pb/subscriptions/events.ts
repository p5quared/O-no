import type { GameEvents } from "$lib/events/Events";
import type { GameEventTypes } from "$lib/events/EventTypes";
import { TABLES } from "../constants";
import { pb } from "../pocketbase";
import type { EventsGamesResponse } from "../types/pocketbase";


type GameEventHandler = <T extends GameEventTypes>(
	action: string,
	eventType: T,
	data: GameEvents[T]
) => void;

export const subscribeToGameEventsTable = async (f: GameEventHandler) => {
	await pb.collection(TABLES.GAME_EVENTS).subscribe<EventsGamesResponse>("*", (e) => {
		const eventType = e.record.event_type as GameEventTypes;
		const typedData = e.record.data as GameEvents[typeof eventType];
		f(e.action, eventType, typedData);
	})

	return {
		cancel: () => pb.collection(TABLES.GAME_EVENTS).unsubscribe("*")
	}
}
