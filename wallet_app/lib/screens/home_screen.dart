import 'package:flutter/material.dart';
import 'package:wallet_app/screens/dashboard_screen.dart';
import 'package:wallet_app/screens/transactions_screen.dart';
import 'package:wallet_app/screens/settings_screen.dart';
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
      body: Row(
        children: [
          if (isDesktop)
            // Desktop Glass Sidebar
            Container(
              width: 250,
              decoration: BoxDecoration(
                border: Border(right: BorderSide(color: Colors.white.withOpacity(0.1))),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.05),
                    Colors.white.withOpacity(0.02),
                  ],
                ),
              ),
              child: ClipRRect(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                  child: NavigationRail(
                    backgroundColor: Colors.transparent,
                    selectedIndex: _selectedIndex,
                    onDestinationSelected: (int index) {
                      setState(() {
                        _selectedIndex = index;
                      });
                    },
                    labelType: NavigationRailLabelType.all,
                    destinations: const [
                      NavigationRailDestination(
                        icon: Icon(Icons.speed, color: Colors.grey),
                        selectedIcon: Icon(Icons.speed, color: Color(0xFF0A84FF)),
                        label: Text('Dashboard', style: TextStyle(color: Colors.white)),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.list_alt, color: Colors.grey),
                        selectedIcon: Icon(Icons.list_alt, color: Color(0xFF0A84FF)),
                        label: Text('Transactions', style: TextStyle(color: Colors.white)),
                      ),
                      NavigationRailDestination(
                        icon: Icon(Icons.settings, color: Colors.grey),
                        selectedIcon: Icon(Icons.settings, color: Color(0xFF0A84FF)),
                        label: Text('Settings', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          
          // Main Content
          Expanded(
            child: Container(
               decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(-0.8, -0.6),
                  radius: 1.5,
                  colors: [
                     Color(0xFF1c1c2e), // Deep blue/purple base
                     Colors.black,
                  ],
                ),
              ),
              child: _screens[_selectedIndex],
            ),
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
}
