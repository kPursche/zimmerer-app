import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // sharp laeuft nur in der Node-Runtime; die API-Routes setzen runtime="nodejs".
  serverExternalPackages: ["sharp"],
  // Eigenstaendige App in einem Unterverzeichnis: Workspace-Root explizit setzen,
  // damit Turbopack nicht die Lockfile des Eltern-Repos als Root waehlt.
  turbopack: { root: __dirname },
};

export default nextConfig;
