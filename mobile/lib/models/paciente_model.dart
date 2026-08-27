class Paciente {
  final String nombre;
  final int fuerza;
  final String nivel;
  final int racha;
  final int sesionesCompletadas;
  final int sesionesTotales;
  final double progresoSemanal;
  final DateTime ultimaSesion;

  Paciente({
    required this.nombre,
    required this.fuerza,
    required this.nivel,
    required this.racha,
    this.sesionesCompletadas = 0,
    this.sesionesTotales = 0,
    this.progresoSemanal = 0.0,
    DateTime? ultimaSesion,
  }) : ultimaSesion = ultimaSesion ?? DateTime.now();

  factory Paciente.fromJson(Map<String, dynamic> json) {
    return Paciente(
      nombre: json['nombre_completo'],
      fuerza: json['fuerza_actual_pct'],
      nivel: json['nivel_rehabilitacion'],
      racha: json['racha_dias'],
      sesionesCompletadas: json['sesiones_completadas'] ?? 0,
      sesionesTotales: json['sesiones_totales'] ?? 0,
      progresoSemanal: (json['progreso_semanal'] ?? 0.0) / 100.0,
      ultimaSesion: json['ultima_sesion'] != null
          ? DateTime.parse(json['ultima_sesion'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'nombre_completo': nombre,
      'fuerza_actual_pct': fuerza,
      'nivel_rehabilitacion': nivel,
      'racha_dias': racha,
      'sesiones_completadas': sesionesCompletadas,
      'sesiones_totales': sesionesTotales,
      'progreso_semanal': (progresoSemanal * 100).toInt(),
      'ultima_sesion': ultimaSesion.toIso8601String(),
    };
  }
}
