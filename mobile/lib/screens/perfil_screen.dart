import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class PerfilScreen extends StatelessWidget {
  const PerfilScreen({super.key});

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
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Image.asset(
                    'assets/images/MindForce Grip-logo.jpeg',
                    fit: BoxFit.contain,
                  ),
                ),
                const SizedBox(height: 20),
                const Text("EXPEDIENTE CLÍNICO",
                    style: TextStyle(
                        color: AppTheme.primaryTeal,
                        fontSize: 12,
                        fontWeight: FontWeight.bold)),
                const Text("Paciente Activo",
                    style: TextStyle(color: Colors.white, fontSize: 20)),
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("CERRAR SESIÓN",
                      style: TextStyle(color: Colors.redAccent)),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
