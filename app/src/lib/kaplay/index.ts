import kaplay, { type KAPLAYCtx } from "kaplay";

let kInstance: KAPLAYCtx;
export function getKaplay() {
  if (!kInstance) {
    kInstance = kaplay();
  }
  return kInstance;
}
