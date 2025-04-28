/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Chat = "chat",
	EventsGames = "events_games",
	Lobbies = "lobbies",
	PlayerPositions = "player_positions",
	Positions = "positions",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type ChatRecord = {
	content?: string
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export type EventsGamesRecord<Tdata = unknown> = {
	created?: IsoDateString
	data?: null | Tdata
	event_type: string
	id: string
	updated?: IsoDateString
}

export type LobbiesRecord = {
	created?: IsoDateString
	host?: RecordIdString
	id: string
	name: string
	players?: RecordIdString[]
	updated?: IsoDateString
}

export type PlayerPositionsRecord = {
	created?: IsoDateString
	id: string
	updated?: IsoDateString
	x?: number
	y?: number
}

export type PositionsRecord = {
	created?: IsoDateString
	entity_name: string
	id: string
	pos_x?: number
	pos_y?: number
	updated?: IsoDateString
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	score?: number
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ChatResponse<Texpand = unknown> = Required<ChatRecord> & BaseSystemFields<Texpand>
export type EventsGamesResponse<Tdata = unknown, Texpand = unknown> = Required<EventsGamesRecord<Tdata>> & BaseSystemFields<Texpand>
export type LobbiesResponse<Texpand = unknown> = Required<LobbiesRecord> & BaseSystemFields<Texpand>
export type PlayerPositionsResponse<Texpand = unknown> = Required<PlayerPositionsRecord> & BaseSystemFields<Texpand>
export type PositionsResponse<Texpand = unknown> = Required<PositionsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	chat: ChatRecord
	events_games: EventsGamesRecord
	lobbies: LobbiesRecord
	player_positions: PlayerPositionsRecord
	positions: PositionsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	chat: ChatResponse
	events_games: EventsGamesResponse
	lobbies: LobbiesResponse
	player_positions: PlayerPositionsResponse
	positions: PositionsResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'chat'): RecordService<ChatResponse>
	collection(idOrName: 'events_games'): RecordService<EventsGamesResponse>
	collection(idOrName: 'lobbies'): RecordService<LobbiesResponse>
	collection(idOrName: 'player_positions'): RecordService<PlayerPositionsResponse>
	collection(idOrName: 'positions'): RecordService<PositionsResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
