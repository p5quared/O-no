import type { GameObj } from 'kaplay';
import { getKaplay } from '.';

export class LeaderboardFactory {
	static leaderboardText: GameObj | null = null;
	static leaderboardBg: GameObj | null = null;

	static renderLeaderboard(players: { name: string; y: number }[]) {
		const k = getKaplay();

		const sorted = players.sort((a, b) => a.y - b.y).slice(0, 10);

		const lines = sorted
			.map((p, i) => {
				const heightDisplay = p.y < 100 ? '(0)' : `(-${Math.round(p.y)}m)`;
				return `${i + 1}. ${p.name} ${heightDisplay}`;
			})
			.join('\n');

		// Remove existing leaderboard visuals
		if (LeaderboardFactory.leaderboardText) LeaderboardFactory.leaderboardText.destroy();
		if (LeaderboardFactory.leaderboardBg) LeaderboardFactory.leaderboardBg.destroy();

		// Background
		LeaderboardFactory.leaderboardBg = k.add([
			k.rect(200, 170),
			k.pos(20, 20), // Top-left position
			k.color(10, 10, 10),
			k.z(100),
			k.fixed(), // So it stays in camera view
			k.opacity(0.8)
		]);

		// Text
		LeaderboardFactory.leaderboardText = k.add([
			k.text(lines, { size: 12, lineSpacing: 4, font: 'monospace' }),
			k.pos(30, 30),
			k.z(101),
			k.fixed()
		]);
	}
}
