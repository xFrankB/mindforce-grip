import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/cita_model.dart';
import '../services/citas_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import '../widgets/glass_card.dart';

class PacienteHistorialScreen extends StatefulWidget {
  final String userName;

  const PacienteHistorialScreen({super.key, required this.userName});

  @override
  State<PacienteHistorialScreen> createState() =>
      _PacienteHistorialScreenState();
}

class _PacienteHistorialScreenState extends State<PacienteHistorialScreen> {
  final ValueNotifier<List<CitaModel>> _citasNotifier =
      CitasService.instance.citasNotifier;

  String _filter = 'todas';

  List<CitaModel> _sorted(List<CitaModel> source) {
    final sorted = [...source]..sort((a, b) => b.fecha.compareTo(a.fecha));
    return sorted;
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'completada':
        return 'Completada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return status;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'pendiente':
        return AppColors.warning;
      case 'confirmada':
        return AppColors.primaryTeal;
      case 'completada':
        return AppColors.success;
      case 'rechazada':
        return AppColors.danger;
      default:
        return Colors.white70;
    }
  }

  Widget _buildFilterChip(String label, String value) {
    final isActive = _filter == value;

    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: () => setState(() => _filter = value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive
              ? AppColors.primaryTeal.withValues(alpha: 0.18)
              : Colors.white.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: isActive
                ? AppColors.primaryTeal.withValues(alpha: 0.52)
                : Colors.white.withValues(alpha: 0.14),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isActive ? AppColors.primaryTeal : Colors.white70,
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String title, int value, Color color) {
    return Expanded(
      child: GlassCard(
        opacity: 0.1,
        borderRadius: BorderRadius.circular(16),
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '$value',
              style: AppTheme.glassTitle.copyWith(fontSize: 22, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              title,
              style: AppTheme.glassCaption.copyWith(fontSize: 11),
            ),
          ],
        ),
      ),
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
              final sorted = _sorted(citas);
              final filtered = sorted
                  .where((cita) => _filter == 'todas' || cita.estado == _filter)
                  .toList();

              final pendientes = citas.where((c) => c.isPendiente).length;
              final confirmadas = citas.where((c) => c.isConfirmada).length;
              final completadas = citas.where((c) => c.isCompletada).length;

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 110),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Historial Clinico',
                      style: AppTheme.glassTitle.copyWith(fontSize: 28),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Registro completo de sesiones y estado de tus citas.',
                      style: AppTheme.glassSubtitle.copyWith(fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildStatCard(
                            'Pendientes', pendientes, AppColors.warning),
                        const SizedBox(width: 10),
                        _buildStatCard(
                            'Confirmadas', confirmadas, AppColors.primaryTeal),
                        const SizedBox(width: 10),
                        _buildStatCard(
                            'Completadas', completadas, AppColors.success),
                      ],
                    ),
                    const SizedBox(height: 14),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildFilterChip('Todas', 'todas'),
                          const SizedBox(width: 8),
                          _buildFilterChip('Pendientes', 'pendiente'),
                          const SizedBox(width: 8),
                          _buildFilterChip('Confirmadas', 'confirmada'),
                          const SizedBox(width: 8),
                          _buildFilterChip('Completadas', 'completada'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (filtered.isEmpty)
                      GlassCard(
                        opacity: 0.08,
                        borderRadius: BorderRadius.circular(18),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Text(
                            'No hay elementos para este filtro.',
                            style: AppTheme.glassCaption.copyWith(fontSize: 13),
                          ),
                        ),
                      )
                    else
                      Column(
                        children: filtered.map((cita) {
                          final color = _statusColor(cita.estado);

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: GlassCard(
                              opacity: 0.1,
                              borderRadius: BorderRadius.circular(16),
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        width: 10,
                                        height: 10,
                                        decoration: BoxDecoration(
                                          color: color,
                                          borderRadius:
                                              BorderRadius.circular(99),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Expanded(
                                        child: Text(
                                          cita.tipo,
                                          style:
                                              AppTheme.glassSubtitle.copyWith(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 5,
                                        ),
                                        decoration: BoxDecoration(
                                          color: color.withValues(alpha: 0.16),
                                          borderRadius:
                                              BorderRadius.circular(999),
                                          border: Border.all(
                                            color:
                                                color.withValues(alpha: 0.42),
                                          ),
                                        ),
                                        child: Text(
                                          _statusLabel(cita.estado),
                                          style: TextStyle(
                                            color: color,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    '${DateFormat('dd MMM yyyy', 'es_ES').format(cita.fecha)} · ${DateFormat('HH:mm', 'es_ES').format(cita.fecha)} · ${cita.duracionMin} min',
                                    style: AppTheme.glassCaption
                                        .copyWith(fontSize: 12),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${cita.terapeuta} · ${cita.especialidad}',
                                    style: AppTheme.glassCaption
                                        .copyWith(fontSize: 12),
                                  ),
                                  if (cita.notas.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      cita.notas,
                                      style: AppTheme.glassSubtitle
                                          .copyWith(fontSize: 13),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        }).toList(),
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
