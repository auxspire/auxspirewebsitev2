/**
 * Content Feed render helpers (markdown + cards).
 * Requires: marked (global), ContentFeed
 */
(function (global) {
  "use strict";

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return "";
    }
  }

  function markdownToHtml(md) {
    if (!md) return "";
    if (typeof global.marked !== "undefined" && global.marked.parse) {
      return global.marked.parse(md, { gfm: true, breaks: false });
    }
    // Minimal fallback
    return "<p>" + escapeHtml(md).replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>") + "</p>";
  }

  function renderCard(post) {
    var href = global.ContentFeed.postUrl(post.slug);
    var author = post.author && post.author.name ? escapeHtml(post.author.name) : "";
    var meta = [formatDate(post.published_at), post.read_minutes ? post.read_minutes + " min" : "", author]
      .filter(Boolean)
      .join(" · ");
    var cover = post.cover_image_url
      ? '<div class="blog-card__cover"><img src="' +
        escapeHtml(post.cover_image_url) +
        '" alt="" loading="lazy"></div>'
      : "";
    return (
      '<article class="card card--glass card--glow blog-card">' +
      cover +
      '<div class="blog-card__body">' +
      (post.category
        ? '<span class="blog-card__category">' + escapeHtml(post.category) + "</span>"
        : "") +
      "<h3><a href=\"" +
      escapeHtml(href) +
      '">' +
      escapeHtml(post.title) +
      "</a></h3>" +
      (post.excerpt ? "<p>" + escapeHtml(post.excerpt) + "</p>" : "") +
      (meta ? '<p class="blog-card__meta">' + escapeHtml(meta) + "</p>" : "") +
      '<a href="' +
      escapeHtml(href) +
      '" class="btn btn-outline btn-card-link">Read article</a>' +
      "</div></article>"
    );
  }

  function renderList(posts, emptyHtml) {
    if (!posts || !posts.length) {
      return emptyHtml || "<p>No published articles yet.</p>";
    }
    return '<div class="blog-grid">' + posts.map(renderCard).join("") + "</div>";
  }

  global.ContentFeedRender = {
    escapeHtml: escapeHtml,
    formatDate: formatDate,
    markdownToHtml: markdownToHtml,
    renderCard: renderCard,
    renderList: renderList,
  };
})(typeof window !== "undefined" ? window : globalThis);
