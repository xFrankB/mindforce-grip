import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class RegistroScreen extends StatelessWidget {
  const RegistroScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Registro QualyTech")),
      body: Container(
        decoration: AppTheme.backgroundGradient,
        child: const Center(
            child: Text("Pantalla de Registro",
                style: TextStyle(color: Colors.white))),
      ),
    );
  }
}
