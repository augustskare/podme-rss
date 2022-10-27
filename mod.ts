import { router } from "./utils/router.ts";
import { index } from "./routes/index.ts";
import { feed } from "./routes/feed.ts";

router([
  [{ pathname: "/" }, index],
  [{ pathname: "/:slug" }, feed],
]);
