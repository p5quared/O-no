import { subscribeToPositions, updatePosition, type Position, type PositionRecord } from '$lib/pb/game';
import kaplay, { type GameObj } from 'kaplay';


const _id = Math.random().toString(36).substring(2, 9);

const debounce = (func: Function, delay: number) => {
	let timeout: ReturnType<typeof setTimeout>;
	return function(this: any, ...args: any[]) {
		clearTimeout(timeout);
		timeout = setTimeout(() => {
		console.log("Updating position");
	  func.apply(this, args)}, delay);
	}
}

const updatePositionDebounced = debounce(updatePosition, 10);

const init = (name: string) => {
	const k = kaplay();
	const { add, rect, pos, width, height, outline, area, body, color, loadSprite, sprite, onKeyPress, setGravity, onKeyPressRepeat } = k;

	add([
		rect(width(), 48),
		pos(0, height() - 48),
		outline(4),
		area(),
		body({ isStatic: true }),
		color(127, 200, 255),
	]);

	loadSprite("bean", "https://play.kaplayjs.com/sprites/bean.png");

	const localPlayer = add([sprite("bean"), pos(80, 40), area(), body()]);

	onKeyPressRepeat("space", () => {
		if (localPlayer.isGrounded()) {
			localPlayer.jump();
		}
	});

	localPlayer.onDraw(async () => {
	})

	onKeyPressRepeat("left", () => {
		const p = {
			entity_name: name,
			pos_x: localPlayer.pos.x,
			pos_y: localPlayer.pos.y,
		}
		updatePositionDebounced(p);
		localPlayer.move(-400, 0);
	});
	onKeyPressRepeat("right", () => {
		localPlayer.move(400, 0);
		const p = {
			entity_name: name,
			pos_x: localPlayer.pos.x,
			pos_y: localPlayer.pos.y,
		}
		updatePositionDebounced(p);
	});

	setGravity(1600);

	const remotePlayer = add([
			  sprite("bean"),
			  pos(100, 80),
			  area(),
			  body(),
	  ])

  let remotePlayerPosition = {
	pos_x: remotePlayer.pos.x,
	pos_y: remotePlayer.pos.y,
  }

	remotePlayer.onUpdate(() => {
	console.log("RemotePlayer.onUpdate");
	if (remotePlayer.pos.x !== remotePlayerPosition.pos_x || remotePlayer.pos.y !== remotePlayerPosition.pos_y) {
	  remotePlayer.moveTo(remotePlayerPosition.pos_x, remotePlayerPosition.pos_y);
	}
	})
	

	const onPlayerUpdates = (p: PositionRecord) => {
		if (p.entity_name === name) return;
	  console.log("Updating remote player position", p);
			remotePlayerPosition = {
				pos_x : p.pos_x,
				pos_y : p.pos_y,
		}
	}

	subscribeToPositions(onPlayerUpdates);
}

export { init };
