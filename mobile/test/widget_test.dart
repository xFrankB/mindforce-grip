import 'package:flutter_test/flutter_test.dart';
import 'package:mind_force_grip_aplication/main.dart';

void main() {
  testWidgets('Carga inicial', (WidgetTester tester) async {
    await tester.pumpWidget(const MindForceApp());

    expect(find.byType(MindForceApp), findsOneWidget);
  });
}
