import 'package:flutter/material.dart';
import 'package:oc_liquid_glass/oc_liquid_glass.dart';

class LiquidGlass extends StatelessWidget {
  final Widget child;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final bool isStrong;
  final Gradient? background;
  final BoxBorder? border;


  const LiquidGlass({
    super.key,
    required this.child,
    this.borderRadius = 26, // CSS --radius-lg: 26px
    this.padding,
    this.isStrong = false,
    this.background,
    this.border,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.75), // var(--shadow-soft)
            blurRadius: 80,
            offset: Offset(0, 32),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(borderRadius),
        child: Stack(
          children: [
            // 1. Refraction Layer (Shader)
            Positioned.fill(
              child: OCLiquidGlassGroup(
                settings: OCLiquidGlassSettings(
                  blurRadiusPx: isStrong ? 28.0 : 20.0, // var(--blur-strong)
                  refractStrength: isStrong ? 0.8 : 0.5,
                  specStrength: 2.0,
                  specWidth: 1.5,
                  specPower: 5.0,
                  specAngle: 0.8,
                  distortFalloffPx: 30,
                  blendPx: 20,
                ),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    return OCLiquidGlass(
                      width: constraints.maxWidth,
                      height: constraints.maxHeight,
                      borderRadius: borderRadius,
                      color: Colors.transparent, // Let styling be handled by layers
                      child: Container(),
                    );
                  },
                ),
              ),
            ),

            // 2. Base Background (CSS background)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(borderRadius),
                  color: background == null ? const Color.fromRGBO(15, 23, 42, 0.72) : null, // var(--glass-bg)
                  gradient: background,
                ),
              ),
            ),

            // 3. Highlight Overlay (CSS ::before)
            // linear-gradient(135deg, rgba(248, 250, 252, 0.75), rgba(148, 163, 184, 0.18) 25%, transparent 55%, rgba(15, 23, 42, 0.95) 80%)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(borderRadius),
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      const Color(0xFFF8FAFC).withOpacity(0.15), // Adjusted opacity for blend mode simulation
                      const Color(0xFF94A3B8).withOpacity(0.05),
                      Colors.transparent,
                      const Color(0xFF0F172A).withOpacity(0.6),
                    ],
                    stops: const [0.0, 0.25, 0.55, 0.8],
                  ),
                ),
              ),
            ),

            // 4. Vignette / Inner Shadow (CSS ::after)
            // radial-gradient(circle at 50% 130%, rgba(0, 0, 0, 0.9), transparent 55%)
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(borderRadius),
                  gradient: RadialGradient(
                    center: const Alignment(0, 1.6), // 50% 130% approx
                    radius: 1.2,
                    colors: [
                      Colors.black.withOpacity(0.6),
                      Colors.transparent,
                    ],
                    stops: const [0.0, 0.6],
                  ),
                ),
              ),
            ),

            // 5. Border Layer
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(borderRadius),
                  border: border ?? Border.all(
                    color: const Color.fromRGBO(148, 163, 184, 0.25),
                    width: 1,
                  ),
                ),
              ),
            ),

            // 6. Content
            Container(
              padding: padding ?? const EdgeInsets.all(24),
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}
