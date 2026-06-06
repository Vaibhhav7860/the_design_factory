/**
 * Default Instagram community cards.
 *
 * These ship bundled in /public so the storefront strip is never empty
 * before an admin configures the section. They're also used to seed the
 * admin editor the first time it's opened (when no DB block exists yet),
 * so the admin can edit / replace the cards that are already live.
 *
 * Shape matches the admin card model: { url, href, name }. The storefront
 * component maps `url` → `src`.
 */
export const INSTAGRAM_DEFAULT_CARDS = [
  {
    url: "/images/insta_images/399DFFB7-4721-483D-9FB5-A3178BDA1791.webp",
    href: "https://www.instagram.com/reel/DW-_OuyxfDK/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 1",
  },
  {
    url: "/images/insta_images/687FEE19-B54D-4431-A5B5-D7EB1B66EB61.webp",
    href: "https://www.instagram.com/reel/DTPyhKKjKOZ/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 2",
  },
  {
    url: "/images/insta_images/94F7370F-AB2E-41D6-8EA9-2DA050F35979_f208c605-9bb3-4c0b-aebe-8112c9115826.webp",
    href: "https://www.instagram.com/reel/DQ7O28hkjbb/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 3",
  },
  {
    url: "/images/insta_images/AdultGiftTags-Design1_ArchShape_-04_95879508-0145-493b-89af-6b26f19035c7.webp",
    href: "https://www.instagram.com/reel/DMU_p-cTVQq/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 4",
  },
  {
    url: "/images/insta_images/AdultMoneyEnvelopes-01-06_96629764-477b-46e9-b398-bc5315fa6c95.webp",
    href: "https://www.instagram.com/reel/DI0ULKsxAsN/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 5",
  },
  {
    url: "/images/insta_images/AdultMoneyEnvelopes-02-05.webp",
    href: "https://www.instagram.com/reel/DH89XoAit5M/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
    name: "Instagram Reel 6",
  },
];
