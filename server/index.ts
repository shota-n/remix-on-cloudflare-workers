import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";

const app = new Hono<{
  Bindings: {
    ENV_TEST: string;
  };
}>();

app.use(poweredBy());

app.get("/api", (c) => {
  const { ENV_TEST } = c.env;
  return c.json({ message: "Hello, World!", envTest: ENV_TEST });
});

export default app;
