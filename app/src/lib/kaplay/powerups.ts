import { goto } from "$app/navigation"
import { Conduit } from "$lib/events"
import { GameEventTypes } from "$lib/events/EventTypes"
import type { PBEventManager } from "$lib/pb/event_manager"
import type { Vec2 } from "kaplay"
import { getKaplay } from "."

export const spawnPowerup = (em: PBEventManager): void => {
	em.broadcastEvent(GameEventTypes.POWERUP_COLLECTED, {
		emit_by: em.playerID,
		type: POWERUP_TYPES.JUMP,
	})
}

export enum POWERUP_TYPES {
	TEST = "test",
	RICK_ROLL = "rick_roll",
	JUMP = "jump",
}

// Util gets the closest n players to the local player
const nClosest = (n: number) => {
	const k = getKaplay()
	const local = k.get("localPlayer")[0]
	const remote = k.get("remotePlayer")
	const us = k.vec2(local.pos.x, local.pos.y)

	const playersWithDistances = remote.map(p => {
		return {
			player: p,
			position: k.vec2(p.pos.x, p.pos.y),
			distance: us.dist(k.vec2(p.pos.x, p.pos.y))
		}
	})

	const sortedPlayers = playersWithDistances.sort((a, b) => a.distance - b.distance)

	const closestPlayers = sortedPlayers.slice(0, n)

	const out = closestPlayers.map(playerInfo => {
		const idTag = playerInfo.player.tags.find(tag => tag.startsWith("id:"))
		return idTag ? idTag.substring(3) : null
	})
	return out.filter((id): id is string => id !== null)
}

export class PowerupManager {
	private currentPowerup: string | null = null
	private pbem: PBEventManager

	constructor(pb: PBEventManager) {
		this.pbem = pb
		this.attachBindings()
		this.handlePowerUps()

		Conduit.on(GameEventTypes.POWERUP_COLLECTED, e => {
			if (e.emit_by == this.pbem.playerID) {
				this.pickupPowerup(e.type as POWERUP_TYPES)
				console.log("Picked up powerup")
			}
		})
	}

	public pickupPowerup(type: POWERUP_TYPES) {
		if (this.hasPowerup()) return;
		this.currentPowerup = type;
	}

	public hasPowerup(): boolean {
		return this.currentPowerup != null
	}

	public usePowerup() {
		const k = getKaplay();
		if (!this.hasPowerup()) return
		switch (this.currentPowerup) {
			case POWERUP_TYPES.RICK_ROLL:
				this.pbem.broadcastEvent(GameEventTypes.POWERUP_USED, {
					emit_by: this.pbem.playerID,
					type: POWERUP_TYPES.RICK_ROLL,
					target: nClosest(3),
				})

			case POWERUP_TYPES.JUMP:
				this.pbem.broadcastEvent(GameEventTypes.POWERUP_USED, {
					emit_by: this.pbem.playerID,
					type: POWERUP_TYPES.JUMP,
				})
				const local = k.get('localPlayer')[0];
				local.onKeyPress("up", () => {
					if (local.isGrounded()) {
						local.jump(666)
					}
				});
				setTimeout(() => {
					local.onKeyPress("up", () => {
						if (local.isGrounded()) {
							local.jump()
						}
					});
				}, 7500)
		}

		this.currentPowerup = null;
	}

	// We only need to handle powerups that
	// have effects on us from other players
	private handlePowerUps() {
		Conduit.on(GameEventTypes.POWERUP_USED, e => {
			console.log(`Player ${this.pbem.playerID} sees use: ${e}`)
			switch (e.type) {
				case POWERUP_TYPES.RICK_ROLL:
					if (e.target?.includes(this.pbem.playerID)) {
						alert(`${e.emit_by} is never gonna give you up!`)
						setTimeout(() => window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 5000)
					}
			}

		})

	}

	private attachBindings() {
		const k = getKaplay();
		k.onKeyPress('space', () => {
			if (this.hasPowerup()) {
				this.usePowerup();
			}
		})
	}

}
