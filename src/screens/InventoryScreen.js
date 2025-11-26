import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import {
  getInventory,
  getLowStockItems,
  addStock,
  adjustStock,
  getVariants,
} from '../utils/api';

const InventoryScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal states
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newQuantity, setNewQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [showLowStockOnly]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      let data;

      if (showLowStockOnly) {
        data = await getLowStockItems();
      } else {
        data = await getInventory({ limit: 100 });
      }

      console.log('Inventory data received:', data);
      setInventory(data || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch inventory');
      console.error('Fetch inventory error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const handleAdjustStock = (item) => {
    setSelectedItem(item);
    setNewQuantity(item.quantity?.toString() || '0');
    setNotes('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjustment = async () => {
    if (!selectedItem) return;

    const qty = parseInt(newQuantity);
    if (isNaN(qty) || qty < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      await adjustStock({
        variant_id: selectedItem.variant_id,
        location: selectedItem.location || 'default',
        new_quantity: qty,
        notes: notes || `Adjusted from ${selectedItem.quantity} to ${qty}`,
      });

      Alert.alert('Success', 'Stock adjusted successfully');
      setAdjustModalVisible(false);
      fetchInventory();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to adjust stock');
      console.error('Adjust stock error:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (!searchText) return true;

    const search = searchText.toLowerCase();
    const productName = item.product_name?.toLowerCase() || '';
    const sku = item.sku?.toLowerCase() || '';
    const location = item.location?.toLowerCase() || '';

    return productName.includes(search) || sku.includes(search) || location.includes(search);
  });

  const renderInventoryItem = ({ item }) => {
    const isLowStock = item.reorder_point > 0 && item.available <= item.reorder_point;

    return (
      <TouchableOpacity
        style={[styles.inventoryCard, isLowStock && styles.lowStockCard]}
        onPress={() => handleAdjustStock(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.product_name || 'Unknown Product'}
            </Text>
            {item.sku && (
              <Text style={styles.sku}>SKU: {item.sku}</Text>
            )}
            <Text style={styles.location}>
              <Icon name="map-pin" size={12} color="#666" /> {item.location || 'default'}
            </Text>
          </View>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Icon name="alert-triangle" size={16} color="#ff4444" />
              <Text style={styles.lowStockText}>Low</Text>
            </View>
          )}
        </View>

        <View style={styles.stockInfo}>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>In Stock</Text>
            <Text style={styles.stockValue}>{item.quantity || 0}</Text>
          </View>

          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Reserved</Text>
            <Text style={[styles.stockValue, styles.reservedValue]}>
              {item.reserved || 0}
            </Text>
          </View>

          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Available</Text>
            <Text style={[styles.stockValue, styles.availableValue]}>
              {item.available || 0}
            </Text>
          </View>
        </View>

        {item.reorder_point > 0 && (
          <View style={styles.reorderInfo}>
            <Text style={styles.reorderText}>
              Reorder at: {item.reorder_point} | Qty: {item.reorder_quantity}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Inventory"
        showNotification={true}
        showMenu={true}
      />

      {/* Search and Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search inventory..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity
          style={[styles.filterButton, showLowStockOnly && styles.filterButtonActive]}
          onPress={() => setShowLowStockOnly(!showLowStockOnly)}
        >
          <Icon
            name="alert-triangle"
            size={18}
            color={showLowStockOnly ? '#fff' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {/* Inventory List */}
      {loading && inventory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DB8AC" />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item) => `${item.id || item.variant_id}-${item.location}`}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {showLowStockOnly ? 'No low stock items' : 'No inventory items yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                Add variants to products to start tracking inventory
              </Text>
            </View>
          }
        />
      )}

      <BottomNav navigation={navigation} activeRoute="Inventory" />

      {/* Adjust Stock Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adjust Stock</Text>
              <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItem && (
                <>
                  <Text style={styles.modalProductName}>
                    {selectedItem.product_name}
                  </Text>
                  {selectedItem.sku && (
                    <Text style={styles.modalSku}>SKU: {selectedItem.sku}</Text>
                  )}

                  <View style={styles.currentStock}>
                    <Text style={styles.currentStockLabel}>Current Stock:</Text>
                    <Text style={styles.currentStockValue}>
                      {selectedItem.quantity || 0}
                    </Text>
                  </View>

                  <Text style={styles.inputLabel}>New Quantity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new quantity"
                    keyboardType="numeric"
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                  />

                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Reason for adjustment..."
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                  />

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveAdjustment}
                  >
                    <Text style={styles.saveButtonText}>Save Adjustment</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  filterButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  filterButtonActive: {
    backgroundColor: '#ff4444',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  inventoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lowStockCard: {
    borderColor: '#ff4444',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#999',
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff4444',
  },
  stockInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  stockItem: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  reservedValue: {
    color: '#ff9500',
  },
  availableValue: {
    color: '#4DB8AC',
  },
  reorderInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reorderText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  modalSku: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  currentStock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  currentStockLabel: {
    fontSize: 14,
    color: '#666',
  },
  currentStockValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4DB8AC',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InventoryScreen;
