import 'package:flutter/material.dart';

class CitaModel {
  final int id;
  final DateTime fecha;
  final String terapeuta;
  final String tipo;
  final String especialidad;
  final int duracionMin;
  final String ubicacion;
  final String notas;
  final String estado;
  final Color color;

  const CitaModel({
    required this.id,
    required this.fecha,
    required this.terapeuta,
    required this.tipo,
    required this.especialidad,
    required this.duracionMin,
    required this.ubicacion,
    required this.notas,
    required this.estado,
    required this.color,
  });

  bool get isPendiente => estado == 'pendiente';
  bool get isConfirmada => estado == 'confirmada';
  bool get isCompletada => estado == 'completada';

  CitaModel copyWith({
    int? id,
    DateTime? fecha,
    String? terapeuta,
    String? tipo,
    String? especialidad,
    int? duracionMin,
    String? ubicacion,
    String? notas,
    String? estado,
    Color? color,
  }) {
    return CitaModel(
      id: id ?? this.id,
      fecha: fecha ?? this.fecha,
      terapeuta: terapeuta ?? this.terapeuta,
      tipo: tipo ?? this.tipo,
      especialidad: especialidad ?? this.especialidad,
      duracionMin: duracionMin ?? this.duracionMin,
      ubicacion: ubicacion ?? this.ubicacion,
      notas: notas ?? this.notas,
      estado: estado ?? this.estado,
      color: color ?? this.color,
    );
  }
}
