import type { PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import { GameEventTypes } from "$lib/events/EventTypes";
import type { AreaComp, BodyComp, GameObj, PosComp, SpriteComp } from "kaplay";
import { getLoggedInUserID, createOrRecreateUserPositionRecord } from "$lib/pb/users";
import { PBEventManager } from "$lib/pb/events";
import { getKaplay } from ".";

class EntityBuilder {
	protected sprite: SpriteComp | null = null;
	protected posX: number = 0;
	protected posY: number = 0;

	public withSprite(sprite: SpriteComp): this {
		this.sprite = sprite;
		return this
	}

	public atPosition(x: number, y: number): this {
		this.posX = x;
		this.posY = y;
		return this
	}
}

type KaplayPlayerType = GameObj<SpriteComp | PosComp | AreaComp | BodyComp | null>
export class PlayerBuilder extends EntityBuilder {
	private isLocalPlayer: boolean = false;
	private PLAYER_SPEED = 200;
	private playerID: PlayerID = '';

	public asLocalPlayer(playerID: PlayerID): this {
		this.isLocalPlayer = true;
		this.playerID = playerID;
		return this
	}

	public async build() {
		if (!this.playerID) {
			throw new Error("Player ID is required to build a player");
		}

		const k = getKaplay();
		let p = k.add([
			this.sprite,
			k.pos(this.posX, this.posY),
			k.area(),
			k.body(),
		])

		p = this.setupEventHooks(p)

		if (this.isLocalPlayer) {
			this.attachMovementBindings(p);
			this.setupEventBroadcast(p);
		}


		return p
	}

	public withID(id: PlayerID): this {
		this.playerID = id;
		return this
	}


	private attachMovementBindings(p: KaplayPlayerType): KaplayPlayerType {
		p.onKeyDown("left", () => {
			p.move(-this.PLAYER_SPEED, 0);
		});

		p.onKeyDown("right", () => {
			p.move(this.PLAYER_SPEED, 0);
		});

		p.onKeyPress("up", () => {
			if (p.isGrounded()) {
				p.jump()
			}
		});

		return p
	}

	private setupEventBroadcast(p: KaplayPlayerType): KaplayPlayerType {
		p.onUpdate(() => {
			console.log("Broadcasting player movement", p.pos);
			Conduit.emit(GameEventTypes.PLAYER_MOVED,
				{ player_id: this.playerID, position: p.pos }
			)
		});
		return p
	}

	private setupEventHooks(p: KaplayPlayerType): KaplayPlayerType {
		const k = getKaplay();
		if (!this.isLocalPlayer) {
			Conduit.on(GameEventTypes.PLAYER_MOVED, (e) => {
				if (e.player_id === this.playerID) {
					p.moveTo(k.vec2(e.position.x, e.position.y));
				}
			});
		}
		return p
	}
}

export class PlayerFactory {
	static async createLocalPlayer(playerID: PlayerID, x: number, y: number): Promise<{
		entity: KaplayPlayerType;
		positionTableID: string;
		eventManager: PBEventManager;
	}> {
		const positionTableID = await createOrRecreateUserPositionRecord(playerID, x, y);
		const eventManager = new PBEventManager(playerID, positionTableID);
		await eventManager.setup();

		const k = getKaplay();
		const entity = await new PlayerBuilder()
			.withSprite(k.sprite('bean'))
			.atPosition(x, y)
			.asLocalPlayer(playerID)
			.build();

		return { entity, positionTableID, eventManager };
	}

	static async createRemotePlayer(playerID: PlayerID, x: number, y: number): Promise<{
		entity: KaplayPlayerType;
	}> {
		const k = getKaplay();
		const entity = await new PlayerBuilder()
			.withSprite(k.sprite('bean'))
			.atPosition(x, y)
			.withID(playerID)
			.build();

		console.log("Spawned remote player", playerID, x, y);

		return { entity };
	}
}
