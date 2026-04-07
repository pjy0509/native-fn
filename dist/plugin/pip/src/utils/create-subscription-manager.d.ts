import { SubscriptionManager } from "../types/subscription-manager";
export default function createSubscriptionManager<T>(attach: () => void, detach: () => void): SubscriptionManager<T>;
