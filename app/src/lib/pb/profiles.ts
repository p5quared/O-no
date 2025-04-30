import { TABLES } from "./constants";
import { pb } from "./pocketbase";

export const getUserProfile = async (userId: string) => {
  const user = await pb.collection(TABLES.PROFILES).getFirstListItem(`user="${userId}"`);
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

