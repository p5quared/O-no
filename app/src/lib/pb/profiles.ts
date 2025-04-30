import { TABLES } from "./constants";
import { pb } from "./pocketbase";

export const getUserProfile = async (userId: string) => {
  const user = await pb.collection(TABLES.PROFILES).getFirstListItem(`user="${userId}"`);
  return user
}

