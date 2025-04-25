type EventCallback<T = any> = (data: T) => void;
type EventSubscription = { cancel: () => void };

export class EventBus<EventMap extends Record<string, any>> {
	private listeners = new Map<keyof EventMap, EventCallback[]>();

	/**
	 * Subscribe to an event
	 * @param event The event name to subscribe to
	 * @param callback Function to call when event is emitted
	 * @returns Subscription object with cancel method
	 */
	on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): EventSubscription {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, []);
		}

		const callbacks = this.listeners.get(event)!;
		callbacks.push(callback as EventCallback);

		return {
			cancel: () => {
				const callbacks = this.listeners.get(event);
				if (callbacks) {
					const index = callbacks.indexOf(callback as EventCallback);
					if (index !== -1) {
						callbacks.splice(index, 1);
					}
				}
			}
		};
	}

	/**
	 * Subscribe to an event once
	 * @param event The event name to subscribe to
	 * @param callback Function to call when event is emitted
	 * @returns Subscription object with cancel method
	 */
	once<K extends keyof EventMap>(
		event: K,
		callback: EventCallback<EventMap[K]>
	): EventSubscription {
		const subscription = this.on(event, ((data: EventMap[K]) => {
			subscription.cancel();
			callback(data);
		}) as EventCallback);

		return subscription;
	}

	/**
	 * Emit an event with payload
	 * @param event The event name to emit
	 * @param data The event payload
	 */
	emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
		if (this.listeners.has(event)) {
			for (const callback of [...this.listeners.get(event)!]) {
				callback(data);
			}
		}
	}

	/**
	 * Remove all listeners for an event or all events
	 * @param event Optional event name to clear listeners for
	 */
	clear(event?: keyof EventMap): void {
		if (event) {
			this.listeners.delete(event);
		} else {
			this.listeners.clear();
		}
	}

	/**
	 * Get the number of listeners for an event
	 * @param event The event name to check
	 * @returns Number of listeners
	 */
	listenerCount(event: keyof EventMap): number {
		return this.listeners.get(event)?.length || 0;
	}
}
