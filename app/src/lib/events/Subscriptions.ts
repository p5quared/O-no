export type EventSubscriptionInstance = { cancel: () => void };
export class SubscriptionManager {
  private subscriptions: EventSubscriptionInstance[] = [];

  /**
   * Add a subscription to manage
   * @param subscription The subscription to manage
   */
  add(subscription: EventSubscriptionInstance): EventSubscriptionInstance {
    this.subscriptions.push(subscription);
    return subscription;
  }

  /**
   * Add multiple subscriptions to manage
   * @param subscriptions The subscriptions to manage
   */
  addAll(...subscriptions: EventSubscriptionInstance[]): EventSubscriptionInstance[] {
    this.subscriptions.push(...subscriptions);
    return subscriptions;
  }

  /**
   * Cancel all managed subscriptions
   */
  cancelAll(): void {
    for (const subscription of this.subscriptions) {
      subscription.cancel();
    }
    this.subscriptions = [];
  }
}
