import 'package:flutter/material.dart';
import 'package:wallet_app/services/api_service.dart';
import 'package:wallet_app/widgets/glass_card.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final TextEditingController _controller = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadBudget();
  }

  Future<void> _loadBudget() async {
    final budget = await ApiService.getGlobalBudget();
    if (budget != null) {
      _controller.text = budget['amount_limit'].toString();
    }
  }

  Future<void> _saveBudget() async {
    setState(() => _loading = true);
    final val = double.tryParse(_controller.text);
    if (val != null) {
      await ApiService.setGlobalBudget(val);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Budget Saved!")));
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Settings', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          GlassCard(
            title: 'Set Monthly Budget',
            value: '', 
            isAlert: false,
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.1)),
            ),
            child: TextField(
              controller: _controller,
              keyboardType: TextInputType.number,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                border: InputBorder.none,
                labelText: 'Total Monthly Limit (\$)',
                labelStyle: TextStyle(color: Colors.grey),
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _loading ? null : _saveBudget,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0A84FF),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: _loading ? const CircularProgressIndicator() : const Text("Save Budget"),
            ),
          ),
        ],
      ),
    );
  }
}
