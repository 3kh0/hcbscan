export default defineEventHandler((event) => {
  setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
  return `<!doctype html>
<html lang="en">
  <head>
  <title>HCBScan API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="app"></div>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
    <script>
      Scalar.createApiReference('#app', {
        url: "/api/v1/openapi.json",
        hideClientButton: true,
        theme: "deepSpace",
        agent: {
          disabled: true,
        },
        defaultOpenAllTags: true,
      });
    </script>
  </body>
</html>`;
});
