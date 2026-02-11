import { Hono } from "hono";

export const detect = new Hono();

detect.get("/runtime", (c) => {
    const obj = {
        runtimeType: "unknown",
        bun_version: process.versions.bun,
        // Some Edge‑specific built‑in globals
        isGlobalFetch: typeof globalThis.fetch !== "undefined",
        isWebCrypto: typeof globalThis.crypto !== "undefined",

        isNextRuntime: process.env.NEXT_RUNTIME,
        isVercel: !!process.env.VERCEL,
        isVercelRegion: process.env.VERCEL_REGION,
        isEdge: process.env.NEXT_RUNTIME === "edge",
        isNodejs: process.env.NEXT_RUNTIME === "nodejs",

        inBunContext:
            typeof (globalThis as Record<string, unknown>).Bun !== 'undefined',

        // If we’re on Node.js until `process` is present and node‑specific features exist
        hasProcess: typeof process !== "undefined",
        nodeVersion: typeof process !== "undefined" ? process.version : null,

        // Vercel‑specific envs
        vercelEnv: process.env.VERCEL_ENV || "unknown",

        // Hints: Edge balances on Node‑style, but still with limitations like no direct TCP
        canReadEnv: !!process.env.BETTER_AUTH_SECRET,
    };

    // Heuristic: pure Edge usually has no Node `process.resourceUsage()` etc.,
    // and no direct Postgres‑style TCP sockets.
    if (obj.hasProcess && obj.nodeVersion) {
        obj.runtimeType = "nodejs";
    } else if (obj.isNextRuntime === "edge") {
        obj.runtimeType = "edge";
    } else if (obj.hasProcess && obj.vercelEnv === "development") {
        obj.runtimeType = "nodejs (dev)";
    } else {
        obj.runtimeType = "possibly edge / web worker";
    }


    return c.json(obj);
});
