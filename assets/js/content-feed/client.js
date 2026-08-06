/**
 * Content Feed client — list/get published posts for a siteId.
 * Depends on window.ContentFeedConfig (see config.js).
 */
(function (global) {
  "use strict";

  function cfg() {
    return global.ContentFeedConfig || {};
  }

  function assertConfig() {
    var c = cfg();
    if (!c.siteId) throw new Error("ContentFeedConfig.siteId is required");
    if (c.mode === "api" && !c.feedBase) {
      throw new Error("ContentFeedConfig.feedBase is required when mode=api");
    }
    if (c.mode !== "api" && (!c.supabaseUrl || !c.supabaseAnonKey)) {
      throw new Error("ContentFeedConfig supabaseUrl/supabaseAnonKey required when mode=supabase");
    }
    return c;
  }

  function qs(params) {
    return Object.keys(params)
      .filter(function (k) {
        return params[k] !== undefined && params[k] !== null && params[k] !== "";
      })
      .map(function (k) {
        return encodeURIComponent(k) + "=" + encodeURIComponent(params[k]);
      })
      .join("&");
  }

  async function listViaApi(c, page, pageSize) {
    var url =
      c.feedBase.replace(/\/$/, "") +
      "/posts?" +
      qs({ site: c.siteId, page: page, pageSize: pageSize });
    var res = await fetch(url);
    if (!res.ok) throw new Error("Feed list failed (" + res.status + ")");
    return res.json();
  }

  async function getViaApi(c, slug) {
    var url =
      c.feedBase.replace(/\/$/, "") +
      "/posts/" +
      encodeURIComponent(slug) +
      "?" +
      qs({ site: c.siteId });
    var res = await fetch(url);
    if (res.status === 404) return { site: c.siteId, post: null };
    if (!res.ok) throw new Error("Feed get failed (" + res.status + ")");
    return res.json();
  }

  async function listViaSupabase(c, page, pageSize) {
    var from = (page - 1) * pageSize;
    var to = from + pageSize - 1;
    var now = new Date().toISOString();
    var select =
      "slug,title,excerpt,cover_image_url,published_at,category,read_minutes,primary_keyword,author:authors(slug,name,avatar_url)";
    var url =
      c.supabaseUrl.replace(/\/$/, "") +
      "/rest/v1/blog_posts?" +
      qs({
        select: select,
        site: "eq." + c.siteId,
        published_at: "lte." + now,
        order: "published_at.desc",
        offset: from,
        limit: pageSize,
      });
    var res = await fetch(url, {
      headers: {
        apikey: c.supabaseAnonKey,
        Authorization: "Bearer " + c.supabaseAnonKey,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) throw new Error("Supabase list failed (" + res.status + ")");
    var posts = await res.json();
    var range = res.headers.get("content-range") || "";
    var totalMatch = /\/(\d+|\*)/.exec(range);
    var total = totalMatch && totalMatch[1] !== "*" ? Number(totalMatch[1]) : posts.length;
    return { site: c.siteId, posts: posts, total: total, page: page, pageSize: pageSize };
  }

  async function getViaSupabase(c, slug) {
    var now = new Date().toISOString();
    var select = "*,author:authors(slug,name,avatar_url,role_title,bio)";
    var url =
      c.supabaseUrl.replace(/\/$/, "") +
      "/rest/v1/blog_posts?" +
      qs({
        select: select,
        slug: "eq." + slug,
        site: "eq." + c.siteId,
        published_at: "lte." + now,
        limit: 1,
      });
    var res = await fetch(url, {
      headers: {
        apikey: c.supabaseAnonKey,
        Authorization: "Bearer " + c.supabaseAnonKey,
      },
    });
    if (!res.ok) throw new Error("Supabase get failed (" + res.status + ")");
    var rows = await res.json();
    return { site: c.siteId, post: rows[0] || null };
  }

  async function listPosts(options) {
    var c = assertConfig();
    var page = (options && options.page) || 1;
    var pageSize = (options && options.pageSize) || 12;
    if (c.mode === "api") return listViaApi(c, page, pageSize);
    return listViaSupabase(c, page, pageSize);
  }

  async function getPost(slug) {
    var c = assertConfig();
    if (!slug) throw new Error("slug is required");
    if (c.mode === "api") return getViaApi(c, slug);
    return getViaSupabase(c, slug);
  }

  function postUrl(slug) {
    var c = cfg();
    var prefix = (c.pathPrefix || "/blog").replace(/\/$/, "");
    return prefix + "/" + String(slug).replace(/^\/+/, "");
  }

  global.ContentFeed = {
    listPosts: listPosts,
    getPost: getPost,
    postUrl: postUrl,
  };
})(typeof window !== "undefined" ? window : globalThis);
