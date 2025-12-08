import 'package:flutter/material.dart';
import 'package:wallet_app/screens/dashboard_screen.dart';
import 'package:wallet_app/screens/transactions_screen.dart';
import 'package:wallet_app/screens/settings_screen.dart';
import 'package:wallet_app/widgets/side_panel.dart';
import 'package:wallet_app/widgets/liquid_glass.dart';
import 'package:wallet_app/widgets/background_orbits.dart';
import 'dart:ui';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    DashboardScreen(),
    TransactionsScreen(),
    SettingsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    // Media Query for Responsive Layout
    final isDesktop = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      extendBody: true, // For glass effect behind navbar
      body: Stack(
        children: [
          const BackgroundOrbits(), // 0. Background Texture
          Row(
            children: [
              if (isDesktop)
            // 1. Sidebar (Left Column)
            Padding(
              padding: const EdgeInsets.only(right: 20, bottom: 20, top: 20, left: 20), // Outer margin for the glass sidebar to float? CSS says "app-frame gap: 20px", and sidebar is a child.
              // Actually, the sidebar in CSS is a direct child of the grid. 
              // In Flutter, `Row` doesn't have gap. The `gap: 20px` in CSS means we need SizedBox or Padding.
              // But wait, the Sidebar itself has the glass effect.
              // So I should wrap LiquidGlass in a SizedBox(width: 260).
              child: LiquidGlass(
                isStrong: true, // Strong blur for sidebar
                padding: const EdgeInsets.fromLTRB(18, 18, 18, 20),
                child: SizedBox(
                   width: 260 - 36, // 260 total width, minus padding (18+18) = 224? No, LiquidGlass default is box-sizing border-box equivalent usually? 
                   // The LiquidGlass widget uses Container padding. So child constraint is tighter.
                   // Let's just set width on the parent.
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Logo Row
                      Row(
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              gradient: const RadialGradient(
                                center: Alignment(0.2, -1.0), // circle at 20% 0
                                colors: [Color(0xFF38BDF8), Color(0xFF6366F1)],
                              ),
                              boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 10, offset: Offset(0, 5))],
                            ),
                            child: const Center(child: Text('◎', style: TextStyle(fontSize: 19, color: Colors.white))),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Ledger', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: -0.5, color: Colors.white)),
                              Text('Finance · Preview', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                            ],
                          )
                        ],
                      ),
                      
                      const SizedBox(height: 24),

                      // OVERVIEW Section
                      _buildSectionTitle('Overview'),
                      const SizedBox(height: 6),
                      Column(
                        children: [
                          _buildNavTile('Dashboard', Icons.home, 0),
                          _buildNavTile('Wallets', Icons.wallet, 1), // "Wallets" in CSS, map to TransactionsScreen? User code had "Transactions". Let's stick to "Wallets" label as per CSS reference.
                          _buildNavTile('Analytics', Icons.bar_chart, 2), // Placeholder index
                          _buildNavTile('Notifications', Icons.notifications, 3), // Placeholder
                        ],
                      ),
                      
                      const SizedBox(height: 24),

                      // ACCOUNT Section
                      _buildSectionTitle('Account'),
                      const SizedBox(height: 6),
                       Column(
                        children: [
                          _buildNavTile('Settings', Icons.settings, 4), // Placeholder
                          _buildNavTile('Privacy', Icons.security, 5), // Placeholder
                        ],
                      ),
                      
                      const Spacer(),
                      
                      // Footer
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(18),
                          color: const Color(0xFF0F172A).withOpacity(0.98),
                          border: Border.all(color: Colors.blue.withOpacity(0.3)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                             const Text('Dark Glass', style: TextStyle(fontWeight: FontWeight.w500, fontSize: 12, color: Colors.white)),
                             const SizedBox(height: 4),
                             Text('UI mock only. Buttons are decorative.', style: TextStyle(color: Colors.grey[500], fontSize: 10)),
                          ],
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
          
          // 2. Main Content (Center Column) with 3. Right Panel (Right Column)
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Main Feed
                Expanded(
                  flex: 5,
                  child: Container(
                    child: _screens[_selectedIndex],
                  ),
                ),
                
                // 3. Right Panel (Insights)
                if (isDesktop)
                  Expanded(
                    flex: 3,
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      color: Colors.transparent,
                      child: const SingleChildScrollView(
                        child: SidePanel(), // Your new component
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
      ],
      ),
      
      // Mobile Bottom Nav
      bottomNavigationBar: isDesktop
          ? null
          : ClipRRect(
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.6),
                    border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
                  ),
                  child: NavigationBar(
                    backgroundColor: Colors.transparent,
                    indicatorColor: const Color(0xFF0A84FF).withOpacity(0.2),
                    selectedIndex: _selectedIndex,
                    onDestinationSelected: (index) => setState(() => _selectedIndex = index),
                    destinations: const [
                      NavigationDestination(icon: Icon(Icons.speed), label: 'Dashboard'),
                      NavigationDestination(icon: Icon(Icons.list_alt), label: 'Transactions'),
                      NavigationDestination(icon: Icon(Icons.settings), label: 'Settings'),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
  Widget _buildSectionTitle(String title) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        fontSize: 12,
        letterSpacing: 1.5,
        fontWeight: FontWeight.w600,
        color: Colors.grey[600],
      ),
    );
  }

  Widget _buildNavTile(String label, IconData icon, int index) {
    final bool isSelected = _selectedIndex == index;
    // Remap index for navigation logic if needed, but for visual mock we use direct mapping or placeholder
    final bool isRealPage = index <= 2; // Dashboard, Wallets (Trans), Settings? 
    // Actual mapping: 0->Dashboard, 1->Transactions, 2->Settings. 
    // In the new list: 0->Dash, 1->Wallets, 2->Analytics, 3->Notif, 4->Settings, 5->Privacy.
    // We need to map `Wallets` to `TransactionsScreen` (1) and `Settings` to `SettingsScreen` (2).
    // Let's just update `_selectedIndex` visual state for all, but only switch screen if it matches existing screens.
    
    return GestureDetector(
      onTap: () {
        int targetScreenIndex = 0;
        if (label == 'Dashboard') targetScreenIndex = 0;
        else if (label == 'Wallets') targetScreenIndex = 1;
        else if (label == 'Settings') targetScreenIndex = 2;
        else targetScreenIndex = _selectedIndex; // Don't change screen for placeholders

        setState(() {
           // We use a separate `_visualIndex` if we want to highlight non-existent pages, but for now let's just highlight properties.
           // Actually, simpler: Just update _selectedIndex to `index` for visual, and handle screen switching logic separately or just show Dashboard for unimplemented.
           // User wants visual parity.
           _selectedIndex = targetScreenIndex; 
           // Wait, if I click "Analytics" (index 2 in sidebar list), it sets _selectedIndex=2 which is SettingsScreen in existing list?
           // Original list: [Dashboard, Transaction, Settings].
           // New Visuals: [Dash, Wallets, Analytics, Notif, Settings, Privacy].
           // I should probably map them carefully or just accept that "Analytics" might show Settings for now.
           // Correct Mapping:
           // Dash (0) -> Screen 0
           // Wallets (1) -> Screen 1 (Transactions)
           // Analytics (2) -> Stay/No-op
           // Notif (3) -> Stay/No-op
           // Settings (4) -> Screen 2
           // Privacy (5) -> Stay/No-op
        });
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          gradient: isSelected
              ? const RadialGradient(
                  center: Alignment(0.2, -1.0), // 10% 0
                  radius: 1.5,
                  colors: [
                    Color.fromRGBO(250, 204, 21, 0.2), // Yellow tint
                    Colors.transparent,
                  ],
                )
              : null,
          color: isSelected ? const Color.fromRGBO(15, 23, 42, 0.9) : Colors.transparent,
          boxShadow: isSelected ? [const BoxShadow(color: Colors.black54, blurRadius: 12, offset: Offset(0, 4))] : null,
        ),
        child: Row(
          children: [
            Container(
              width: 24,
              alignment: Alignment.center,
              child: Icon(
                icon,
                size: 20,
                color: isSelected ? const Color(0xFFFACC15) : Colors.grey[500],
              ),
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? const Color(0xFFFACC15) : Colors.grey[500],
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
