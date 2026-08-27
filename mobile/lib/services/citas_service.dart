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
        terapeuta: 'Terapeuta demo 01',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 60,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'completada',
        color: AppColors.primaryTeal,
      ),
      CitaModel(
        id: 2,
        fecha: at(-2, 15, 30),
        terapeuta: 'Terapeuta demo 02',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 45,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'completada',
        color: AppColors.secondaryOrange,
      ),
      CitaModel(
        id: 3,
        fecha: at(1, 11, 0),
        terapeuta: 'Terapeuta demo 03',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 60,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'pendiente',
        color: AppColors.accentPurple,
      ),
      CitaModel(
        id: 4,
        fecha: at(3, 9, 30),
        terapeuta: 'Terapeuta demo 01',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 50,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'confirmada',
        color: AppColors.primaryTeal,
      ),
      CitaModel(
        id: 5,
        fecha: at(7, 16, 0),
        terapeuta: 'Terapeuta demo 04',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 55,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'pendiente',
        color: AppColors.success,
      ),
      CitaModel(
        id: 6,
        fecha: at(10, 12, 30),
        terapeuta: 'Terapeuta demo 02',
        tipo: 'Sesion de demostracion',
        especialidad: 'Demostracion',
        duracionMin: 40,
        ubicacion: 'Entorno de demostracion',
        notas: 'Registro de demostracion.',
        estado: 'pendiente',
        color: AppColors.secondaryOrange,
      ),
    ];
  }
}
