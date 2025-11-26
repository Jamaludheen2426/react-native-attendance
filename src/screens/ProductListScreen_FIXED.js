import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductModal from '../components/ProductModal';
import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createVariantWithDetails,
} from '../utils/api';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch data');
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchProducts = async () => {
    await fetchData();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setModalVisible(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (selectedProduct) {
        // ============================================
        // EDITING EXISTING PRODUCT
        // ============================================

        // Update product basic info
        const productPayload = {
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price) || 0,
          is_disabled: false,
        };

        // Add optional fields
        if (productData.sku) productPayload.sku = productData.sku;
        if (productData.category_id) productPayload.category_id = productData.category_id;

        await updateProduct(selectedProduct.id, productPayload);

        // ============================================
        // SAVE VARIANTS (if product has them)
        // ============================================
        if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
          console.log('Saving variants:', productData.variants);

          // Create each variant with price and inventory
          for (const variant of productData.variants) {
            // Only create NEW variants (temporary IDs like Date.now())
            // Existing variants have real IDs (numbers < 1000000000000)
            if (variant.id > 1000000000000) {
              const variantPayload = {
                product_id: selectedProduct.id,
                sku: `${productPayload.sku || selectedProduct.id}-${variant.size}-${variant.color}`.toUpperCase().replace(/\s+/g, '-'),
                attributes: {
                  size: variant.size,
                  color: variant.color,
                },
                price: parseFloat(variant.price) || 0,
                cost: parseFloat(variant.price) * 0.6 || 0, // 40% margin
                initial_stock: parseInt(variant.stock) || 0,
                location: 'default',
                reorder_point: 0,
                reorder_quantity: 0,
              };

              console.log('Creating new variant:', variantPayload);
              await createVariantWithDetails(variantPayload);
            } else {
              console.log('Skipping existing variant:', variant.id);
            }
          }
        }

        setModalVisible(false);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        // ============================================
        // CREATING NEW PRODUCT
        // ============================================
        await createProduct(productData);
        setModalVisible(false);
        Alert.alert('Success', 'Product created successfully');
      }

      // Refresh the list
      await fetchProducts();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save product');
      console.error('Save product error:', error);
    }
  };

  const handleDeleteProduct = (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert('Success', 'Product deleted successfully');
              fetchProducts();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete product');
              console.error('Delete product error:', error);
            }
          },
        },
      ]
    );
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productIcon}>
        <Icon name="package" size={32} color="#4DB8AC" />
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        {item.sku ? <Text style={styles.productSku}>SKU: {item.sku}</Text> : null}
        {item.description ? (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        {item.is_disabled ? (
          <Text style={styles.disabledBadge}>Disabled</Text>
        ) : null}
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditProduct(item)}
        >
          <Icon name="edit-2" size={18} color="#4DB8AC" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Icon name="trash-2" size={18} color="#ff4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Header
        title="Products"
        showNotification={true}
        showMenu={true}
      />

      <View style={styles.content}>
        {loading && products.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4DB8AC" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id || item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="package" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No products yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the + button to add a product
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddProduct}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <BottomNav navigation={navigation} activeRoute="ProductList" />

      <ProductModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  productIcon: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
    marginBottom: 8,
  },
  disabledBadge: {
    fontSize: 11,
    color: '#ff4444',
    fontWeight: '600',
    marginTop: 4,
  },
  productActions: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    padding: 8,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
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
});

export default ProductListScreen;
