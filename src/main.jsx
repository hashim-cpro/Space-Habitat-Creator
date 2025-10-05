import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import UnifiedApp from "./UnifiedApp.jsx";
import AnalyticsLoader from "./AnalyticsLoader.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <AnalyticsLoader />
      <UnifiedApp />
    </>
  </StrictMode>
);
