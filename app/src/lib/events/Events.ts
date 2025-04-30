import type { PlayerID } from "$lib/constants";
import type { POWERUP_TYPES } from "$lib/kaplay/powerups";

// NOTE: In reality these are all non-null
export type PlayerPosition = {x: number, y: number};

interface HealthState {
	current: number;
	max: number;
}

export interface GameEvents {
	// Initialization
	player_joined: {
		id: string;
		username: string;
		position: PlayerPosition;
	};
	player_left: {
		id: string;
	};

	// Player actions
	player_moved: {
		player_id: PlayerID; // player id
		position: PlayerPosition;
	};
	player_damaged: {
		id: PlayerID;
		damage: number;
		source: string;
		health: HealthState;
	};
	player_died: {
		id: PlayerID;
		killerId?: string;
	};
	player_spawned: {
		id: PlayerID;
		position: PlayerPosition;
	};

	// Powerups
	powerup_collected: {
		emit_by: string;
		type: POWERUP_TYPES;
	};

	powerup_used: {
		emit_by: string
		type: POWERUP_TYPES;
		target?: string[]
	};

	// Game/lobby state?
	// These should probably be redefined somehow
	game_state_changed: {
		// maybe don't need
		oldState: string;
		newState: string;
		timestamp: number;
	};
	game_started: {
		gameId: string;
		level: string;
		players: Array<{ id: string; username: string }>;
		timestamp: number;
	};
	game_ended: {
		emit_by: string;
	};

	chat_message: {
		playerId: string;
		username: string;
		message: string;
		timestamp: number;
	};
}

