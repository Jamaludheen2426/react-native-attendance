import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { getProductById, getProductVariants } from '../utils/api';
import { useCart } from '../context/CartContext';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product: initialProduct } = route.params || {};
  const [product, setProduct] = useState(initialProduct);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, getAvailableStock } = useCart();

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try { 
      setLoading(true);
      if (!initialProduct?.id) {
        Alert.alert('Error', 'Product ID not found');
        navigation.goBack();
        return;
      }

      const productData = await getProductById(initialProduct.id);
      setProduct(productData);

      if (productData.has_variants && productData.variants) {
        setVariants(productData.variants || []);
        if (productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error', 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStock = () => {
    return getAvailableStock(product, selectedVariant);
  };

  const getCurrentPrice = () => {
    if (product?.has_variants && selectedVariant) {
      return selectedVariant.price?.price || 0;
    }
    return product?.price || 0;
  };

  const incrementQuantity = () => {
    const stock = getCurrentStock();
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    if (product?.has_variants && selectedVariant) {
      const itemToAdd = {
        ...selectedVariant,
        product_id: product.id, 
        variant_id: selectedVariant.id,  
        name: product.name,
        product_name: product.name,
      };
      addToCart(itemToAdd, quantity);
      Alert.alert('Success', `Added ${quantity} ${product.name} to cart`);
    } else if (product) {
      addToCart(product, quantity);
      Alert.alert('Success', `Added ${quantity} ${product.name} to cart`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4DB8AC" />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
        <BottomNav navigation={navigation} activeRoute="Products" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Header
          title="Product Details"
          showBack={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color="#ccc" />
          <Text style={styles.errorText}>Product not found</Text>
        </View>
        <BottomNav navigation={navigation} activeRoute="Products" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Product Details"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightText={product?.sku ? String(product.sku) : (product?.id ? `#${String(product.id)}` : '')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Text style={styles.productImage}>{String(product.image || '📦')}</Text>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{String(product.name || 'Unnamed Product')}</Text>
          <Text style={styles.productPrice}>₹{String(parseFloat(getCurrentPrice() || 0).toFixed(2))}</Text>

          {product.description && String(product.description).trim() !== '' && (
            <>
              <Text style={styles.descriptionLabel}>Product Description</Text>
              <Text style={styles.description}>{String(product.description)}</Text>
            </>
          )}

          {/* Variants Selection */}
          {Boolean(product.has_variants) && variants.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Select Variant</Text>
              <View style={styles.sizesContainer}>
                {variants.map((variant) => (
                  <TouchableOpacity
                    key={variant.id}
                    style={[
                      styles.sizeChip,
                      selectedVariant?.id === variant.id && styles.sizeChipActive,
                    ]}
                    onPress={() => setSelectedVariant(variant)}
                  >
                    <Text
                      style={[
                        styles.sizeText,
                        selectedVariant?.id === variant.id && styles.sizeTextActive,
                      ]}
                    >
                      {(() => {
                        const attrs = variant?.attributes || {};
                        const display = [attrs.size, attrs.color].filter(Boolean).join(' ');
                        return display || 'Variant';
                      })()}
                    </Text>
                    <Text
                      style={[
                        styles.variantPrice,
                        selectedVariant?.id === variant.id && styles.variantPriceActive,
                      ]}
                    >
                      ₹{String(parseFloat(variant.price?.price || 0).toFixed(2))}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Quantity */}
          <View style={styles.quantityContainer}>
            <View>
              <Text style={styles.quantityLabel}>Quantity</Text>
            </View>
            <View style={styles.stockContainer}>
              <Text style={styles.stockText}>Stock: {String(getCurrentStock())}</Text>
            </View>
          </View>

          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{String(quantity)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.quantityButton, styles.incrementButton]}
              onPress={incrementQuantity}
            >
              <Text style={[styles.quantityButtonText, styles.incrementText]}>
                +
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}> Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Products" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  productImage: {
    fontSize: 150,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4DB8AC',
    marginBottom: 20,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#999',
  },
  variantPrice: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  variantPriceActive: {
    color: '#fff',
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: 22,
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 25,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  sizeChipActive: {
    backgroundColor: '#4DB8AC',
    borderColor: '#4DB8AC',
  },
  sizeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sizeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  stockContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#4DB8AC',
  },
  quantityButtonText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '600',
  },
  incrementText: {
    color: '#fff',
  },
  quantityDisplay: {
    width: 50,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#4DB8AC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailsScreen;
