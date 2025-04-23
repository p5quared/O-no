import type { GameID } from "$lib/constants";
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
	public asLocalPlayer(): this {
		this.isLocalPlayer = true;
		return this
	}
	public build(): KaplayPlayerType {
		const k = kaplay();

		let p = k.add([
			this.sprite,
			k.pos(this.posX, this.posY),
			k.area(),
			k.body(),
		])

		if (this.isLocalPlayer) {
			  p = this.setupNetworkBroadcast(p);
		}
		
		p = this.setupNetworkHooks(p)

		return p;
	}

  private setupNetworkBroadcast(p: KaplayPlayerType): KaplayPlayerType {
	// TODO: broadcast location and actions
	// don't forget to debounce actions
	//@ts-ignore
	return
  }

  private setupNetworkHooks(p: KaplayPlayerType): KaplayPlayerType {
	// TODO: Connect the events pipeline from Conduit
	// and define the effects
	//@ts-ignore
	return
  }
}

