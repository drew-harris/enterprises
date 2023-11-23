import { liveReloadScript } from "../../scripts/reloadClient";
import { config } from "../config";

const safeScript = config.NODE_ENV === "development" ? liveReloadScript() : "";

export const BaseHtml = ({ children }: any) => {
  return (
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Drewh Cloud Enterprises</title>
        <script src="https://unpkg.com/htmx.org@1.9.3"></script>
        <script>{safeScript}</script>
        <link href="/styles.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
};
