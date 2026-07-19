hexo.extend.generator.register("category-index", function (locals) {
  const categoryDir = this.config.category_dir.replace(/\/?$/, "/");

  return {
    path: categoryDir,
    layout: ["archive", "index"],
    data: {
      archive: true,
      base: categoryDir,
      current: 1,
      current_url: categoryDir,
      next: 0,
      next_link: "",
      posts: locals.posts,
      prev: 0,
      prev_link: "",
      total: 1,
    },
  };
});
