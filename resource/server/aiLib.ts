import * as server from "@aicore-fivem/lib/server";
import * as shared from "@aicore-fivem/lib/shared";

// Loaded by other resources (`server_script '@ai-lib/dist/server.js'`): the lib runs in their context as `aiLib`.
Object.assign(globalThis, { aiLib: { ...shared, ...server } });
