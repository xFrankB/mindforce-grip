import 'package:flutter/foundation.dart';

import '../models/cita_model.dart';
import '../theme/app_theme.dart';

class CitasService {
  CitasService._();

  static final CitasService instance = CitasService._();

  final ValueNotifier<List<CitaModel>> citasNotifier =
      ValueNotifier<List<CitaModel>>(_buildSeedData());

  List<CitaModel> get citas => List.unmodifiable(citasNotifier.value);

  void confirmarCita(int id) {
    _updateEstado(id, 'confirmada');
  }

  void rechazarCita(int id) {
    _updateEstado(id, 'rechazada');
  }

  void completarCita(int id) {
    _updateEstado(id, 'completada');
  }

  void _updateEstado(int id, String nuevoEstado) {
    final updated = citasNotifier.value.map((cita) {
      if (cita.id != id) {
        return cita;
      }
      return cita.copyWith(estado: nuevoEstado);
    }).toList(growable: false);

    citasNotifier.value = updated;
  }

  void resetToSeed() {
    citasNotifier.value = _buildSeedData();
  }

  static List<CitaModel> _buildSeedData() {
    final now = DateTime.now();

    DateTime at(int dayOffset, int hour, int minute) {
      final date = now.add(Duration(days: dayOffset));
      return DateTime(date.year, date.month, date.day, hour, minute);
    }

    return [
      CitaModel(
        id: 1,
        fecha: at(-5, 10, 0),
        terapeuta: 'Dra. Elena Rios',
        tipo: 'Sesion de Rehabilitacion',
        especialidad: 'Neurorehabilitacion',
        duracionMin: 60,
        ubicacion: 'Consultorio 3A',
        notas: 'Mejora notable de movilidad fina.',
        estado: 'completada',
        color: AppColors.primaryTeal,
      ),
      CitaModel(
        id: 2,
        fecha: at(-2, 15, 30),
        terapeuta: 'Lic. Raul Tapia',
        tipo: 'Evaluacion de Progreso',
        especialidad: 'Motriz Superior',
        duracionMin: 45,
        ubicacion: 'Consultorio 2B',
        notas: 'Ajustar rutina de fortalecimiento.',
        estado: 'completada',
        color: AppColors.secondaryOrange,
      ),
      CitaModel(
        id: 3,
        fecha: at(1, 11, 0),
        terapeuta: 'Mtra. Diana Ortega',
        tipo: 'Sesion de Rehabilitacion',
        especialidad: 'Pediatrica',
        duracionMin: 60,
        ubicacion: 'Consultorio 1A',
        notas: 'Llevar bitacora de ejercicios de casa.',
        estado: 'pendiente',
        color: AppColors.accentPurple,
      ),
      CitaModel(
        id: 4,
        fecha: at(3, 9, 30),
        terapeuta: 'Dra. Elena Rios',
        tipo: 'Sesion de Seguimiento',
        especialidad: 'Neurorehabilitacion',
        duracionMin: 50,
        ubicacion: 'Consultorio 3A',
        notas: 'Revisar dolor durante flexion.',
        estado: 'confirmada',
        color: AppColors.primaryTeal,
      ),
      CitaModel(
        id: 5,
        fecha: at(7, 16, 0),
        terapeuta: 'Dr. Carlos Mendoza',
        tipo: 'Terapia Fisica',
        especialidad: 'Ortopedia',
        duracionMin: 55,
        ubicacion: 'Sala de Ejercicios',
        notas: 'Enfocar sesion en resistencia muscular.',
        estado: 'pendiente',
        color: AppColors.success,
      ),
      CitaModel(
        id: 6,
        fecha: at(10, 12, 30),
        terapeuta: 'Lic. Raul Tapia',
        tipo: 'Control Funcional',
        especialidad: 'Motriz Superior',
        duracionMin: 40,
        ubicacion: 'Consultorio 2B',
        notas: 'Llevar reportes de fuerza semanal.',
        estado: 'pendiente',
        color: AppColors.secondaryOrange,
      ),
    ];
  }
}
