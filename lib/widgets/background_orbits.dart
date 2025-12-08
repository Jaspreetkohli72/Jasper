import 'package:flutter/material.dart';
import 'dart:ui';

class BackgroundOrbits extends StatelessWidget {
  const BackgroundOrbits({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Orbit 1: Top Left (Blue/Slate)
        Positioned(
          top: -100,
          left: 0,
          child: _BuildBlob(
            color: const Color(0xFF60A5FA).withOpacity(0.3),
            size: 600,
          ),
        ),
        // Orbit 2: Top Right (Cyan/Sky)
        Positioned(
          top: 0,
          right: -100,
          child: _BuildBlob(
            color: const Color(0xFF38BDF8).withOpacity(0.35),
            size: 500,
          ),
        ),
        // Orbit 3: Bottom Left (Emerald/Green)
        Positioned(
          bottom: -100,
          left: -50,
          child: _BuildBlob(
            color: const Color(0xFF34D399).withOpacity(0.3),
            size: 600,
          ),
        ),
        // Orbit 4: Bottom Right (Pink/Rose)
        Positioned(
          bottom: 0,
          right: 0,
          child: _BuildBlob(
            color: const Color(0xFFF472B6).withOpacity(0.25),
            size: 550,
          ),
        ),
        
        // Noise Overlay (Optional polisher using high-opacity blurred overlay as 'fog')
        Positioned.fill(
           child: BackdropFilter(
             filter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
             child: Container(color: Colors.transparent),
           ),
        ),
      ],
    );
  }
}

class _BuildBlob extends StatelessWidget {
  final Color color;
  final double size;

  const _BuildBlob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: RadialGradient(
          colors: [color, color.withOpacity(0)],
          stops: const [0.0, 0.7],
        ),
      ),
    );
  }
}
