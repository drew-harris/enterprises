import { type } from "arktype";
import { errAsync, fromPromise, okAsync, ResultAsync } from "neverthrow";
import { parseToResult } from "../arktype";
import { Env } from "../env";
import { fn } from "../fn";
import { makeLogger } from "../logging";
import { CaddyHandlers } from "./caddyHandlers";

export namespace Caddy {
  const log = makeLogger("caddy");

  const AdminConfig = type({
    "@id": "string?",
    disabled: "boolean",
    listen: "string?",
    origins: "string[]?",
    config: type({
      persist: "boolean?",
    }).optional(),
    remote: type({
      listen: "string",
    }).optional(),
  });

  const HandleConfig = type({ handler: "string" });

  const MatchConfig = type({ host: "string[]", "@id": "string?" });

  const RouteConfig = type({
    "@id": "string?",
    terminal: "boolean?",
    handle: HandleConfig.or(CaddyHandlers.ReverseProxyHandler).array(),
    match: MatchConfig.array(),
    group: "string?",
  });

  const ServerConfig = type({
    "@id": "string?",
    listen: "string[]",
    // total scam
    named_routes: type({
      "[string]": RouteConfig,
    }).optional(),
    routes: RouteConfig.array(),
  });

  const CaddyJsonConfig = type({
    admin: AdminConfig.optional(),
    apps: type({
      http: type({
        servers: type({
          "[string]": ServerConfig,
        }),
        http_port: "number?",
        https_port: "number?",
        protocols: "string[]?",
      }),
    }).optional(),
  })
    .or("null")
    .describe("Caddy JSON config");

  export const upsertRoutingPath = fn(
    type({
      domain: "string",
      // Simple container / port combo
      target: "string?",
      // If root access auth is required
      authRequired: "boolean",
    }),
    (params): ResultAsync<string, Error> => {
      return okAsync("hi");
    },
  );

  const fetchCurrentConfig = (): ResultAsync<
    typeof CaddyJsonConfig.infer,
    Error
  > =>
    fromPromise(
      fetch("http://caddy:2019/config"),
      () => new Error("Failed to fetch caddy config"),
    )
      .andThen((response) =>
        fromPromise(
          response.json(),
          () => new Error("Failed to parse caddy config"),
        ),
      )
      .andThen((jsonResult) => {
        return parseToResult(CaddyJsonConfig, jsonResult);
      });

  const saveNewConfig = fn(CaddyJsonConfig, (config) => {
    return fromPromise(
      fetch("http://caddy:2019/load", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(config),
      }),
      (_) => new Error("Failed to post new caddy config"),
    ).andThen((res) =>
      res.ok
        ? okAsync(undefined)
        : errAsync(new Error("Failed to save caddy config")),
    );
  });

  export const updateCaddyConfig = (
    transform: (
      config: typeof CaddyJsonConfig.infer,
    ) => typeof CaddyJsonConfig.infer,
  ): ResultAsync<void, Error> => {
    console.log("Updating caddy config");
    return fetchCurrentConfig()
      .andTee((config) => {
        log.info(config);
      })
      .orTee((err) => {
        log.error(err);
      })
      .map((oldConfig) => {
        const newConfig = transform(oldConfig);
        log.info({ newConfig }, "new config");
        return newConfig;
      })
      .andThen(saveNewConfig)
      .map(() => undefined);
  };

  export const ensureMinimumConfigForOperation = (): ResultAsync<
    any,
    Error
  > => {
    return updateCaddyConfig((old) => {
      old ||= {
        admin: { "@id": "admin", disabled: false, config: { persist: true } },
      };
      old.apps ||= {
        http: {
          servers: {
            srv0: {
              listen: [":443"],
              routes: [
                {
                  "@id": "admin",
                  match: [{ host: [`admin.${Env.get("DOMAIN")}`] }],
                  handle: [
                    {
                      handler: "reverse_proxy",
                      upstreams: [{ dial: "server:3000" }],
                    },
                  ],
                },
              ],
            },
          },
        },
      };
      return old;
    });
  };
}
