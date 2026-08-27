import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/supabase_config.dart';

class PacienteApiService {
  static const String baseUrl = '$supabaseUrl/rest/v1';
  static const String apiKey = supabaseAnonKey;

  final Map<String, String> _headers = {
    'apikey': apiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  Future<bool> loginPaciente(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pacientes?email=eq.$email'),
        headers: _headers,
        body: jsonEncode({'email': email, 'password': password}),
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          if (data[0]['password'] == password) {
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      print('Error en login: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> getPacienteByEmail(String email) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/pacientes?email=eq.$email'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          return data[0];
        }
      }
      return null;
    } catch (e) {
      print('Error al obtener paciente: $e');
      return null;
    }
  }

  Future<bool> registrarPaciente({
    required String nombre,
    required String email,
    required String password,
    required String telefono,
    required String diagnostico,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/pacientes'),
        headers: _headers,
        body: jsonEncode({
          'nombre_completo': nombre,
          'email': email,
          'password': password,
          'telefono': telefono,
          'diagnostico': diagnostico,
          'fecha_registro': DateTime.now().toIso8601String(),
          'estado': 'activo',
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Error al registrar paciente: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getCitas(String pacienteId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/citas?id_paciente=eq.$pacienteId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error al obtener citas: $e');
      return [];
    }
  }

  Future<bool> reagendarCita(String citaId, DateTime nuevaFecha) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/citas?id=eq.$citaId'),
        headers: _headers,
        body: jsonEncode({
          'fecha': nuevaFecha.toIso8601String(),
          'fecha_actualizacion': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error al reagendar cita: $e');
      return false;
    }
  }

  Future<bool> cancelarCita(String citaId, String razon) async {
    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/citas?id=eq.$citaId'),
        headers: _headers,
        body: jsonEncode({
          'estado': 'cancelada',
          'razon_cancelacion': razon,
          'fecha_cancelacion': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error al cancelar cita: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getSesiones(String pacienteId) async {
    try {
      final response = await http.get(
        Uri.parse(
            '$baseUrl/sesiones?id_paciente=eq.$pacienteId&order=fecha.desc'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error al obtener sesiones: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getSesionDetalles(String sesionId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sesiones?id=eq.$sesionId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          return data[0];
        }
      }
      return null;
    } catch (e) {
      print('Error al obtener detalles de sesión: $e');
      return null;
    }
  }

  Future<bool> descargarReporteSesion(String sesionId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/sesiones/$sesionId/reporte'),
        headers: _headers,
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error al descargar reporte: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> getProgreso(String pacienteId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/progreso?id_paciente=eq.$pacienteId'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        if (data.isNotEmpty) {
          return data[0];
        }
      }
      return null;
    } catch (e) {
      print('Error al obtener progreso: $e');
      return null;
    }
  }

  Future<bool> actualizarPerfil(
    String pacienteId, {
    String? nombre,
    String? telefono,
    String? direccion,
    String? fechaNacimiento,
  }) async {
    try {
      Map<String, dynamic> datos = {
        'fecha_actualizacion': DateTime.now().toIso8601String(),
      };

      if (nombre != null) datos['nombre_completo'] = nombre;
      if (telefono != null) datos['telefono'] = telefono;
      if (direccion != null) datos['direccion'] = direccion;
      if (fechaNacimiento != null) datos['fecha_nacimiento'] = fechaNacimiento;

      final response = await http.patch(
        Uri.parse('$baseUrl/pacientes?id=eq.$pacienteId'),
        headers: _headers,
        body: jsonEncode(datos),
      );

      return response.statusCode == 200;
    } catch (e) {
      print('Error al actualizar perfil: $e');
      return false;
    }
  }

  Future<bool> cambiarContrasena(
    String pacienteId,
    String contrasenaActual,
    String contrasenaNueva,
  ) async {
    try {
      final paciente = await http.get(
        Uri.parse('$baseUrl/pacientes?id=eq.$pacienteId'),
        headers: _headers,
      );

      if (paciente.statusCode == 200) {
        List<dynamic> data = jsonDecode(paciente.body);
        if (data.isNotEmpty && data[0]['password'] == contrasenaActual) {
          final response = await http.patch(
            Uri.parse('$baseUrl/pacientes?id=eq.$pacienteId'),
            headers: _headers,
            body: jsonEncode({
              'password': contrasenaNueva,
              'fecha_actualizacion': DateTime.now().toIso8601String(),
            }),
          );

          return response.statusCode == 200;
        }
      }
      return false;
    } catch (e) {
      print('Error al cambiar contrasena: $e');
      return false;
    }
  }

  Future<bool> enviarMensaje(
    String pacienteId,
    String terapeutaId,
    String mensaje,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/mensajes'),
        headers: _headers,
        body: jsonEncode({
          'id_paciente': pacienteId,
          'id_terapeuta': terapeutaId,
          'mensaje': mensaje,
          'fecha_envio': DateTime.now().toIso8601String(),
          'leido': false,
        }),
      );

      return response.statusCode == 201;
    } catch (e) {
      print('Error al enviar mensaje: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getMensajes(String pacienteId) async {
    try {
      final response = await http.get(
        Uri.parse(
            '$baseUrl/mensajes?id_paciente=eq.$pacienteId&order=fecha_envio.desc'),
        headers: _headers,
      );

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        return List<Map<String, dynamic>>.from(data);
      }
      return [];
    } catch (e) {
      print('Error al obtener mensajes: $e');
      return [];
    }
  }
}
