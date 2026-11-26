import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";

const pageEntries = {
  home: "index.html",
  privacy: "privacy-policy/index.html",
  terms: "terms-of-service/index.html",
  app: "app/index.html",
  tracker: "app/tracker/index.html",
  explore: "app/explore/index.html",
  notFound: "404.html",
};

const associationPath = "/.well-known/apple-app-site-association";

const setAssociationContentType: Connect.NextHandleFunction = (req, res, next) => {
  if ((req.method === "GET" || req.method === "HEAD") && req.url?.split("?")[0] === associationPath) {
    res.setHeader("Content-Type", "application/json");
  }

  next();
};

function servePublicPages(): Plugin {
  const pages = new Set(Object.values(pageEntries).map((entry) => `/${entry}`));
  const middleware = (loadPage: () => Promise<string>): Connect.NextHandleFunction => (req, res, next) => {
    const url = req.url ?? "/";
    const pathname = url.split("?")[0];
    if (
      (req.method !== "GET" && req.method !== "HEAD") ||
      (req.headers.accept && !/text\/html|\*\/\*/.test(req.headers.accept)) ||
      pages.has(pathname)
    ) {
      next();
      return;
    }

    const directoryIndex = `${pathname}/index.html`;
    if (pages.has(directoryIndex)) {
      req.url = directoryIndex + url.slice(pathname.length);
      next();
      return;
    }

    void loadPage().then((html) => {
      res.writeHead(404, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": Buffer.byteLength(html),
      });
      res.end(req.method === "HEAD" ? undefined : html);
    }, next);
  };

  return {
    name: "pacematcher-public-pages",
    configureServer(server) {
      server.middlewares.use(setAssociationContentType);
      return () => server.middlewares.use(middleware(async () => {
        const html = await readFile(path.join(server.config.root, pageEntries.notFound), "utf8");
        return server.transformIndexHtml("/404.html", html);
      }));
    },
    configurePreviewServer(server) {
      server.middlewares.use(setAssociationContentType);
      const { root, build } = server.config;
      return () => server.middlewares.use(middleware(
        () => readFile(path.resolve(root, build.outDir, pageEntries.notFound), "utf8"),
      ));
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [react(), tailwindcss(), servePublicPages()],
  build: {
    target: "es2022",
    sourcemap: false,
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pageEntries).map(([name, entry]) => [name, path.resolve(__dirname, entry)]),
      ),
    },
  },
});
