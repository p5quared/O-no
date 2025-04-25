import { EventBus } from './EventBus';
import type { GameEvents } from './Events';

// Singleton instance
// Conduit is just a fun name https://en.wikipedia.org/wiki/Conduit
export const Conduit = new EventBus<GameEvents>();
