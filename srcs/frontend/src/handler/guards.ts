
import { authenticate } from "./loginHandler";

type GuardTypes = true | false | "offline" | "string" | string;
export type Guard = () => Promise<GuardTypes>;

export const authGuard: Guard = async () => {
    const result = await authenticate();

    return result;
}