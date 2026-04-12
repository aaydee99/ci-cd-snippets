export default {
    async fetch(request) {
      const url = new URL(request.url);
  
      // Redirect /old/* to /new/*
      if (url.pathname.startsWith("/old/")) {
        const newPath = url.pathname.replace("/old/", "/new/");
        url.pathname = newPath;
        return Response.redirect(url.toString(), 301);
      }
  
      return fetch(request);
    },
};