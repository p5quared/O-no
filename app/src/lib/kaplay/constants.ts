export const WORLD_WIDTH = 1024;
export const bgOriginalWidth = 1024;
export const bgOriginalHeight = 1536;
export const frogGodOriginalHeight = 806;

export const GRAVITY = 1000;

export const bgTargetWidth = WORLD_WIDTH * 2.5;
export const bgScale = bgTargetWidth / bgOriginalWidth;
export const bgTargetHeight = bgOriginalHeight * bgScale;
export const frogGodHeight = frogGodOriginalHeight * bgScale;
export const bgX = WORLD_WIDTH / 2 - bgTargetWidth / 2;

export const WORLD_HEIGHT = bgTargetHeight * 3 + frogGodHeight;
export const FINAL_PLATFORM_Y = frogGodHeight / 3 + 184;

export const GROUND_HEIGHT = 48;
export const PLATFORM_WIDTH = 100;
export const MIN_GAP = 70;
