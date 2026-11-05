<?php
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$appStore = 'https://apps.apple.com/us/app/pacematcher/id6752578460';
$googlePlay = 'https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en';
$clientPlatform = trim($_SERVER['HTTP_SEC_CH_UA_PLATFORM'] ?? '', " \t\n\r\0\x0B\"");

if (preg_match('/iPhone|iPad|iPod/i', $userAgent) || strcasecmp($clientPlatform, 'iOS') === 0) {
    $destination = $appStore;
} elseif (preg_match('/Android/i', $userAgent) || strcasecmp($clientPlatform, 'Android') === 0) {
    $destination = $googlePlay;
} else {
    $destination = null;
}

$source = $_GET['src'] ?? 'none';
if (!is_string($source)) {
    $source = 'none';
}
$source = preg_replace('/[^a-z0-9_-]/i', '', $source) ?: 'none';
error_log('get-app src=' . $source . ' target=' . ($destination ?? 'store-chooser'));

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
if ($destination === null) {
    header('Content-Type: text/html; charset=UTF-8');
    $appStoreJson = json_encode($appStore, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $googlePlayJson = json_encode($googlePlay, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    ?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f5f6f2">
    <title>Get PaceMatcher</title>
    <style>
        :root { color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
        body { min-height: 100vh; margin: 0; display: grid; place-items: center; background: #f5f6f2; color: #19241f; }
        main { width: min(100% - 40px, 420px); box-sizing: border-box; padding: 32px; border-radius: 24px; background: #fff; box-shadow: 0 16px 48px #19241f14; text-align: center; }
        h1 { margin: 0 0 8px; font-size: 28px; }
        p { margin: 0 0 24px; color: #536159; line-height: 1.5; }
        a { display: block; margin-top: 12px; padding: 14px 18px; border-radius: 999px; background: #195c43; color: #fff; font-weight: 650; text-decoration: none; }
        a.secondary { background: #eef3ef; color: #195c43; }
    </style>
</head>
<body>
    <main>
        <h1>Get PaceMatcher</h1>
        <p>Choose your app store to find your running people.</p>
        <a href="<?= htmlspecialchars($googlePlay, ENT_QUOTES, 'UTF-8') ?>">Get it on Google Play</a>
        <a class="secondary" href="<?= htmlspecialchars($appStore, ENT_QUOTES, 'UTF-8') ?>">Download on the App Store</a>
    </main>
    <script>
        const platform = [navigator.userAgent, navigator.userAgentData?.platform, navigator.platform].join(" ");
        const isAndroid = /Android/i.test(platform);
        const isIos = /iPhone|iPad|iPod/i.test(platform) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        if (isAndroid) window.location.replace(<?= $googlePlayJson ?>);
        else if (isIos) window.location.replace(<?= $appStoreJson ?>);
    </script>
</body>
</html>
    <?php
    exit;
}

header('Location: ' . $destination, true, 302);
exit;
