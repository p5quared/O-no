import type { PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import { GameEventTypes } from "$lib/events/EventTypes";
import type { AreaComp, BodyComp, GameObj, PosComp, SpriteComp } from "kaplay";
import { getLoggedInUserID, createOrRecreateUserPositionRecord } from "$lib/pb/users";
import { PBEventManager } from "$lib/pb/events";
import { getKaplay } from ".";
import { frogGodHeight, PLATFORM_WIDTH, WORLD_WIDTH } from "./constants";

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

	// TODO: Player username under sprite
	// This can be attached: https://kaplayjs.com/guides/game_objects/ 
	// (see section on "Parents, childs, and roots")
	//
	//const nameLabel = add([
	//	text(name, { size: 12, align: "center", width: 100 }),
	//	pos(localPlayer.pos.x + 28, localPlayer.pos.y + 64),
	//	anchor("center"),
	//	z(10)
	//]);
	//
	//localPlayer.onUpdate(() => {
	//	nameLabel.pos = vec2(localPlayer.pos.x + 28, localPlayer.pos.y + 64);
	//	maxHeights[name] = WORLD_HEIGHT - localPlayer.pos.y;
	//});


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

		p.onCollide("boostpad", () => {
			p.jump(2.5 * 400);
		});

		return p
	}

	private setupEventBroadcast(p: KaplayPlayerType): KaplayPlayerType {
		p.onUpdate(() => {
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
					p.moveTo(k.vec2(e.position.x, e.position.y), this.PLAYER_SPEED * 3);
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

const FINAL_PLATFORM_Y = frogGodHeight / 3 + 184;
const GOLD_WIDTH = PLATFORM_WIDTH * 1.8;
const GOLD_HEIGHT = 8 * 1.8;
const GLOW_WIDTH = GOLD_WIDTH + 30;
const GLOW_HEIGHT = 30 * 1.8;
const GLOW_Y_OFFSET = 11 * 1.8;
export class PlatformFactory {

	static async createGoldPlatform(x: number): Promise<GameObj<PosComp | SpriteComp>> {
		const k = getKaplay();
		k.add([
			k.rect(GOLD_WIDTH, GOLD_HEIGHT),
			k.pos(x - GOLD_WIDTH / 2, FINAL_PLATFORM_Y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(255, 215, 0),
			k.z(5),
			"goldPlatform"
		]);

		k.add([
			k.rect(GLOW_WIDTH, GLOW_HEIGHT),
			k.pos(x - GOLD_WIDTH / 2 - 15, FINAL_PLATFORM_Y - GLOW_Y_OFFSET),
			k.color(255, 215, 0),
			k.opacity(0.3),
			k.z(4)
		]);

		//@ts-ignore
		return Promise.resolve();
	}

}
