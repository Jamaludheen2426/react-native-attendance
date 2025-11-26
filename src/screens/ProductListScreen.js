import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { getProducts } from '../utils/api';
import Header from '../components/Header';
import CustomAlert from '../components/CustomAlert';

const ProductListScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '' });
  const { addToCart } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'Failed to load products',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setAlert({
      visible: true,
      title: 'Success',
      message: `Added ${product.name} to cart`,
    });
  };

  const handleViewProduct = (product) => {
    navigation.navigate('ProductDetails', { productId: product.id });
  };

  const getProductPrice = (product) => {
    if (product.has_variants && product.variants?.length > 0) {
      const firstVariant = product.variants[0];
      return typeof firstVariant.price === 'object'
        ? firstVariant.price?.price || '0.00'
        : firstVariant.price || '0.00';
    }
    return typeof product.price === 'object'
      ? product.price?.price || '0.00'
      : product.price || '0.00';
  };

  const renderProductCard = ({ item }) => {
    const price = getProductPrice(item);
    const hasVariants = item.has_variants || item.hasVariants;

    return (
      <View style={styles.card}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.productImage}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>�{parseFloat(price).toFixed(2)}</Text>
        </View>
        <View style={styles.actionContainer}>
          {hasVariants ? (
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => handleViewProduct(item)}
            >
              <Text style={styles.viewButtonText}>View</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4DB8AC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Products"
        showBackButton={false}
        rightIcon="grid"
        onRightIconPress={() => navigation.navigate('Products')}
      />
      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4DB8AC']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ visible: false, title: '', message: '' })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4DB8AC',
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4DB8AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#4DB8AC',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProductListScreen;
