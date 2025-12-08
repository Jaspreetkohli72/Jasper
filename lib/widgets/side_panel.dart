import 'package:flutter/material.dart';
import 'package:wallet_app/widgets/liquid_glass.dart';

class SidePanel extends StatelessWidget {
  const SidePanel({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // 1. Month Snapshot
        LiquidGlass(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 14),
          background: const RadialGradient(
            center: Alignment.topLeft,
            radius: 1.0,
            colors: [
              Color.fromRGBO(59, 130, 246, 0.35), // Blue soft
              Color.fromRGBO(15, 23, 42, 0.98),   // Dark background
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'This month snapshot',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15, // CSS 15px
                ),
              ),
              const SizedBox(height: 8),
              GridView.count(
                shrinkWrap: true,
                crossAxisCount: 2,
                childAspectRatio: 2.2,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                physics: const NeverScrollableScrollPhysics(),
                children: const [
                  _SnapshotItem(label: 'Income', value: '\$4,200', color: Color(0xFF22C55E)),
                  _SnapshotItem(label: 'Spent', value: '\$2,910', color: Color(0xFFEF4444)),
                  _SnapshotItem(label: 'Saved', value: '\$1,290', color: Color(0xFF22C55E)),
                  _SnapshotItem(label: 'Active wallets', value: '3 / 5', color: Colors.white),
                ],
              ),
            ],
          ),
        ),
        
        const SizedBox(height: 20),
        
        // 2. Top Categories
        LiquidGlass(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
          background: const RadialGradient(
            center: Alignment(1.2, -1.0), // circle at 120% 0
            radius: 1.0,
            colors: [
              Color.fromRGBO(56, 189, 248, 0.3), // Sky blue
              Color.fromRGBO(15, 23, 42, 0.96),  // Dark
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
               const Text(
                'Top categories',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                ),
              ),
              const SizedBox(height: 10),
              _buildCategoryRow('Food & Dining', '\$640', const Color(0xFFFB923C)),
              const SizedBox(height: 7),
              _buildCategoryRow('Travel', '\$410', const Color(0xFF38BDF8)),
              const SizedBox(height: 7),
              _buildCategoryRow('Bills & Utilities', '\$390', const Color(0xFFA855F7)),
              const SizedBox(height: 7),
              _buildCategoryRow('Other', '\$210', const Color(0xFF22C55E)),
              
              const SizedBox(height: 16),
              // Bar
              Container(
                height: 5,
                width: double.infinity,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(999),
                  color: const Color.fromRGBO(15, 23, 42, 0.9),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(999),
                  child: Row(
                    children: [
                      Expanded(flex: 35, child: Container(color: const Color(0xFFFB923C).withOpacity(0.5))), // Using simpler colors than gradients for now
                      Expanded(flex: 25, child: Container(color: const Color(0xFF38BDF8).withOpacity(0.5))),
                      Expanded(flex: 20, child: Container(color: const Color(0xFFA855F7).withOpacity(0.5))),
                      Expanded(flex: 10, child: Container(color: const Color(0xFF22C55E).withOpacity(0.5))),
                      const Spacer(flex: 10),
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryRow(String label, String amount, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(label, style: const TextStyle(color: Colors.white, fontSize: 13)),
          ],
        ),
        Text(amount, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }
}

class _SnapshotItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _SnapshotItem({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.grey[400], fontSize: 12)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: color, fontSize: 16, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
