import type { GameObj, PosComp, SpriteComp } from 'kaplay';
import { frogGodHeight, PLATFORM_WIDTH, WORLD_WIDTH } from './constants';
import { getKaplay } from '.';

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
			'endPlatform'
		]);

		k.add([
			k.rect(PlatformFactory.GLOW_WIDTH, PlatformFactory.GLOW_HEIGHT),
			k.pos(
				x - PlatformFactory.GOLD_WIDTH / 2 - 15,
				PlatformFactory.FINAL_PLATFORM_Y - PlatformFactory.GLOW_Y_OFFSET
			),
			k.color(255, 215, 0),
			k.opacity(0.3),
			k.z(4)
		]);

		//@ts-ignore
		return Promise.resolve();
	}
	static createTogglePlatform(x: number, y: number) {
		const k = getKaplay();
		let p: GameObj | null = null;

		const createPlatform = () => {
			p = k.add([
				k.rect(PLATFORM_WIDTH, PlatformFactory.PLATFORM_HEIGHT),
				k.pos(x, y),
				k.area(),
				k.body({ isStatic: true }),
				k.color(48, 0, 80),
				k.outline(2)
			]);
		};

		createPlatform();

		if (typeof window !== 'undefined') {
			setInterval(() => {
				if (p) {
					k.destroy(p);
					p = null;
				} else {
					createPlatform();
				}
			}, 2000);
		}

		return p;
	}

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
			'boostpad'
		]);
		return p;
	}

	static createEndingPlatforms() {
		// In a perfect world this would live in the world factory
		const nFinalPlatforms = 5;
		const spacing = 440;
		const totalGoldWidth = spacing * (nFinalPlatforms - 1);
		const goldStartX = (WORLD_WIDTH - totalGoldWidth) / 2;
		for (let i = 0; i < nFinalPlatforms; i++) {
			const x = goldStartX + spacing * i;
			PlatformFactory.createGoldPlatform(x);
		}
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
