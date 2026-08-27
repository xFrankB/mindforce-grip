import 'package:flutter/material.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';

import '../services/api_service.dart';
import '../services/citas_service.dart';
import 'login_screen.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import '../widgets/glass_card.dart';

class PacientePerfilScreen extends StatefulWidget {
  final String userName;

  const PacientePerfilScreen({super.key, required this.userName});

  @override
  State<PacientePerfilScreen> createState() => _PacientePerfilScreenState();
}

class _PacientePerfilScreenState extends State<PacientePerfilScreen> {
  final ApiService _apiService = ApiService();
  late Map<String, dynamic> _data;

  @override
  void initState() {
    super.initState();
    _data = {
      'nombre': 'Paciente demo',
      'email': 'usuario.demo@example.test',
      'telefono': '',
      'fechaNacimiento': '',
      'edad': 0,
      'sexo': 'No especificado',
      'direccion': '',
      'nivelRehabilitacion': 'Demostracion',
      'diagnostico': 'Registro de demostracion',
      'terapeuta': 'Terapeuta demo',
      'fechaInicio': '',
      'sesionesCompletadas': 24,
      'sesionesRestantes': 6,
    };
  }

  Future<void> _downloadPdfHistory() async {
    final doc = pw.Document();

    doc.addPage(
      pw.MultiPage(
        build: (context) => [
          pw.Header(level: 0, text: 'Historial Clinico - MindForce Grip'),
          pw.Paragraph(text: 'Paciente: ${_data['nombre']}'),
          pw.Paragraph(text: 'Diagnostico: ${_data['diagnostico']}'),
          pw.Paragraph(text: 'Terapeuta asignado: ${_data['terapeuta']}'),
          pw.Paragraph(
            text:
                'Sesiones completadas: ${_data['sesionesCompletadas']} · Restantes: ${_data['sesionesRestantes']}',
          ),
          pw.SizedBox(height: 18),
          pw.Text(
            'Generado: ${DateTime.now().toIso8601String()}',
            style: const pw.TextStyle(fontSize: 10),
          ),
        ],
      ),
    );

    await Printing.layoutPdf(onLayout: (_) async => doc.save());
  }

  Future<void> _contactTherapist() async {
    final Uri mailUri = Uri(
      scheme: 'mailto',
      path: 'soporte@example.test',
      query: 'subject=Seguimiento%20terapeutico',
    );

    final launched = await launchUrl(mailUri, mode: LaunchMode.externalApplication);

    if (!mounted || launched) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('No fue posible abrir el canal de contacto.'),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _secureLogout() async {
    try {
      await _apiService.logout();
    } catch (_) {
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    CitasService.instance.resetToSeed();

    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  Widget _sectionTitle(String text) {
    return Text(
      text,
      style: AppTheme.glassSubtitle.copyWith(
        fontSize: 16,
        fontWeight: FontWeight.w700,
      ),
    );
  }

  Widget _infoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: AppTheme.glassCaption.copyWith(fontSize: 12),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTheme.glassSubtitle.copyWith(
                fontSize: 13,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _actionTile({
    required String text,
    required IconData icon,
    required VoidCallback onTap,
    bool danger = false,
  }) {
    final color = danger ? AppColors.danger : AppColors.primaryTeal;

    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.35)),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                text,
                style: TextStyle(
                  color: color,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              color: color,
            ),
          ],
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF171C22),
          title: const Text(
            'Cerrar sesion',
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            'Se cerrara la sesion actual del paciente.',
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancelar'),
            ),
            FilledButton(
              onPressed: () async {
                Navigator.pop(context);
                await _secureLogout();
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.danger,
                foregroundColor: Colors.white,
              ),
              child: const Text('Cerrar sesion'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final completed = _data['sesionesCompletadas'] as int;
    final remaining = _data['sesionesRestantes'] as int;
    final total = completed + remaining;

    return Scaffold(
      backgroundColor: Colors.transparent,
      body: AppBackground(
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 110),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Perfil del Paciente',
                  style: AppTheme.glassTitle.copyWith(fontSize: 28),
                ),
                const SizedBox(height: 6),
                Text(
                  'Informacion personal, clinica y acciones de cuenta.',
                  style: AppTheme.glassSubtitle.copyWith(fontSize: 14),
                ),
                const SizedBox(height: 16),
                GlassCard(
                  opacity: 0.12,
                  borderRadius: BorderRadius.circular(20),
                  padding: const EdgeInsets.all(18),
                  child: Row(
                    children: [
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: AppColors.primaryTeal.withValues(alpha: 0.18),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: AppColors.primaryTeal.withValues(alpha: 0.4),
                          ),
                        ),
                        child: const Icon(
                          Icons.person_rounded,
                          size: 36,
                          color: AppColors.primaryTeal,
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _data['nombre'],
                              style: AppTheme.glassTitle.copyWith(fontSize: 20),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              _data['email'],
                              style:
                                  AppTheme.glassCaption.copyWith(fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.secondaryOrange
                                    .withValues(alpha: 0.16),
                                borderRadius: BorderRadius.circular(999),
                                border: Border.all(
                                  color: AppColors.secondaryOrange
                                      .withValues(alpha: 0.35),
                                ),
                              ),
                              child: Text(
                                'Nivel ${_data['nivelRehabilitacion']}',
                                style: AppTheme.glassCaption.copyWith(
                                  fontSize: 11,
                                  color: AppColors.secondaryOrange,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _sectionTitle('Informacion personal'),
                const SizedBox(height: 8),
                GlassCard(
                  opacity: 0.1,
                  borderRadius: BorderRadius.circular(16),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      _infoRow('Edad', '${_data['edad']} anos'),
                      _infoRow('Sexo', _data['sexo']),
                      _infoRow('Nacimiento', _data['fechaNacimiento']),
                      _infoRow('Telefono', _data['telefono']),
                      _infoRow('Direccion', _data['direccion']),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _sectionTitle('Informacion medica'),
                const SizedBox(height: 8),
                GlassCard(
                  opacity: 0.1,
                  borderRadius: BorderRadius.circular(16),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    children: [
                      _infoRow('Diagnostico', _data['diagnostico']),
                      _infoRow('Terapeuta asignado', _data['terapeuta']),
                      _infoRow('Inicio de tratamiento', _data['fechaInicio']),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _sectionTitle('Progreso de tratamiento'),
                const SizedBox(height: 8),
                GlassCard(
                  opacity: 0.1,
                  borderRadius: BorderRadius.circular(16),
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Sesiones completadas',
                            style: AppTheme.glassCaption.copyWith(fontSize: 12),
                          ),
                          Text(
                            '$completed / $total',
                            style: AppTheme.glassSubtitle.copyWith(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: LinearProgressIndicator(
                          minHeight: 8,
                          value: total == 0 ? 0 : completed / total,
                          backgroundColor: Colors.white.withValues(alpha: 0.08),
                          valueColor: const AlwaysStoppedAnimation<Color>(
                              AppColors.primaryTeal),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Restantes: $remaining sesiones',
                        style: AppTheme.glassCaption.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                _sectionTitle('Acciones'),
                const SizedBox(height: 8),
                GlassCard(
                  opacity: 0.1,
                  borderRadius: BorderRadius.circular(16),
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      _actionTile(
                        text: 'Descargar historial medico',
                        icon: Icons.download_rounded,
                        onTap: _downloadPdfHistory,
                      ),
                      const SizedBox(height: 10),
                      _actionTile(
                        text: 'Contactar terapeuta',
                        icon: Icons.chat_bubble_outline_rounded,
                        onTap: _contactTherapist,
                      ),
                      const SizedBox(height: 10),
                      _actionTile(
                        text: 'Cerrar sesion',
                        icon: Icons.logout_rounded,
                        danger: true,
                        onTap: _showLogoutDialog,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
