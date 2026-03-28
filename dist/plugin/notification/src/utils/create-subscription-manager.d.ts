import { SubscriptionManager } from "../types/subscription-manager";
export default function createSubscriptionManager<T, U>(attach: () => void, detach: () => void): SubscriptionManager<T, U>;
