# 🛠️ Liquid Glass Finance - Technical Implementation Manual

**Version:** 2.1.0 (Shader Engine Upgrade)
**Renderer Target:** CanvasKit (WebGL) / Skia
**Core Dependency:** `oc_liquid_glass`

---

## 1. Architecture Overview (The "Glass Engine")

The application's signature visual aesthetic—the "Liquid Glass" effect—is not merely a background blur. It is a **multi-layered composite rendering pipeline** that simulates physical optical properties: refraction, specular reflection, and caustics.

### 1.1 The 6-Layer Composition Stack
The `LiquidGlass` widget (`lib/widgets/liquid_glass.dart`) is the fundamental building block. Unlike standard Flutter `BackdropFilter` implementations, it constructs the glass effect using a precise `Stack` of 6 render layers to achieve 1:1 parity with advanced CSS `backdrop-filter` compositions.

| Layer | Component | Function | Technical Implementation |
| :--- | :--- | :--- | :--- |
| **0** | `BoxShadow` | Soft Depth | `BlurRadius: 80`, `Offset: (0, 32)`, `Opacity: 0.75` (Deep ambient occlusion) |
| **1** | `OCLiquidGlassGroup` | **Refraction Engine** | Compiles the GLSL shader. Distorts background pixels based on a normal map simulation. |
| **2** | `Container(Gradient)` | Base Tint | Provides the surface color. Supports custom gradients for Wallet Cards. Default: `rgba(15, 23, 42, 0.72)`. |
| **3** | `LinearGradient` | **Specular Highlight** | Simulates a light source from Top-Left. `Color(0xFFF8FAFC).withOpacity(0.15)` blending to transparent. |
| **4** | `RadialGradient` | Vignette | Darkens the bottom-right edges to add volume. Mix-blend-mode simulation via `Colors.black.withOpacity(0.6)`. |
| **5** | `Border` | Edge Definition | 1px border `rgba(148, 163, 184, 0.25)` to simulate cut glass edges. |

### 1.2 Shader Configuration (`OCLiquidGlassSettings`)
The GLSL shader is tuned with specific float values to balance performance and visual realism.

```dart
settings: OCLiquidGlassSettings(
  blurRadiusPx: isStrong ? 28.0 : 20.0, // Matches CSS --blur-strong
  refractStrength: isStrong ? 0.8 : 0.5, // High IOR (Index of Refraction) simulation
  specStrength: 2.0,                     // Intense highlights
  specWidth: 1.5,
  specPower: 5.0,                        // Sharpness of the reflection
  specAngle: 0.8,
  distortFalloffPx: 30,                  // Softens distortion at edges to prevent clipping
  blendPx: 20,
)
```

---

## 2. Component Implementation Details

### 2.1 The `LiquidGlass` Reusable Widget
Designed as a drop-in wrapper for any content. It exposes a clean API while encapsulating the complexity of the 6-layer stack.

```dart
class LiquidGlass extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final Gradient? background; // Allows overriding the "glass color" (e.g., specific wallet tints)

  // ... implementation handles the Stack & ClipRRect context ...
}
```

### 2.2 Wallet Cards (Custom Gradients)
Specific cards use bespoke radial gradients passed to the `background` parameter to differentiate their financial context while maintaining the unified glass physics.

**Implementation (`wallet_card.dart`):**
```dart
LiquidGlass(
  background: RadialGradient(
    center: Alignment.topLeft,
    radius: 1.0,
    colors: [
      Color.fromRGBO(148, 163, 184, 0.22), // Light Slate (Top-Left Light interaction)
      Color.fromRGBO(15, 23, 42, 0.9),     // Dark Slate Base (Opaque body)
    ],
  ),
  // ...
)
```

### 2.3 Layout & Responsiveness
The Sidebar uses a custom implementation instead of `NavigationRail` to support the glass effect.
- **Constraints**: Fixed `width: 260` on Desktop.
- **Active State**: Navigation items use a **Golden Radial Gradient** (`Color.fromRGBO(250, 204, 21, 0.2)`) to indicate selection, simulating an active LED beneath the glass surface.

---

## 3. Web Renderer Requirements
This specific shader implementation relies on **Skia/CanvasKit** for advanced fragment shader support.

> **CRITICAL**: When building for web, you MUST strictly enforce the CanvasKit renderer. The HTML (dom-based) renderer cannot process the `runtimeEffect` shaders used by `oc_liquid_glass`.

**Build Command:**
```bash
flutter build web --web-renderer canvaskit --release
```

**Debug Command:**
```bash
flutter run -d chrome --web-renderer canvaskit
```

---

## 4. Visual Assets & Tokens
- **Font**: System UI (`-apple-system`, `BlinkMacSystemFont`), mapped to Flutter's default Typography.
- **Colors**:
  - `Accent Yellow`: `#FACC15`
  - `Accent Green`: `#22C55E`
  - `Glass Soft`: `rgba(15, 23, 42, 0.85)`
- **Orbits**: The background contains animated "Orbits" (`BackgroundOrbits` widget) which are essential for the refraction effect to be visible. The glass *needs* something to refract; a solid black background will render the effect invisible.
