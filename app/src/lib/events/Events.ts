import type { PlayerID } from "$lib/constants";

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
	powerup_spawned: {
		id: string;
		type: string;
		position: { x: number; y: number };
	};
	powerup_collected: {
		id: string;
		type: string;
		playerId: string;
	};
	powerup_expired: {
		id: string;
		player_id: string;
		type: string;
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
		gameId: string;
		winner?: { id: string; username: string; score: number };
		reason: 'timeout' | 'victory' | 'admin_ended';
		timestamp: number;
	};

	chat_message: {
		playerId: string;
		username: string;
		message: string;
		timestamp: number;
	};
}

