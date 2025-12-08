import 'package:flutter/material.dart';
import 'package:wallet_app/widgets/liquid_glass.dart';

class NetWorthCard extends StatelessWidget {
  final String amount;
  final String change;
  final bool isPositive;

  const NetWorthCard({
    super.key,
    required this.amount,
    required this.change,
    this.isPositive = true,
  });

  @override
  Widget build(BuildContext context) {
    return LiquidGlass(
      padding: const EdgeInsets.fromLTRB(20, 18, 20, 16),
      isStrong: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Net worth',
                    style: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 6), // CSS gap: 6px
                  Text(
                    amount,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w600,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              // Sparkline Placeholder (CSS .net-worth-spark)
              Container(
                width: 100,
                height: 40,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  gradient: LinearGradient(
                    colors: [
                      const Color(0xFF22C55E).withOpacity(0.1),
                      const Color(0xFF22C55E).withOpacity(0.3),
                    ],
                  ),
                  border: Border.all(
                    color: const Color(0xFF22C55E).withOpacity(0.5),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF22C55E).withOpacity(0.2),
                      blurRadius: 10,
                    )
                  ],
                ),
                child: CustomPaint(
                  painter: _SparklinePainter(),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
               Icon(
                isPositive ? Icons.arrow_drop_up : Icons.arrow_drop_down,
                color: isPositive ? const Color(0xFF22C55E) : const Color(0xFFEF4444),
              ),
              Text(
                change,
                style: TextStyle(
                  color: isPositive ? const Color(0xFF22C55E) : const Color(0xFFEF4444),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SparklinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF22C55E).withOpacity(0.8)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    
    final path = Path();
    path.moveTo(0, size.height * 0.7);
    path.quadraticBezierTo(size.width * 0.3, size.height * 0.9, size.width * 0.5, size.height * 0.4);
    path.quadraticBezierTo(size.width * 0.7, size.height * 0.1, size.width, size.height * 0.5);

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
