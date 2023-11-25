/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import("../auth.ts").Auth;
  type DatabaseUserAttributes = {
    username: string;
  };
  type DatabaseSessionAttributes = {};
}
