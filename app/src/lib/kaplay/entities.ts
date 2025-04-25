import type { PlayerID } from "$lib/constants";
import { Conduit } from "$lib/events";
import { GameEventTypes } from "$lib/events/EventTypes";
import type { AreaComp, BodyComp, GameObj, PosComp, SpriteComp } from "kaplay";
import { createOrRecreateUserPositionRecord } from "$lib/pb/users";
import { PBEventManager } from "$lib/pb/events";
import { getKaplay } from ".";
import { bgScale, bgTargetHeight, bgX, frogGodHeight, GROUND_HEIGHT, MIN_GAP, PLATFORM_WIDTH, WORLD_WIDTH } from "./constants";

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

		// TODO: Player camera updates
		// Update local player and camera based on keyboard inputs
		//k.onUpdate(() => {
		//	const groundCenterX = WORLD_WIDTH / 2;
		//	const clampMargin = WORLD_WIDTH / 4;
		//	const minCamX = groundCenterX - clampMargin;
		//	const maxCamX = groundCenterX + clampMargin;
		//
		//	k.camPos(vec2(
		//		Math.max(minCamX, Math.min(localPlayer.pos.x, maxCamX)),
		//		Math.min(localPlayer.pos.y, WORLD_HEIGHT - height() / 2)
		//	));
		//
		//
		//	if (leaderboardText && leaderboardBg) {
		//		const camTopLeft = vec2(
		//			k.camPos().x - width() / 2, // use actual screen width
		//			k.camPos().y - height() / 2
		//		);
		//		const offset = vec2(20, 20);
		//		leaderboardText.pos = camTopLeft.add(offset);
		//		leaderboardBg.pos = camTopLeft.add(offset);
		//	}
		//
		//	updatePositionDebounced({
		//		entity_name: name,
		//		pos_x: localPlayer.pos.x,
		//		pos_y: localPlayer.pos.y,
		//	});
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

export class PlatformFactory {
	static FINAL_PLATFORM_Y = frogGodHeight / 3 + 184;
	static GOLD_WIDTH = PLATFORM_WIDTH * 1.8;
	static GOLD_HEIGHT = 8 * 1.8;
	static GLOW_WIDTH = this.GOLD_WIDTH + 30;
	static GLOW_HEIGHT = 30 * 1.8;
	static GLOW_Y_OFFSET = 11 * 1.8;
	static PLATFORM_HEIGHT = 8;
	static async createGoldPlatform(x: number): Promise<GameObj<PosComp | SpriteComp>> {
		const k = getKaplay();
		k.add([
			k.rect(PlatformFactory.GOLD_WIDTH, PlatformFactory.GOLD_HEIGHT),
			k.pos(x - PlatformFactory.GOLD_WIDTH / 2, PlatformFactory.FINAL_PLATFORM_Y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(255, 215, 0),
			k.z(5),
			"goldPlatform"
		]);

		k.add([
			k.rect(PlatformFactory.GLOW_WIDTH, PlatformFactory.GLOW_HEIGHT),
			k.pos(x - PlatformFactory.GOLD_WIDTH / 2 - 15, PlatformFactory.FINAL_PLATFORM_Y - PlatformFactory.GLOW_Y_OFFSET),
			k.color(255, 215, 0),
			k.opacity(0.3),
			k.z(4)
		]);

		//@ts-ignore
		return Promise.resolve();
	}
	static createTogglePlatform(x: number, y: number) {
		const k = getKaplay();
		let p = k.add([
			k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
			k.pos(x, y),
			k.area(),
			k.body({ isStatic: true, }),
			k.color(48, 0, 80),
			k.outline(2)
		]);

		setInterval(() => {
			if (p) {
				k.destroy(p);
			} else {
				p = PlatformFactory.createTogglePlatform(x, y);
			}
		}, 2000);

		return p
	};

	static createBoostPad(x: number, y: number) {
		const k = getKaplay();
		const p = k.add([
			k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
			k.pos(x, y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(255, 140, 0),
			k.outline(2),
			k.offscreen({ distance: 600 }),
			"boostpad"
		]);
		return p
	}

	static createSidewaysMover(x: number, y: number) {
		const k = getKaplay();
		const mover = k.add([
			k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
			k.pos(x, y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(173, 216, 230),
			k.outline(2)
		]);
		const baseX = x;
		let t = 0;
		mover.onUpdate(() => {
			t += k.dt();
			mover.pos.x = baseX + Math.sin(t * 2) * 100;
		});
		return mover;

	}

	static createUpDownMover(x: number, y: number) {
		const k = getKaplay();
		const mover = k.add([
			k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
			k.pos(x, y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(173, 216, 230),
			k.outline(2)
		]);
		const baseY = y;
		let t = 0;
		mover.onUpdate(() => {
			t += k.dt();
			mover.pos.y = baseY + Math.sin(t * 2) * 100;
		});
		return mover;
	}

	static createBasicPlatform(x: number, y: number) {
		const k = getKaplay();
		return k.add([
			k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
			k.pos(x, y),
			k.area(),
			k.body({ isStatic: true }),
			k.color(34, 139, 34),
			k.outline(2),
			k.offscreen({ distance: 600 })
		]);
	}

}
// Updates the leaderboard based on player height, every 5 seconds
//const updateLeaderboard = () => {
//	const sorted = Object.entries(maxHeights)
//		.sort(([, aY], [, bY]) => bY - aY) // Higher height = higher rank
//		.slice(0, 10);
//
//
//	const lines = sorted.map(([playerName, y], i) => {
//		const heightDisplay = y < 100 ? "(0)" : `(${Math.round(y)}m)`;
//		return `${i + 1}. ${playerName} ${heightDisplay}`;
//	}).join("\n");
//
//	if (leaderboardText) leaderboardText.destroy();
//	if (leaderboardBg) leaderboardBg.destroy();
//
//	leaderboardBg = add([
//		rect(200, 170),
//		pos(0, -400),
//		color(10, 10, 10),
//		z(100),
//		layer("game"),
//		opacity(0.8)
//	]);
//	add([
//		rect(204, 174),
//		pos(-2, -400),
//		color(80, 80, 80),
//		z(99),
//		layer("game"),
//		opacity(0.4)
//	]);
//
//	leaderboardText = add([
//		text(lines, { size: 12, lineSpacing: 4, font: "monospace" }),
//		pos(10, 25), // shift down for title spacing
//		z(101),
//		layer("game")
//	]);
//};
//
//setInterval(updateLeaderboard, 5000);
//

export class WorldFactory {
	// Randomizing seed, probably unnecessary
	static mulberry32(seed: number) {
		return function() {
			let t = seed += 0x6D2B79F5;
			t = Math.imul(t ^ t >>> 15, t | 1);
			t ^= t + Math.imul(t ^ t >>> 7, t | 61);
			return ((t ^ t >>> 14) >>> 0) / 4294967296;
		};
	}

	// Create a world with auto-generated platforms, based on a seed (optional)
	static generateWorld(WORLD_HEIGHT: number, frogGodHeight: number, seed = 625) {
		const k = getKaplay();
		const {
			add, rect, pos, area, body, color, outline, offscreen, opacity, z
		} = k;

		k.loadSprite("hell", "/backgrounds/hell2.png");
		k.loadSprite("swamp", "/backgrounds/swamp.png");
		k.loadSprite("heaven", "/backgrounds/heaven.png");
		k.loadSprite("froggod", "/backgrounds/froggod.png");

		["hell", "swamp", "heaven"].forEach((name, index) => {
			add([
				k.sprite(name),
				k.scale(bgScale),
				pos(bgX, WORLD_HEIGHT - bgTargetHeight * (index + 1)),
				z(-10),
				offscreen({ distance: 600 })
			]);
		});

		add([
			k.sprite("froggod"),
			k.scale(bgScale),
			pos(bgX, 0),
			z(-10),
			offscreen({ distance: 600 })
		])

		const rng = WorldFactory.mulberry32(seed);
		const placed: { x: number, y: number }[] = [];

		add([
			rect(WORLD_WIDTH, GROUND_HEIGHT),
			pos(0, WORLD_HEIGHT - GROUND_HEIGHT),
			area(),
			body({ isStatic: true }),
			color(70, 20, 0), // very dark burnt orange
			outline(2)
		]);
		add([
			rect(WORLD_WIDTH, GROUND_HEIGHT + 10),
			pos(0, WORLD_HEIGHT - GROUND_HEIGHT),
			color(255, 60, 0),
			opacity(0.1),
			z(-9)
		]);


		const platformGenStart = WORLD_HEIGHT - GROUND_HEIGHT - 100;
		const ROW_HEIGHT_GAP = 120
		const platformGenEnd = frogGodHeight / 3 + 2 * ROW_HEIGHT_GAP;

		for (let y = platformGenStart; y > platformGenEnd; y -= ROW_HEIGHT_GAP) {
			const roll = rng();
			let numPlatforms = roll < 1 / 6 ? 2 : roll < 3 / 6 ? 3 : 4;
			let attempts = 0;
			const placedX: number[] = [];

			while (placedX.length < numPlatforms && attempts < 50) {
				const x = rng() * (WORLD_WIDTH - PLATFORM_WIDTH);
				const overlaps = placed.some(p =>
					p.y === y && Math.abs(p.x - x) < PLATFORM_WIDTH + MIN_GAP
				);
				if (overlaps) {
					attempts++;
					continue;
				}

				const r = rng();
				let p: GameObj | null = null;

				if (r < 0.05) {
					p = PlatformFactory.createTogglePlatform(x, y);
				} else if (r < 0.10) {
					p = PlatformFactory.createBoostPad(x, y);
				} else if (r < 0.15) {
					p = PlatformFactory.createSidewaysMover(x, y);
				} else if (r < 0.20) {
					p = PlatformFactory.createUpDownMover(x, y);
				} else {
					p = PlatformFactory.createBasicPlatform(x, y);

				}
				if (p) {
					placedX.push(x);
					placed.push({ x, y });
				}
			}
		}
	}
}
