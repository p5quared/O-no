import type { GameEvents } from "$lib/events/Events";
import type { GameEventTypes } from "$lib/events/EventTypes";
import type { EventsGamesRecord, EventsGamesResponse } from "$lib/pb/types/pocketbase";
import { TABLES } from "$lib/pb/constants";
import { pb } from "$lib/pb/pocketbase";


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

export const createGameEvent = async (eventType: GameEventTypes, data: GameEvents[GameEventTypes]) => {
	await pb.collection(TABLES.GAME_EVENTS).create<EventsGamesRecord>({
		event_type: eventType,
		data
	})
}
