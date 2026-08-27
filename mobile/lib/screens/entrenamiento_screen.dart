import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';

import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class EntrenamientoScreen extends StatefulWidget {
  const EntrenamientoScreen({super.key});

  @override
  State<EntrenamientoScreen> createState() => _EntrenamientoScreenState();
}

class _EntrenamientoScreenState extends State<EntrenamientoScreen> {
  final ApiService _apiService = ApiService();
  final Random _random = Random();

  Timer? _captureTimer;
  bool _isCapturing = false;
  int _seconds = 0;
  double _kg = 0;
  double _maxKg = 0;

  @override
  void dispose() {
    _captureTimer?.cancel();
    super.dispose();
  }

  void _toggleCapture() {
    if (_isCapturing) {
      _captureTimer?.cancel();
      setState(() {
        _isCapturing = false;
      });
      return;
    }

    _captureTimer?.cancel();
    _captureTimer = Timer.periodic(const Duration(milliseconds: 850), (_) {
      final nextKg = 6 + (_random.nextDouble() * 34);
      if (!mounted) {
        return;
      }

      setState(() {
        _isCapturing = true;
        _seconds += 1;
        _kg = nextKg;
        if (nextKg > _maxKg) {
          _maxKg = nextKg;
        }
      });
    });
  }

  Future<void> _finalizarSesion() async {
    _captureTimer?.cancel();
    setState(() {
      _isCapturing = false;
    });

    final progress = ((_maxKg / 40) * 100).clamp(0, 100).round();
    await _apiService.updateTrainingProgress(progress);

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          'Sesion guardada. Pico: ${_maxKg.toStringAsFixed(1)} kg, progreso: $progress%.',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: AppTheme.backgroundGradient,
        child: Center(
          child: GlassCard(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.fitness_center,
                  color: AppTheme.primaryTeal,
                  size: 50,
                ),
                const SizedBox(height: 20),
                const Text(
                  'SESION DE GRIP ACTIVA',
                  style: TextStyle(color: Colors.white, fontSize: 18),
                ),
                const SizedBox(height: 8),
                Text(
                  'Tiempo: ${_seconds}s  ·  Max: ${_maxKg.toStringAsFixed(1)} kg',
                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                ),
                const SizedBox(height: 10),
                Text(
                  '${_kg.toStringAsFixed(1)} kg',
                  style: const TextStyle(
                    color: AppTheme.primaryTeal,
                    fontSize: 45,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 20),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  alignment: WrapAlignment.center,
                  children: [
                    ElevatedButton(
                      onPressed: _toggleCapture,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isCapturing
                            ? AppColors.warning
                            : AppTheme.primaryTeal,
                      ),
                      child: Text(
                        _isCapturing ? 'DETENER CAPTURA' : 'INICIAR CAPTURA',
                        style: const TextStyle(color: Colors.black),
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _seconds > 0 ? _finalizarSesion : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.secondaryOrange,
                      ),
                      child: const Text(
                        'FINALIZAR Y GUARDAR',
                        style: TextStyle(color: Colors.black),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
