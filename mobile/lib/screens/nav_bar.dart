import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'paciente_dashboard_screen.dart';
import 'paciente_citas_screen.dart';
import 'paciente_historial_screen.dart';
import 'paciente_perfil_screen.dart';

class NavBar extends StatefulWidget {
  final String userName;
  const NavBar({super.key, required this.userName});

  @override
  State<NavBar> createState() => _NavBarState();
}

class _NavBarState extends State<NavBar> {
  int _currentIndex = 0;

  static const List<IconData> _icons = [
    Icons.dashboard_rounded,
    Icons.calendar_month_rounded,
    Icons.history_rounded,
    Icons.person_rounded,
  ];

  static const List<String> _labels = [
    'Inicio',
    'Citas',
    'Historial',
    'Perfil',
  ];

  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      PacienteDashboardScreen(userName: widget.userName),
      PacienteCitasScreen(userName: widget.userName),
      PacienteHistorialScreen(userName: widget.userName),
      PacientePerfilScreen(userName: widget.userName),
    ];

    return Scaffold(
      extendBody: true,
      body: IndexedStack(index: _currentIndex, children: pages),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(14, 0, 14, 14),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFF1A1E24).withValues(alpha: 0.76),
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.14),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.28),
                blurRadius: 24,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Row(
            children: List.generate(_labels.length, (index) {
              final isActive = _currentIndex == index;

              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => setState(() => _currentIndex = index),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      curve: Curves.easeOut,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        gradient: isActive
                            ? AppTheme.primaryGradient
                            : const LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  Colors.transparent
                                ],
                              ),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _icons[index],
                            size: 20,
                            color: isActive
                                ? Colors.white
                                : Colors.white.withValues(alpha: 0.66),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _labels[index],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight:
                                  isActive ? FontWeight.w700 : FontWeight.w500,
                              color: isActive
                                  ? Colors.white
                                  : Colors.white.withValues(alpha: 0.66),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
