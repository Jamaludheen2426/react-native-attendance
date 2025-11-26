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
  const [selectedFilter, setSelectedFilter] = useState('1W');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    productIn: 0,
    productOut: 0,
  });
  const [recentMovements, setRecentMovements] = useState([]);

  const filters = ['1D', '1W', '1M', '3W', '6W', '1Y'];

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

      // Calculate total stock (sum of all variant stock)
      let totalStock = 0;
      if (productsData && Array.isArray(productsData)) {
        productsData.forEach(product => {
          if (product.variants && Array.isArray(product.variants)) {
            product.variants.forEach(variant => {
              totalStock += variant.quantity || 0;
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
        productIn: totalStock, // Total inventory
        productOut: Math.floor(totalStock * 0.65), // Simulated sold products (65%)
      });

      // Set recent movements from low stock data
      if (lowStockData && lowStockData.length > 0) {
        const movements = lowStockData.slice(0, 3).map((item) => {
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
        title="Dashboard Shop"
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
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.statCardIn]}>
                <View style={styles.statIconContainer}>
                  <Icon name="package" size={24} color="#fff" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{stats.productIn}</Text>
                  <Text style={styles.statLabel}>Product In</Text>
                </View>
              </View>

              <View style={[styles.statCard, styles.statCardOut]}>
                <View style={styles.statIconContainer}>
                  <Icon name="trending-up" size={24} color="#fff" />
                </View>
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{stats.productOut}</Text>
                  <Text style={styles.statLabel}>Product Out</Text>
                </View>
              </View>
            </View>

            {/* Filter Range */}
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filter Range</Text>
                <TouchableOpacity>
                  <Icon name="chevron-right" size={20} color="#4DB8AC" />
                </TouchableOpacity>
              </View>
              <View style={styles.filterChips}>
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedFilter === filter && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selectedFilter === filter && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Revenue */}
            <View style={styles.revenueSection}>
              <View style={styles.revenueHeader}>
                <Text style={styles.revenueTitle}>Revenue</Text>
                <TouchableOpacity>
                  <Icon name="chevron-right" size={20} color="#4DB8AC" />
                </TouchableOpacity>
              </View>
              <Text style={styles.revenueAmount}>₹ 32,370.04</Text>

              {/* Chart */}
              <View style={styles.chartContainer}>
                <View style={styles.chart}>
                  {/* Simple line chart representation */}
                  <View style={styles.chartLine}>
                    <View style={[styles.chartPoint, { bottom: 40, left: '10%' }]} />
                    <View style={[styles.chartPoint, { bottom: 80, left: '25%' }]} />
                    <View style={[styles.chartPoint, { bottom: 60, left: '40%' }]} />
                    <View style={[styles.chartPoint, { bottom: 120, left: '55%' }]} />
                    <View style={[styles.chartPoint, { bottom: 90, left: '70%' }]} />
                    <View style={[styles.chartPoint, { bottom: 70, left: '85%' }]} />
                  </View>

                  {/* Tooltip */}
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>₹2673</Text>
                  </View>
                </View>

                {/* Days */}
                <View style={styles.chartDays}>
                  <Text style={styles.dayText}>MON</Text>
                  <Text style={styles.dayText}>TUE</Text>
                  <Text style={styles.dayText}>WED</Text>
                  <Text style={styles.dayText}>THU</Text>
                  <Text style={styles.dayText}>FRI</Text>
                  <Text style={styles.dayText}>SAT</Text>
                  <Text style={styles.dayText}>SUN</Text>
                </View>
              </View>
            </View>

            {/* Order Completed */}
            <View style={styles.orderSection}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTitle}>Order Completed</Text>
                <TouchableOpacity>
                  <Icon name="chevron-right" size={20} color="#4DB8AC" />
                </TouchableOpacity>
              </View>
              <Text style={styles.orderCount}>1,670</Text>
            </View>

            {/* Inventory Overview */}
            <View style={styles.inventorySection}>
              <View style={styles.inventoryHeader}>
                <Text style={styles.inventoryTitle}>Inventory Overview</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ProductList')}>
                  <Icon name="chevron-right" size={20} color="#4DB8AC" />
                </TouchableOpacity>
              </View>

              <View style={styles.inventoryCards}>
                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#4DB8AC20' }]}>
                    <Icon name="package" size={24} color="#4DB8AC" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.totalProducts}</Text>
                  <Text style={styles.inventoryLabel}>Total Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#ff950020' }]}>
                    <Icon name="alert-triangle" size={24} color="#ff9500" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.lowStock}</Text>
                  <Text style={styles.inventoryLabel}>Low Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.inventoryCard}
                  onPress={() => navigation.navigate('ProductList')}
                >
                  <View style={[styles.inventoryIcon, { backgroundColor: '#ff444420' }]}>
                    <Icon name="x-circle" size={24} color="#ff4444" />
                  </View>
                  <Text style={styles.inventoryValue}>{stats.outOfStock}</Text>
                  <Text style={styles.inventoryLabel}>Out of Stock</Text>
                </TouchableOpacity>
              </View>

              {/* Recent Stock Movements */}
              <View style={styles.stockMovements}>
                <Text style={styles.stockMovementsTitle}>Recent Stock Movements</Text>

                {recentMovements.length > 0 ? (
                  recentMovements.map((movement) => {
                    const iconConfig = getMovementIcon(movement.type);
                    return (
                      <View key={movement.id} style={styles.movementItem}>
                        <View style={[styles.movementIcon, { backgroundColor: iconConfig.bg }]}>
                          <Icon name={iconConfig.name} size={16} color={iconConfig.color} />
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
                        <Text style={styles.movementTime}>{movement.time}</Text>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyMovements}>
                    <Icon name="check-circle" size={32} color="#4DB8AC" />
                    <Text style={styles.emptyMovementsText}>All stock levels are healthy!</Text>
                  </View>
                )}
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
    backgroundColor: '#fff',
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statCardIn: {
    backgroundColor: '#4DB8AC',
  },
  statCardOut: {
    backgroundColor: '#2196F3',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  filterChips: {
    flexDirection: 'row',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  filterChipActive: {
    backgroundColor: '#4DB8AC',
  },
  filterText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  revenueSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
  },
  chart: {
    height: 180,
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 10,
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4DB8AC',
  },
  tooltip: {
    position: 'absolute',
    top: 30,
    right: 40,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  chartDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  dayText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  orderSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  inventorySection: {
    paddingHorizontal: 20,
    marginBottom: 100,
    marginTop: 20,
  },
  inventoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  inventoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  inventoryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inventoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inventoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  inventoryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  inventoryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  stockMovements: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stockMovementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  movementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  movementIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  movementInfo: {
    flex: 1,
  },
  movementProduct: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  movementDetail: {
    fontSize: 12,
    color: '#666',
  },
  movementTime: {
    fontSize: 12,
    color: '#999',
  },
  emptyMovements: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyMovementsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});

export default DashboardScreen;
