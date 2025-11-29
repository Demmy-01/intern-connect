import React from "react";
// Re-export a small wrapper around the `sonner` Toaster so other files can import
// from `src/components/ui/sonner` (or `@/components/ui/sonner` if you have an alias).
// The library provides the Toaster component and optional CSS.
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
// The sonner package exposes its CSS at ./dist/styles.css
import "sonner/dist/styles.css";

export function Toaster(props) {
  return <SonnerToaster {...props} />;
}

// Re-export the toast helper so callers can import { toast } from this file
export const toast = sonnerToast;

export default Toaster;
