import { router } from "./utils/router.ts";
import { index } from "./routes/index.tsx";
import { feed } from "./routes/feed.tsx";

router([
  [{ pathname: "/" }, index],
  [{ pathname: "/:slug" }, feed],
]);
