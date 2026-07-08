import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  X,
  ScanLine,
  Loader2,
  Camera,
} from "lucide-react";

import {
  Html5Qrcode,
} from "html5-qrcode";

export default function BarcodeScanner({
  open,
  onClose,
  onDetected,
}) {
  const scannerRef = useRef(null);

  const detectedRef =
    useRef(false);

  const closingRef =
    useRef(false);

  const mountedRef =
    useRef(true);

  const [starting, setStarting] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================
  // FORCE STOP ALL CAMERA TRACKS
  // ==========================================
  const stopAllVideoTracks =
    useCallback(() => {
      const videos =
        document.querySelectorAll(
          "#manak-barcode-reader video"
        );

      videos.forEach((video) => {
        const stream =
          video.srcObject;

        if (
          stream &&
          typeof stream.getTracks ===
            "function"
        ) {
          stream
            .getTracks()
            .forEach((track) => {
              try {
                track.stop();
              } catch (err) {
                console.error(
                  "Track stop error:",
                  err
                );
              }
            });
        }

        try {
          video.pause();
          video.srcObject = null;
        } catch (err) {
          console.error(
            "Video cleanup error:",
            err
          );
        }
      });
    }, []);

  // ==========================================
  // COMPLETE SCANNER CLEANUP
  // ==========================================
  const cleanupScanner =
    useCallback(async () => {
      if (closingRef.current) {
        return;
      }

      closingRef.current = true;

      const scanner =
        scannerRef.current;

      scannerRef.current = null;

      if (scanner) {
        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }
        } catch (err) {
          console.warn(
            "Scanner stop warning:",
            err
          );
        }

        try {
          await scanner.clear();
        } catch (err) {
          console.warn(
            "Scanner clear warning:",
            err
          );
        }
      }

      // Extra safety:
      // explicitly stop browser MediaStream tracks
      stopAllVideoTracks();

      closingRef.current = false;
    }, [stopAllVideoTracks]);

  // ==========================================
  // START SCANNER
  // ==========================================
  useEffect(() => {
    mountedRef.current = true;

    if (!open) {
      return;
    }

    let cancelled = false;

    const startScanner = async () => {
      try {
        setStarting(true);
        setError("");

        detectedRef.current = false;
        closingRef.current = false;

        // Wait for scanner DOM node
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 150)
        );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          return;
        }

        const element =
          document.getElementById(
            "manak-barcode-reader"
          );

        if (!element) {
          throw new Error(
            "Scanner container not found."
          );
        }

        const scanner =
          new Html5Qrcode(
            "manak-barcode-reader"
          );

        scannerRef.current =
          scanner;

        await scanner.start(
          {
            facingMode:
              "environment",
          },
          {
            fps: 10,

            qrbox: {
              width: 280,
              height: 140,
            },

            aspectRatio:
              1.777778,
          },

          async (decodedText) => {
            if (
              detectedRef.current
            ) {
              return;
            }

            detectedRef.current = true;

            // IMPORTANT:
            // release camera first
            await cleanupScanner();

            // then process barcode
            if (
              mountedRef.current
            ) {
              onDetected(
                decodedText
              );
            }
          },

          () => {
            // Ignore normal
            // per-frame scan failures
          }
        );

        if (
          cancelled ||
          !mountedRef.current
        ) {
          await cleanupScanner();
          return;
        }

        setStarting(false);
      } catch (err) {
        console.error(
          "Camera scanner error:",
          err
        );

        await cleanupScanner();

        if (
          !cancelled &&
          mountedRef.current
        ) {
          setStarting(false);

          setError(
            "Camera could not be opened. Allow camera permission and try again."
          );
        }
      }
    };

    startScanner();

    // ========================================
    // CLEANUP WHEN MODAL UNMOUNTS / CLOSES
    // ========================================
    return () => {
      cancelled = true;

      cleanupScanner();
    };
  }, [
    open,
    onDetected,
    cleanupScanner,
  ]);

  // ==========================================
  // COMPONENT UNMOUNT
  // ==========================================
  useEffect(() => {
    return () => {
      mountedRef.current = false;

      cleanupScanner();
    };
  }, [cleanupScanner]);

  // ==========================================
  // PAGE HIDE / TAB CLOSE / REFRESH
  // ==========================================
  useEffect(() => {
    const handlePageHide = () => {
      stopAllVideoTracks();

      const scanner =
        scannerRef.current;

      if (
        scanner &&
        scanner.isScanning
      ) {
        scanner
          .stop()
          .catch(() => {});
      }
    };

    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "hidden"
        ) {
          stopAllVideoTracks();
        }
      };

    window.addEventListener(
      "pagehide",
      handlePageHide
    );

    window.addEventListener(
      "beforeunload",
      handlePageHide
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.removeEventListener(
        "pagehide",
        handlePageHide
      );

      window.removeEventListener(
        "beforeunload",
        handlePageHide
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [stopAllVideoTracks]);

  if (!open) {
    return null;
  }

  // ==========================================
  // CLOSE BUTTON
  // ==========================================
  const handleClose = async () => {
    // IMPORTANT:
    // stop camera completely first
    await cleanupScanner();

    // only then close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-5">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ScanLine size={21} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Scan Product
              </h2>

              <p className="text-xs text-slate-500">
                Point camera at barcode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close scanner"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* CAMERA AREA */}
        <div className="p-4 sm:p-5">
          <div className="relative overflow-hidden rounded-2xl bg-slate-950">
            <div
              id="manak-barcode-reader"
              className="min-h-[280px] w-full"
            />

            {/* STARTING */}
            {starting && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 text-white">
                <Loader2
                  size={30}
                  className="animate-spin"
                />

                <p className="mt-3 text-sm font-medium">
                  Starting camera...
                </p>
              </div>
            )}

            {/* SCAN FRAME */}
            {!starting &&
              !error && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                  <div className="relative h-36 w-[82%] max-w-[320px] rounded-2xl border-2 border-white/90">
                    <span className="absolute left-3 right-3 top-1/2 h-0.5 bg-red-500 shadow-lg" />
                  </div>
                </div>
              )}
          </div>

          {/* ERROR */}
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <Camera
                  size={20}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Camera unavailable
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Hold the product steady and
              keep the full barcode inside
              the frame.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}