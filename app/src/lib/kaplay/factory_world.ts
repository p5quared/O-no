import type { GameObj } from 'kaplay';
import { getKaplay } from '.';
import {
	bgScale,
	bgTargetHeight,
	bgX,
	GRAVITY,
	GROUND_HEIGHT,
	MIN_GAP,
	PLATFORM_WIDTH,
	WORLD_WIDTH
} from './constants';
import { PlatformFactory } from './factory_platform';

export class WorldFactory {
	// Randomizing seed, probably unnecessary
	static mulberry32(seed: number) {
		return function () {
			let t = (seed += 0x6d2b79f5);
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	// Create a world with auto-generated platforms, based on a seed (optional)
	static generateWorld(WORLD_HEIGHT: number, frogGodHeight: number, seed = 625) {
		const k = getKaplay();
		const { add, rect, pos, area, body, color, outline, offscreen, opacity, z } = k;

		k.loadSprite('hell', '/backgrounds/hell2.png');
		k.loadSprite('swamp', '/backgrounds/swamp.png');
		k.loadSprite('heaven', '/backgrounds/heaven.png');
		k.loadSprite('froggod', '/backgrounds/froggod.png');

		['hell', 'swamp', 'heaven'].forEach((name, index) => {
			add([
				k.sprite(name),
				k.scale(bgScale),
				pos(bgX, WORLD_HEIGHT - bgTargetHeight * (index + 1)),
				z(-10),
				offscreen({ distance: 600 })
			]);
		});

		add([k.sprite('froggod'), k.scale(bgScale), pos(bgX, 0), z(-10), offscreen({ distance: 600 })]);

		k.setGravity(GRAVITY);

		const rng = WorldFactory.mulberry32(seed);
		const placed: { x: number; y: number }[] = [];

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
		const ROW_HEIGHT_GAP = 120;
		const platformGenEnd = frogGodHeight / 3 + 2 * ROW_HEIGHT_GAP;

		for (let y = platformGenStart; y > platformGenEnd; y -= ROW_HEIGHT_GAP) {
			const roll = rng();
			let numPlatforms = roll < 1 / 6 ? 2 : roll < 3 / 6 ? 3 : 4;
			let attempts = 0;
			const placedX: number[] = [];

			while (placedX.length < numPlatforms && attempts < 50) {
				const x = rng() * (WORLD_WIDTH - PLATFORM_WIDTH);
				const overlaps = placed.some(
					(p) => p.y === y && Math.abs(p.x - x) < PLATFORM_WIDTH + MIN_GAP
				);
				if (overlaps) {
					attempts++;
					continue;
				}

				const r = rng();
				let p: GameObj | null = null;

				if (r < 0.05) {
					p = PlatformFactory.createTogglePlatform(x, y);
				} else if (r < 0.1) {
					p = PlatformFactory.createBoostPad(x, y);
				} else if (r < 0.15) {
					p = PlatformFactory.createSidewaysMover(x, y);
				} else if (r < 0.2) {
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

		PlatformFactory.createEndingPlatforms();
	}
}
