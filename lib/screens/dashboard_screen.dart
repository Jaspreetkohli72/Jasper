import 'package:flutter/material.dart';
import 'package:wallet_app/widgets/net_worth_card.dart';
import 'package:wallet_app/widgets/wallet_card.dart';
import 'package:wallet_app/widgets/activity_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // This dashboard is designed to fill the "Main Area" column
    return SingleChildScrollView(
      padding: const EdgeInsets.only(left: 20, right: 20, top: 10, bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header (Welcome Message)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Overview',
                    style: TextStyle(
                      color: Colors.grey[400],
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Good evening, Jaspreet',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 24,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              // User Avatar & Status
              Row(
                children: [
                  Text(
                    'Cloud sync · Idle',
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const RadialGradient(
                        colors: [Color(0xFF22C55E), Color(0xFF16A34A)],
                        center: Alignment.topLeft,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.5),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Center(
                      child: Text(
                        'J',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  )
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // 1. Net Worth Card
          const NetWorthCard(
            amount: '\$59,436',
            change: '+3.8% vs last month',
            isPositive: true,
          ),
          
          const SizedBox(height: 20),
          
          // 2. Wallets Row
          const Row(
            children: [
              Expanded(
                child: WalletCard(
                  type: WalletType.cash,
                  name: 'Cash',
                  balance: '\$1,200',
                  label: 'Personal',
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: WalletCard(
                  type: WalletType.bank,
                  name: 'HDFC',
                  balance: '\$22,350',
                  label: 'Personal',
                ),
              ),
              SizedBox(width: 14),
              Expanded(
                child: WalletCard(
                  type: WalletType.crypto,
                  name: 'Crypto',
                  balance: '\$15,640',
                  label: 'Personal',
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // 3. Recent Activity
          const ActivityCard(),
        ],
      ),
    );
  }
}
