import {
	subscribeToPositions,
	updatePosition,
	type PositionRecord
} from '$lib/pb/game';
import kaplay, { type GameObj, type Vec2 } from 'kaplay';

function mulberry32(seed: number) {
	return function () {
		let t = seed += 0x6D2B79F5;
		t = Math.imul(t ^ t >>> 15, t | 1);
		t ^= t + Math.imul(t ^ t >>> 7, t | 61);
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}


// const _id = Math.random().toString(36).substring(2, 9);

const debounce = (func: Function, delay: number) => {
	let timeout: ReturnType<typeof setTimeout>;
	return function (this: any, ...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
			func.apply(this, args);
		}, delay);
	};
};

const updatePositionDebounced = debounce(updatePosition, 10);

// Shared constants
const GROUND_HEIGHT = 48;
const PLATFORM_WIDTH = 100;
const MIN_GAP = 70;

// World generation function
function generateWorld(k: ReturnType<typeof kaplay>, WORLD_HEIGHT: number, frogGodHeight: number, seed = 1337) {

	const {
		add, rect, pos, width, area, body, color, outline, destroy, offscreen
	} = k;

	const PLATFORM_HEIGHT = 8;

	const rng = mulberry32(seed);
	const placed: { x: number, y: number }[] = [];

	// Ground
	add([
		rect(width(), GROUND_HEIGHT),
		pos(0, (WORLD_HEIGHT - frogGodHeight) - GROUND_HEIGHT),
		area(),
		body({ isStatic: true }),
		color(139, 69, 19),
		outline(2)
	]);

	const platformGenStart = (WORLD_HEIGHT - frogGodHeight) - 150;
	const platformGenEnd = frogGodHeight / 3 - 64; // Same as FINAL_PLATFORM_Y

	for (let y = platformGenStart; y > platformGenEnd; y -= 120) {
		 const roll = rng();
		let numPlatforms = 2;

		if (roll < 1 / 6) {
			numPlatforms = 2;
		} else if (roll < 3 / 6) {
			numPlatforms = 3;
		} else {
			numPlatforms = 4;
		}

		let attempts = 0;
		const placedX: number[] = [];

		while (placedX.length < numPlatforms && attempts < 50) {
			const x = rng() * (width() - PLATFORM_WIDTH);
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
				// 💜 Disappearing platform (5%)
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
				// 🔥 Boost platform (5%)
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
				// 🔁 Horizontal mover (5%)
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
				// ↕️ Vertical mover (5%)
				const mover = add([
					rect(PLATFORM_WIDTH, PLATFORM_HEIGHT),
					pos(x, y),
					area(),
					body({isStatic: true}),
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
				// ✅ Static green platform (default ~80%)
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



const init = (name: string) => {
	const k = kaplay();
	const {
		add, pos, width, height, rect, color, opacity,
		area, body, loadSprite, sprite, anchor, offscreen,
		setGravity, onKeyPressRepeat, isKeyDown, vec2, scale, z, text
	} = k;

	loadSprite("hell", "/backgrounds/hell2.png");
	loadSprite("swamp", "/backgrounds/swamp.png");
	loadSprite("heaven", "/backgrounds/heaven.png");
	loadSprite("froggod", "/backgrounds/froggod.png");

	const bgOriginalWidth = 1024;
	const bgOriginalHeight = 1536;
	const frogGodOriginalHeight = 806;

	const bgTargetWidth = width() * 1.7;
	const bgScale = bgTargetWidth / bgOriginalWidth;

	const bgTargetHeight = bgOriginalHeight * bgScale;
	const frogGodHeight = frogGodOriginalHeight * bgScale;

	const bgX = (width() / 2) - (bgTargetWidth / 2);

// 🗺️ Final world height includes 3 regular backgrounds + frogGod image
	const WORLD_HEIGHT = bgTargetHeight * 3 + frogGodHeight;
	const platformMaxY = frogGodHeight / 3;

	const bgLayers = ["hell", "swamp", "heaven"];

	bgLayers.forEach((name, index) => {
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
		pos(bgX, 0), // <-- Show it at the very top of the world
		z(-10),
		offscreen({ distance: 600 })
	]);

	// Can add/exclude 3rd param to put multiple players on same map
	generateWorld(k, WORLD_HEIGHT, frogGodHeight);

	// 🌟 Final golden platforms at the top (in front of the Frog God)
	const FINAL_PLATFORM_Y = frogGodHeight / 3 - 64;
	const numFinalPlatforms = 5;
	const spacing = width() / (numFinalPlatforms + 1);

	for (let i = 1; i <= numFinalPlatforms; i++) {
		add([
			rect(PLATFORM_WIDTH, 8),
			pos(spacing * i - PLATFORM_WIDTH / 2, FINAL_PLATFORM_Y),
			area(),
			body({ isStatic: true, isPlatform: true }),
			color(255, 215, 0),
			z(5)
		]);

		add([
			rect(PLATFORM_WIDTH + 30, 30),
			pos(spacing * i - PLATFORM_WIDTH / 2 - 15, FINAL_PLATFORM_Y - 11),
			color(255, 215, 0),
			opacity(0.3),
			z(4)
		]);
	}



	const spawnPos = vec2(80, (WORLD_HEIGHT - frogGodHeight) - GROUND_HEIGHT - 32);

	loadSprite('bean', 'https://play.kaplayjs.com/sprites/bean.png');
	// loadSprite("player", "/sprites/frogneutral.png");

	const localPlayer = add([
		sprite('bean'),
		scale(1.0),
		pos(spawnPos.x, spawnPos.y),
		area(),
		body()
	]);

	// Local name tag
	const nameLabel = add([
		text(name, { size: 12, align: "center", width: 100 }),
		pos(localPlayer.pos.x + 28, localPlayer.pos.y + 64),
		anchor("center"),
		z(10)
	]);
	localPlayer.onUpdate(() => {
		nameLabel.pos = vec2(localPlayer.pos.x + 28, localPlayer.pos.y + 64);
	});


	localPlayer.onCollide("boostpad", () => {
		localPlayer.jump(2.5 * 400); // 2.5x jump height
	});

	setGravity(1000);

	// Handle input and camera in one update
	k.onUpdate(() => {
		// Camera follows local player upward
		const groundCenterX = width() / 2;
		const clampMargin = width() / 4; // allow 25% screen to either side of center

		const minCamX = groundCenterX - clampMargin;
		const maxCamX = groundCenterX + clampMargin;

		k.camPos(
			Math.max(minCamX, Math.min(localPlayer.pos.x, maxCamX)),
			Math.min(localPlayer.pos.y, WORLD_HEIGHT - height() / 2)
		);


		if (isKeyDown('left')) localPlayer.move(-400, 0);
		if (isKeyDown('right')) localPlayer.move(400, 0);
		if (localPlayer.pos.y > WORLD_HEIGHT + 200) {
			localPlayer.pos = spawnPos.clone();
			localPlayer.vel = vec2(0, 0); // Reset velocity to prevent immediate falling again
		}
		// Broadcast position
		updatePositionDebounced({
			entity_name: name,
			pos_x: localPlayer.pos.x,
			pos_y: localPlayer.pos.y
		});
	});

	onKeyPressRepeat('space', () => {
		if (localPlayer.isGrounded()) {
			localPlayer.jump();
		}
	});

	// Multiplayer player syncing
	type RemotePlayerData = {
		player: GameObj<{ pos: Vec2 }>;
		nameTag: GameObj;
	};

	const remotePlayers: Record<string, RemotePlayerData> = {};

	const onPlayerUpdates = (p: PositionRecord) => {
		if (p.entity_name === name) return;

		if (!remotePlayers[p.entity_name]) {
			const player = add([
				sprite('bean'),
				pos(p.pos_x, p.pos_y),
				area(), // for overlap detection or interactivity
				scale(1.0) // match local
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
			});

			remotePlayers[p.entity_name] = { player, nameTag };
		}

		const remote = remotePlayers[p.entity_name];
		remote.player.pos = remote.player.pos.lerp(vec2(p.pos_x, p.pos_y), 0.08); // 0.2 = smoothing factor
	};


	subscribeToPositions(onPlayerUpdates);
};

export { init };
