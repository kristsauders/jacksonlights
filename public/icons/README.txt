PWA icons, generated from base.svg.

To regenerate after editing base.svg (or public/favicon.svg):
  node scripts/generate-icons.mjs

This writes icon-192.png, icon-512.png, maskable-512.png, favicon-32.png and
favicon-16.png using sharp. It won't overwrite base.svg if one already exists,
so edit that file directly (or public/favicon.svg for the small standalone
favicon) and re-run the script — there's no separate source-of-truth file to
keep in sync.
