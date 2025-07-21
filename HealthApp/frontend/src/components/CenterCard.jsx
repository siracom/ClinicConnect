// src/components/CenterCard.jsx
// Reusable centered card container.
// Uses Tailwind for brevity; see fallback CSS below if not using Tailwind.

import React from "react";
import PropTypes from "prop-types";

export function CenterCard({ children, maxWidth = "sm" }) {
  const maxWidthClass = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  }[maxWidth] || "max-w-sm";

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className={`w-full ${maxWidthClass} bg-white rounded-2xl shadow p-6`}>{children}</div>
    </div>
  );
}

CenterCard.propTypes = {
  children: PropTypes.node,
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
};

/* Plain CSS fallback (if not using Tailwind):
.center-wrapper { display:flex; align-items:center; justify-content:center; width:100vw; height:100vh; background:#f7f7f7; padding:1rem; }
.center-card { width:100%; max-width:24rem; background:#fff; border-radius:1rem; box-shadow:0 2px 8px rgba(0,0,0,.1); padding:1.5rem; }
*/