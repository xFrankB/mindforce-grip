import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const Color primaryTeal = Color(0xFF00E5FF);
  static const Color secondaryOrange = Color(0xFFFF6B00);
  static const Color accentPurple = Color(0xFF9C27B0);
  static const Color background = Color(0xFF0A0A0A);
  static const Color darkBg = Color(0xFF1A1A1A);
  static const Color container = Color(0xFF2A2A2A);
  static const Color text = Color(0xFFFFFFFF);
  static const Color textMuted = Color(0xFFA9B1BA);
  static const Color textLight = Color(0xB3FFFFFF);
  static const Color danger = Color(0xFFD93025);
  static const Color success = Color(0xFF00C853);
  static const Color warning = Color(0xFFFF9800);
  static const Color borderSoft = Color(0x24FFFFFF);
  static const Color glassOverlay = Color(0x15FFFFFF);
}

class AppTheme {
  static const Color primaryTeal = AppColors.primaryTeal;
  static const Color darkBg = AppColors.darkBg;

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF00E5FF),
      Color(0xFF0099CC),
      Color(0xFF006699),
    ],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFFFF6B00),
      Color(0xFFCC5500),
      Color(0xFF993D00),
    ],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0xFF9C27B0),
      Color(0xFF7B1FA2),
      Color(0xFF4A148C),
    ],
  );

  static final BoxDecoration backgroundGradient = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      stops: [0.0, 0.3, 0.6, 1.0],
      colors: [
        const Color(0xFF0A0A0A),
        const Color(0xFF1A1A1A).withValues(alpha: 0.9),
        const Color(0xFF121212).withValues(alpha: 0.8),
        const Color(0xFF0F1419).withValues(alpha: 0.7),
      ],
    ),
  );

  static final BoxDecoration glassGradient = BoxDecoration(
    gradient: LinearGradient(
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
      colors: [
        Colors.white.withValues(alpha: 0.1),
        Colors.white.withValues(alpha: 0.05),
        Colors.white.withValues(alpha: 0.02),
      ],
    ),
  );

  static const TextStyle glassTitle = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    letterSpacing: 0.5,
    height: 1.2,
  );

  static const TextStyle glassSubtitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    color: Colors.white70,
    letterSpacing: 0.3,
    height: 1.4,
  );

  static const TextStyle glassCaption = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w500,
    color: Colors.white54,
    letterSpacing: 0.8,
    height: 1.5,
  );

  static const TextStyle glassButton = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    letterSpacing: 0.5,
  );

  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Curve animationCurve = Curves.easeInOutCubic;

  static List<BoxShadow> glassShadows = [
    BoxShadow(
      color: Colors.white.withValues(alpha: 0.1),
      blurRadius: 20,
      spreadRadius: -10,
      offset: const Offset(-10, -10),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.2),
      blurRadius: 20,
      spreadRadius: -10,
      offset: const Offset(10, 10),
    ),
  ];

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    primaryColor: AppColors.primaryTeal,
    scaffoldBackgroundColor: AppColors.background,
    cardTheme: CardThemeData(
      color: AppColors.container.withValues(alpha: 0.8),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.primaryTeal.withValues(alpha: 0.2),
        foregroundColor: Colors.white,
        elevation: 0,
        shadowColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(15),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.primaryTeal,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.1),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: BorderSide(
          color: Colors.white.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(15),
        borderSide: BorderSide(
          color: AppColors.primaryTeal,
          width: 2,
        ),
      ),
      labelStyle: const TextStyle(color: Colors.white70),
      hintStyle: const TextStyle(color: Colors.white38),
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.transparent,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: GoogleFonts.inter(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: Colors.white,
        letterSpacing: 0.5,
      ),
      iconTheme: const IconThemeData(color: Colors.white),
    ),
  );
}
