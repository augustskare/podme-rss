import { router } from "./utils/router.tsx";
import * as feed from "./routes/feed.tsx";
import * as index from "./routes/index.tsx";

router([
  [{ pathname: "/" }, index],
  [{ pathname: "/:slug" }, feed],
]);
