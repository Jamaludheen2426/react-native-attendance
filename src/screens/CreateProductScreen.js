import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';

const CreateProductScreen = ({ navigation }) => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [category, setCategory] = useState('Running Shoes');
  const [price, setPrice] = useState('78,0');
  const [stockQuantity, setStockQuantity] = useState('32');
  const [selectedSizes, setSelectedSizes] = useState([36, 37, 38, 39, 40, 41, 42]);

  const sizes = [36, 37, 38, 39, 40, 41, 42];

  const toggleSize = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Create Product"
        showBack={true}
        onBackPress={() => navigation.goBack()}
        showHelp={true}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Product Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Product Name"
              placeholderTextColor="#ccc"
              value={productName}
              onChangeText={setProductName}
            />
          </View>

          {/* Product Description */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Product Description"
              placeholderTextColor="#ccc"
              value={productDescription}
              onChangeText={setProductDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Product Category */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Category</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownValue}>{category}</Text>
              <Icon name="chevron-down" size={18} color="#666" />
            </View>
          </View>

          {/* Product Price */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Price</Text>
            <View style={styles.priceContainer}>
              <View style={styles.currencyContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <Icon name="chevron-down" size={16} color="#666" />
              </View>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#ccc"
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Available Sizes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Available Sizes</Text>
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownPlaceholder}>Select Size</Text>
              <Icon name="chevron-down" size={18} color="#666" />
            </View>

            <View style={styles.sizesContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeChip,
                    selectedSizes.includes(size) && styles.sizeChipActive,
                  ]}
                  onPress={() => toggleSize(size)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSizes.includes(size) && styles.sizeTextActive,
                    ]}
                  >
                    {size}
                  </Text>
                  {selectedSizes.includes(size) && (
                    <View style={styles.closeIcon}>
                      <Icon name="x" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Stock Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Stock Quanitity</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="#ccc"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="number-pad"
            />
          </View>

          {/* Cover Image */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Cover Image</Text>
            <TouchableOpacity style={styles.imageUpload}>
              <Icon name="image" size={32} color="#999" />
              <Text style={styles.imageUploadText}>Choose Image</Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Product</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4DB8AC',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  dropdownValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  dropdownPlaceholder: {
    fontSize: 14,
    color: '#ccc',
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    gap: 8,
  },
  currencySymbol: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: '#1a1a1a',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  sizeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  closeIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageUpload: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateProductScreen;
