import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/cita_model.dart';
import '../models/paciente_model.dart';
import '../services/citas_service.dart';
import '../screens/entrenamiento_screen.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import '../widgets/custom_button.dart';
import '../widgets/glass_card.dart';

class PacienteDashboardScreen extends StatefulWidget {
  final String userName;

  const PacienteDashboardScreen({super.key, required this.userName});

  @override
  State<PacienteDashboardScreen> createState() =>
      _PacienteDashboardScreenState();
}

class _PacienteDashboardScreenState extends State<PacienteDashboardScreen> {
  final ValueNotifier<List<CitaModel>> _citasNotifier =
      CitasService.instance.citasNotifier;

  late Paciente _paciente;

  Future<void> _openContactChannel() async {
    final Uri mailUri = Uri(
      scheme: 'mailto',
      path: 'soporte@example.test',
      query: 'subject=Seguimiento%20de%20terapia',
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

  @override
  void initState() {
    super.initState();
    _paciente = Paciente(
      nombre: widget.userName,
      fuerza: 68,
      nivel: 'Intermedio',
      racha: 12,
      sesionesCompletadas: 28,
      sesionesTotales: 35,
      progresoSemanal: 0.82,
      ultimaSesion: DateTime.now().subtract(const Duration(days: 1)),
    );
  }

  List<CitaModel> _upcoming(List<CitaModel> citas) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    final upcoming = citas.where((cita) => !cita.fecha.isBefore(today)).toList()
      ..sort((a, b) => a.fecha.compareTo(b.fecha));

    return upcoming;
  }

  CitaModel? _nextAppointment(List<CitaModel> citas) {
    final now = DateTime.now();
    final upcoming = citas
        .where((cita) => cita.fecha.isAfter(now) && !cita.isCompletada)
        .toList()
      ..sort((a, b) => a.fecha.compareTo(b.fecha));

    if (upcoming.isEmpty) {
      return null;
    }

    return upcoming.first;
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String caption,
    required IconData icon,
    required Color accent,
  }) {
    return Expanded(
      child: GlassCard(
        opacity: 0.1,
        borderRadius: BorderRadius.circular(16),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: accent, size: 20),
            const SizedBox(height: 10),
            Text(
              value,
              style: AppTheme.glassTitle.copyWith(fontSize: 22, color: accent),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: AppTheme.glassSubtitle.copyWith(fontSize: 13),
            ),
            const SizedBox(height: 4),
            Text(
              caption,
              style: AppTheme.glassCaption.copyWith(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final now = DateTime.now();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Hola, ${_paciente.nombre}',
          style: AppTheme.glassTitle.copyWith(fontSize: 30),
        ),
        const SizedBox(height: 6),
        Text(
          'Panel de seguimiento de rehabilitacion',
          style: AppTheme.glassSubtitle.copyWith(fontSize: 14),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: AppColors.primaryTeal.withValues(alpha: 0.14),
            borderRadius: BorderRadius.circular(999),
            border: Border.all(
              color: AppColors.primaryTeal.withValues(alpha: 0.44),
            ),
          ),
          child: Text(
            DateFormat('EEEE, d MMMM y', 'es_ES').format(now),
            style: AppTheme.glassCaption.copyWith(
              fontSize: 12,
              color: AppColors.primaryTeal,
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      body: AppBackground(
        child: SafeArea(
          child: ValueListenableBuilder<List<CitaModel>>(
            valueListenable: _citasNotifier,
            builder: (context, citas, _) {
              final upcoming = _upcoming(citas);
              final next = _nextAppointment(citas);
              final pendientes =
                  upcoming.where((cita) => cita.isPendiente).length;
              final confirmadas =
                  upcoming.where((cita) => cita.isConfirmada).length;
              final completadas =
                  citas.where((cita) => cita.isCompletada).length;

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 110),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(),
                    const SizedBox(height: 18),
                    GlassCard(
                      blurStrength: 22,
                      opacity: 0.12,
                      borderRadius: BorderRadius.circular(20),
                      padding: const EdgeInsets.all(18),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 92,
                            height: 92,
                            child: Stack(
                              fit: StackFit.expand,
                              children: [
                                CircularProgressIndicator(
                                  value: _paciente.fuerza / 100,
                                  strokeWidth: 8,
                                  backgroundColor:
                                      Colors.white.withValues(alpha: 0.12),
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
                                          AppColors.primaryTeal),
                                ),
                                Center(
                                  child: Text(
                                    '${_paciente.fuerza}%',
                                    style: AppTheme.glassTitle
                                        .copyWith(fontSize: 20),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Fuerza actual',
                                  style: AppTheme.glassSubtitle.copyWith(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  'Nivel ${_paciente.nivel} · Racha ${_paciente.racha} dias',
                                  style: AppTheme.glassCaption
                                      .copyWith(fontSize: 12),
                                ),
                                const SizedBox(height: 10),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: LinearProgressIndicator(
                                    minHeight: 8,
                                    value: _paciente.progresoSemanal,
                                    backgroundColor:
                                        Colors.white.withValues(alpha: 0.08),
                                    valueColor:
                                        const AlwaysStoppedAnimation<Color>(
                                            AppColors.secondaryOrange),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 14),
                    Row(
                      children: [
                        _buildMetricCard(
                          title: 'Pendientes',
                          value: '$pendientes',
                          caption: 'por confirmar',
                          icon: Icons.schedule_rounded,
                          accent: AppColors.warning,
                        ),
                        const SizedBox(width: 10),
                        _buildMetricCard(
                          title: 'Confirmadas',
                          value: '$confirmadas',
                          caption: 'agendadas',
                          icon: Icons.check_circle_rounded,
                          accent: AppColors.primaryTeal,
                        ),
                        const SizedBox(width: 10),
                        _buildMetricCard(
                          title: 'Completadas',
                          value: '$completadas',
                          caption: 'historico',
                          icon: Icons.task_alt_rounded,
                          accent: AppColors.success,
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text(
                      'Proxima cita',
                      style: AppTheme.glassSubtitle.copyWith(
                        fontSize: 17,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (next == null)
                      GlassCard(
                        opacity: 0.08,
                        borderRadius: BorderRadius.circular(16),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(
                            'No hay citas proximas por el momento.',
                            style: AppTheme.glassCaption.copyWith(fontSize: 13),
                          ),
                        ),
                      )
                    else
                      GlassCard(
                        blurStrength: 20,
                        opacity: 0.1,
                        borderRadius: BorderRadius.circular(18),
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    gradient: LinearGradient(
                                      colors: [
                                        next.color,
                                        next.color.withValues(alpha: 0.64),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.medical_services_rounded,
                                    color: Colors.white,
                                    size: 22,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        next.tipo,
                                        style: AppTheme.glassTitle
                                            .copyWith(fontSize: 16),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        next.terapeuta,
                                        style: AppTheme.glassCaption
                                            .copyWith(fontSize: 12),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              DateFormat('dd MMM yyyy · HH:mm', 'es_ES')
                                  .format(next.fecha),
                              style:
                                  AppTheme.glassSubtitle.copyWith(fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${next.ubicacion} · ${next.duracionMin} min',
                              style:
                                  AppTheme.glassCaption.copyWith(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 18),
                    Row(
                      children: [
                        Expanded(
                          child: CustomButton(
                            text: 'Nueva sesion',
                            icon: Icons.play_arrow_rounded,
                            height: 48,
                            onPressed: () {
                              Navigator.of(context).push(
                                MaterialPageRoute(
                                  builder: (_) => const EntrenamientoScreen(),
                                ),
                              );
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: CustomButton(
                            text: 'Contactar',
                            icon: Icons.chat_bubble_outline_rounded,
                            height: 48,
                            gradient: AppTheme.secondaryGradient,
                            onPressed: _openContactChannel,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
