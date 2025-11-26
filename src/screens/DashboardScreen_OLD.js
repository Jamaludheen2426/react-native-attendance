import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const DashboardScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('1W');

  const filters = ['1D', '1W', '1M', '3W', '6W', '1Y'];

  return (
    <View style={styles.container}>
      <Header
        title="Dashboard Shop"
        showNotification={true}
        showMenu={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardIn]}>
            <View style={styles.statIconContainer}>
              <Icon name="package" size={24} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>4890</Text>
              <Text style={styles.statLabel}>Product In</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardOut]}>
            <View style={styles.statIconContainer}>
              <Icon name="trending-up" size={24} color="#fff" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>3220</Text>
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
            <TouchableOpacity>
              <Icon name="chevron-right" size={20} color="#4DB8AC" />
            </TouchableOpacity>
          </View>

          <View style={styles.inventoryCards}>
            <View style={styles.inventoryCard}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#4DB8AC20' }]}>
                <Icon name="package" size={24} color="#4DB8AC" />
              </View>
              <Text style={styles.inventoryValue}>1,245</Text>
              <Text style={styles.inventoryLabel}>Total Products</Text>
            </View>

            <View style={styles.inventoryCard}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#ff950020' }]}>
                <Icon name="alert-triangle" size={24} color="#ff9500" />
              </View>
              <Text style={styles.inventoryValue}>12</Text>
              <Text style={styles.inventoryLabel}>Low Stock</Text>
            </View>

            <View style={styles.inventoryCard}>
              <View style={[styles.inventoryIcon, { backgroundColor: '#ff444420' }]}>
                <Icon name="x-circle" size={24} color="#ff4444" />
              </View>
              <Text style={styles.inventoryValue}>5</Text>
              <Text style={styles.inventoryLabel}>Out of Stock</Text>
            </View>
          </View>

          {/* Recent Stock Movements */}
          <View style={styles.stockMovements}>
            <Text style={styles.stockMovementsTitle}>Recent Stock Movements</Text>

            <View style={styles.movementItem}>
              <View style={[styles.movementIcon, { backgroundColor: '#4DB8AC20' }]}>
                <Icon name="arrow-up" size={16} color="#4DB8AC" />
              </View>
              <View style={styles.movementInfo}>
                <Text style={styles.movementProduct}>T-Shirt Classic (M, Red)</Text>
                <Text style={styles.movementDetail}>Stock Added • +50 units</Text>
              </View>
              <Text style={styles.movementTime}>2h ago</Text>
            </View>

            <View style={styles.movementItem}>
              <View style={[styles.movementIcon, { backgroundColor: '#ff444420' }]}>
                <Icon name="arrow-down" size={16} color="#ff4444" />
              </View>
              <View style={styles.movementInfo}>
                <Text style={styles.movementProduct}>Jeans Premium (32, Black)</Text>
                <Text style={styles.movementDetail}>Order Fulfilled • -3 units</Text>
              </View>
              <Text style={styles.movementTime}>4h ago</Text>
            </View>

            <View style={styles.movementItem}>
              <View style={[styles.movementIcon, { backgroundColor: '#2196F320' }]}>
                <Icon name="edit-2" size={16} color="#2196F3" />
              </View>
              <View style={styles.movementInfo}>
                <Text style={styles.movementProduct}>Hoodie Comfort (L, Gray)</Text>
                <Text style={styles.movementDetail}>Stock Adjusted • 15 units</Text>
              </View>
              <Text style={styles.movementTime}>6h ago</Text>
            </View>
          </View>
        </View>
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
    marginBottom: 100,
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
});

export default DashboardScreen;
