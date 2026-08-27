import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';
import '../widgets/custom_button.dart';
import '../services/api_service.dart';
import 'nav_bar.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;
  String? _errorMessage;

  late AnimationController _logoAnimationController;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoRotationAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
  }

  void _setupAnimations() {
    _logoAnimationController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    )..repeat(reverse: true);

    _logoScaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _logoAnimationController,
      curve: Curves.easeInOut,
    ));

    _logoRotationAnimation = Tween<double>(
      begin: -0.1,
      end: 0.1,
    ).animate(CurvedAnimation(
      parent: _logoAnimationController,
      curve: Curves.easeInOut,
    ));
  }

  @override
  void dispose() {
    _logoAnimationController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: AppTheme.backgroundGradient,
          ),
          _buildFloatingParticles(),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(30),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    _buildAnimatedLogo(),
                    const SizedBox(height: 40),
                    GlassCard(
                      blurStrength: 25.0,
                      opacity: 0.12,
                      padding: const EdgeInsets.all(32),
                      boxShadow: AppTheme.glassShadows,
                      child: Column(
                        children: [
                          ShaderMask(
                            shaderCallback: (bounds) =>
                                AppTheme.primaryGradient.createShader(bounds),
                            child: const Text(
                              "MINDFORCE GRIP",
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                                letterSpacing: 1.5,
                                height: 1.2,
                              ),
                            ),
                          ).animate().fadeIn(duration: 800.ms).slideY(
                              begin: 0.3,
                              end: 0,
                              duration: 800.ms,
                              curve: Curves.easeOutCubic),
                          const SizedBox(height: 8),
                          Text(
                            "Sistema de Rehabilitación Avanzada",
                            style: AppTheme.glassCaption.copyWith(
                              fontSize: 14,
                              letterSpacing: 1.0,
                            ),
                          )
                              .animate()
                              .fadeIn(delay: 200.ms, duration: 600.ms)
                              .slideY(
                                  begin: 0.2,
                                  end: 0,
                                  duration: 600.ms,
                                  curve: Curves.easeOutCubic),
                          const SizedBox(height: 50),
                          _buildAnimatedTextField(
                            controller: _emailController,
                            hintText: "Correo electrónico",
                            prefixIcon: Icons.email_outlined,
                            delay: 400,
                          ),
                          const SizedBox(height: 24),
                          _buildAnimatedTextField(
                            controller: _passwordController,
                            hintText: "Contraseña",
                            prefixIcon: Icons.lock_outline,
                            isPassword: true,
                            delay: 600,
                          ),
                          if (_errorMessage != null) ...[
                            const SizedBox(height: 20),
                            _buildErrorMessage(),
                          ],
                          const SizedBox(height: 40),
                          CustomButton(
                            text: _isLoading
                                ? "VERIFICANDO..."
                                : "ACCEDER AL SISTEMA",
                            onPressed: _isLoading ? () {} : _handleLogin,
                            gradient: AppTheme.primaryGradient,
                          )
                              .animate()
                              .fadeIn(delay: 800.ms, duration: 500.ms)
                              .scale(
                                  begin: const Offset(0.8, 0.8),
                                  end: const Offset(1.0, 1.0),
                                  duration: 500.ms,
                                  curve: Curves.elasticOut),
                          const SizedBox(height: 24),
                          TextButton(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: const Text(
                                      "Contacta al administrador para acceso"),
                                  backgroundColor: AppColors.primaryTeal
                                      .withValues(alpha: 0.2),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                              );
                            },
                            child: Text(
                              "¿Necesitas acceso? Contactar administrador",
                              style: TextStyle(
                                color: AppColors.primaryTeal,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ).animate().fadeIn(delay: 1000.ms, duration: 400.ms),
                        ],
                      ),
                    ).animate().fadeIn(delay: 300.ms, duration: 700.ms).slideY(
                        begin: 0.2,
                        end: 0,
                        duration: 700.ms,
                        curve: Curves.easeOutCubic),
                  ],
                ),
              ),
            ),
          ),
          if (_isLoading) _buildLoadingOverlay(),
        ],
      ),
    );
  }

  Widget _buildFloatingParticles() {
    return Stack(
      children: List.generate(20, (index) {
        return Positioned(
          left: (index * 47) % MediaQuery.of(context).size.width,
          top: (index * 83) % MediaQuery.of(context).size.height,
          child: Container(
            width: 4 + (index % 3) * 2.0,
            height: 4 + (index % 3) * 2.0,
            decoration: BoxDecoration(
              color: AppColors.primaryTeal
                  .withValues(alpha: 0.1 + (index % 5) * 0.05),
              shape: BoxShape.circle,
            ),
          )
              .animate(
                onPlay: (controller) => controller.repeat(),
              )
              .moveY(
                begin: 0,
                end: -20,
                duration: Duration(seconds: 3 + index % 2),
                curve: Curves.easeInOut,
              ),
        );
      }),
    );
  }

  Widget _buildAnimatedLogo() {
    return AnimatedBuilder(
      animation: _logoAnimationController,
      builder: (context, child) {
        return Transform.scale(
          scale: _logoScaleAnimation.value,
          child: Transform.rotate(
            angle: _logoRotationAnimation.value,
            child: Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: AppTheme.primaryGradient,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryTeal.withValues(alpha: 0.3),
                    blurRadius: 30,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: const Icon(
                Icons.biotech,
                size: 60,
                color: Colors.white,
              ),
            ),
          ),
        );
      },
    ).animate().fadeIn(duration: 1000.ms).scale(
        begin: const Offset(0.5, 0.5),
        end: const Offset(1.0, 1.0),
        duration: 800.ms,
        curve: Curves.elasticOut);
  }

  Widget _buildAnimatedTextField({
    required TextEditingController controller,
    required String hintText,
    required IconData prefixIcon,
    bool isPassword = false,
    required int delay,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TextField(
        controller: controller,
        style: const TextStyle(color: Colors.white, fontSize: 16),
        enabled: !_isLoading,
        obscureText: isPassword && _obscurePassword,
        decoration: InputDecoration(
          hintText: hintText,
          hintStyle: TextStyle(
            color: Colors.white.withValues(alpha: 0.4),
            fontSize: 16,
          ),
          prefixIcon: Icon(
            prefixIcon,
            color: AppColors.primaryTeal,
            size: 24,
          ),
          suffixIcon: isPassword
              ? IconButton(
                  icon: Icon(
                    _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    color: AppColors.primaryTeal,
                  ),
                  onPressed: () {
                    setState(() {
                      _obscurePassword = !_obscurePassword;
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white.withValues(alpha: 0.08),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(
              color: Colors.white.withValues(alpha: 0.1),
              width: 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: BorderSide(
              color: AppColors.primaryTeal,
              width: 2,
            ),
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        ),
      ),
    )
        .animate()
        .fadeIn(delay: Duration(milliseconds: delay), duration: 500.ms)
        .slideX(
            begin: 0.2, end: 0, duration: 500.ms, curve: Curves.easeOutCubic);
  }

  Widget _buildErrorMessage() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.danger.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: AppColors.danger.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.error_outline,
            color: AppColors.danger,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _errorMessage!,
              style: TextStyle(
                color: AppColors.danger,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 300.ms).shake(duration: 500.ms, hz: 4);
  }

  Widget _buildLoadingOverlay() {
    return Container(
      color: Colors.black.withValues(alpha: 0.7),
      child: Center(
        child: GlassCard(
          width: 200,
          height: 120,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor:
                    AlwaysStoppedAnimation<Color>(AppColors.primaryTeal),
                strokeWidth: 3,
              ),
              const SizedBox(height: 16),
              Text(
                "Verificando credenciales...",
                style: AppTheme.glassSubtitle.copyWith(fontSize: 14),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogin() async {
    setState(() {
      _errorMessage = null;
    });

    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty) {
      setState(() {
        _errorMessage = "Por favor ingresa tu correo electrónico";
      });
      return;
    }

    if (password.isEmpty) {
      setState(() {
        _errorMessage = "Por favor ingresa tu contraseña";
      });
      return;
    }

    if (password.length < 6) {
      setState(() {
        _errorMessage = "La contraseña debe tener al menos 6 caracteres";
      });
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final authResponse = await _apiService.login(email, password);
      final user = authResponse.user;

      if (user == null) {
        setState(() {
          _errorMessage = 'No se pudo iniciar sesion con esas credenciales';
          _isLoading = false;
        });
        return;
      }

      final patientData = await _apiService.getPatientData();
      final displayName = patientData?.nombre.isNotEmpty == true
          ? patientData!.nombre
          : (user.email?.split('@').first ?? 'Paciente');

      if (!mounted) {
        return;
      }

      setState(() {
        _isLoading = false;
      });

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (context) => NavBar(userName: displayName),
        ),
      );
    } on AuthException catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _isLoading = false;
        _errorMessage = error.message;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }

      setState(() {
        _isLoading = false;
        _errorMessage =
            'No fue posible iniciar sesion. Verifica conexion y credenciales.';
      });
    }
  }
}
