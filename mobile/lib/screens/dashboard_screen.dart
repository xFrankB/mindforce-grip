import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  final String userName;
  const DashboardScreen({super.key, this.userName = "Paciente"});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
          Colors.transparent, // Para que se vea el gradiente del contenedor
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: AppTheme.backgroundGradient, // Ahora sí lo encontrará
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(25),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                const SizedBox(height: 30),
                _buildMetricsGrid(),
                const SizedBox(height: 25),
                const Text("ANÁLISIS DE REHABILITACIÓN",
                    style: TextStyle(
                        color: Colors.white54,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2)),
                const SizedBox(height: 15),
                _buildStatusCard(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text("SISTEMA QUALYTECH",
                style: TextStyle(
                    color: AppTheme.primaryTeal,
                    fontSize: 10,
                    fontWeight: FontWeight.bold)),
            Text(userName, style: AppTheme.glassTitle),
          ],
        ),
        const CircleAvatar(
          backgroundColor: Colors.white12,
          child: Icon(Icons.person_outline, color: AppTheme.primaryTeal),
        )
      ],
    );
  }

  Widget _buildMetricsGrid() {
    return Row(
      children: [
        Expanded(child: _metricTile("Presión Máx.", "48.2", "kg", Icons.bolt)),
        const SizedBox(width: 15),
        Expanded(child: _metricTile("Progreso", "82", "%", Icons.trending_up)),
      ],
    );
  }

  Widget _buildStatusCard() {
    return GlassCard(
      child: Column(
        children: [
          const LinearProgressIndicator(
            value: 0.82,
            backgroundColor: Colors.white10,
            color: AppTheme.primaryTeal,
            minHeight: 8,
          ),
          const SizedBox(height: 15),
          const Text(
            "Recuperación óptima en zona de flexores. Mantener ritmo actual.",
            style: TextStyle(color: Colors.white70, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String t, String v, String u, IconData i) {
    return GlassCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(i, color: AppTheme.primaryTeal, size: 18),
          const SizedBox(height: 10),
          Text(t, style: const TextStyle(color: Colors.white54, fontSize: 11)),
          Text("$v $u",
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
