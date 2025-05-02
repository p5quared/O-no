// TODO: Connect with events from Coduit (player_moved)
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
