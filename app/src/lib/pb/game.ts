import { pb } from "./pocketbase"

export type Position = {
  entity_name: string
  pos_x: number
  pos_y: number
}

export type PositionRecord = Position & {
	id: string;
	collectionId: string;
	collectionName: string;
	created: string;
	updated: string;
}
  
export async function updatePosition(p: Position){
  try {
	console.log("Updating position");
	await pb.collection('positions').create(p);
  	} catch (error) {
	console.error('Failed to update position:', error);
  	}
}

export async function subscribeToPositions(
	callback: (position: PositionRecord) => void
): Promise<() => void> {
	try {
		return await pb.collection('positions').subscribe('*', ({ action, record }) => {
			if (action === 'create') {
				console.log('Entity moved:', record);
				callback(record as PositionRecord);
			}
		}, {
		maxRetries: 3,
		reconnectAttempts: 3,
	  });
	} catch (error) {
		console.error('Failed to subscribe to position updates:', error);
		return () => {}; // Return empty function if subscription fails
	}
}

