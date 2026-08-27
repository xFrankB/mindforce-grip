import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';

import '../models/cita_model.dart';
import '../services/citas_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_background.dart';
import '../widgets/glass_card.dart';

class PacienteCitasScreen extends StatefulWidget {
  final String userName;

  const PacienteCitasScreen({super.key, required this.userName});

  @override
  State<PacienteCitasScreen> createState() => _PacienteCitasScreenState();
}

class _PacienteCitasScreenState extends State<PacienteCitasScreen> {
  final ValueNotifier<List<CitaModel>> _citasNotifier =
      CitasService.instance.citasNotifier;

  DateTime _selectedDate = DateTime.now();
  DateTime _focusedDate = DateTime.now();
  CalendarFormat _calendarFormat = CalendarFormat.month;
  String _statusFilter = 'todas';

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }

  String _statusLabel(String estado) {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'confirmada':
        return 'Confirmada';
      case 'completada':
        return 'Completada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return estado;
    }
  }

  Color _statusColor(String estado) {
    switch (estado) {
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

  List<CitaModel> _sortedByDate(List<CitaModel> source) {
    final sorted = [...source]..sort((a, b) => a.fecha.compareTo(b.fecha));
    return sorted;
  }

  List<CitaModel> _upcoming(List<CitaModel> source) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    return _sortedByDate(
      source.where((cita) => !cita.fecha.isBefore(today)).toList(),
    );
  }

  List<CitaModel> _selectedDayAppointments(List<CitaModel> source) {
    return _upcoming(source)
        .where((cita) => _isSameDay(cita.fecha, _selectedDate))
        .where(
            (cita) => _statusFilter == 'todas' || cita.estado == _statusFilter)
        .toList();
  }

  void _confirmAppointment(CitaModel cita) {
    if (!cita.isPendiente) {
      return;
    }

    CitasService.instance.confirmarCita(cita.id);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Cita confirmada: ${cita.tipo}'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.primaryTeal.withValues(alpha: 0.22),
      ),
    );
  }

  void _rejectAppointment(CitaModel cita) {
    if (!cita.isPendiente) {
      return;
    }

    CitasService.instance.rechazarCita(cita.id);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Cita rechazada: ${cita.tipo}'),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.danger.withValues(alpha: 0.22),
      ),
    );
  }

  Widget _buildFilterChip(String label, String value) {
    final isActive = _statusFilter == value;

    return InkWell(
      borderRadius: BorderRadius.circular(999),
      onTap: () => setState(() => _statusFilter = value),
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
                ? AppColors.primaryTeal.withValues(alpha: 0.55)
                : Colors.white.withValues(alpha: 0.12),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isActive ? AppColors.primaryTeal : Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildStat(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.13),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withValues(alpha: 0.35)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: AppTheme.glassCaption.copyWith(
                fontSize: 11,
                letterSpacing: 0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAppointmentCard(CitaModel cita) {
    final statusColor = _statusColor(cita.estado);

    return GlassCard(
      blurStrength: 22,
      opacity: 0.1,
      padding: const EdgeInsets.all(16),
      borderRadius: BorderRadius.circular(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [cita.color, cita.color.withValues(alpha: 0.65)],
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      cita.tipo,
                      style: AppTheme.glassTitle.copyWith(fontSize: 16),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      cita.terapeuta,
                      style: AppTheme.glassCaption.copyWith(fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.16),
                  borderRadius: BorderRadius.circular(999),
                  border:
                      Border.all(color: statusColor.withValues(alpha: 0.46)),
                ),
                child: Text(
                  _statusLabel(cita.estado),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 12,
            runSpacing: 8,
            children: [
              Text(
                '${DateFormat('HH:mm', 'es_ES').format(cita.fecha)}  ·  ${cita.duracionMin} min',
                style: AppTheme.glassSubtitle.copyWith(fontSize: 13),
              ),
              Text(
                cita.ubicacion,
                style: AppTheme.glassSubtitle.copyWith(fontSize: 13),
              ),
            ],
          ),
          if (cita.notas.isNotEmpty) ...[
            const SizedBox(height: 10),
            Text(
              cita.notas,
              style: AppTheme.glassCaption.copyWith(fontSize: 12),
            ),
          ],
          if (cita.isPendiente) ...[
            const SizedBox(height: 14),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FilledButton.icon(
                  onPressed: () => _rejectAppointment(cita),
                  icon: const Icon(Icons.close_rounded, size: 18),
                  label: const Text('Rechazar'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.danger,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton.icon(
                  onPressed: () => _confirmAppointment(cita),
                  icon: const Icon(Icons.check_rounded, size: 18),
                  label: const Text('Aceptar'),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.primaryTeal,
                    foregroundColor: const Color(0xFF052128),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
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
              final upcoming = _upcoming(citas);
              final dayAppointments = _selectedDayAppointments(citas);
              final pendientes = upcoming.where((c) => c.isPendiente).length;
              final confirmadas = upcoming.where((c) => c.isConfirmada).length;
              final completadas = citas.where((c) => c.isCompletada).length;

              return SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 110),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Agenda de Citas',
                      style: AppTheme.glassTitle.copyWith(fontSize: 28),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Visualiza, organiza y confirma tus sesiones con tu terapeuta.',
                      style: AppTheme.glassSubtitle.copyWith(fontSize: 14),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _buildStat(
                            'Pendientes', '$pendientes', AppColors.warning),
                        const SizedBox(width: 10),
                        _buildStat('Confirmadas', '$confirmadas',
                            AppColors.primaryTeal),
                        const SizedBox(width: 10),
                        _buildStat(
                            'Completadas', '$completadas', AppColors.success),
                      ],
                    ),
                    const SizedBox(height: 20),
                    GlassCard(
                      blurStrength: 24,
                      opacity: 0.1,
                      borderRadius: BorderRadius.circular(20),
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(6, 2, 6, 10),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  DateFormat('MMMM yyyy', 'es_ES')
                                      .format(_focusedDate),
                                  style: AppTheme.glassSubtitle.copyWith(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 5,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white.withValues(alpha: 0.08),
                                    borderRadius: BorderRadius.circular(999),
                                  ),
                                  child: Text(
                                    _calendarFormat == CalendarFormat.month
                                        ? 'Mes'
                                        : '2 semanas',
                                    style: AppTheme.glassCaption
                                        .copyWith(fontSize: 11),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          TableCalendar<CitaModel>(
                            locale: 'es_ES',
                            firstDay: DateTime.now()
                                .subtract(const Duration(days: 120)),
                            lastDay:
                                DateTime.now().add(const Duration(days: 365)),
                            focusedDay: _focusedDate,
                            selectedDayPredicate: (day) =>
                                _isSameDay(day, _selectedDate),
                            calendarFormat: _calendarFormat,
                            availableCalendarFormats: const {
                              CalendarFormat.month: 'Mes',
                              CalendarFormat.twoWeeks: '2 semanas',
                            },
                            eventLoader: (day) => _upcoming(citas)
                                .where((cita) => _isSameDay(cita.fecha, day))
                                .toList(),
                            onDaySelected: (selectedDay, focusedDay) {
                              setState(() {
                                _selectedDate = selectedDay;
                                _focusedDate = focusedDay;
                              });
                            },
                            onPageChanged: (focusedDay) {
                              setState(() {
                                _focusedDate = focusedDay;
                              });
                            },
                            onFormatChanged: (format) {
                              setState(() {
                                _calendarFormat = format;
                              });
                            },
                            headerVisible: false,
                            calendarStyle: CalendarStyle(
                              outsideDaysVisible: false,
                              defaultTextStyle:
                                  const TextStyle(color: Colors.white),
                              weekendTextStyle:
                                  const TextStyle(color: Colors.white70),
                              selectedTextStyle: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w700,
                              ),
                              todayTextStyle: const TextStyle(
                                color: AppColors.primaryTeal,
                                fontWeight: FontWeight.w700,
                              ),
                              markerDecoration: BoxDecoration(
                                color: AppColors.secondaryOrange,
                                borderRadius: BorderRadius.circular(4),
                              ),
                              markersMaxCount: 3,
                              selectedDecoration: BoxDecoration(
                                gradient: AppTheme.primaryGradient,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primaryTeal
                                        .withValues(alpha: 0.35),
                                    blurRadius: 12,
                                    spreadRadius: 1,
                                  ),
                                ],
                              ),
                              todayDecoration: BoxDecoration(
                                color: AppColors.primaryTeal
                                    .withValues(alpha: 0.18),
                                shape: BoxShape.circle,
                                border:
                                    Border.all(color: AppColors.primaryTeal),
                              ),
                            ),
                            daysOfWeekStyle: DaysOfWeekStyle(
                              weekdayStyle: AppTheme.glassCaption.copyWith(
                                fontSize: 11,
                                color: Colors.white.withValues(alpha: 0.72),
                              ),
                              weekendStyle: AppTheme.glassCaption.copyWith(
                                fontSize: 11,
                                color: Colors.white.withValues(alpha: 0.5),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Citas del ${DateFormat('dd/MM/yyyy', 'es_ES').format(_selectedDate)}',
                          style: AppTheme.glassSubtitle.copyWith(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          '${dayAppointments.length} evento(s)',
                          style: AppTheme.glassCaption.copyWith(fontSize: 11),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
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
                    if (dayAppointments.isEmpty)
                      GlassCard(
                        opacity: 0.08,
                        borderRadius: BorderRadius.circular(18),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          child: Column(
                            children: [
                              Icon(
                                Icons.event_busy_rounded,
                                color: Colors.white.withValues(alpha: 0.38),
                                size: 34,
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'No hay citas para esta fecha.',
                                style: AppTheme.glassCaption
                                    .copyWith(fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      )
                    else
                      Column(
                        children: dayAppointments
                            .map((cita) => Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: _buildAppointmentCard(cita),
                                ))
                            .toList(),
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
