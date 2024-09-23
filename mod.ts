import { load } from "dotenv";
import { router } from "./utils/router.tsx";
import * as feed from "./routes/feed.tsx";
import * as index from "./routes/index.tsx";
import * as telemetry from "./routes/telemetry.tsx";

await load({ export: true });
router([
  [{ pathname: "/" }, index],
  [{ pathname: "/telemetry" }, telemetry],
  [{ pathname: "/:slug" }, feed],
]);
