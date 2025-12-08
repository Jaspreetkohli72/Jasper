import 'package:flutter/material.dart';
import 'package:wallet_app/services/api_service.dart';
import 'package:wallet_app/widgets/glass_card.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  late Future<List<Map<String, dynamic>>> _transactionsFuture;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  void _refresh() {
    setState(() {
      _transactionsFuture = ApiService.getTransactions();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Transactions', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
              ElevatedButton.icon(
                onPressed: () {
                  // Show Add Dialog (Placeholder)
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Add Transaction Dialog to be implemented")));
                },
                icon: const Icon(Icons.add),
                label: const Text("New"),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0A84FF),
                  foregroundColor: Colors.white,
                ),
              )
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: FutureBuilder<List<Map<String, dynamic>>>(
              future: _transactionsFuture,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                }
                final data = snapshot.data ?? [];
                if (data.isEmpty) {
                  return const Center(child: Text("No transactions found."));
                }
                return ListView.builder(
                  itemCount: data.length,
                  itemBuilder: (context, index) {
                    final tx = data[index];
                    final isExpense = tx['type'] == 'expense';
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: GlassCard(
                        title: tx['description'] ?? 'No Description',
                        value: "\$${tx['amount']}",
                        color: isExpense ? Colors.redAccent : Colors.greenAccent,
                        isAlert: true, // Reusing style for list item
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
