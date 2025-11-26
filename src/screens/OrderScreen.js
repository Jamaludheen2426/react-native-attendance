import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';
import { createOrder } from '../utils/api';
import { showAlert } from '../components/CustomAlert';

const OrderScreen = ({ navigation }) => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartCount, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);

  const subTotal = getCartTotal();
  const membershipDiscount = 0;
  const taxRate = 0.1;
  const tax = subTotal * taxRate;
  const total = subTotal - membershipDiscount + tax;
  const totalItems = getCartCount();

  const handleUpdateQuantity = (id, delta) => {
    const cartItem = cartItems.find(item => item.id === id);
    if (cartItem) {
      const newQuantity = cartItem.quantity + delta;
      if (newQuantity <= 0) {
        showAlert(
          'Remove Item',
          'Do you want to remove this item from cart?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => removeFromCart(id), style: 'destructive' },
          ]
        );
      } else {
        updateQuantity(id, newQuantity);
      }
    }
  };

  const handleProcessTransaction = async () => {
    if (cartItems.length === 0) {
      showAlert('Empty Cart', 'Please add items to cart before processing');
      return;
    }

    showAlert(
      'Select Payment Method',
      'How would you like to pay?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cash',
          onPress: () => processOrder('cash'),
        },
        {
          text: 'Card',
          onPress: () => processOrder('card'),
        },
        {
          text: 'UPI',
          onPress: () => processOrder('upi'),
        },
      ]
    );
  };

  const processOrder = async (paymentMethod) => {
    try {
      setProcessing(true);

      // Build order payload
      const orderData = {
        customer_name: 'Walk-in Customer',
        customer_phone: null,
        items: cartItems.map(item => {
          const itemPrice = typeof item.price === 'object' ? (item.price?.price || 0) : (item.price || 0);
          const unitPrice = parseFloat(itemPrice) || 0;

          // Debug log to see item structure
          console.log('Cart item:', JSON.stringify(item, null, 2));

          return {
            product_id: item.id || item.product_id,
            variant_id: item.variant_id || null,
            product_name: item.name || item.product_name || 'Unknown Product',
            variant_attributes: item.variant_attributes || item.attributes || null,
            sku: item.sku || null,
            quantity: item.quantity || 1,
            unit_price: unitPrice,
            total: unitPrice * (item.quantity || 1)
          };
        }),
        subtotal: parseFloat(subTotal) || 0,
        tax: parseFloat(tax) || 0,
        discount: parseFloat(membershipDiscount) || 0,
        total: parseFloat(total) || 0,
        payment_method: paymentMethod,
        received_amount: paymentMethod === 'cash' ? (parseFloat(total) || 0) : null,
        notes: null
      };

      // Debug log the full order payload
      console.log('Order payload:', JSON.stringify(orderData, null, 2));

      // Create order via API
      const createdOrder = await createOrder(orderData);

      // Clear cart on success
      clearCart();

      // Show success message with order number
      showAlert(
        'Success!',
        `Order ${createdOrder.order_number} completed successfully!\n\nTotal: ₹${total.toFixed(2)}\nPayment: ${paymentMethod.toUpperCase()}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Products')
          }
        ],
        { icon: 'check-circle', iconColor: '#4DB8AC' }
      );
    } catch (error) {
      console.error('Order creation error:', error);
      showAlert(
        'Order Failed',
        error.message || 'Failed to create order. Please try again.',
        [{ text: 'OK' }],
        { icon: 'alert-circle', iconColor: '#ff4444' }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Order Details"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        rightText="#AR928"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer Name</Text>
              <Text style={styles.infoValue}>Prabowo Sasmito</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Membership ID</Text>
              <Text style={styles.infoValue}>Membership ID</Text>
            </View>
          </View>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {cartItems.length === 0 ? (
            <View style={styles.emptyCart}>
              <Icon name="shopping-cart" size={64} color="#ccc" />
              <Text style={styles.emptyCartText}>Your cart is empty</Text>
              <Text style={styles.emptyCartSubtext}>Add products from the home screen</Text>
            </View>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImageContainer}>
                  <Text style={styles.itemImage}>{item.image || '📦'}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.sku && <Text style={styles.itemSize}>SKU: {item.sku}</Text>}
                  <Text style={styles.itemPrice}>
                    ₹{(() => {
                      const itemPrice = typeof item.price === 'object' ? (item.price?.price || 0) : (item.price || 0);
                      return parseFloat(itemPrice).toFixed(2);
                    })()}
                  </Text>
                </View>
                <View style={styles.itemControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => handleUpdateQuantity(item.id, -1)}
                  >
                    <Text style={styles.controlButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={[styles.controlButton, styles.incrementButton]}
                    onPress={() => handleUpdateQuantity(item.id, 1)}
                  >
                    <Text style={[styles.controlButtonText, styles.incrementText]}>
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item</Text>
              <Text style={styles.summaryValue}>{totalItems} Item</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sub Total</Text>
              <Text style={styles.summaryValue}>₹{subTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Membership Discount</Text>
              <Text style={styles.summaryValue}>₹{membershipDiscount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (10%)</Text>
              <Text style={styles.summaryValue}>₹{tax.toFixed(1)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{total.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Process Transaction Button */}
        <TouchableOpacity
          style={[styles.processButton, (cartItems.length === 0 || processing) && styles.processButtonDisabled]}
          onPress={handleProcessTransaction}
          disabled={cartItems.length === 0 || processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.processButtonText}>Process Transaction</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <BottomNav navigation={navigation} activeRoute="Order" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  customerInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemImage: {
    fontSize: 30,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  itemControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incrementButton: {
    backgroundColor: '#4DB8AC',
  },
  controlButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  incrementText: {
    color: '#fff',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    width: 20,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  processButton: {
    backgroundColor: '#4DB8AC',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  processButtonDisabled: {
    backgroundColor: '#ccc',
  },
  processButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
  },
});

export default OrderScreen;
