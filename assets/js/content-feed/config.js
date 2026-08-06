/**
 * Content Feed config — plug into any static site.
 * mode "supabase": read published posts directly (recommended for Auxspire; no hub uptime dependency)
 * mode "api": call Two Ears public Content Feed API (FEED_BASE)
 */
window.ContentFeedConfig = {
  siteId: "auxspire",
  mode: "supabase",
  pathPrefix: "/blog",
  supabaseUrl: "https://aljhjngmajmzzrgqksyg.supabase.co",
  supabaseAnonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsamhqbmdtYWptenpyZ3Frc3lnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwODU2MjYsImV4cCI6MjA5NjY2MTYyNn0.T9_p7WMDiRfM-wqsi2QsZk8xtdbI4dVcTPP-08No1l0",
  // When Two Ears is deployed, you can switch to:
  // mode: "api",
  // feedBase: "https://twoears.co/api/public/content",
};
