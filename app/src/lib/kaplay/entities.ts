import type { GameID, PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import { GameEventTypes } from "$lib/events/EventTypes";
import type { AreaComp, BodyComp, GameObj, PosComp, SpriteComp } from "kaplay";
import kaplay from "kaplay";
class EntityBuilder {
	protected gameID: GameID;
	protected sprite: SpriteComp | null = null;
	protected posX: number = 0;
	protected posY: number = 0;

	constructor(gameID: GameID) {
		this.gameID = gameID;
	}

	public withGameID(gameID: GameID): this {
		this.gameID = gameID;
		return this
	}

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

type KaplayPlayerType = GameObj<SpriteComp | PosComp | AreaComp | BodyComp>
class PlayerBuilder extends EntityBuilder {
	private isLocalPlayer: boolean = false;
	private PLAYER_SPEED = 200;
	private playerID: PlayerID = "player";

	public asLocalPlayer(): this {
		this.isLocalPlayer = true;
		return this
	}

	public build(): KaplayPlayerType {
		const k = kaplay({ global: false });

		let p = k.add([
			this.sprite,
			k.pos(this.posX, this.posY),
			k.area(),
			k.body(),
		])

		this.attachMovement(p);

		p = this.setupEventBroadcast(p);
		p = this.setupEventHooks(p)

		return p;
	}

	private attachMovement(p: KaplayPlayerType): KaplayPlayerType {
		p.onKeyDown("left", () => {
			p.move(-this.PLAYER_SPEED, 0);
		});

		p.onKeyDown("right", () => {
			p.move(this.PLAYER_SPEED, 0);
		});

		return p
	}

	private setupEventBroadcast(p: KaplayPlayerType): KaplayPlayerType {
		p.onUpdate(() => Conduit.emit(GameEventTypes.PLAYER_MOVED,
			{ player_id: this.playerID, position: p.pos }
		));
		return p
	}

	private setupEventHooks(p: KaplayPlayerType): KaplayPlayerType {
		if (!this.isLocalPlayer) {
			Conduit.on(GameEventTypes.PLAYER_MOVED, (e) => {
				if (e.player_id === this.playerID) {
					p.moveTo(e.position);
				}
			});
		}
		return p
	}
}

