import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
  const isPatchBay = context.url.pathname.startsWith("/patch-bay");

  if (isPatchBay) {
    const basicAuth = context.request.headers.get("authorization");

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const decoded = atob(authValue);
      const [username, password] = decoded.split(":");
      const expectedUsername = import.meta.env?.PATCH_BAY_USERNAME || process.env.PATCH_BAY_USERNAME;
      const expectedPassword = import.meta.env?.PATCH_BAY_PASSWORD || process.env.PATCH_BAY_PASSWORD;

      if (expectedUsername && expectedPassword && username === expectedUsername && password === expectedPassword) {
        return next();
      }
    }

    return new Response("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Patch Bay Admin"',
      },
    });
  }

  return next();
});
