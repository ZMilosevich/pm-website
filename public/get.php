<?php
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$appStore = 'https://apps.apple.com/us/app/pacematcher/id6752578460';
$googlePlay = 'https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en';
$clientPlatform = trim($_SERVER['HTTP_SEC_CH_UA_PLATFORM'] ?? '', " \t\n\r\0\x0B\"");
$source = $_GET['src'] ?? 'none';
if (!is_string($source)) {
    $source = 'none';
}
$source = preg_replace('/[^a-z0-9_-]/i', '', $source) ?: 'none';
$isIos = preg_match('/iPhone|iPad|iPod/i', $userAgent) || strcasecmp($clientPlatform, 'iOS') === 0;
$mayBeIPad = stripos($userAgent, 'Macintosh') !== false || strcasecmp($clientPlatform, 'macOS') === 0;

if ($isIos) {
    $destination = $appStore;
} elseif ($mayBeIPad) {
    // iPadOS may present a Mac-like user agent, so resolve touch devices in the browser.
    error_log('get-app src=' . $source . ' target=apple-device-check');
    $appStoreJson = json_encode($appStore, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    $googlePlayJson = json_encode($googlePlay, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Content-Type: text/html; charset=UTF-8');
    ?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        const isIPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        window.location.replace(isIPad ? <?= $appStoreJson ?> : <?= $googlePlayJson ?>);
    </script>
    <noscript><meta http-equiv="refresh" content="0;url=<?= htmlspecialchars($googlePlay, ENT_QUOTES, 'UTF-8') ?>"></noscript>
</head>
</html>
    <?php
    exit;
} else {
    $destination = $googlePlay;
}

error_log('get-app src=' . $source . ' target=' . ($destination === $appStore ? 'app-store' : 'google-play'));

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Location: ' . $destination, true, 302);
exit;
