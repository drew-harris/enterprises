import Elysia from "elysia";
import { auth, githubAuth } from "../auth";
import { ctx } from "../context";
import { LuciaError } from "lucia";

export const authRoutes = new Elysia()
  .use(ctx)
  .get("/signin", async ({ set }) => {
    // TODO :Implement state cookie
    const [url, state] = await githubAuth.getAuthorizationUrl();
    console.log("URL!!!", url);
    set.redirect = url.toString();
    return;
  })
  .get("/auth/callback", async ({ log, request, query, set, cookie }) => {
    if (!query.code) {
      set.redirect = "/";
      return;
    }

    console.log("CODE: ", query.code);

    console.log("Test");
    try {
      const { getExistingUser, githubUser, createUser } =
        await githubAuth.validateCallback(query.code);

      console.log("Validated callback");

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

      console.log("Got user");

      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      });

      console.log("Created session");
      const sessionCookie = auth.createSessionCookie(session);
      set.headers["Set-Cookie"] = sessionCookie.serialize();

      set.redirect = "/";
    } catch (error) {
      console.error(error);
      if (error instanceof LuciaError) {
        console.log(error.stack);
        console.log(error.name);
        console.log(error.detail);
        console.log(error.cause);
        console.log(error.message);
      }
      set.status = 500;
      return <div>Something went wrong</div>;
    }
  });
