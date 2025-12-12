import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Foliage from "./Foliage";
import Ornaments from "./Ornaments";
import SpiralLights from "./SpiralLights";
import Snow from "./Snow";
import TopStar from "./TopStar";
import { TreeColors } from "../types";

interface ExperienceProps {
  mixFactor: number;
  colors: TreeColors;
  inputRef: React.MutableRefObject<{
    x: number;
    y: number;
    isDetected?: boolean;
  }>;
  userImages?: string[];
  signatureText?: string;
}

// COLORS FOR REALISTIC OBJECTS - Vibrant, cool and rich colors
const BALL_COLORS = [
  "#FF1744", // Vibrant Red
  "#FF5252", // Bright Pink-Red
  "#4CAF50", // Emerald Green
  "#00E676", // Neon Green
  "#FFD700", // Gold
  "#FFC107", // Amber
  "#2196F3", // Bright Blue
  "#00BCD4", // Cyan
  "#3F51B5", // Indigo
  "#9C27B0", // Purple
  "#E91E63", // Pink
  "#FF5722", // Deep Orange
  "#FFEB3B", // Yellow
  "#00E5FF", // Light Cyan
  "#7C4DFF", // Deep Purple
  "#FF4081", // Hot Pink
  "#18FFFF", // Aqua
  "#FF6F00", // Orange
];

const BOX_COLORS = [
  "#E53935", // Bright Red
  "#43A047", // Bright Green
  "#FFD700", // Gold
  "#FFFFFF", // White
  "#7B1FA2", // Bright Purple
  "#546E7A", // Blue Gray
  "#00ACC1", // Bright Teal
  "#FF8F00", // Bright Orange
  "#E91E63", // Pink
  "#3F51B5", // Indigo
  "#00BCD4", // Cyan
  "#FF5722", // Deep Orange
];

const STAR_COLORS = ["#FFD700", "#FFC107", "#FFEB3B", "#FFF59D", "#FFE082"]; // Gold and Yellow variations - more vibrant
const CRYSTAL_COLORS = [
  "#E0F7FA",
  "#B2EBF2",
  "#80DEEA",
  "#4DD0E1",
  "#26C6DA",
  "#00BCD4",
  "#00ACC1",
]; // Bright Ice Blues and Cyans - more cool tones
// Set Candy base to white, as stripes are handled via texture in Ornaments.tsx
const CANDY_COLORS = ["#FFFFFF"];

// Handles Camera Parallax, Tree Rotation (Drag) and Zoom (Wheel + Pinch)
const SceneController: React.FC<{
  inputRef: React.MutableRefObject<{
    x: number;
    y: number;
    isDetected?: boolean;
  }>;
  groupRef: React.RefObject<THREE.Group>;
}> = ({ inputRef, groupRef }) => {
  const { camera, gl } = useThree();
  const vec = useMemo(() => new THREE.Vector3(), []);

  // Interaction State
  const zoomTarget = useRef(32);
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);

  // Touch Pinch State
  const lastTouchDistance = useRef<number | null>(null);

  // Physics State
  const rotationVelocity = useRef(0.002); // Start with slow auto-spin

  // Hand Control State
  const wasDetected = useRef(false); // To detect the "grab" frame
  const grabOffset = useRef(0); // The rotation offset when grabbed

  // Smooth Input State (for Parallax)
  const currentInput = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.style.touchAction = "none";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomTarget.current += e.deltaY * 0.02;
      zoomTarget.current = THREE.MathUtils.clamp(zoomTarget.current, 12, 55);
    };

    const onPointerDown = (e: PointerEvent) => {
      // Allow primary pointer (mouse or first touch) to start dragging
      if (e.isPrimary && e.button === 0) {
        isDragging.current = true;
        lastPointerX.current = e.clientX;
        canvas.setPointerCapture(e.pointerId);
        rotationVelocity.current = 0; // Stop auto-spin on grab
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.isPrimary) {
        isDragging.current = false;
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      // Only rotate if primary pointer and NOT currently pinching
      if (
        e.isPrimary &&
        isDragging.current &&
        groupRef.current &&
        lastTouchDistance.current === null
      ) {
        const deltaX = e.clientX - lastPointerX.current;
        lastPointerX.current = e.clientX;
        // Mouse still uses impulse/velocity logic
        const rotationAmount = deltaX * 0.005;
        groupRef.current.rotation.y += rotationAmount;
        rotationVelocity.current = rotationAmount;
      }
    };

    // --- Touch Pinch Logic ---
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        if (e.cancelable) e.preventDefault(); // Stop browser zoom/scroll

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (lastTouchDistance.current !== null) {
          const diff = lastTouchDistance.current - distance;
          // Diff > 0: Pinched In -> Zoom Out (Increase Z)
          // Diff < 0: Pinched Out -> Zoom In (Decrease Z)

          const sensitivity = 0.15; // Zoom speed multiplier
          zoomTarget.current += diff * sensitivity;
          zoomTarget.current = THREE.MathUtils.clamp(
            zoomTarget.current,
            12,
            55
          );
        }

        lastTouchDistance.current = distance;
      }
    };

    const onTouchEnd = () => {
      lastTouchDistance.current = null;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    // Touch Listeners
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);

      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [gl, groupRef]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);

    // 1. Smooth Input Interpolation (Parallax Logic)
    const targetX = inputRef.current.x;
    const targetY = inputRef.current.y;
    const isHandDetected = !!inputRef.current.isDetected;

    // Slower smoothing for parallax (hides jitter from AI)
    const inputSmoothing = 4.0 * safeDelta;
    currentInput.current.x = THREE.MathUtils.lerp(
      currentInput.current.x,
      targetX,
      inputSmoothing
    );
    currentInput.current.y = THREE.MathUtils.lerp(
      currentInput.current.y,
      targetY,
      inputSmoothing
    );

    // 2. Camera Update
    const camX = currentInput.current.x * 4;
    const camY = currentInput.current.y * 2;
    const camZ = zoomTarget.current + Math.abs(currentInput.current.x) * 2;
    camera.position.lerp(vec.set(camX, camY, camZ), 4.0 * safeDelta); // Slightly faster camera catchup
    camera.lookAt(0, 0, 0);

    // 3. Tree Rotation Physics
    if (groupRef.current) {
      if (isHandDetected) {
        // --- HAND CONTROL (GRAB MODE) ---
        const HAND_ROTATION_FACTOR = Math.PI * 1.2;
        const targetHandRotation =
          currentInput.current.x * HAND_ROTATION_FACTOR;

        if (!wasDetected.current) {
          grabOffset.current = groupRef.current.rotation.y - targetHandRotation;
          rotationVelocity.current = 0;
        }

        const targetAngle = targetHandRotation + grabOffset.current;
        const smoothFactor = 6.0 * safeDelta;

        const prevRot = groupRef.current.rotation.y;
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          prevRot,
          targetAngle,
          smoothFactor
        );

        rotationVelocity.current = groupRef.current.rotation.y - prevRot;

        wasDetected.current = true;
      } else {
        // --- IDLE / MOUSE CONTROL (INERTIA MODE) ---
        if (wasDetected.current) {
          if (Math.abs(rotationVelocity.current) < 0.0001) {
            rotationVelocity.current = 0.002;
          }
          wasDetected.current = false;
        }

        // Apply velocity if NOT dragging manually
        if (!isDragging.current) {
          groupRef.current.rotation.y += rotationVelocity.current;
          const baseSpeed = 0.002;
          rotationVelocity.current = THREE.MathUtils.lerp(
            rotationVelocity.current,
            baseSpeed,
            safeDelta * 0.5
          );
        }
      }
    }
  });

  return null;
};

const SceneContent: React.FC<ExperienceProps> = ({
  mixFactor,
  colors,
  inputRef,
  userImages,
  signatureText,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // Object counts restored to original values (without HDR environment)
  const photoCount = Math.min(
    userImages && userImages.length > 0 ? userImages.length : 10,
    10
  );

  return (
    <>
      <SceneController inputRef={inputRef} groupRef={groupRef} />

      {/* Enhanced ambient light for better ornament visibility */}
      <ambientLight intensity={0.7} />

      {/* Additional ambient light with warm tone for ornaments */}
      <ambientLight intensity={0.3} color="#fff8e1" />

      <spotLight
        position={[20, 20, 20]}
        angle={0.4}
        penumbra={1}
        intensity={2.5}
        color="#fff5d0"
        castShadow={false}
      />

      {/* Enhanced point lights for better ornament illumination */}
      <pointLight position={[-10, 5, -10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[10, -5, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 10, 10]} intensity={1.0} color="#ffffff" />

      {/* Additional point lights for better coverage */}
      <pointLight position={[0, 15, 0]} intensity={0.8} color="#fff5d0" />
      <pointLight position={[-15, 8, -15]} intensity={0.6} color="#e3f2fd" />
      <pointLight position={[15, 8, -15]} intensity={0.6} color="#fce4ec" />

      {/* HDR Environment disabled to prevent WebGL context loss */}
      {/* <Environment
        files="public/hdri/potsdamer_platz_1k.hdr"
        background={false}
      /> */}

      {/* Stars count restored to original */}
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      <Snow mixFactor={mixFactor} />

      <group ref={groupRef} position={[0, 0, 0]}>
        <TopStar mixFactor={mixFactor} />
        <Foliage mixFactor={mixFactor} colors={colors} />
        <SpiralLights mixFactor={mixFactor} />

        {/* Ornament counts restored to original values */}
        <Ornaments
          mixFactor={mixFactor}
          type="BALL"
          count={60}
          scale={0.5}
          colors={BALL_COLORS}
        />
        <Ornaments
          mixFactor={mixFactor}
          type="BOX"
          count={30}
          scale={0.6}
          colors={BOX_COLORS}
        />
        <Ornaments
          mixFactor={mixFactor}
          type="STAR"
          count={25}
          scale={0.5}
          colors={STAR_COLORS}
        />
        <Ornaments
          mixFactor={mixFactor}
          type="CRYSTAL"
          count={40}
          scale={0.4}
          colors={CRYSTAL_COLORS}
        />
        <Ornaments
          mixFactor={mixFactor}
          type="CANDY"
          count={40}
          scale={0.8}
          colors={CANDY_COLORS}
        />
        <Ornaments
          mixFactor={mixFactor}
          type="PHOTO"
          count={photoCount}
          userImages={userImages}
          signatureText={signatureText}
        />
      </group>

      {/* Completely disabled post-processing to save GPU resources */}
      {/* Post-processing effects (Bloom, Vignette) are very GPU-intensive and can cause context loss */}
      {/* <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom 
            luminanceThreshold={0.95} 
            mipmapBlur={false}
            intensity={0.8} 
            radius={0.4}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer> */}
    </>
  );
};

const Experience = React.forwardRef<
  {
    getPhotoPositions: () => Array<{
      position: { x: number; y: number; z: number };
      index: number;
    }>;
  },
  ExperienceProps
>((props, ref) => {
  const [webglError, setWebglError] = React.useState<string | null>(null);

  // Expose photo positions via ref (simplified - not needed for current implementation)
  React.useImperativeHandle(ref, () => ({
    getPhotoPositions: () => [],
  }));

  const handleWebGLError = React.useCallback((error: ErrorEvent) => {
    console.error("WebGL Error:", error);
    setWebglError("WebGL 渲染错误，请刷新页面重试");
  }, []);

  const handleContextLost = React.useCallback((event: Event) => {
    event.preventDefault();
    console.warn("WebGL Context Lost");
    setWebglError("WebGL 上下文丢失，正在尝试恢复...");
  }, []);

  const handleContextRestored = React.useCallback(() => {
    console.log("WebGL Context Restored");
    setWebglError(null);
    // Force re-render by reloading the page
    window.location.reload();
  }, []);

  React.useEffect(() => {
    window.addEventListener("webglcontextlost", handleContextLost);
    window.addEventListener("webglcontextrestored", handleContextRestored);
    window.addEventListener("error", handleWebGLError);

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("webglcontextrestored", handleContextRestored);
      window.removeEventListener("error", handleWebGLError);
    };
  }, [handleContextLost, handleContextRestored, handleWebGLError]);

  if (webglError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-white z-50">
        <div className="text-center p-8">
          <div className="text-2xl mb-4">⚠️</div>
          <div className="text-lg mb-4">{webglError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded border border-white/40 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      dpr={[1, 1.25]}
      // OPTIMIZATION: Tighten near/far planes to increase depth buffer precision on mobile.
      // 5-80 covers the tree nicely (centered at 0, camera at 32).
      camera={{ position: [0, 0, 32], fov: 45, near: 5, far: 80 }}
      gl={{
        antialias: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "high-performance",
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        // Reduce precision to save memory
        precision: "lowp",
      }}
      onCreated={({ gl }) => {
        console.log("Canvas created, WebGL context initialized");

        // Check WebGL support and memory limits
        const canvas = gl.domElement;
        const webglContext =
          canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (webglContext) {
          const debugInfo = webglContext.getExtension(
            "WEBGL_debug_renderer_info"
          );
          if (debugInfo) {
            const vendor = webglContext.getParameter(
              debugInfo.UNMASKED_VENDOR_WEBGL
            );
            const renderer = webglContext.getParameter(
              debugInfo.UNMASKED_RENDERER_WEBGL
            );
            console.log("WebGL Vendor:", vendor);
            console.log("WebGL Renderer:", renderer);
          }

          // Check GPU memory limits
          const maxTextureSize = webglContext.getParameter(
            webglContext.MAX_TEXTURE_SIZE
          );
          const maxTextureImageUnits = webglContext.getParameter(
            webglContext.MAX_TEXTURE_IMAGE_UNITS
          );
          console.log("Max Texture Size:", maxTextureSize);
          console.log("Max Texture Units:", maxTextureImageUnits);

          // Warn if low-end GPU
          if (maxTextureSize < 4096) {
            console.warn(
              "Low-end GPU detected, using reduced quality settings"
            );
          }
        }

        // Monitor GPU memory usage
        const memoryMonitor = setInterval(() => {
          // Log memory info if available
          if (gl.info) {
            console.log(
              "GPU Memory - Programs:",
              gl.info.programs?.length || 0
            );
            // Note: geometries and textures counts may not be available in all Three.js versions
            try {
              const info = gl.info as any;
              if (info.geometries !== undefined) {
                console.log("GPU Memory - Geometries:", info.geometries);
              }
              if (info.textures !== undefined) {
                console.log("GPU Memory - Textures:", info.textures);
              }
            } catch (e) {
              // Ignore if properties don't exist
            }
          }
        }, 30000); // Every 30 seconds

        // Handle WebGL context lost
        const handleContextLost = (event: Event) => {
          event.preventDefault();
          console.error("WebGL Context Lost in Canvas");
          setWebglError(
            "WebGL 上下文丢失。已启用低性能模式以减少资源消耗。如果问题持续，请刷新页面或更新显卡驱动。"
          );

          // Try to prevent further context loss by reducing quality
          try {
            // Lower render quality
            gl.setPixelRatio(0.75);
            console.log("Reduced pixel ratio to prevent further context loss");
          } catch (e) {
            console.error("Failed to adjust render quality:", e);
          }
        };

        const handleContextRestored = () => {
          console.log("WebGL Context Restored in Canvas");
          setWebglError(null);
          // Reload to reinitialize everything
          setTimeout(() => window.location.reload(), 1000);
        };

        canvas.addEventListener("webglcontextlost", handleContextLost);
        canvas.addEventListener("webglcontextrestored", handleContextRestored);

        // Monitor for context loss
        const checkContext = () => {
          if (webglContext && webglContext.isContextLost()) {
            console.error("WebGL context is lost");
            setWebglError("WebGL 上下文已丢失");
          }
        };

        // Check periodically (every 5 seconds)
        const intervalId = setInterval(checkContext, 5000);

        // Cleanup
        return () => {
          canvas.removeEventListener("webglcontextlost", handleContextLost);
          canvas.removeEventListener(
            "webglcontextrestored",
            handleContextRestored
          );
          clearInterval(intervalId);
          clearInterval(memoryMonitor);
        };
      }}
      shadows
      style={{ touchAction: "none" }}
    >
      <SceneContent {...props} />
    </Canvas>
  );
});

Experience.displayName = "Experience";

export default Experience;
