import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/paciente_model.dart';
import '../models/sesion_model.dart';

class ApiService {
  final SupabaseClient _client = Supabase.instance.client;

  Future<AuthResponse> login(String email, String password) async {
    return await _client.auth
        .signInWithPassword(email: email, password: password);
  }

  Future<AuthResponse> register(
      String email, String password, String nombreCompleto) async {
    final response = await _client.auth.signUp(
      email: email,
      password: password,
      data: {
        'role': 'paciente',
        'full_name': nombreCompleto,
      },
    );
    if (response.user == null) throw Exception("Error al crear usuario");

    await _client.from('pacientes').upsert({
      'id_paciente': response.user!.id,
      'nombre_completo': nombreCompleto,
      'email': email,
    }, onConflict: 'id_paciente');

    return response;
  }

  Future<void> logout() async {
    await _client.auth.signOut();
  }

  User? get currentUser => _client.auth.currentUser;

  Future<Paciente?> getPatientData() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return null;

    try {
      final data = await _client
          .from('pacientes')
          .select()
          .eq('id_paciente', userId)
          .single();
      return Paciente.fromJson(data);
    } catch (e) {
      print("Error al obtener datos del paciente: $e");
      return null;
    }
  }

  Future<List<SesionModel>> getUpcomingSessions() async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return [];

    try {
      final data = await _client
          .from('sesiones_rehabilitacion')
          .select('*, terapeutas(*)')
          .eq('id_paciente', userId)
          .eq('estado', 'Pendiente')
          .order('fecha_programada');
      return data
          .map((item) => SesionModel(
                fecha: item['fecha_programada'] ?? '',
                fuerzaPromedio: (item['fuerza_promedio'] ?? 0.0).toDouble(),
              ))
          .toList();
    } catch (e) {
      print("Error al obtener sesiones: $e");
      return [];
    }
  }

  Future<void> updateTrainingProgress(int fuerzaPct) async {
    final userId = _client.auth.currentUser?.id;
    if (userId == null) return;

    await _client
        .from('pacientes')
        .update({'fuerza_actual_pct': fuerzaPct}).eq('id_paciente', userId);
  }
}
