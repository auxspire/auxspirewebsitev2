# Content Feed kit (plug-and-play)

Drop these files onto any static site to show posts published from the Two Ears content hub.

## Files

| File | Role |
|---|---|
| `config.js` | Set `siteId`, `mode`, credentials / API base |
| `client.js` | `ContentFeed.listPosts()` / `getPost(slug)` |
| `render.js` | Cards + markdown helpers |

## Config

```js
window.ContentFeedConfig = {
  siteId: "auxspire",       // must match registry entry in Two Ears src/lib/sites.ts
  mode: "supabase",         // or "api"
  pathPrefix: "/blog",
  supabaseUrl: "https://....supabase.co",
  supabaseAnonKey: "eyJ...",
  // mode: "api",
  // feedBase: "https://twoears.co/api/public/content",
};
```

## Usage

```html
<script src="/assets/js/content-feed/config.js"></script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="/assets/js/content-feed/client.js"></script>
<script src="/assets/js/content-feed/render.js"></script>
<script>
  ContentFeed.listPosts({ page: 1, pageSize: 12 }).then(function (data) {
    document.getElementById("feed").innerHTML =
      ContentFeedRender.renderList(data.posts);
  });
</script>
```

## Adding a new website

1. Add the site to Two Ears `src/lib/sites.ts`
2. Copy this kit and set `siteId`
3. Add listing + article pages and SPA-style slug routing
4. In admin, choose the new site under **Publish to site**
