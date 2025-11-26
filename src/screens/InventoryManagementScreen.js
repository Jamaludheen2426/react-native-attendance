import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

// Hardcoded inventory data
const HARDCODED_INVENTORY = [
  {
    id: 1,
    variant_id: 1,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-S-RED',
    location: 'Warehouse A',
    quantity: 45,
    reserved: 5,
    available: 40,
    reorder_point: 20,
    reorder_quantity: 50,
  },
  {
    id: 2,
    variant_id: 2,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-M-RED',
    location: 'Warehouse A',
    quantity: 78,
    reserved: 10,
    available: 68,
    reorder_point: 30,
    reorder_quantity: 100,
  },
  {
    id: 3,
    variant_id: 3,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-L-BLUE',
    location: 'Warehouse A',
    quantity: 12,
    reserved: 2,
    available: 10,
    reorder_point: 25,
    reorder_quantity: 75,
  },
  {
    id: 4,
    variant_id: 4,
    product_name: 'Jeans Premium',
    sku: 'JEANS-32-BLACK',
    location: 'Warehouse B',
    quantity: 25,
    reserved: 3,
    available: 22,
    reorder_point: 15,
    reorder_quantity: 40,
  },
  {
    id: 5,
    variant_id: 5,
    product_name: 'Jeans Premium',
    sku: 'JEANS-34-BLACK',
    location: 'Warehouse B',
    quantity: 8,
    reserved: 1,
    available: 7,
    reorder_point: 20,
    reorder_quantity: 50,
  },
  {
    id: 6,
    variant_id: 6,
    product_name: 'Hoodie Comfort',
    sku: 'HOODIE-M-GRAY',
    location: 'Store Front',
    quantity: 15,
    reserved: 0,
    available: 15,
    reorder_point: 10,
    reorder_quantity: 30,
  },
];

const InventoryManagementScreen = ({ navigation }) => {
  const [inventory, setInventory] = useState(HARDCODED_INVENTORY);
  const [searchText, setSearchText] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Stock action modal states
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('add'); // add, remove, adjust
  const [actionQuantity, setActionQuantity] = useState('');
  const [actionNotes, setActionNotes] = useState('');

  const locations = ['All', 'Warehouse A', 'Warehouse B', 'Store Front'];

  const handleStockAction = (item, type) => {
    setSelectedItem(item);
    setActionType(type);
    setActionQuantity('');
    setActionNotes('');
    setActionModalVisible(true);
  };

  const handleSaveAction = () => {
    const qty = parseInt(actionQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const updated = inventory.map(item => {
      if (item.id === selectedItem.id) {
        let newQuantity = item.quantity;

        if (actionType === 'add') {
          newQuantity = item.quantity + qty;
        } else if (actionType === 'remove') {
          newQuantity = item.quantity - qty;
          if (newQuantity < 0) {
            Alert.alert('Error', 'Insufficient stock');
            return item;
          }
        } else if (actionType === 'adjust') {
          newQuantity = qty;
        }

        return {
          ...item,
          quantity: newQuantity,
          available: newQuantity - item.reserved,
        };
      }
      return item;
    });

    setInventory(updated);
    setActionModalVisible(false);
    Alert.alert('Success', `Stock ${actionType}ed successfully`);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      !searchText ||
      item.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase());

    const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;

    const isLowStock = item.reorder_point > 0 && item.available <= item.reorder_point;
    const matchesLowStock = !showLowStockOnly || isLowStock;

    return matchesSearch && matchesLocation && matchesLowStock;
  });

  const renderInventoryCard = ({ item }) => {
    const isLowStock = item.reorder_point > 0 && item.available <= item.reorder_point;

    return (
      <View style={[styles.inventoryCard, isLowStock && styles.lowStockCard]}>
        <View style={styles.cardHeader}>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {item.product_name}
            </Text>
            <Text style={styles.sku}>SKU: {item.sku}</Text>
            <View style={styles.locationContainer}>
              <Icon name="map-pin" size={12} color="#666" />
              <Text style={styles.location}>{item.location}</Text>
            </View>
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
            <Text style={styles.stockValue}>{item.quantity}</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Reserved</Text>
            <Text style={[styles.stockValue, styles.reservedValue]}>
              {item.reserved}
            </Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={styles.stockLabel}>Available</Text>
            <Text style={[styles.stockValue, styles.availableValue]}>
              {item.available}
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

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addBtn]}
            onPress={() => handleStockAction(item, 'add')}
          >
            <Icon name="plus" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Add Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.removeBtn]}
            onPress={() => handleStockAction(item, 'remove')}
          >
            <Icon name="minus" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Remove</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.adjustBtn]}
            onPress={() => handleStockAction(item, 'adjust')}
          >
            <Icon name="edit-2" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Adjust</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Inventory Management" showNotification={true} showMenu={true} />

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

      {/* Location Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.locationFilter}
        contentContainerStyle={styles.locationFilterContent}
      >
        {locations.map(location => (
          <TouchableOpacity
            key={location}
            style={[
              styles.locationChip,
              selectedLocation === location && styles.locationChipActive,
            ]}
            onPress={() => setSelectedLocation(location)}
          >
            <Text
              style={[
                styles.locationChipText,
                selectedLocation === location && styles.locationChipTextActive,
              ]}
            >
              {location}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {showLowStockOnly ? 'No low stock items' : 'No inventory items'}
            </Text>
            <Text style={styles.emptySubtext}>
              Add variants to start tracking inventory
            </Text>
          </View>
        }
      />

      <BottomNav navigation={navigation} activeRoute="Inventory" />

      {/* Stock Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {actionType === 'add' && 'Add Stock'}
                {actionType === 'remove' && 'Remove Stock'}
                {actionType === 'adjust' && 'Adjust Stock'}
              </Text>
              <TouchableOpacity onPress={() => setActionModalVisible(false)}>
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedItem && (
                <>
                  <Text style={styles.modalProductName}>{selectedItem.product_name}</Text>
                  <Text style={styles.modalSku}>SKU: {selectedItem.sku}</Text>
                  <Text style={styles.modalLocation}>
                    <Icon name="map-pin" size={12} color="#666" /> {selectedItem.location}
                  </Text>

                  <View style={styles.currentStock}>
                    <Text style={styles.currentStockLabel}>Current Stock:</Text>
                    <Text style={styles.currentStockValue}>{selectedItem.quantity}</Text>
                  </View>

                  <Text style={styles.inputLabel}>
                    {actionType === 'adjust' ? 'New Quantity' : 'Quantity'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    value={actionQuantity}
                    onChangeText={setActionQuantity}
                  />

                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Reason for action..."
                    multiline
                    numberOfLines={3}
                    value={actionNotes}
                    onChangeText={setActionNotes}
                  />

                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveAction}>
                    <Text style={styles.saveButtonText}>Confirm Action</Text>
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
  locationFilter: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  locationFilterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  locationChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  locationChipActive: {
    backgroundColor: '#4DB8AC',
  },
  locationChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  locationChipTextActive: {
    color: '#fff',
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginBottom: 12,
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
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  reorderText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addBtn: {
    backgroundColor: '#4DB8AC',
  },
  removeBtn: {
    backgroundColor: '#ff4444',
  },
  adjustBtn: {
    backgroundColor: '#2196F3',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  modalLocation: {
    fontSize: 14,
    color: '#999',
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

export default InventoryManagementScreen;
