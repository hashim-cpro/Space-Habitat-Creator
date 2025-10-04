import { useEffect, useRef } from "react";

/**
 * Custom hook for iPad/touch gestures on OrbitControls
 * - 1 finger: rotate
 * - 2 fingers: pan
 * - Pinch: zoom
 */
export function useTouchGestures(controlsRef, enabled = true) {
  const touchStartRef = useRef({});
  const lastDistanceRef = useRef(0);
  const lastMidpointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled || !controlsRef.current) return;

    const controls = controlsRef.current;
    const domElement = controls.domElement;

    const getTouchDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getTouchMidpoint = (touch1, touch2) => {
      return {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
    };

    const handleTouchStart = (e) => {
      const touches = e.touches;

      if (touches.length === 2) {
        // Two finger gesture
        e.preventDefault();

        lastDistanceRef.current = getTouchDistance(touches[0], touches[1]);
        lastMidpointRef.current = getTouchMidpoint(touches[0], touches[1]);

        // Disable rotation, enable panning for two fingers
        controls.enableRotate = false;
        controls.enablePan = true;
        controls.enableZoom = true;
      } else if (touches.length === 1) {
        // One finger gesture - rotate
        controls.enableRotate = true;
        controls.enablePan = false;
        controls.enableZoom = false;
      }
    };

    const handleTouchMove = (e) => {
      const touches = e.touches;

      if (touches.length === 2) {
        e.preventDefault();

        const currentDistance = getTouchDistance(touches[0], touches[1]);
        const currentMidpoint = getTouchMidpoint(touches[0], touches[1]);

        // Pinch to zoom
        if (lastDistanceRef.current > 0) {
          const delta = currentDistance - lastDistanceRef.current;
          const zoomSpeed = 0.01;

          // Adjust camera zoom based on pinch
          if (controls.object.isPerspectiveCamera) {
            const dollyScale = Math.pow(0.95, delta * zoomSpeed);
            controls.object.position.multiplyScalar(dollyScale);
          } else if (controls.object.isOrthographicCamera) {
            controls.object.zoom = Math.max(
              0.1,
              controls.object.zoom * (1 + delta * zoomSpeed * 0.1)
            );
            controls.object.updateProjectionMatrix();
          }

          controls.update();
        }

        lastDistanceRef.current = currentDistance;
        lastMidpointRef.current = currentMidpoint;
      }
    };

    const handleTouchEnd = (e) => {
      const touches = e.touches;

      if (touches.length < 2) {
        lastDistanceRef.current = 0;

        // Reset to single finger controls
        if (touches.length === 1) {
          controls.enableRotate = true;
          controls.enablePan = false;
          controls.enableZoom = false;
        } else {
          // No touches left
          controls.enableRotate = true;
          controls.enablePan = true;
          controls.enableZoom = true;
        }
      }
    };

    // Add touch event listeners
    domElement.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    domElement.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    domElement.addEventListener("touchend", handleTouchEnd);
    domElement.addEventListener("touchcancel", handleTouchEnd);

    return () => {
      domElement.removeEventListener("touchstart", handleTouchStart);
      domElement.removeEventListener("touchmove", handleTouchMove);
      domElement.removeEventListener("touchend", handleTouchEnd);
      domElement.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [controlsRef, enabled]);
}
