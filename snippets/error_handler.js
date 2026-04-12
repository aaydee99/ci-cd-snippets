export default {
    async fetch(request) {
        const response = await fetch(request);

        if (response.status < 500) {
            return response;
        }

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Something went wrong</title>
</head>
<body>
  <p>We're sorry, something went wrong. Please try again later.</p>
</body>
</html>`;

        return new Response(html, {
            status: response.status,
            headers: {
                "content-type": "text/html; charset=utf-8",
                "cache-control": "no-store",
            },
        });
    },
};
