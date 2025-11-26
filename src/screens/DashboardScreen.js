import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getProducts, getLowStockItems } from '../utils/api';

const DashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalInventory: 0,
  });
  const [recentMovements, setRecentMovements] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all products
      const productsData = await getProducts();
      const totalProducts = productsData?.length || 0;

      // Calculate total inventory stock (sum of all variant quantities)
      let totalInventory = 0;
      if (productsData && Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach(variant => {
              totalInventory += variant.quantity || 0;
            });
          }
        });
      }

      // Fetch low stock items
      const lowStockData = await getLowStockItems();
      const lowStock = lowStockData?.length || 0;

      // Count out of stock items (available = 0)
      const outOfStock = lowStockData?.filter(item => item.available === 0).length || 0;

      setStats({
        totalProducts,
        lowStock,
        outOfStock,
        totalInventory,
      });

      // Set recent movements from low stock data
      if (lowStockData && lowStockData.length > 0) {
        const movements = lowStockData.slice(0, 5).map((item) => {
          const variant = item.attributes || {};
          const variantStr = [variant.size, variant.color].filter(Boolean).join(', ');

          return {
            id: item.id,
            product: item.product_name || 'Unknown Product',
            variant: variantStr,
            type: item.available === 0 ? 'out' : item.available < 10 ? 'low' : 'adjust',
            quantity: item.available || 0,
            stock: item.quantity || 0,
            time: 'Recently',
          };
        });
        setRecentMovements(movements);
      } else {
        setRecentMovements([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'out':
        return { name: 'x-circle', color: '#ff4444', bg: '#ff444420' };
      case 'low':
        return { name: 'alert-triangle', color: '#ff9500', bg: '#ff950020' };
      default:
        return { name: 'edit-2', color: '#2196F3', bg: '#2196F320' };
    }
  };

  const getMovementDetail = (type, quantity, stock) => {
    switch (type) {
      case 'out':
        return 'Out of Stock • 0 units';
      case 'low':
        return `Low Stock • ${quantity} units available`;
      default:
        return `Stock Level • ${stock} units`;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard"
        showNotification={true}
        showMenu={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4DB8AC" />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {/* Welcome Section */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Inventory Overview</Text>
              <Text style={styles.welcomeSubtitle}>Real-time stock monitoring</Text>
            </View>

            {/* Inventory Overview Cards */}
            <View style={styles.inventorySection}>
              <View style={styles.inventoryCards}>
                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#4DB8AC20' }]}>
                    <Icon name="package" size={28} color="#4DB8AC" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.totalProducts}</Text>
                  <Text style={styles.inventoryLabel}>Total Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#2196F320' }]}>
                    <Icon name="layers" size={28} color="#2196F3" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.totalInventory}</Text>
                  <Text style={styles.inventoryLabel}>Total Stock</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inventoryCards}>
                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#ff950020' }]}>
                    <Icon name="alert-triangle" size={28} color="#ff9500" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.lowStock}</Text>
                  <Text style={styles.inventoryLabel}>Low Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#ff444420' }]}>
                    <Icon name="x-circle" size={28} color="#ff4444" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.outOfStock}</Text>
                  <Text style={styles.inventoryLabel}>Out of Stock</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recent Stock Alerts */}
            <View style={styles.stockMovementsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Stock Alerts</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
                  <Icon name="chevron-right" size={20} color="#4DB8AC" />
                </TouchableOpacity>
              </View>

              <View style={styles.stockMovements}>
                {recentMovements.length > 0 ? (
                  recentMovements.map((movement) => {
                    const iconConfig = getMovementIcon(movement.type);
                    return (
                      <TouchableOpacity
                        key={movement.id}
                        style={styles.movementItem}
                        onPress={() => navigation.navigate('ProductList')}
                      >
                        <View style={[styles.movementIcon, { backgroundColor: iconConfig.bg }]}>
                          <Icon name={iconConfig.name} size={18} color={iconConfig.color} />
                        </View>
                        <View style={styles.movementInfo}>
                          <Text style={styles.movementProduct}>
                            {movement.product}
                            {movement.variant ? ` (${movement.variant})` : ''}
                          </Text>
                          <Text style={styles.movementDetail}>
                            {getMovementDetail(movement.type, movement.quantity, movement.stock)}
                          </Text>
                        </View>
                        <Icon name="chevron-right" size={16} color="#ccc" />
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={styles.emptyMovements}>
                    <Icon name="check-circle" size={48} color="#4DB8AC" />
                    <Text style={styles.emptyMovementsTitle}>All Stock Levels Healthy!</Text>
                    <Text style={styles.emptyMovementsText}>
                      No low stock or out of stock items
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('Products')}
                >
                  <Icon name="plus-circle" size={32} color="#4DB8AC" />
                  <Text style={styles.quickActionText}>Add Product</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <Icon name="list" size={32} color="#2196F3" />
                  <Text style={styles.quickActionText}>View Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => navigation.navigate('CategoryList')}
                >
                  <Icon name="folder" size={32} color="#ff9500" />
                  <Text style={styles.quickActionText}>Categories</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Dashboard" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inventorySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inventoryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inventoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inventoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  inventoryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  inventoryLabel: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  stockMovementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stockMovements: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementInfo: {
    flex: 1,
  },
  movementProduct: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  movementDetail: {
    fontSize: 13,
    color: '#666',
  },
  emptyMovements: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyMovementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4DB8AC',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyMovementsText: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default DashboardScreen;
