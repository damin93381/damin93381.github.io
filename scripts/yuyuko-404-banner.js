hexo.extend.filter.register("template_locals", (locals) => {
  if (locals.page?.type === "404") {
    locals.page.banner = "/images/reimu.png";
  }
  return locals;
});
