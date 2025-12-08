import 'package:flutter/material.dart';
import 'package:wallet_app/widgets/liquid_glass.dart';

class ActivityCard extends StatelessWidget {
  const ActivityCard({super.key});

  @override
  Widget build(BuildContext context) {
    return LiquidGlass(
      padding: const EdgeInsets.fromLTRB(18, 16, 18, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Recent Activity',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
              TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(
                  foregroundColor: const Color(0xFF38BDF8),
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('See all'),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // List Items (Mock Data for UI match)
          _buildActivityRow(
            icon: '🍽️',
            gradient: const [Color(0xFFFB923C), Color(0xFFF97316)],
            title: 'Dining out',
            subtitle: 'HDFC · Today · 7:21 PM',
            amount: '- \$42',
            isPositive: false,
          ),
          const SizedBox(height: 12),
          _buildActivityRow(
            icon: '💼',
            gradient: const [Color(0xFF38BDF8), Color(0xFF0EA5E9)],
            title: 'Freelance payout',
            subtitle: 'Cash · Yesterday',
            amount: '+ \$500',
            isPositive: true,
          ),
          const SizedBox(height: 12),
          _buildActivityRow(
            icon: '🛒',
            gradient: const [Color(0xFF4ADE80), Color(0xFF16A34A)],
            title: 'Groceries',
            subtitle: 'HDFC · Monday',
            amount: '- \$76',
            isPositive: false,
          ),
        ],
      ),
    );
  }

  Widget _buildActivityRow({
    required String icon,
    required List<Color> gradient,
    required String title,
    required String subtitle,
    required String amount,
    required bool isPositive,
  }) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: gradient,
            ),
            boxShadow: const [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 8,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Center(child: Text(icon, style: const TextStyle(fontSize: 16))),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.grey[400],
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
        Text(
          amount,
          style: TextStyle(
            color: isPositive ? const Color(0xFF22C55E) : const Color(0xFFEF4444), // Green or Red
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
