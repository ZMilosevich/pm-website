import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Connect, type Plugin } from "vite";

const pageEntries = {
  home: "index.html",
  privacy: "privacy-policy/index.html",
  terms: "terms-of-service/index.html",
  notFound: "404.html",
};

function notFoundPage(): Plugin {
  const pages = new Set(Object.values(pageEntries).map((entry) => `/${entry}`));
  const middleware = (loadPage: () => Promise<string>): Connect.NextHandleFunction => (req, res, next) => {
    const pathname = (req.url ?? "/").split("?")[0];
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
      req.url = directoryIndex;
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
    name: "pacematcher-not-found",
    configureServer(server) {
      return () => server.middlewares.use(middleware(async () => {
        const html = await readFile(path.join(server.config.root, pageEntries.notFound), "utf8");
        return server.transformIndexHtml("/404.html", html);
      }));
    },
    configurePreviewServer(server) {
      const { root, build } = server.config;
      return () => server.middlewares.use(middleware(
        () => readFile(path.resolve(root, build.outDir, pageEntries.notFound), "utf8"),
      ));
    },
  };
}

export default defineConfig({
  appType: "mpa",
  plugins: [react(), tailwindcss(), notFoundPage()],
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
