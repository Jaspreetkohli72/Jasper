import 'package:flutter/material.dart';
import 'package:wallet_app/widgets/liquid_glass.dart';

enum WalletType { cash, bank, crypto }

class WalletCard extends StatelessWidget {
  final WalletType type;
  final String name;
  final String balance;
  final String label;

  const WalletCard({
    super.key,
    required this.type,
    required this.name,
    required this.balance,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return LiquidGlass(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
      borderRadius: 20, // --radius-md
      background: const RadialGradient(
        center: Alignment.topLeft,
        radius: 1.0,
        colors: [
          Color.fromRGBO(148, 163, 184, 0.22), // Light Slate
          Color.fromRGBO(15, 23, 42, 0.9),     // Dark Slate Base
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10),
              gradient: _getIconGradient(type),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 8,
                  offset: Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                _getIconText(type),
                style: const TextStyle(fontSize: 18),
              ),
            ),
          ),
          const SizedBox(height: 10), // CSS margin-top: 10px
          Text(
            name,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 3), // CSS margin-top: 3px
          Text(
            balance,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16, // CSS font-size: 16px
              fontWeight: FontWeight.bold, // Kept bold (implied by hierarchy, though CSS didn't explicitly bold it, standard for values)
            ),
          ),
          const SizedBox(height: 2), // CSS margin-top: 2px
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[400],
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  LinearGradient _getIconGradient(WalletType type) {
    switch (type) {
      case WalletType.cash:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFBEF264), Color(0xFF4ADE80)], // Lime to Green
        );
      case WalletType.bank:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF38BDF8), Color(0xFF6366F1)], // Sky to Indigo
        );
      case WalletType.crypto:
        return const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFA855F7), Color(0xFFF9A8D4)], // Purple to Pink
        );
    }
  }

  String _getIconText(WalletType type) {
    switch (type) {
      case WalletType.cash:
        return '💵';
      case WalletType.bank:
        return '🏦';
      case WalletType.crypto:
        return '₿';
    }
  }
}
