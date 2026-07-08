import {
  useEffect,
  useRef,
} from "react";

export default function useExternalBarcodeScanner({
  onScan,
  enabled = true,
  minLength = 4,
  maxDelay = 100,
}) {
  const bufferRef = useRef("");
  const lastKeyTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  // Keep latest callback without
  // re-registering keyboard listener
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const resetBuffer = () => {
      bufferRef.current = "";
      lastKeyTimeRef.current = 0;
    };

    const handleKeyDown = (event) => {
      // ======================================
      // IGNORE MODIFIER SHORTCUTS
      // ======================================
      if (
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      ) {
        return;
      }

      // ======================================
      // IGNORE NORMAL FORM TYPING
      //
      // Search fields and quantity inputs
      // should continue working normally.
      // ======================================
      const target = event.target;

      const tagName =
        target?.tagName?.toLowerCase();

      const isTypingField =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isTypingField) {
        resetBuffer();
        return;
      }

      const now = Date.now();

      // ======================================
      // ENTER = COMPLETE SCAN
      // ======================================
      if (event.key === "Enter") {
        const barcode =
          bufferRef.current.trim();

        resetBuffer();

        if (
          barcode.length >= minLength
        ) {
          event.preventDefault();

          onScanRef.current?.(
            barcode
          );
        }

        return;
      }

      // ======================================
      // TAB SUPPORT
      //
      // Some scanners are configured with
      // Tab suffix instead of Enter.
      // ======================================
      if (event.key === "Tab") {
        const barcode =
          bufferRef.current.trim();

        if (
          barcode.length >= minLength
        ) {
          event.preventDefault();

          resetBuffer();

          onScanRef.current?.(
            barcode
          );

          return;
        }

        resetBuffer();
        return;
      }

      // Only collect printable characters
      if (event.key.length !== 1) {
        return;
      }

      // ======================================
      // DISTINGUISH SCANNER FROM HUMAN TYPING
      //
      // External scanners usually emit keys
      // very quickly.
      // ======================================
      if (
        lastKeyTimeRef.current &&
        now - lastKeyTimeRef.current >
          maxDelay
      ) {
        bufferRef.current = "";
      }

      bufferRef.current += event.key;

      lastKeyTimeRef.current = now;
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    enabled,
    minLength,
    maxDelay,
  ]);
}