const fs = require("node:fs/promises");
const path = require("node:path");
const assert = require("node:assert/strict");

const playwrightModulePath = process.env.PLAYWRIGHT_MODULE_PATH || "playwright";
const chromeExecutable =
  process.env.CHROME_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.PACEMATCHER_BASE_URL || "http://127.0.0.1:4173/";
const qaDir = process.env.PACEMATCHER_QA_DIR
  ? path.resolve(process.env.PACEMATCHER_QA_DIR)
  : path.resolve(__dirname, "../docs/agent-work/pacematcher-refinement/qa");
const { chromium } = require(playwrightModulePath);

function parseCssColor(value) {
  if (value.startsWith("#")) {
    const hex = value.slice(1);
    const expanded =
      hex.length === 3
        ? hex
            .split("")
            .map((channel) => `${channel}${channel}`)
            .join("")
        : hex;
    return [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16));
  }

  return (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
}

function colorContrast(foreground, background) {
  const luminance = (value) => {
    const linear = parseCssColor(value).map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };

  const foregroundLum = luminance(foreground);
  const backgroundLum = luminance(background);
  return Number(
    ((Math.max(foregroundLum, backgroundLum) + 0.05) /
      (Math.min(foregroundLum, backgroundLum) + 0.05)).toFixed(2),
  );
}

const viewports = [
  { width: 1440, height: 1000, name: "1440" },
  { width: 1024, height: 900, name: "1024" },
  { width: 768, height: 900, name: "768" },
  { width: 375, height: 812, name: "375" },
  { width: 320, height: 700, name: "320" },
];

async function scrollThroughPage(page) {
  const revealCount = await page.locator(".reveal").count();
  for (let index = 0; index < revealCount; index += 1) {
    process.stdout.write(`[qa] revealing ${index + 1}/${revealCount}\n`);
    await page.locator(".reveal").nth(index).scrollIntoViewIfNeeded();
    await page.waitForTimeout(90);
  }

  const productImage = page.locator(".product-shot img");
  await productImage.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const image = document.querySelector(".product-shot img");
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  });
  await productImage.evaluate(async (image) => {
    if (image instanceof HTMLImageElement && typeof image.decode === "function") {
      await image.decode().catch(() => undefined);
    }
  });
  await page.waitForTimeout(200);

  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((image) => {
        if (image.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          const timer = setTimeout(resolve, 5_000);
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
          image.addEventListener(
            "load",
            () => {
              clearTimeout(timer);
            },
            { once: true },
          );
        });
      }),
    );
  });
  await page.waitForTimeout(850);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(100);
}

async function collectLayoutMetrics(page, viewportName, response) {
  return page.evaluate(
    ({ viewportName: currentViewport, httpStatus }) => {
      const html = document.documentElement;
      const images = [...document.images].map((image) => ({
          src: image.getAttribute("src"),
          complete: image.complete,
          naturalWidth: image.naturalWidth,
        }));
      const anchors = [...document.querySelectorAll("a")].map((anchor) => ({
        text: anchor.textContent?.trim() ?? "",
        href: anchor.getAttribute("href"),
        target: anchor.getAttribute("target"),
        internalTargetExists:
          !anchor.getAttribute("href")?.startsWith("#") ||
          Boolean(document.querySelector(anchor.getAttribute("href"))),
      }));
      const sectionIds = [
        "how-it-works",
        "app",
        "safety",
        "our-story",
        "faq",
        "contact",
      ];
      const sectionHeights = Object.fromEntries(
        sectionIds.map((id) => [
          id,
          Math.round(document.querySelector(`#${id}`)?.getBoundingClientRect().height ?? 0),
        ]),
      );
      const fontSizes = {
        nav: parseFloat(getComputedStyle(document.querySelector(".desktop-nav a")).fontSize),
        heroBody: parseFloat(
          getComputedStyle(document.querySelector(".hero__description")).fontSize,
        ),
        stepTitle: parseFloat(getComputedStyle(document.querySelector(".step__copy h3")).fontSize),
        stepBody: parseFloat(getComputedStyle(document.querySelector(".step__copy p")).fontSize),
        appBody: parseFloat(getComputedStyle(document.querySelector(".app-feature p")).fontSize),
        footer: parseFloat(getComputedStyle(document.querySelector(".footer-links a")).fontSize),
        microLabel: parseFloat(getComputedStyle(document.querySelector(".eyebrow")).fontSize),
        howHeading: parseFloat(
          getComputedStyle(document.querySelector(".how-it-works h2")).fontSize,
        ),
        appHeading: parseFloat(getComputedStyle(document.querySelector(".app-panel h2")).fontSize),
        safetyHeading: parseFloat(getComputedStyle(document.querySelector(".safety h2")).fontSize),
        storyHeading: parseFloat(getComputedStyle(document.querySelector(".team h2")).fontSize),
      };
      const appLineCounts = [...document.querySelectorAll("#app-title span")].map(
        (span) => span.getClientRects().length,
      );
      const productShot = document.querySelector(".product-shot");
      const productImage = productShot?.querySelector("img");
      const productShotRect = productShot?.getBoundingClientRect();
      const productImageRect = productImage?.getBoundingClientRect();
      const heroImage = document.querySelector(".hero__image");
      const storeBadgeLinks = [...document.querySelectorAll(".store-badge")].map((link) => ({
        href: link.getAttribute("href"),
        target: link.getAttribute("target"),
        rel: link.getAttribute("rel"),
        label: link.getAttribute("aria-label"),
        minHeight: Math.round(link.getBoundingClientRect().height),
      }));
      const keyTextSelectors = [
        ".hero h1 span",
        ".hero__description",
        ".store-badge strong",
        ".how-it-works h2",
        ".step__copy h3",
        ".app-panel h2 span",
        ".safety h2",
        ".safety-card h3",
        ".team h2",
        ".team-member small",
        ".faq-item button span",
        ".contact h2",
      ];
      const clippedText = keyTextSelectors.flatMap((selector) =>
        [...document.querySelectorAll(selector)]
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map((element) => ({ selector, text: element.textContent?.trim() ?? "" })),
      );

      const parseRgb = (value) => {
        if (value.startsWith("#")) {
          const hex = value.slice(1);
          const expanded =
            hex.length === 3
              ? hex
                  .split("")
                  .map((channel) => `${channel}${channel}`)
                  .join("")
              : hex;
          return [0, 2, 4].map((offset) => parseInt(expanded.slice(offset, offset + 2), 16));
        }
        const channels = value.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
        return channels.slice(0, 3);
      };
      const relativeLuminance = ([red, green, blue]) => {
        const linear = [red, green, blue].map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
      };
      const contrastRatio = (foreground, background) => {
        const foregroundLum = relativeLuminance(parseRgb(foreground));
        const backgroundLum = relativeLuminance(parseRgb(background));
        return Number(
          ((Math.max(foregroundLum, backgroundLum) + 0.05) /
            (Math.min(foregroundLum, backgroundLum) + 0.05)).toFixed(2),
        );
      };
      const rootStyles = getComputedStyle(document.documentElement);
      const bodyBackground = getComputedStyle(document.body).backgroundColor;
      const panelBackground = getComputedStyle(document.querySelector(".app-panel")).backgroundColor;
      const safetyBackground = getComputedStyle(document.querySelector(".safety")).backgroundColor;
      const heroCopy = document.querySelector(".hero__copy");
      const heroCopyRect = heroCopy.getBoundingClientRect();
      const hero = document.querySelector(".hero");
      const heroRect = hero.getBoundingClientRect();
      const scrimBackgroundImage = getComputedStyle(document.querySelector(".hero__wash")).backgroundImage;
      const heroTextRight = Math.max(
        ...[...heroCopy.querySelectorAll("h1, p, a")].map(
          (element) => element.getBoundingClientRect().right,
        ),
      );
      const textProgress = Math.min(1, (heroTextRight - heroRect.left) / heroRect.width);
      const alphaStops = window.innerWidth <= 900
        ? [[0, 0.96], [0.72, 0.94], [1, 0.9]]
        : [[0, 0.96], [0.42, 0.94], [0.58, 0.9], [0.78, 0.42], [1, 0]];
      const upperStopIndex = alphaStops.findIndex(([position]) => position >= textProgress);
      const upperStop = alphaStops[Math.max(1, upperStopIndex)];
      const lowerStop = alphaStops[Math.max(0, upperStopIndex - 1)];
      const stopProgress = (textProgress - lowerStop[0]) / (upperStop[0] - lowerStop[0]);
      const scrimAlpha = lowerStop[1] + (upperStop[1] - lowerStop[1]) * stopProgress;
      const baseRgb = parseRgb(rootStyles.getPropertyValue("--color-bg"));
      const brightestScrimBackground = `rgb(${baseRgb
        .map((channel) => Math.round(channel * scrimAlpha + 255 * (1 - scrimAlpha)))
        .join(", ")})`;
      const accentFill = rootStyles.getPropertyValue("--color-accent-fill").trim();
      const contrastAudit = {
        bodyText: contrastRatio(
          getComputedStyle(document.querySelector(".step__copy p")).color,
          bodyBackground,
        ),
        panelBodyText: contrastRatio(
          getComputedStyle(document.querySelector(".app-feature p")).color,
          panelBackground,
        ),
        accentText: contrastRatio(
          getComputedStyle(document.querySelector(".step__number")).color,
          bodyBackground,
        ),
        microLabel: contrastRatio(
          getComputedStyle(document.querySelector(".hero__eyebrow")).color,
          brightestScrimBackground,
        ),
        heroDescription: contrastRatio(
          getComputedStyle(document.querySelector(".hero__description")).color,
          brightestScrimBackground,
        ),
        heroAccentHeading: contrastRatio(
          getComputedStyle(document.querySelector(".hero h1 em")).color,
          brightestScrimBackground,
        ),
        safetyPolicy: contrastRatio(
          getComputedStyle(document.querySelector(".safety__summary a")).color,
          safetyBackground,
        ),
        pageMicroLabel: contrastRatio(
          getComputedStyle(document.querySelector(".how-it-works .eyebrow")).color,
          bodyBackground,
        ),
        primaryButtonText: contrastRatio("#ffffff", accentFill),
      };
      const scrimAudit = {
        minimumAppliedAlpha: scrimAlpha,
        backgroundImage: scrimBackgroundImage,
        copyRight: Math.round(heroCopyRect.right),
        textRight: Math.round(heroTextRight),
        textWithinGuaranteedBand: heroTextRight <= heroRect.right + 1,
      };

      return {
        viewport: currentViewport,
        httpStatus,
        title: document.title,
        heading: document.querySelector("h1")?.innerText ?? "",
        clientWidth: html.clientWidth,
        scrollWidth: html.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        pageHeight: Math.round(html.scrollHeight),
        headerHeight: Math.round(
          document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0,
        ),
        heroHeight: Math.round(
          document.querySelector(".hero")?.getBoundingClientRect().height ?? 0,
        ),
        footerHeight: Math.round(
          document.querySelector(".site-footer")?.getBoundingClientRect().height ?? 0,
        ),
        sectionHeights,
        fontSizes,
        appLineCounts,
        clippedText,
        contrastAudit,
        scrimAudit,
        storeBadgeLinks,
        safetyCardCount: document.querySelectorAll(".safety-card").length,
        safetyText:
          document.querySelectorAll(".safety-card h3, .safety-card p").length > 0
            ? [...document.querySelectorAll(".safety-card h3, .safety-card p")]
                .map((element) => element.textContent?.trim() ?? "")
                .join(" ")
            : "",
        safetyPolicyHref: document.querySelector(".safety__summary a")?.getAttribute("href") ?? null,
        storyContributionCount: document.querySelectorAll(".team-member small").length,
        hasBetterMiles: Boolean(document.querySelector(".better-miles")),
        headerCta: {
          text: document.querySelector(".header-cta")?.textContent?.trim() ?? "",
          href: document.querySelector(".header-cta")?.getAttribute("href") ?? null,
        },
        locationFaq:
          document.querySelectorAll(".faq-item button span")[2]?.textContent?.trim() ?? "",
        locationFaqAnswer:
          document.querySelector("#faq-panel-2 p")?.textContent?.trim() ?? "",
        appImageCurrentSrc: productImage?.getAttribute("src") ?? null,
        productWidthRatio: productShotRect && productImageRect
          ? Number((productImageRect.width / productShotRect.width).toFixed(3))
          : 0,
        productImageWidth: productImageRect ? Math.round(productImageRect.width) : 0,
        productControlsPresent: Boolean(
          document.querySelector(".product-caption, .product-zoom, .screens-dialog"),
        ),
        productImageLoading: productImage?.getAttribute("loading") ?? null,
        productImageAlt: productImage?.getAttribute("alt") ?? null,
        productImageObjectFit: productImage
          ? getComputedStyle(productImage).objectFit
          : null,
        productShotStyles: productShot
          ? {
              position: getComputedStyle(productShot).position,
              display: getComputedStyle(productShot).display,
              minWidth: getComputedStyle(productShot).minWidth,
              minHeight: getComputedStyle(productShot).minHeight,
              alignItems: getComputedStyle(productShot).alignItems,
              alignSelf: getComputedStyle(productShot).alignSelf,
              overflow: getComputedStyle(productShot).overflow,
              margin: getComputedStyle(productShot).margin,
              backgroundColor: getComputedStyle(productShot).backgroundColor,
            }
          : null,
        productImageDetails: productImage
          ? {
              currentSrc: productImage.currentSrc,
              width: Math.round(productImageRect.width),
              height: Math.round(productImageRect.height),
              opacity: getComputedStyle(productImage).opacity,
              visibility: getComputedStyle(productImage).visibility,
              display: getComputedStyle(productImage).display,
              transform: getComputedStyle(productImage).transform,
              filter: getComputedStyle(productImage).filter,
            }
          : null,
        heroImageLayout: {
          leftPercent: parseFloat(getComputedStyle(heroImage).left) / html.clientWidth,
          widthPercent: parseFloat(getComputedStyle(heroImage).width) / html.clientWidth,
        },
        productCompositeContained:
          Boolean(productShotRect && productImageRect) &&
          productImageRect.left >= productShotRect.left - 1 &&
          productImageRect.right <= productShotRect.right + 1 &&
          productImageRect.top >= productShotRect.top - 1 &&
          productImageRect.bottom <= productShotRect.bottom + 1,
        faqInitiallyExpanded:
          document.querySelector("#faq-button-0")?.getAttribute("aria-expanded") ?? null,
        mobileNavInitiallyOpen: document.querySelector(".mobile-nav")?.classList.contains("is-open"),
        desktopNavDisplay: getComputedStyle(document.querySelector(".desktop-nav")).display,
        images,
        anchors,
      };
    },
    { viewportName, httpStatus: response?.status() ?? null },
  );
}

async function run() {
  await fs.mkdir(qaDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: chromeExecutable,
  });
  const layoutResults = [];
  const errors = [];

  try {
    for (const viewport of viewports) {
      process.stdout.write(`[qa] checking ${viewport.name}px\n`);
      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
      });
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`${viewport.name}: console: ${message.text()}`);
        }
      });
      page.on("pageerror", (error) => {
        errors.push(`${viewport.name}: pageerror: ${error.message}`);
      });

      const response = await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 30_000 });
      process.stdout.write(`[qa] loaded ${viewport.name}px\n`);
      await scrollThroughPage(page);
      process.stdout.write(`[qa] revealed ${viewport.name}px\n`);
      const metrics = await collectLayoutMetrics(page, viewport.name, response);
      layoutResults.push(metrics);
      process.stdout.write(`[qa] capturing ${viewport.name}px\n`);

      await page.screenshot({
        path: path.join(qaDir, `pacematcher-${viewport.name}.png`),
        fullPage: true,
        timeout: 60_000,
      });
      if (viewport.name === "1440") {
        await page.locator(".app-panel").screenshot({
          path: path.join(qaDir, "pacematcher-app-1440.png"),
        });
      } else if (viewport.name === "375") {
        await page.locator(".product-shot").screenshot({
          path: path.join(qaDir, "pacematcher-app-375.png"),
        });
      }
      process.stdout.write(`[qa] captured ${viewport.name}px\n`);
      await page.close();
    }

    process.stdout.write("[qa] checking interactions\n");
    const interactionPage = await browser.newPage({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 1,
    });
    interactionPage.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(`interaction: console: ${message.text()}`);
      }
    });
    interactionPage.on("pageerror", (error) => {
      errors.push(`interaction: pageerror: ${error.message}`);
    });
    await interactionPage.goto(baseUrl, { waitUntil: "networkidle" });

    await interactionPage.getByRole("button", { name: "Open navigation menu" }).click();
    const menuOpened = await interactionPage
      .getByRole("button", { name: "Close navigation menu" })
      .getAttribute("aria-expanded");
    const mobileNavVisible = await interactionPage
      .locator(".mobile-nav")
      .evaluate((element) => getComputedStyle(element).visibility);
    await interactionPage.locator('#mobile-navigation a[href="#how-it-works"]').focus();
    await interactionPage.keyboard.press("Escape");
    await interactionPage.waitForTimeout(50);
    const menuClosed = await interactionPage
      .getByRole("button", { name: "Open navigation menu" })
      .getAttribute("aria-expanded");
    const escapeFocus = await interactionPage.evaluate(
      () => document.activeElement?.getAttribute("aria-label") ?? null,
    );

    await interactionPage.getByRole("button", { name: "Open navigation menu" }).click();
    await interactionPage.setViewportSize({ width: 1100, height: 812 });
    await interactionPage.waitForTimeout(150);
    const resizeState = {
      menuExpanded: await interactionPage
        .locator(".menu-toggle")
        .getAttribute("aria-expanded"),
      mobileNavHidden: await interactionPage
        .locator(".mobile-nav")
        .getAttribute("aria-hidden"),
      desktopNavDisplay: await interactionPage
        .locator(".desktop-nav")
        .evaluate((element) => getComputedStyle(element).display),
    };
    await interactionPage.setViewportSize({ width: 375, height: 812 });
    await interactionPage.reload({ waitUntil: "networkidle" });

    await interactionPage.getByRole("button", { name: "Open navigation menu" }).click();
    await interactionPage.locator('#mobile-navigation a[href="#app"]').click();
    await interactionPage.waitForTimeout(500);
    const mobileNavigation = {
      hash: await interactionPage.evaluate(() => window.location.hash),
      menuExpanded: await interactionPage
        .getByRole("button", { name: "Open navigation menu" })
        .getAttribute("aria-expanded"),
    };

    await interactionPage.getByRole("button", { name: "Open navigation menu" }).click();
    await interactionPage.locator('#mobile-navigation a.button[href="#download"]').click();
    await interactionPage.waitForTimeout(500);
    const mobileDownloadNavigation = {
      hash: await interactionPage.evaluate(() => window.location.hash),
      menuExpanded: await interactionPage
        .getByRole("button", { name: "Open navigation menu" })
        .getAttribute("aria-expanded"),
    };

    const secondFaq = interactionPage.locator("#faq-button-1");
    await secondFaq.scrollIntoViewIfNeeded();
    await secondFaq.click();
    const secondExpanded = await secondFaq.getAttribute("aria-expanded");
    const secondAnswerVisible = await interactionPage
      .locator("#faq-panel-1")
      .evaluate((element) => getComputedStyle(element).visibility);
    const faqIconColors = {
      expanded: await interactionPage
        .locator(".faq-item.is-open button svg")
        .evaluate((element) => getComputedStyle(element).color),
      collapsed: await interactionPage
        .locator(".faq-item:not(.is-open) button svg")
        .first()
        .evaluate((element) => getComputedStyle(element).color),
    };
    await secondFaq.press("ArrowDown");
    const arrowFocus = await interactionPage.evaluate(() => document.activeElement?.id);

    const footerUrls = await interactionPage
      .locator(".footer-links a")
      .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
    const finalDownloadAppleHref = await interactionPage
      .locator(".contact .store-badge--apple")
      .getAttribute("href");

    await interactionPage.emulateMedia({ reducedMotion: "reduce" });
    await interactionPage.reload({ waitUntil: "networkidle" });
    const reducedMotion = await interactionPage.evaluate(() => ({
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      firstRevealOpacity: getComputedStyle(document.querySelector(".reveal")).opacity,
      firstRevealTransform: getComputedStyle(document.querySelector(".reveal")).transform,
    }));
    await interactionPage.close();

    const desktopNavigationPage = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      deviceScaleFactor: 1,
    });
    await desktopNavigationPage.goto(baseUrl, { waitUntil: "networkidle" });
    await desktopNavigationPage.locator('.desktop-nav a[href="#how-it-works"]').click();
    await desktopNavigationPage.waitForTimeout(650);
    const desktopNavigation = {
      hash: await desktopNavigationPage.evaluate(() => window.location.hash),
      sectionTop: await desktopNavigationPage
        .locator("#how-it-works")
        .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
      headerHeight: await desktopNavigationPage
        .locator(".site-header")
        .evaluate((element) => Math.round(element.getBoundingClientRect().height)),
    };
    await desktopNavigationPage.locator('.header-cta[href="#download"]').click();
    await desktopNavigationPage.waitForTimeout(650);
    const desktopDownloadNavigation = {
      hash: await desktopNavigationPage.evaluate(() => window.location.hash),
      targetTop: await desktopNavigationPage
        .locator("#download")
        .evaluate((element) => Math.round(element.getBoundingClientRect().top)),
    };

    const headerCta = desktopNavigationPage.locator(".header-cta");
    await headerCta.hover();
    await desktopNavigationPage.waitForTimeout(300);
    const headerHoverStyles = await headerCta.evaluate((element) => ({
      color: getComputedStyle(element).color,
      backgroundColor: getComputedStyle(element).backgroundColor,
    }));
    const headerHoverContrast = colorContrast(
      headerHoverStyles.color,
      headerHoverStyles.backgroundColor,
    );

    await desktopNavigationPage.mouse.move(0, 0);
    await headerCta.focus();
    await desktopNavigationPage.waitForTimeout(300);
    const headerFocusStyles = await headerCta.evaluate((element) => ({
      isFocused: element === document.activeElement,
      color: getComputedStyle(element).color,
      backgroundColor: getComputedStyle(element).backgroundColor,
    }));
    const headerFocusContrast = colorContrast(
      headerFocusStyles.color,
      headerFocusStyles.backgroundColor,
    );
    await desktopNavigationPage.close();

    process.stdout.write("[qa] evaluating assertions\n");
    const expectedStoreUrls = [
      "https://apps.apple.com/us/app/pacematcher/id6752578460",
      "https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en",
      "https://apps.apple.com/us/app/pacematcher/id6752578460",
      "https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en",
      "https://apps.apple.com/us/app/pacematcher/id6752578460",
      "https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en",
    ];

    for (const result of layoutResults) {
      assert.equal(result.httpStatus, 200, `${result.viewport}: expected HTTP 200`);
      assert.ok(
        result.scrollWidth <= result.clientWidth,
        `${result.viewport}: document overflows horizontally`,
      );
      assert.ok(
        result.bodyScrollWidth <= result.clientWidth,
        `${result.viewport}: body overflows horizontally`,
      );
      assert.ok(
        result.anchors.every((anchor) => anchor.internalTargetExists),
        `${result.viewport}: internal anchor target is missing`,
      );
      assert.ok(
        result.images.every((image) => image.complete && image.naturalWidth > 0),
        `${result.viewport}: an image failed to load`,
      );
      assert.equal(result.faqInitiallyExpanded, "true");
      assert.equal(result.productCompositeContained, true, `${result.viewport}: phones are clipped`);
      assert.equal(
        result.productControlsPresent,
        false,
        `${result.viewport}: app controls or captions overlap the phones`,
      );
      assert.equal(result.appImageCurrentSrc, "/images/app-screens-three.webp");
      assert.equal(result.productImageLoading, "lazy");
      assert.equal(result.productImageObjectFit, "contain");
      assert.match(result.productImageAlt, /^Three PaceMatcher app screens/i);
      assert.equal(result.hasBetterMiles, false, `${result.viewport}: obsolete photo section remains`);
      assert.equal(result.safetyCardCount, 3);
      assert.match(result.safetyText, /Manage location permissions through your device settings/i);
      assert.doesNotMatch(result.safetyText, /Map access/i);
      assert.equal(result.storyContributionCount, 3);
      assert.equal(result.safetyPolicyHref, "/privacy-policy/");
      assert.equal(result.headerCta.text, "Get the app");
      assert.equal(result.headerCta.href, "#download");
      assert.match(result.locationFaqAnswer, /device permissions/i);
      assert.match(result.locationFaqAnswer, /limit public exposure/i);
      assert.deepEqual(result.clippedText, [], `${result.viewport}: visible text is clipped`);
      assert.deepEqual(
        result.storeBadgeLinks.map((link) => link.href),
        expectedStoreUrls,
        `${result.viewport}: store destinations do not match`,
      );
      assert.ok(
        result.storeBadgeLinks.every(
          (link) =>
            link.target === "_blank" &&
            link.rel === "noopener noreferrer" &&
            link.minHeight >= 48,
        ),
        `${result.viewport}: store badge interaction contract is incomplete`,
      );
      assert.ok(
        Number.isFinite(result.scrimAudit.minimumAppliedAlpha) &&
          result.scrimAudit.minimumAppliedAlpha >= 0.89,
        `${result.viewport}: hero copy scrim alpha is insufficient`,
      );
      assert.match(result.scrimAudit.backgroundImage, /linear-gradient/i);
      assert.equal(
        result.scrimAudit.textWithinGuaranteedBand,
        true,
        `${result.viewport}: hero text extends beyond the guaranteed scrim band`,
      );
      assert.ok(
        result.contrastAudit.heroAccentHeading >= 3,
        `${result.viewport}: pink hero heading contrast is below 3:1`,
      );
      assert.ok(
        result.contrastAudit.heroDescription >= 4.5,
        `${result.viewport}: hero description contrast is below 4.5:1`,
      );
      assert.ok(
        result.contrastAudit.microLabel >= 4.5,
        `${result.viewport}: hero micro-label contrast is ${result.contrastAudit.microLabel}:1`,
      );
      assert.ok(
        result.contrastAudit.safetyPolicy >= 4.5,
        `${result.viewport}: safety policy link contrast is below 4.5:1`,
      );
    }

    const desktop = layoutResults.find((result) => result.viewport === "1440");
    const laptop = layoutResults.find((result) => result.viewport === "1024");
    assert.ok(desktop.pageHeight >= 3200 && desktop.pageHeight <= 5000, "page rhythm is off");
    assert.ok(desktop.headerHeight >= 88 && desktop.headerHeight <= 92, "header height is off");
    assert.ok(desktop.heroHeight >= 640 && desktop.heroHeight <= 720, "hero height is off");
    assert.ok(desktop.sectionHeights.app >= 600, "app showcase lacks visual real estate");
    assert.ok(desktop.sectionHeights.safety >= 260, "safety section is too compressed");
    assert.ok(desktop.sectionHeights["our-story"] >= 300, "team story is too compressed");
    assert.ok(desktop.sectionHeights.faq >= 370, "FAQ section is too compressed");
    assert.ok(desktop.sectionHeights.contact >= 200, "contact section is too compressed");
    assert.ok(desktop.fontSizes.nav >= 15.5, "desktop navigation text is too small");
    assert.ok(desktop.fontSizes.heroBody >= 17.5, "hero body text is too small");
    assert.ok(desktop.fontSizes.stepTitle >= 21, "step titles are too small");
    assert.ok(desktop.fontSizes.stepBody >= 17, "step body text is too small");
    assert.ok(desktop.fontSizes.appBody >= 17, "app feature body text is too small");
    assert.ok(desktop.fontSizes.footer >= 13.5, "footer text is too small");
    assert.ok(desktop.fontSizes.microLabel >= 12, "micro labels are too small");
    assert.ok(
      desktop.fontSizes.appHeading >= 56 && desktop.fontSizes.appHeading <= 60,
      "app heading size is off",
    );
    assert.deepEqual(desktop.appLineCounts, [1, 1], "app heading must be exactly two lines");
    assert.ok(desktop.productImageWidth >= 650, "three-phone composite is too small at desktop");
    assert.deepEqual(desktop.productShotStyles, {
      position: "relative",
      display: "flex",
      minWidth: "0px",
      minHeight: "544px",
      alignItems: "center",
      alignSelf: "stretch",
      overflow: "hidden",
      margin: "0px",
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
    assert.ok(
      Math.abs(desktop.heroImageLayout.leftPercent - 0.15) < 0.01,
      "desktop hero image should start 15vw from the left edge",
    );
    assert.ok(
      Math.abs(desktop.heroImageLayout.widthPercent - 1) < 0.01,
      "desktop hero image should span 100% of the hero width",
    );
    assert.ok(laptop.desktopNavDisplay === "flex", "1024px header should retain desktop navigation");
    assert.ok(laptop.productImageWidth >= 500, "three-phone composite is too small at 1024");
    assert.ok(desktop.contrastAudit.bodyText >= 4.5, "body text contrast is below 4.5:1");
    assert.ok(desktop.contrastAudit.panelBodyText >= 4.5, "panel body contrast is below 4.5:1");
    assert.ok(desktop.contrastAudit.accentText >= 4.5, "accent text contrast is below 4.5:1");
    assert.ok(desktop.contrastAudit.pageMicroLabel >= 4.5, "page labels are below 4.5:1");
    assert.ok(
      desktop.contrastAudit.primaryButtonText >= 4.5,
      "pink fill with white text is below 4.5:1",
    );
    assert.equal(menuOpened, "true");
    assert.equal(mobileNavVisible, "visible");
    assert.equal(menuClosed, "false");
    assert.equal(escapeFocus, "Open navigation menu");
    assert.equal(resizeState.menuExpanded, "false");
    assert.equal(resizeState.mobileNavHidden, "true");
    assert.equal(resizeState.desktopNavDisplay, "flex");
    assert.equal(mobileNavigation.hash, "#app");
    assert.equal(mobileNavigation.menuExpanded, "false");
    assert.equal(mobileDownloadNavigation.hash, "#download");
    assert.equal(mobileDownloadNavigation.menuExpanded, "false");
    assert.equal(desktopNavigation.hash, "#how-it-works");
    assert.equal(desktopDownloadNavigation.hash, "#download");
    assert.ok(desktopDownloadNavigation.targetTop < 220);
    assert.ok(headerHoverContrast >= 4.5, "outline CTA hover contrast is below 4.5:1");
    assert.equal(headerFocusStyles.isFocused, true);
    assert.ok(headerFocusContrast >= 4.5, "outline CTA focus contrast is below 4.5:1");
    assert.equal(secondExpanded, "true");
    assert.equal(secondAnswerVisible, "visible");
    assert.equal(arrowFocus, "faq-button-2");
    assert.deepEqual(faqIconColors, {
      expanded: "rgb(255, 0, 85)",
      collapsed: "rgb(255, 255, 255)",
    });
    assert.deepEqual(footerUrls, [
      "https://www.instagram.com/pacematcher/",
      "https://www.linkedin.com/company/pacematcher",
      "/privacy-policy/",
      "/terms-of-service/",
    ]);
    assert.equal(
      finalDownloadAppleHref,
      "https://apps.apple.com/us/app/pacematcher/id6752578460",
    );
    assert.equal(reducedMotion.scrollBehavior, "auto");
    assert.equal(reducedMotion.firstRevealOpacity, "1");
    assert.equal(reducedMotion.firstRevealTransform, "none");
    assert.equal(errors.length, 0, `browser errors: ${errors.join("; ")}`);

    const report = {
      checkedAt: new Date().toISOString(),
      baseUrl,
      viewports: layoutResults,
      interactions: {
        menuOpened,
        mobileNavVisible,
        menuClosed,
        escapeFocus,
        resizeState,
        mobileNavigation,
        mobileDownloadNavigation,
        desktopNavigation,
        desktopDownloadNavigation,
        headerHoverStyles,
        headerHoverContrast,
        headerFocusStyles,
        headerFocusContrast,
        secondExpanded,
        secondAnswerVisible,
        faqIconColors,
        arrowFocus,
        footerUrls,
        finalDownloadAppleHref,
        reducedMotion,
      },
      errors,
    };
    const serialized = JSON.stringify(report, null, 2);
    await fs.writeFile(path.join(qaDir, "browser-qa.json"), serialized);
    await fs.writeFile(path.join(qaDir, "browser-qa.log"), serialized);
    process.stdout.write(serialized);
    process.stdout.write("\n");
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
