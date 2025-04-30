import { TABLES } from "./constants";
import { pb } from "./pocketbase";

const initUserProfile = async (userId: string) => {
	await pb.collection(TABLES.PROFILES).create({
		user: userId,
		sprite: 'bean',
	})

}


export const getUserProfile = async (userId: string) => {
	const user = await pb.collection(TABLES.PROFILES).getFirstListItem(`user="${userId}"`).catch(async (err) => {
		if (err.status === 404) {
			await initUserProfile(userId);
		}
	})
	return user
}

export const getUserSprite = async (userId: string): Promise<string> => {
	return getUserProfile(userId).then((user) => {
		return user.sprite ?? 'bean'
	}).catch((err) => {
		console.error("Error fetching user sprite", err);
		return 'bean'
	})
}

