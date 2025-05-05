import type { PlayerID } from '$lib/constants';
import type { AreaComp, BodyComp, GameObj, PosComp, SpriteComp } from 'kaplay';
import { getKaplay } from '.';
import { Conduit } from '$lib/events';
import { GameEventTypes } from '$lib/events/EventTypes';
import { WORLD_HEIGHT, WORLD_WIDTH } from './constants';
import { getUsername } from '$lib/pb/users';
import { wsClient } from '$lib/ws/ws';
import { browser } from '$app/environment';
import { closeLobby } from '$lib/pb/lobbies';
import { page } from '$app/state';

class EntityBuilder {
	protected sprite: SpriteComp | null = null;
	protected posX: number = 0;
	protected posY: number = 0;

	public withSprite(sprite: SpriteComp): this {
		this.sprite = sprite;
		return this;
	}

	public atPosition(x: number, y: number): this {
		this.posX = x;
		this.posY = y;
		return this;
	}
}

export type KaplayPlayerType = GameObj<SpriteComp | PosComp | AreaComp | BodyComp | null>;
export class PlayerBuilder extends EntityBuilder {
	private isLocalPlayer: boolean = false;
	private PLAYER_SPEED = 200;
	private playerID: PlayerID = '';

	public asLocalPlayer(playerID: PlayerID): this {
		this.isLocalPlayer = true;
		this.playerID = playerID;
		return this;
	}

	public async build() {
		if (!this.playerID) {
			throw new Error('Player ID is required to build a player');
		}

		const k = getKaplay();
		let p = k.add([this.sprite, k.pos(this.posX, this.posY), k.area(), k.body()]);

		// TODO: Player username under sprite
		// This can be attached: https://kaplayjs.com/guides/game_objects/
		// (see section on "Parents, childs, and roots")

		const username = await getUsername(this.playerID);
		const usernameLabel = k.add([
			k.text(username, { size: 12, align: 'center', width: 100 }),
			k.pos(p.pos.x + 28, p.pos.y + 64),
			k.anchor('center'),
			k.z(10)
		]);
		p.onUpdate(() => {
			usernameLabel.pos = k.vec2(p.pos.x + 28, p.pos.y + 64);
		});

		// TODO: Player camera updates
		// Update local player and camera based on keyboard inputs

		p = this.setupEventHooks(p);

		if (this.isLocalPlayer) {
			p = this.setupCameraTracking(p);
			p = this.attachMovementBindings(p);
			p = this.setupEventBroadcast(p);
			p.tag('localPlayer');
		}

		return p;
	}

	public withID(id: PlayerID): this {
		this.playerID = id;
		return this;
	}

	private setupCameraTracking(p: KaplayPlayerType): KaplayPlayerType {
		const k = getKaplay();
		const groundCenterX = WORLD_WIDTH / 2;
		const clampMargin = WORLD_WIDTH / 4;
		const minCamX = groundCenterX - clampMargin;
		const maxCamX = groundCenterX + clampMargin;

		p.onUpdate(() => {
			const x = Math.max(minCamX, Math.min(p.pos.x, maxCamX));
			const y = Math.min(p.pos.y, WORLD_HEIGHT - k.height() / 2);
			k.setCamPos(k.vec2(x, y));
		});

		// TODO: what is this?
		//
		//if (leaderboardText && leaderboardBg) {
		//	const camTopLeft = vec2(
		//		k.camPos().x - width() / 2, // use actual screen width
		//		k.camPos().y - height() / 2
		//	);
		//	const offset = vec2(20, 20);
		//	leaderboardText.pos = camTopLeft.add(offset);
		//	leaderboardBg.pos = camTopLeft.add(offset);
		//}

		return p;
	}

	private attachMovementBindings(p: KaplayPlayerType): KaplayPlayerType {
		p.onKeyDown('left', () => {
			p.move(-this.PLAYER_SPEED, 0);
		});

		p.onKeyDown('right', () => {
			p.move(this.PLAYER_SPEED, 0);
		});

		p.onKeyPress('up', () => {
			if (p.isGrounded()) {
				p.jump();
			}
		});

		p.onCollide('boostpad', () => {
			p.jump(2.5 * 400);
		});

		p.onCollide('endPlatform', async () => {
			if (p.isGrounded()) {
				console.log('Gold collected');
				Conduit.emit(GameEventTypes.GAME_OVER, { emit_by: this.playerID });
				await closeLobby(page.params.id ?? ''); // INFO: Always exists
			}
		});

		return p;
	}

	private setupEventBroadcast(p: KaplayPlayerType): KaplayPlayerType {
		p.onUpdate(() => {
			//Conduit.emit(GameEventTypes.PLAYER_MOVED,
			//	{ player_id: this.playerID, position: p.pos }
			//)
			if (!browser) return;
			wsClient.emitMessage(this.playerID, p.pos.x, p.pos.y);
		});
		return p;
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
		return p;
	}
}
