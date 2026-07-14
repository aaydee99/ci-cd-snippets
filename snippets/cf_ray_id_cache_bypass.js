export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      // In production Workers, request.headers.get("cf-ray") returns only the
      // hex portion (e.g. "a07190681e1f9080") — the datacenter suffix is
      // stripped from the incoming request header by the CF runtime.
      // request.cf.colo contains the IATA code (e.g. "KHI").
      // We reconstruct the full Ray ID: "a07190681e1f9080-KHI"
      // Ref: community.cloudflare.com/t/cf-ray-and-workers/20667
      const rayHex  = request.headers.get("cf-ray") ?? "unknown";
      const colo    = request.cf?.colo ?? "";
      const rayId   = colo ? `${rayHex}-${colo}` : rayHex;

      // ── Step 1: No ?cf_ray param → redirect so it's visible in the browser ──
      if (!url.searchParams.has("cf_ray")) {
        const redirectUrl = new URL(url);
        redirectUrl.searchParams.set("cf_ray", rayId);
        return Response.redirect(redirectUrl.toString(), 302);
      }

      // ── Step 2: ?cf_ray present → fetch origin with cache bypass via cf object ──
      const newRequest = new Request(request);

      const fetchOptions = {
        cf: {
          // Do not treat content as static or cache beyond CF defaults.
          cacheEverything: false,

          // TTL of 0 — cached asset expires immediately.
          cacheTtl: -1,

          // Unique cache key per request — ?cf_ray=<unique-rayId> ensures
          // no two requests share a cache key, so CF always goes to origin.
          cacheKey: url.toString(),
        },
      };

      const originResponse = await fetch(newRequest, fetchOptions);

      // Reconstruct the Response so headers are mutable
      const response = new Response(originResponse.body, originResponse);

      // Tell the browser not to cache this response either
      response.headers.set("Cache-Control", "no-store");

      // Expose the full Ray ID (with datacenter) for debugging
      response.headers.set("X-Injected-CF-Ray", rayId);

      return response;
    } catch (err) {
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  },
};