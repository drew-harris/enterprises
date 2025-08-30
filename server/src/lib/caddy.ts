import { type } from "arktype";
import * as neverthrow from "neverthrow";
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
    }),
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
          srv0: ServerConfig,
        }),
        http_port: "number?",
        https_port: "number?",
        protocols: "string[]?",
      }),
    }),
  }).describe("Caddy JSON config");

  const minimumDefaultConfig = CaddyJsonConfig.from({
    admin: { "@id": "admin", disabled: false, config: { persist: true } },
    apps: {
      http: {
        servers: {
          srv0: {
            listen: [":443"],
            routes: [],
          },
        },
      },
    },
  });

  const fetchCurrentConfig = (): neverthrow.ResultAsync<
    typeof CaddyJsonConfig.infer,
    Error
  > =>
    neverthrow
      .fromPromise(
        fetch("http://caddy:2019/config"),
        (e) => new Error("Failed to fetch caddy config", { cause: e }),
      )
      .andThen((response) =>
        neverthrow.fromPromise(
          response.json(),
          (e) => new Error("Failed to parse caddy config", { cause: e }),
        ),
      )
      // If its null, then set it to the default minimum
      .andThen((jsonResult) => {
        if (jsonResult === null) {
          return saveNewConfig(minimumDefaultConfig).map(
            () => minimumDefaultConfig,
          );
        }

        return parseToResult(CaddyJsonConfig, jsonResult);
      });

  const saveNewConfig = fn(CaddyJsonConfig, (config) => {
    return neverthrow
      .fromPromise(
        fetch("http://caddy:2019/load", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(config),
        }),
        (e) => new Error("Failed to post new caddy config", { cause: e }),
      )
      .andThen((res) =>
        res.ok
          ? neverthrow.okAsync(undefined)
          : neverthrow.errAsync(new Error("Failed to save caddy config")),
      );
  });

  export const updateCaddyConfig = (
    transform: (
      config: typeof CaddyJsonConfig.infer,
    ) => typeof CaddyJsonConfig.infer,
  ): neverthrow.ResultAsync<void, Error> => {
    log.debug("Updating caddy config");
    return fetchCurrentConfig()
      .map((oldConfig) => {
        const newConfig = transform(oldConfig);
        return newConfig;
      })
      .andThen(saveNewConfig)
      .map(() => undefined);
  };

  const upsertNamedRoute = fn(
    type({
      id: "string",
      domain: "string",
      dial: "string",
    }),
    (input) => {
      log.info({ input }, "Upserting named route");
      return updateCaddyConfig((old) => {
        const routes = old.apps.http.servers.srv0.routes;
        const currentRouteIndex = routes.findIndex(
          (route) => route["@id"] === input.id,
        );
        if (currentRouteIndex === -1) {
          old.apps.http.servers.srv0.routes.push({
            "@id": input.id,
            match: [{ host: [input.domain] }],
            handle: [
              {
                handler: "reverse_proxy",
                upstreams: [{ dial: input.dial }],
              },
            ],
          });
        } else {
          old.apps.http.servers.srv0.routes[currentRouteIndex] = {
            ...routes[currentRouteIndex],
            match: [{ host: [input.domain] }],
            handle: [
              {
                handler: "reverse_proxy",
                upstreams: [{ dial: input.dial }],
              },
            ],
          };
        }

        return old;
      });
    },
  );

  export const ensureMinimumConfigForOperation = (): neverthrow.ResultAsync<
    void,
    Error
  > => {
    log.info("Ensuring minimum caddy config");
    return upsertNamedRoute({
      dial: "server:3000",
      domain: `admin.${Env.env.DOMAIN}`,
      id: "admin-server",
    }).andThen(() => {
      return upsertNamedRoute({
        dial: "minio:9001",
        domain: `storage.${Env.env.DOMAIN}`,
        id: "storage-server",
      });
    });
  };
}
