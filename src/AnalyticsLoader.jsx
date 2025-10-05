import { useEffect } from "react";

// Injects Vercel Analytics script for a Vite + React app (non-Next.js)
export default function AnalyticsLoader() {
  useEffect(() => {
    if (document.getElementById("__vercel_analytics_script")) return;
    const script = document.createElement("script");
    script.id = "__vercel_analytics_script";
    script.defer = true;
    script.src = "https://va.vercel-scripts.com/v1/script.js";
    document.head.appendChild(script);
  }, []);
  return null;
}
