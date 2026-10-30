import * as client from "@aicore-fivem/lib/client";
import * as shared from "@aicore-fivem/lib/shared";

// Loaded by other resources (`client_script '@ai-lib/dist/client.js'`): the lib runs in their context as `aiLib`.
Object.assign(globalThis, { aiLib: { ...shared, ...client } });
