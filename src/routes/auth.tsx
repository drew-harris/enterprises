import Elysia from "elysia";
import { auth, githubAuth } from "../auth";
import { config } from "../config";
import { ctx } from "../context";

export const authRoutes = new Elysia()
  .use(ctx)
  .get("/signin", async ({ set }) => {
    // TODO :Implement state cookie
    const [url, state] = await githubAuth.getAuthorizationUrl();
    url.searchParams.set(
      "redirect_uri",
      config.GITHUB_REDIRECT_DOMAIN + "/auth/callback",
    );
    console.log("URL!!!", url);
    set.redirect = url.toString();
    return;
  })
  .get("/auth/callback", async ({ log, request, query, set, cookie }) => {
    if (!query.code) {
      set.redirect = "/";
      return;
    }

    console.log("Test");
    try {
      const { getExistingUser, githubUser, createUser } =
        await githubAuth.validateCallback(query.code);

      const getUser = async () => {
        const existingUser = await getExistingUser();
        if (existingUser) return existingUser;
        const user = await createUser({
          attributes: {
            username: githubUser.login,
          },
        });
        return user;
      };

      const user = await getUser();
      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });
      const sessionCookie = auth.createSessionCookie(session);
      set.headers["Set-Cookie"] = sessionCookie.serialize();
      set.redirect = "/";
    } catch (error) {
      console.error(error);
    }
  });
