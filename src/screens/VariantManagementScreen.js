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

// Hardcoded data for UI design
const HARDCODED_VARIANTS = [
  {
    id: 1,
    product_id: 1,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-S-RED',
    attributes: { size: 'S', color: 'Red' },
    price: 24.99,
    cost: 12.00,
    stock: 45,
    reserved: 5,
    available: 40,
    is_disabled: false,
  },
  {
    id: 2,
    product_id: 1,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-M-RED',
    attributes: { size: 'M', color: 'Red' },
    price: 24.99,
    cost: 12.00,
    stock: 78,
    reserved: 10,
    available: 68,
    is_disabled: false,
  },
  {
    id: 3,
    product_id: 1,
    product_name: 'T-Shirt Classic',
    sku: 'TSHIRT-L-BLUE',
    attributes: { size: 'L', color: 'Blue' },
    price: 26.99,
    cost: 13.00,
    stock: 12,
    reserved: 2,
    available: 10,
    is_disabled: false,
  },
  {
    id: 4,
    product_id: 2,
    product_name: 'Jeans Premium',
    sku: 'JEANS-32-BLACK',
    attributes: { size: '32', color: 'Black' },
    price: 59.99,
    cost: 30.00,
    stock: 25,
    reserved: 3,
    available: 22,
    is_disabled: false,
  },
  {
    id: 5,
    product_id: 2,
    product_name: 'Jeans Premium',
    sku: 'JEANS-34-BLACK',
    attributes: { size: '34', color: 'Black' },
    price: 59.99,
    cost: 30.00,
    stock: 8,
    reserved: 1,
    available: 7,
    is_disabled: false,
  },
];

const VariantManagementScreen = ({ navigation }) => {
  const [variants, setVariants] = useState(HARDCODED_VARIANTS);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [filterByProduct, setFilterByProduct] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    product_name: '',
    sku: '',
    size: '',
    color: '',
    price: '',
    cost: '',
    stock: '',
  });

  const handleAddVariant = () => {
    setSelectedVariant(null);
    setFormData({
      product_name: '',
      sku: '',
      size: '',
      color: '',
      price: '',
      cost: '',
      stock: '',
    });
    setModalVisible(true);
  };

  const handleEditVariant = (variant) => {
    setSelectedVariant(variant);
    setFormData({
      product_name: variant.product_name,
      sku: variant.sku,
      size: variant.attributes.size || '',
      color: variant.attributes.color || '',
      price: variant.price.toString(),
      cost: variant.cost.toString(),
      stock: variant.stock.toString(),
    });
    setModalVisible(true);
  };

  const handleSaveVariant = () => {
    // Validation
    if (!formData.product_name || !formData.sku || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (selectedVariant) {
      // Update existing variant
      const updated = variants.map(v =>
        v.id === selectedVariant.id
          ? {
              ...v,
              product_name: formData.product_name,
              sku: formData.sku,
              attributes: { size: formData.size, color: formData.color },
              price: parseFloat(formData.price),
              cost: parseFloat(formData.cost || 0),
              stock: parseInt(formData.stock || 0),
            }
          : v
      );
      setVariants(updated);
      Alert.alert('Success', 'Variant updated successfully');
    } else {
      // Add new variant
      const newVariant = {
        id: variants.length + 1,
        product_id: 1,
        product_name: formData.product_name,
        sku: formData.sku,
        attributes: { size: formData.size, color: formData.color },
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost || 0),
        stock: parseInt(formData.stock || 0),
        reserved: 0,
        available: parseInt(formData.stock || 0),
        is_disabled: false,
      };
      setVariants([...variants, newVariant]);
      Alert.alert('Success', 'Variant added successfully');
    }

    setModalVisible(false);
  };

  const handleDeleteVariant = (variant) => {
    Alert.alert(
      'Delete Variant',
      `Are you sure you want to delete ${variant.sku}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setVariants(variants.filter(v => v.id !== variant.id));
            Alert.alert('Success', 'Variant deleted');
          },
        },
      ]
    );
  };

  const filteredVariants = variants.filter(variant => {
    const matchesSearch =
      !searchText ||
      variant.product_name.toLowerCase().includes(searchText.toLowerCase()) ||
      variant.sku.toLowerCase().includes(searchText.toLowerCase()) ||
      Object.values(variant.attributes).some(val =>
        val.toString().toLowerCase().includes(searchText.toLowerCase())
      );

    const matchesFilter = !filterByProduct || variant.product_id === filterByProduct;

    return matchesSearch && matchesFilter;
  });

  const renderVariantCard = ({ item }) => (
    <View style={styles.variantCard}>
      <View style={styles.cardHeader}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.product_name}</Text>
          <Text style={styles.sku}>SKU: {item.sku}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditVariant(item)}
          >
            <Icon name="edit-2" size={18} color="#4DB8AC" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteVariant(item)}
          >
            <Icon name="trash-2" size={18} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.attributesContainer}>
        {Object.entries(item.attributes).map(([key, value]) => (
          <View key={key} style={styles.attributeChip}>
            <Text style={styles.attributeText}>
              {key}: {value}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.priceStockContainer}>
        <View style={styles.priceSection}>
          <Text style={styles.label}>Price</Text>
          <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.stockSection}>
          <Text style={styles.label}>Stock</Text>
          <Text style={styles.stockValue}>{item.stock}</Text>
        </View>
        <View style={styles.stockSection}>
          <Text style={styles.label}>Reserved</Text>
          <Text style={[styles.stockValue, styles.reservedValue]}>{item.reserved}</Text>
        </View>
        <View style={styles.stockSection}>
          <Text style={styles.label}>Available</Text>
          <Text style={[styles.stockValue, styles.availableValue]}>{item.available}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Product Variants" showNotification={true} showMenu={true} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search variants..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Variants List */}
      <FlatList
        data={filteredVariants}
        renderItem={renderVariantCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="package" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No variants found</Text>
            <Text style={styles.emptySubtext}>
              Add product variants to manage inventory
            </Text>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddVariant}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <BottomNav navigation={navigation} activeRoute="Variants" />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedVariant ? 'Edit Variant' : 'Add New Variant'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={formData.product_name}
                onChangeText={text => setFormData({ ...formData, product_name: text })}
              />

              <Text style={styles.inputLabel}>SKU *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., TSHIRT-M-RED"
                value={formData.sku}
                onChangeText={text => setFormData({ ...formData, sku: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Size</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="S, M, L, XL"
                    value={formData.size}
                    onChangeText={text => setFormData({ ...formData, size: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Red, Blue, etc"
                    value={formData.color}
                    onChangeText={text => setFormData({ ...formData, color: text })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={formData.price}
                    onChangeText={text => setFormData({ ...formData, price: text })}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.inputLabel}>Cost</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={formData.cost}
                    onChangeText={text => setFormData({ ...formData, cost: text })}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Initial Stock</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={formData.stock}
                onChangeText={text => setFormData({ ...formData, stock: text })}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveVariant}>
                <Text style={styles.saveButtonText}>
                  {selectedVariant ? 'Update Variant' : 'Add Variant'}
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
  },
  searchInputContainer: {
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
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  variantCard: {
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
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  attributeChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  attributeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priceStockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceSection: {
    alignItems: 'flex-start',
  },
  stockSection: {
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4DB8AC',
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  reservedValue: {
    color: '#ff9500',
  },
  availableValue: {
    color: '#4DB8AC',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4DB8AC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
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
    maxHeight: '90%',
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
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VariantManagementScreen;
