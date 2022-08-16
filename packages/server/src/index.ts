import Koa from "koa";
import { verifyPaste } from "@luogu-auth/core";

const PORT = parseInt(process.env.PORT ?? "3000", 10);

const app = new Koa();

app.use((ctx) =>
  verifyPaste(
    ctx.request.query.paste as string,
    ctx.request.query.content as string
  )
    .catch((e: Error) => e.message)
    .then((r) => {
      ctx.body = r;
    })
);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
