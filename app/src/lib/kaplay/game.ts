
import { getKaplay } from '.';
import { frogGodHeight, WORLD_HEIGHT } from './constants';
import { getLoggedInUserID } from '$lib/pb/users';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WorldFactory } from './factory_world';
import { PlayerFactory } from './factory_player';

// Randomizing seed, probably unnecessary
function mulberry32(seed: number) {
	return function () {
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

const debounce = (func: Function, delay: number) => {
	let timeout: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};

const updatePositionDebounced = debounce(updatePosition, 5);

const GROUND_HEIGHT = 48;
const PLATFORM_WIDTH = 100;
const MIN_GAP = 70;

// Create a world with auto-generated platforms, based on a seed (optional)
function generateWorld(k: ReturnType<typeof kaplay>, WORLD_HEIGHT: number, frogGodHeight: number, seed = 625) {
	const {
		add, rect, pos, width, area, body, color, outline, destroy, offscreen, opacity, z
	} = k;

	const PLATFORM_HEIGHT = 8;
	const WORLD_WIDTH = 1024;
	const rng = mulberry32(seed);
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
			// console.count("loop")
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
				const createTogglePlatform = () => {
					p = add([
						rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
						pos(x, y),
						area(),
						body({ isStatic: true, isPlatform: true }),
						color(48, 0, 80),
						outline(2)
					]);
				};

				createTogglePlatform();
				if (typeof window !== 'undefined') {
					setInterval(() => {
						if (p) {
							destroy(p);
							p = null;
						} else {
							createTogglePlatform();
						}
					}, 2000);
				}
			} else if (r < 0.10) {
				p = add([
					rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
					pos(x, y),
					area(),
					body({ isStatic: true, isPlatform: true }),
					color(255, 140, 0),
					outline(2),
					offscreen({ distance: 600 }),
					"boostpad"
				]);
			} else if (r < 0.15) {
				const mover = add([
					rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
					pos(x, y),
					area(),
					body({ isStatic: true }),
					color(173, 216, 230),
					outline(2)
				]);
				const baseX = x;
				let t = 0;
				mover.onUpdate(() => {
					t += k.dt();
					mover.pos.x = baseX + Math.sin(t * 2) * 100;
				});
				p = mover;
			} else if (r < 0.20) {
				const mover = add([
					rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
					pos(x, y),
					area(),
					body({ isStatic: true }),
					color(173, 216, 230),
					outline(2)
				]);
				const baseY = y;
				let t = 0;
				mover.onUpdate(() => {
					t += k.dt();
					mover.pos.y = baseY + Math.sin(t * 2) * 100;
				});
				p = mover;
			} else {
				p = add([
					rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
					pos(x, y),
					area(),
					body({ isStatic: true, isPlatform: true }),
					color(34, 139, 34),
					outline(2),
					offscreen({ distance: 600 })
				]);
			}
			if (p) {
				placedX.push(x);
				placed.push({ x, y });
			}
		}
	}
}

// Load world and spawn players.
const init = (name: string) => {
	const k = kaplay();
	const {
		add, pos, width, height, rect, color, opacity, onKeyPress, layer,
		area, body, loadSprite, sprite, anchor, offscreen,
		setGravity, onKeyPressRepeat, isKeyDown, vec2, scale, z, text
	} = k;
	loadSprite("hell", "/backgrounds/hell2.png");
	loadSprite("swamp", "/backgrounds/swamp.png");
	loadSprite("heaven", "/backgrounds/heaven.png");
	loadSprite("froggod", "/backgrounds/froggod.png");

	const WORLD_WIDTH = 1024;
	const bgOriginalWidth = 1024;
	const bgOriginalHeight = 1536;
	const frogGodOriginalHeight = 806;

	const bgTargetWidth = WORLD_WIDTH * 2.5;
	const bgScale = bgTargetWidth / bgOriginalWidth;
	const bgTargetHeight = bgOriginalHeight * bgScale;
	const frogGodHeight = frogGodOriginalHeight * bgScale;
	const bgX = (WORLD_WIDTH / 2) - (bgTargetWidth / 2);

	const WORLD_HEIGHT = bgTargetHeight * 3 + frogGodHeight;

	["hell", "swamp", "heaven"].forEach((name, index) => {
		add([
			sprite(name),
			scale(bgScale),
			pos(bgX, WORLD_HEIGHT - bgTargetHeight * (index + 1)),
			z(-10),
			offscreen({ distance: 600 })
		]);
	});

	add([
		sprite("froggod"),
		scale(bgScale),
		pos(bgX, 0),
		z(-10),
		offscreen({ distance: 600 })
	]);

	generateWorld(k, WORLD_HEIGHT, frogGodHeight);

	const FINAL_PLATFORM_Y = frogGodHeight / 3 + 184;
	const GOLD_WIDTH = PLATFORM_WIDTH * 1.8;
	const GOLD_HEIGHT = 8 * 1.8;
	const GLOW_WIDTH = GOLD_WIDTH + 30;
	const GLOW_HEIGHT = 30 * 1.8;
	const GLOW_Y_OFFSET = 11 * 1.8;

	const spacing = 440;
	const numFinalPlatforms = 3;
	const totalGoldWidth = spacing * (numFinalPlatforms - 1);
	const goldStartX = (WORLD_WIDTH - totalGoldWidth) / 2;

	for (let i = 0; i < numFinalPlatforms; i++) {
		const x = goldStartX + spacing * i;

		add([
			rect(GOLD_WIDTH, GOLD_HEIGHT),
			pos(x - GOLD_WIDTH / 2, FINAL_PLATFORM_Y),
			area(),
			body({ isStatic: true, isPlatform: true }),
			color(255, 215, 0),
			z(5),
			"goldPlatform"
		]);

		add([
			rect(GLOW_WIDTH, GLOW_HEIGHT),
			pos(x - GOLD_WIDTH / 2 - 15, FINAL_PLATFORM_Y - GLOW_Y_OFFSET),
			color(255, 215, 0),
			opacity(0.3),
			z(4)
		]);
	}


	const spawnPos = vec2(80, WORLD_HEIGHT - GROUND_HEIGHT - 32);
	const maxHeights: Record<string, number> = { [name]: 0 };
	let leaderboardText: GameObj<{ pos: Vec2 }> | null = null;
	let leaderboardBg: GameObj<{ pos: Vec2 }> | null = null;

	// Updates the leaderboard based on player height, every 5 seconds
	const updateLeaderboard = () => {
		const sorted = Object.entries(maxHeights)
			.sort(([, aY], [, bY]) => bY - aY) // Higher height = higher rank
			.slice(0, 10);


		const lines = sorted.map(([playerName, y], i) => {
			const heightDisplay = y < 100 ? "(0)" : `(${Math.round(y)}m)`;
			return `${i + 1}. ${playerName} ${heightDisplay}`;
		}).join("\n");

		if (leaderboardText) leaderboardText.destroy();
		if (leaderboardBg) leaderboardBg.destroy();

		leaderboardBg = add([
			rect(200, 170),
			pos(0, -400),
			color(10, 10, 10),
			z(100),
			layer("game"),
			opacity(0.8)
		]);
		add([
			rect(204, 174),
			pos(-2, -400),
			color(80, 80, 80),
			z(99),
			layer("game"),
			opacity(0.4)
		]);

		leaderboardText = add([
			text(lines, { size: 12, lineSpacing: 4, font: "monospace" }),
			pos(10, 25), // shift down for title spacing
			z(101),
			layer("game")
		]);
	};

	setInterval(updateLeaderboard, 5000);

	// Load local player sprite and spawn point
	loadSprite('bean', 'https://play.kaplayjs.com/sprites/bean.png');
	const localPlayer = add([
		sprite('bean'),
		scale(1.0),
		pos(spawnPos.x, spawnPos.y),
		area(),
		body()
	]);
	// Player username under sprite
	const nameLabel = add([
		text(name, { size: 12, align: "center", width: 100 }),
		pos(localPlayer.pos.x + 28, localPlayer.pos.y + 64),
		anchor("center"),
		z(10)
	]);

	localPlayer.onUpdate(() => {
		nameLabel.pos = vec2(localPlayer.pos.x + 28, localPlayer.pos.y + 64);
		maxHeights[name] = WORLD_HEIGHT - localPlayer.pos.y;
	});
	localPlayer.onCollide("boostpad", () => {
		localPlayer.jump(2.5 * 400);
	});

	// Gravity of map -- don't change.
	setGravity(1000);

	// Update local player and camera based on keyboard inputs
	k.onUpdate(() => {
		const groundCenterX = WORLD_WIDTH / 2;
		const clampMargin = WORLD_WIDTH / 4;
		const minCamX = groundCenterX - clampMargin;
		const maxCamX = groundCenterX + clampMargin;

		k.camPos(
			Math.max(minCamX, Math.min(localPlayer.pos.x, maxCamX)),
			Math.min(localPlayer.pos.y, WORLD_HEIGHT - height() / 2)
		);

		if (isKeyDown('left') || isKeyDown('a')) localPlayer.move(-400, 0);
		if (isKeyDown('right') || isKeyDown('d')) localPlayer.move(400, 0);
		if (localPlayer.pos.y > WORLD_HEIGHT + 200) {
			localPlayer.pos = spawnPos.clone();
			localPlayer.vel = vec2(0, 0);
		}

		if (leaderboardText && leaderboardBg) {
			const camTopLeft = vec2(
				k.camPos().x - width() / 2, // use actual screen width
				k.camPos().y - height() / 2
			);
			const offset = vec2(20, 20);
			leaderboardText.pos = camTopLeft.add(offset);
			leaderboardBg.pos = camTopLeft.add(offset);
		}

		updatePositionDebounced({
			entity_name: name,
			pos_x: localPlayer.pos.x,
			pos_y: localPlayer.pos.y,
		});
	});
	onKeyPressRepeat(['space', 'w', 'up'], () => {
		if (localPlayer.isGrounded()) {
			localPlayer.jump();
		}
	});

	// Multiplayer
	type RemotePlayerData = {
		player: GameObj<{ pos: Vec2 }>;
		nameTag: GameObj;
	};

	const remotePlayers: Record<string, RemotePlayerData> = {};

	// Track remote player movements live
	const onPlayerUpdates = (p: PositionRecord) => {
		if (p.entity_name === name) return;

		if (!remotePlayers[p.entity_name]) {
			const player = add([
				sprite('bean'),
				pos(p.pos_x, p.pos_y),
				area(),
				scale(1.0)
			]);

			const nameTag = add([
				text(p.entity_name, {
					size: 12,
					align: "center",
					width: 100
				}),
				pos(p.pos_x + 28, p.pos_y + 64),
				anchor("center"),
				z(10)
			]);
			player.onUpdate(() => {
				nameTag.pos = vec2(player.pos.x + 28, player.pos.y + 64);
				maxHeights[p.entity_name] = WORLD_HEIGHT - player.pos.y;
			});
			remotePlayers[p.entity_name] = { player, nameTag };
		}
		const remote = remotePlayers[p.entity_name];
		const target = vec2(p.pos_x, p.pos_y);
		if (remote.player.pos.dist(target) > 300) {
			remote.player.pos = target;
		} else {
			remote.player.pos = remote.player.pos.lerp(target, 0.2);
		}

	};

	subscribeToPositions(onPlayerUpdates);
};

export { init };
