import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductModal from '../components/ProductModal';
import CategoryModal from '../components/CategoryModal';
import { getProducts, getCategories, createProduct, createCategory, createVariantWithDetails } from '../utils/api';
import { useCart } from '../context/CartContext';

const ProductsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All Items']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { addToCart, getCartCount } = useCart();
  const cartCount = getCartCount();

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category or search changes
  const loadProducts = useCallback(async () => {
    console.log('=== loadProducts FIRED ===');
    console.log('selectedCategory:', selectedCategory);
    console.log('categories.length:', categories.length);
    console.log('searchText:', searchText);

    if (categories.length === 0) {
      console.log('No categories loaded yet, skipping product fetch');
      return;
    }

    try {
      setLoading(true);

      // Get category_id for filtering if not "All Items"
      const category = selectedCategory !== 'All Items'
        ? categories.find(cat => cat.name === selectedCategory)
        : null;

      console.log('Found category object:', category);
      console.log('All categories:', categories.map(c => ({ id: c.id, name: c.name })));

      const params = {};
      if (searchText) params.search = searchText;
      if (category?.id) params.category_id = category.id;

      console.log('Final API params:', params);

      const productsData = await getProducts(params);

      // Products already include variants with inventory from API
      setProducts(productsData || []);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch products');
      console.error('Fetch products error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, categories, searchText]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Refresh products when screen is focused (e.g., returning from order screen)
  useFocusEffect(
    useCallback(() => {
      if (categories.length > 0) {
        loadProducts();
      }
    }, [categories, loadProducts])
  );

  // Helper function to reload products (used after creating products/categories)
  const reloadProducts = async () => {
    if (categories.length === 0) return;

    try {
      const category = selectedCategory !== 'All Items'
        ? categories.find(cat => cat.name === selectedCategory)
        : null;

      const params = {};
      if (searchText) params.search = searchText;
      if (category?.id) params.category_id = category.id;

      const productsData = await getProducts(params);

      if (productsData && productsData.length > 0) {
        const productsWithVariants = await Promise.all(
          productsData.map(async (product) => {
            if (product.has_variants || product.hasVariants) {
              try {
                const { getProductVariants } = require('../utils/api');
                const variants = await getProductVariants(product.id);
                return { ...product, variants: variants || [] };
              } catch (error) {
                console.error(`Error fetching variants for product ${product.id}:`, error);
                return { ...product, variants: [] };
              }
            }
            return product;
          })
        );
        setProducts(productsWithVariants);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Reload products error:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    reloadProducts().finally(() => setRefreshing(false));
  };

  const handleSaveProduct = async (productData) => {
    try {
      console.log('Saving product:', productData);

      // If product has variants, use variant creation endpoint
      if (productData.hasVariants && productData.variants && productData.variants.length > 0) {
        // Create product first (only send fields that exist in DB)
        const productPayload = {
          name: productData.name,
          description: productData.description,
          price: 0, // Base price is 0 for variant products
          is_disabled: false,
        };

        // Add optional fields only if they have values
        if (productData.sku) productPayload.sku = productData.sku;
        if (productData.category_id) productPayload.category_id = productData.category_id;

        const productResult = await createProduct(productPayload);
        console.log('Product created:', productResult);
        console.log('Product ID:', productResult.id);

        // Extract product ID from response (handle different response structures)
        const productId = productResult.id || productResult.data?.id || productResult.insertId;

        if (!productId) {
          throw new Error('Failed to get product ID from response');
        }

        // Create each variant with inventory
        for (const variant of productData.variants) {
          const variantData = {
            product_id: productId,
            sku: variant.sku || `${productData.sku || productId}-${variant.size || ''}-${variant.color || ''}`.replace(/\s+/g, '-'),
            attributes: {
              size: variant.size || null,
              color: variant.color || null,
            },
            price: parseFloat(variant.price) || 0,
            initial_stock: parseInt(variant.stock, 10) || 0,
            location: 'default',
          };

          console.log('Creating variant:', variantData);
          await createVariantWithDetails(variantData);
        }

        Alert.alert('Success', `Product created with ${productData.variants.length} variant(s)`);
      } else {
        // Standard product creation without variants (clean payload)
        const productPayload = {
          name: productData.name,
          description: productData.description,
          price: parseFloat(productData.price) || 0,
          is_disabled: false,
        };

        // Add optional fields only if they have values
        if (productData.sku) productPayload.sku = productData.sku;
        if (productData.category_id) productPayload.category_id = productData.category_id;

        const result = await createProduct(productPayload);
        console.log('Product created:', result);
        Alert.alert('Success', 'Product created successfully');
      }

      setProductModalVisible(false);
      await reloadProducts();

      // Refresh categories if a new category was created
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Create product error:', error);
      Alert.alert('Error', error.message || 'Failed to create product');
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      console.log('Saving category:', categoryData);
      const result = await createCategory(categoryData);
      console.log('Category created:', result);
      setCategoryModalVisible(false);
      Alert.alert('Success', 'Category created successfully');

      // Refresh categories list
      const categoriesData = await getCategories();
      setCategories(categoriesData || []);

      // Refresh products
      await reloadProducts(); 
    } catch (error) {
      console.error('Create category error:', error);
      Alert.alert('Error', error.message || 'Failed to create category');
    }
  };

  const handlePlusButtonPress = () => {
    Alert.alert(
      'Add New',
      'What would you like to add?',
      [
        {
          text: 'Product',
          onPress: () => setProductModalVisible(true),
        },
        {
          text: 'Category',
          onPress: () => setCategoryModalVisible(true),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // Helper function to get product display price
  const getProductPrice = (product) => {
    // If product has variants, show the lowest variant price
    if (product.has_variants || product.hasVariants) {
      if (product.variants && product.variants.length > 0) {
        const prices = product.variants.map(v => {
          // Handle nested price structure
          if (typeof v.price === 'object' && v.price?.price) {
            return parseFloat(v.price.price);
          }
          return parseFloat(v.price) || 0;
        });
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        if (minPrice === maxPrice) {
          return `₹${minPrice.toFixed(2)}`;
        }
        return `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
      }
      return '₹0.00'; // No variants yet
    }

    // Simple product - use product price
    const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
    return `₹${price.toFixed(2)}`;
  };

  // Helper function to get product stock (sum of all variant quantities)
  const getProductStock = (product) => {
    if (product.has_variants || product.hasVariants) {
      if (product.variants && product.variants.length > 0) {
        return product.variants.reduce((total, variant) => {
          // inventory is now an array, get first location's quantity
          const inventoryRecord = Array.isArray(variant.inventory) ? variant.inventory[0] : variant.inventory;
          const stock = inventoryRecord?.quantity || 0;
          return total + (parseInt(stock, 10) || 0);
        }, 0);
      }
      return 0; // No variants yet
    }
    // Simple product - inventory is an object for non-variant products
    return parseInt(product.inventory?.quantity, 10) || 0;
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={[styles.productImageContainer, { backgroundColor: item.color ? item.color + '20' : '#f0f0f0' }]}>
        <Text style={styles.productImage}>{item.image || '📦'}</Text>
        {item.color && <View style={[styles.colorDot, { backgroundColor: item.color }]} />}
      </View>
      <Text style={styles.productName} numberOfLines={2}>
        {item.name || 'Unnamed Product'}
      </Text>
      <Text style={styles.productPrice}>
        {getProductPrice(item)}
      </Text>
      

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          // For products with variants, navigate to details page instead of adding directly
          if (item.has_variants || item.hasVariants) {
            navigation.navigate('ProductDetails', { product: item });
          } else {
            addToCart(item, 1);
            Alert.alert('Added to Cart', `${item.name} has been added to your cart`);
          }
        }}
      >
        <Text style={styles.addButtonText}>
          <Icon name={(item.has_variants || item.hasVariants) ? "eye" : "shopping-cart"} size={20} color="#fff" />
          {(item.has_variants || item.hasVariants) ? ' View' : ' Add'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Online Transaction"
        showNotification={true}
        showMenu={true}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Enter Keyword"
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="search" size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="sliders" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={['All Items', ...categories.map(cat => cat.name)]}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === item && styles.categoryChipActive,
              ]}
              onPress={() => {
                console.log('Category chip clicked:', item);
                setSelectedCategory(item);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
        />
      </View>

      {/* Products Grid */}
      {loading && products.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DB8AC" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="package" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {searchText ? `No results for "${searchText}"` : selectedCategory === 'All Items' ? 'No products yet' : `No products in ${selectedCategory}`}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchText ? 'Try different keywords' : 'Add products using the + button'}
              </Text>
            </View>
          }
        />
      )}

      <BottomNav navigation={navigation} activeRoute="Products" />

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate('Order')}
      >
        <Icon name="shopping-cart" size={26} color="#fff" />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.addProductButton}
        onPress={handlePlusButtonPress}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Product Modal */}
      <ProductModal
        visible={productModalVisible}
        onClose={() => setProductModalVisible(false)}
        onSave={handleSaveProduct}
        product={null}
        categories={categories}
      />

      {/* Category Modal */}
      <CategoryModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSave={handleSaveCategory}
        category={null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  searchButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    backgroundColor: '#4DB8AC',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#4DB8AC',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsContainer: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  productImage: {
    fontSize: 50,
  },
  colorDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 11,
    color: '#888',
    marginBottom: 6,
  },
  stockText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4DB8AC20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  variantText: {
    fontSize: 11,
    color: '#4DB8AC',
    fontWeight: '600',
    marginLeft: 4,
  },
  sizesContainer: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10,
  },
  sizeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sizeChipActive: {
    backgroundColor: '#4DB8AC',
    borderColor: '#4DB8AC',
  },
  sizeText: {
    fontSize: 11,
    color: '#666',
  },
  sizeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent:"space-around"
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  cartButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4DB8AC',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addProductButton: {
    position: 'absolute',
    bottom: 170,
    right: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  },
});

export default ProductsScreen;
