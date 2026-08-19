import Echo from "laravel-echo";
import Pusher from "pusher-js";

let echoInstance: Echo<"pusher"> | null = null;

export function getEcho(): Echo<"pusher"> {
    if (echoInstance) return echoInstance;

    if (typeof window === "undefined") {
        return null as unknown as Echo<"pusher">;
    }

    (window as any).Pusher = Pusher;

    echoInstance = new Echo<"pusher">({
        broadcaster: "pusher",
        key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
        forceTLS: true,
    });

    return echoInstance;
}
