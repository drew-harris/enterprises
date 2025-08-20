import { type } from "arktype";

export namespace CaddyHandlers {
  export const ReverseProxyHandler = type({
    handler: "'reverse_proxy'",
    upstreams: type({ dial: "string" }).array(),
  });
}
