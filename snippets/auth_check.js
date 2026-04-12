export default {
    async fetch(request) {
      const authHeader = request.headers.get("Authorization");
  
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 401 });
      }
  
      return fetch(request);
    },
};