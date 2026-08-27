import 'dart:ui';

import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AppBackground extends StatelessWidget {
  final Widget child;

  const AppBackground({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: Container(decoration: AppTheme.backgroundGradient),
        ),
        Positioned(
          top: -140,
          left: -120,
          child: _GlowOrb(
            size: 320,
            color: AppColors.primaryTeal.withValues(alpha: 0.24),
          ),
        ),
        Positioned(
          bottom: -150,
          right: -120,
          child: _GlowOrb(
            size: 340,
            color: AppColors.secondaryOrange.withValues(alpha: 0.16),
          ),
        ),
        Positioned.fill(child: child),
      ],
    );
  }
}

class _GlowOrb extends StatelessWidget {
  final double size;
  final Color color;

  const _GlowOrb({required this.size, required this.color});

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: color,
          ),
        ),
      ),
    );
  }
}
