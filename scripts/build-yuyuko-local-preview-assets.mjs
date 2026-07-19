if (typeof hexo === "undefined") {
  const [{ mkdir }, { default: sharp }] = await Promise.all([
    import("node:fs/promises"),
    import("sharp"),
  ]);

  await Promise.all([
    mkdir("source/images", { recursive: true }),
    mkdir("source/_data/avatar", { recursive: true }),
    mkdir("source/_data/covers", { recursive: true }),
  ]);

  await sharp("assets/yuyuko-local-preview-source/banner-original")
    .rotate()
    .resize(2560, 1200, { fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toFile("source/images/yuyuko-banner.webp");
  await sharp("assets/yuyuko-local-preview-source/banner-original")
    .rotate()
    .resize(1440, 1080, { fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toFile("source/images/yuyuko-banner-mobile.webp");
  await sharp("assets/yuyuko-local-preview-source/avatar-original")
    .rotate()
    .resize(600, 600, { fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toFile("source/_data/avatar/yuyuko-avatar.webp");
  await sharp("assets/yuyuko-local-preview-source/cover-original")
    .rotate()
    .resize(2400, 1350, { fit: "cover", position: "attention" })
    .webp({ quality: 85 })
    .toFile("source/_data/covers/yuyuko-cover.webp");
  await sharp("assets/yuyuko-local-preview-source/404-original")
    .rotate()
    .resize(2560, 1440, { fit: "cover", position: "attention" })
    .png({ compressionLevel: 9 })
    .toFile("source/images/reimu.png");
}
