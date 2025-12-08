import 'package:supabase_flutter/supabase_flutter.dart';

class ApiService {
  static final SupabaseClient supabase = Supabase.instance.client;

  // Fetch Transactions
  static Future<List<Map<String, dynamic>>> getTransactions() async {
    final response = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .order('transaction_date', ascending: false);
    
    return List<Map<String, dynamic>>.from(response);
  }

  // Fetch Categories
  static Future<List<Map<String, dynamic>>> getCategories() async {
    final response = await supabase.from('categories').select();
    return List<Map<String, dynamic>>.from(response);
  }

  // Add Transaction
  static Future<void> addTransaction({
    required double amount,
    required String type,
    required String categoryId,
    required String description,
    required DateTime date,
  }) async {
    await supabase.from('transactions').insert({
      'amount': amount,
      'type': type,
      'category_id': categoryId,
      'description': description,
      'transaction_date': date.toIso8601String(),
    });
  }

  // Fetch Global Budget
  static Future<Map<String, dynamic>?> getGlobalBudget() async {
    final now = DateTime.now();
    final monthYear = "${now.year}-${now.month.toString().padLeft(2, '0')}";
    
    try {
      final response = await supabase
          .from('global_budgets')
          .select()
          .eq('month_year', monthYear)
          .maybeSingle(); // Use maybeSingle to avoid exception if null
      return response;
    } catch (e) {
      return null;
    }
  }

  // Set Global Budget
  static Future<void> setGlobalBudget(double amount) async {
    final now = DateTime.now();
    final monthYear = "${now.year}-${now.month.toString().padLeft(2, '0')}";
    final userId = supabase.auth.currentUser?.id;

    // Check existing
    final existing = await getGlobalBudget();

    if (existing != null) {
      await supabase
          .from('global_budgets')
          .update({'amount_limit': amount})
          .eq('id', existing['id']);
    } else {
      await supabase.from('global_budgets').insert({
        'amount_limit': amount,
        'month_year': monthYear,
        // 'user_id': userId, // If auth is enabled
      });
    }
  }
}
