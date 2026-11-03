const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModulePath = process.env.PLAYWRIGHT_MODULE_PATH || "playwright";
const chromeExecutable =
  process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.PACEMATCHER_BASE_URL || "http://127.0.0.1:4173/";
const qaDir = path.join(
  __dirname,
  "qa",
  process.env.PACEMATCHER_QA_SUITE || "local-static",
);
const { chromium } = require(playwrightModulePath);

const allViewports = [
  { name: "320", width: 320, height: 700 },
  { name: "768", width: 768, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];
const requestedViewports = process.env.PACEMATCHER_QA_VIEWPORTS
  ?.split(",")
  .map((width) => width.trim())
  .filter(Boolean);
const viewports = requestedViewports
  ? allViewports.filter((viewport) => requestedViewports.includes(viewport.name))
  : allViewports;

if (requestedViewports && viewports.length !== requestedViewports.length) {
  throw new Error(`Unsupported QA viewport selection: ${process.env.PACEMATCHER_QA_VIEWPORTS}`);
}

const pages = [
  {
    path: "/privacy-policy/",
    title: "Privacy Policy - PaceMatcher",
    heading: "Privacy Policy",
    date: "Last Updated: August 11, 2026",
    sectionCount: 13,
    firstSection: "1. Information We Collect",
    lastSection: "13. Contact Us",
    keyText: [
      "privacy@pacematcher.com",
      "The verification selfie, facial-analysis data, and match score are not retained by PaceMatcher after the verification process is completed. PaceMatcher retains only the resulting verification status.",
      "PaceMatcher is intended only for individuals who are 18 years of age or older.",
    ],
  },
  {
    path: "/terms-of-service/",
    title: "Terms of Service - PaceMatcher",
    heading: "Terms of Service",
    date: "Last updated: May 4, 2026",
    sectionCount: 17,
    firstSection: "1. About PaceMatcher",
    lastSection: "17. Contact Us",
    keyText: [
      "support@pacematcher.com",
      "PaceMatcher is not a medical, emergency, coaching, or professional safety service.",
      "You may upload or share information such as your name, photos, running preferences, location-related details, messages, and other content (“User Content”).",
      "Do not rely on PaceMatcher for emergency response, navigation in dangerous areas, medical decisions, or personal safety.",
      "PaceMatcher is provided “as is” and “as available.”",
    ],
  },
];

function urlFor(route) {
  return new URL(route, baseUrl).href;
}

async function inspectPage(page, pageDefinition, viewport, response) {
  const definitions = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const legalDocument = document.querySelector(".legal-document");
    const clipped = [...(legalDocument?.querySelectorAll("h1, h2, h3, p, li, a") ?? [])]
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => ({
        tag: element.tagName,
        text: element.textContent?.trim() ?? "",
      }));

    return {
      title: document.title,
      heading: document.querySelector("h1")?.textContent?.trim() ?? "",
      date:
        [...document.querySelectorAll("p")]
          .map((element) => element.textContent?.trim() ?? "")
          .find((text) => text.startsWith("Last Updated:") || text.startsWith("Last updated:")) ??
        "",
      sectionHeadings: [...document.querySelectorAll(".legal-document h2")].map(
        (heading) => heading.textContent?.trim() ?? "",
      ),
      subsectionHeadings: [...document.querySelectorAll(".legal-document h3")].map(
        (heading) => heading.textContent?.trim() ?? "",
      ),
      listCount: document.querySelectorAll(".legal-document ul").length,
      listItemCount: document.querySelectorAll(".legal-document li").length,
      text: legalDocument?.textContent ?? "",
      footerLinks: [...document.querySelectorAll(".footer-links a")].map((link) => ({
        text: link.textContent?.trim() ?? "",
        href: link.getAttribute("href"),
      })),
      internalLinks: [...(legalDocument?.querySelectorAll("a[href^='/']") ?? [])].map((link) => ({
        text: link.textContent?.trim() ?? "",
        href: link.getAttribute("href"),
      })),
      externalLinks: [
        ...(legalDocument?.querySelectorAll('a[href^="http"]') ?? []),
      ].map((link) => ({
        text: link.textContent?.trim() ?? "",
        href: link.getAttribute("href"),
        target: link.getAttribute("target"),
        rel: link.getAttribute("rel"),
      })),
      imagesLoaded: [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
      scrollWidth: Math.max(documentElement.scrollWidth, document.body.scrollWidth),
      clientWidth: documentElement.clientWidth,
      clipped,
      footerTop: Math.round(
        document.querySelector(".site-footer")?.getBoundingClientRect().top ?? 0,
      ),
      documentHeight: Math.round(documentElement.scrollHeight),
    };
  });

  assert.equal(response?.status(), 200, `${pageDefinition.path} did not return HTTP 200`);
  assert.equal(definitions.title, pageDefinition.title);
  assert.equal(definitions.heading, pageDefinition.heading);
  assert.equal(definitions.date, pageDefinition.date);
  assert.equal(definitions.sectionHeadings.length, pageDefinition.sectionCount);
  assert.equal(definitions.sectionHeadings[0], pageDefinition.firstSection);
  assert.equal(
    definitions.sectionHeadings.at(-1),
    pageDefinition.lastSection,
  );
  assert.ok(definitions.listCount >= 1, `${pageDefinition.path} has no semantic lists`);
  assert.ok(definitions.listItemCount >= 7, `${pageDefinition.path} list content is incomplete`);
  assert.ok(definitions.imagesLoaded, `${pageDefinition.path} has a failed image request`);
  assert.ok(
    definitions.scrollWidth <= definitions.clientWidth,
    `${pageDefinition.path} overflows horizontally at ${viewport.name}px`,
  );
  assert.deepEqual(
    definitions.clipped,
    [],
    `${pageDefinition.path} clips text at ${viewport.name}px`,
  );
  assert.deepEqual(definitions.footerLinks, [
    { text: "Instagram", href: "https://www.instagram.com/pacematcher/" },
    { text: "LinkedIn", href: "https://www.linkedin.com/company/pacematcher" },
    { text: "Privacy", href: "/privacy-policy/" },
    { text: "Terms", href: "/terms-of-service/" },
  ]);
  for (const expectedText of pageDefinition.keyText) {
    assert.ok(
      definitions.text.includes(expectedText),
      `${pageDefinition.path} is missing source text: ${expectedText}`,
    );
  }

  return {
    viewport: viewport.name,
    status: response?.status(),
    ...definitions,
  };
}

async function run() {
  await fs.mkdir(qaDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });
  const errors = [];
  const results = [];

  try {
    for (const pageDefinition of pages) {
      for (const viewport of viewports) {
        const page = await browser.newPage({
          viewport: { width: viewport.width, height: viewport.height },
          deviceScaleFactor: 1,
        });
        page.on("console", (message) => {
          if (message.type() === "error") {
            errors.push(`${pageDefinition.path}@${viewport.name}: console: ${message.text()}`);
          }
        });
        page.on("pageerror", (error) => {
          errors.push(`${pageDefinition.path}@${viewport.name}: pageerror: ${error.message}`);
        });

        const directResponse = await page.goto(urlFor(pageDefinition.path), {
          waitUntil: "networkidle",
          timeout: 30_000,
        });
        const direct = await inspectPage(page, pageDefinition, viewport, directResponse);

        const refreshResponse = await page.reload({ waitUntil: "networkidle", timeout: 30_000 });
        const refresh = await inspectPage(page, pageDefinition, viewport, refreshResponse);
        assert.equal(refresh.heading, pageDefinition.heading);

        await page.keyboard.press("Tab");
        const skipLinkFocus = await page.evaluate(() => {
          const active = document.activeElement;
          const rect = active?.getBoundingClientRect();
          return {
            className: active?.className ?? "",
            top: rect ? Math.round(rect.top) : null,
          };
        });
        assert.match(skipLinkFocus.className, /skip-link/);
        assert.ok(skipLinkFocus.top !== null && skipLinkFocus.top >= 0);

        await page.locator(".site-header .wordmark").focus();
        const logoFocus = await page.evaluate(() => ({
          role: document.activeElement?.tagName,
          href: document.activeElement?.getAttribute("href"),
        }));
        assert.deepEqual(logoFocus, { role: "A", href: "/" });

        const screenshotBase = `${pageDefinition.heading
          .toLowerCase()
          .replaceAll(" ", "-")}-${viewport.name}`;
        const topScreenshotName = `${screenshotBase}-top.png`;
        const screenshotName = `${screenshotBase}-full.png`;
        await page.screenshot({
          path: path.join(qaDir, topScreenshotName),
          fullPage: false,
          timeout: 60_000,
        });
        await page.screenshot({
          path: path.join(qaDir, screenshotName),
          fullPage: true,
          timeout: 60_000,
        });

        results.push({
          page: pageDefinition.path,
          refreshHeading: refresh.heading,
          skipLinkFocus,
          logoFocus,
          direct,
          topScreenshot: topScreenshotName,
          screenshot: screenshotName,
        });
        await page.close();
      }
    }

    const homePage = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    homePage.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(`home navigation: console: ${message.text()}`);
      }
    });
    homePage.on("pageerror", (error) => {
      errors.push(`home navigation: pageerror: ${error.message}`);
    });

    const homeResponse = await homePage.goto(baseUrl, {
      waitUntil: "networkidle",
      timeout: 30_000,
    });
    assert.equal(homeResponse?.status(), 200);
    assert.equal(await homePage.locator("h1").innerText(), "Your pace.\nYour people.");
    assert.deepEqual(
      await homePage.locator(".footer-links a").evaluateAll((links) =>
        links.map((link) => ({
          text: link.textContent?.trim() ?? "",
          href: link.getAttribute("href"),
        })),
      ),
      [
        { text: "Instagram", href: "https://www.instagram.com/pacematcher/" },
        { text: "LinkedIn", href: "https://www.linkedin.com/company/pacematcher" },
        { text: "Privacy", href: "/privacy-policy/" },
        { text: "Terms", href: "/terms-of-service/" },
      ],
    );
    assert.equal(
      await homePage.locator(".safety__summary a").getAttribute("href"),
      "/privacy-policy/",
    );

    await homePage.getByRole("link", { name: "Privacy", exact: true }).click();
    await homePage.waitForLoadState("networkidle");
    assert.equal(new URL(homePage.url()).pathname, "/privacy-policy/");
    assert.equal(await homePage.locator("h1").innerText(), "Privacy Policy");

    await homePage.getByRole("link", { name: "Terms", exact: true }).click();
    await homePage.waitForLoadState("networkidle");
    assert.equal(new URL(homePage.url()).pathname, "/terms-of-service/");
    assert.equal(await homePage.locator("h1").innerText(), "Terms of Service");

    const termsPrivacyLinks = await homePage
      .locator('.legal-document a[href="/privacy-policy/"]')
      .evaluateAll((links) =>
        links.map((link) => ({
          text: link.textContent?.trim() ?? "",
          href: link.getAttribute("href"),
        })),
      );
    assert.deepEqual(termsPrivacyLinks, [
      {
        text: "https://pacematcher.com/privacy",
        href: "/privacy-policy/",
      },
    ]);
    assert.deepEqual(
      await homePage.locator('.legal-document a[href^="https://"]').evaluateAll((links) =>
        links.map((link) => ({
          href: link.getAttribute("href"),
          target: link.getAttribute("target"),
          rel: link.getAttribute("rel"),
        })),
      ),
      [
        {
          href: "https://support.google.com/googleplay/android-developer/answer/9858738",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        {
          href: "https://developer.apple.com/support/terms/",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      ],
    );

    await homePage.getByRole("link", { name: "Back to home" }).click();
    await homePage.waitForLoadState("networkidle");
    assert.equal(new URL(homePage.url()).pathname, "/");
    assert.equal(await homePage.locator("h1").innerText(), "Your pace.\nYour people.");
    await homePage.close();

    const report = {
      checkedAt: new Date().toISOString(),
      baseUrl,
      suite: process.env.PACEMATCHER_QA_SUITE || "local-static",
      results,
      interactions: {
        homeHeading: "Your pace.\nYour people.",
        footerPrivacyNavigation: "/privacy-policy/",
        footerTermsNavigation: "/terms-of-service/",
        termsPrivacyLinks,
        homeReturnNavigation: "/",
      },
      errors,
    };
    assert.deepEqual(errors, []);

    const serialized = JSON.stringify(report, null, 2);
    await fs.writeFile(path.join(qaDir, "browser-qa.json"), serialized);
    await fs.writeFile(path.join(qaDir, "browser-qa.log"), `${serialized}\n`);
    process.stdout.write(`${serialized}\n`);
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
