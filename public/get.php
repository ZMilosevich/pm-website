<?php
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

$appStore = 'https://apps.apple.com/us/app/pacematcher/id6752578460';
$googlePlay = 'https://play.google.com/store/apps/details?id=com.pacematcher.frontend&hl=en';
$fallback = 'https://pacematcher.com/#app';

if (preg_match('/iPhone|iPad|iPod/i', $userAgent)) {
    $destination = $appStore;
} elseif (preg_match('/Android/i', $userAgent)) {
    $destination = $googlePlay;
} else {
    $destination = $fallback;
}

$source = $_GET['src'] ?? 'none';
if (!is_string($source)) {
    $source = 'none';
}
$source = preg_replace('/[^a-z0-9_-]/i', '', $source) ?: 'none';
error_log('get-app src=' . $source . ' target=' . $destination);

header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Location: ' . $destination, true, 302);
exit;
