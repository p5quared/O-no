import kaplay, { type KAPLAYCtx } from "kaplay";

let kInstance: KAPLAYCtx;
export function getKaplay() {
  if (!kInstance) {
    kInstance = kaplay();
  }
  return kInstance;
}

export const KAPLAY_SPRITES = [
  "bean",
  "bag",
  "bobo",
  "ghosty",
  "ghostiny",
  "mark",
  "gigagantrum",
  "tga",
  "zombean",
  "apple",
  "grape",
  "meat",
  "mushroom",
  "watermelon",
  "pineapple",
  "egg",
  "cloud",
  "door",
  "heart",
  "moon",
  "portal",
  "sun",
  "steel",
];
