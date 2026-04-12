export default {
    async fetch(request) {
      const response = await fetch(request);
      const newResponse = new Response(response.body, response);
      newResponse.headers.set("X-Deployed-By", "GitHub-Actions");
      return newResponse;
    },
};