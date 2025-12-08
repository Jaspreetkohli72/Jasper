import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:wallet_app/widgets/glass_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Dashboard',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          
          // Metrics Row
          Row(
            children: [
              Expanded(child: GlassCard(title: 'Balance', value: '\$12,450.00', color: Colors.blue)),
              const SizedBox(width: 16),
              Expanded(child: GlassCard(title: 'Income', value: '\$4,200.00', color: Colors.green)),
              const SizedBox(width: 16),
              Expanded(child: GlassCard(title: 'Expenses', value: '\$1,850.00', color: Colors.red)),
            ],
          ),
          
          const SizedBox(height: 30),
          
          // Alerts Placeholder
           GlassCard(
            title: 'Budget Alerts',
            value: 'All good! You are within your budget.',
            color: Colors.white,
            isAlert: true,
          ),
           
          const SizedBox(height: 30),
          
          // Charts Row
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    color: Colors.white.withOpacity(0.05),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: const Center(child: Text("Income vs Expense Chart")),
                ),
              ),
              const SizedBox(width: 20),
              Expanded(
                flex: 1,
                 child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    color: Colors.white.withOpacity(0.05),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: const Center(child: Text("Categories Pie Chart")),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
