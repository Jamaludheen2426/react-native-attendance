import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { getProductVariants } from '../utils/api';
import { showAlert } from '../components/CustomAlert';

const ProductModal = ({
  visible,
  onClose,
  onSave,
  product = null, // if editing, pass existing product
  categories = [], // list of categories
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  // Variant management
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState([]);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [variantForm, setVariantForm] = useState({
    size: '',
    color: '',
    price: '',
    stock: '',
  });
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    const loadProductData = async () => {
      if (product) {
        setName(product.name || '');
        setSku(product.sku || '');
        setPrice(product.price?.toString() || '');
        setDescription(product.description || '');
        setSelectedCategoryId(product.category_id || null);

        // Check has_variants (handle both snake_case from API and camelCase)
        const hasVariantsValue =
          product.has_variants === 1 || product.hasVariants === true;
        setHasVariants(hasVariantsValue);

        // Fetch variants if product has them
        if (hasVariantsValue && product.id) {
          setLoadingVariants(true);
          try {
            const variantsData = await getProductVariants(product.id);
            if (variantsData && variantsData.length > 0) {
              // Transform API variants to frontend format
              const transformedVariants = variantsData.map(v => ({
                id: v.id,
                size: v.attributes?.size || '',
                color: v.attributes?.color || '',
                price: parseFloat(v.price?.price) || 0,
                stock: parseInt(v.inventory?.available, 10) || 0,
              }));
              setVariants(transformedVariants);
            } else {
              setVariants([]);
            }
          } catch (error) {
            console.error('Error fetching variants:', error);
            setVariants([]);
          } finally {
            setLoadingVariants(false);
          }
        } else {
          setVariants([]);
        }
      } else {
        // Reset form for new product
        setName('');
        setSku('');
        setPrice('');
        setDescription('');
        setSelectedCategoryId(null);
        setHasVariants(false);
        setVariants([]);
      }
    };

    if (visible) {
      loadProductData();
    }
  }, [product, visible]);

  const handleAddVariant = () => {
    if (!variantForm.size && !variantForm.color) {
      showAlert('Missing Information', 'Please enter at least size or color');
      return;
    }

    const newVariant = {
      id: Date.now(),
      size: variantForm.size,
      color: variantForm.color,
      price: parseFloat(variantForm.price) || parseFloat(price) || 0,
      stock: parseInt(variantForm.stock, 10) || 0,
    };

    setVariants([...variants, newVariant]);
    setVariantForm({ size: '', color: '', price: '', stock: '' });
    setShowAddVariant(false);
  };

  const handleRemoveVariant = id => {
    setVariants(variants.filter(v => v.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('Missing Information', 'Please enter a product name');
      return;
    }

    if (hasVariants && variants.length === 0) {
      showAlert(
        'Missing Variants',
        'Please add at least one variant or disable variants',
      );
      return;
    }

    const productData = {
      name: name.trim(),
      sku: sku.trim() || undefined,
      price: hasVariants ? 0 : parseFloat(price) || 0,
      description: description.trim() || undefined,
      is_disabled: false,
      category_id: selectedCategoryId,
      hasVariants,
      variants: hasVariants ? variants : [],
    };

    onSave(productData);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setSku('');
    setPrice('');
    setDescription('');
    setSelectedCategoryId(null);
    setShowCategoryPicker(false);
    setHasVariants(false);
    setVariants([]);
    setLoadingVariants(false);
    onClose();
  };

  const handleCategorySelect = categoryId => {
    setSelectedCategoryId(categoryId);
    setShowCategoryPicker(false);
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return 'No Category';
    const category = categories.find(cat => cat.id === selectedCategoryId);
    return category ? category.name : 'No Category';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {product ? 'Edit Product' : 'Add Product'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="x" size={24} color="#1a1a1a" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.scrollContentContainer}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Product Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SKU</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter SKU (optional)"
                value={sku}
                onChangeText={setSku}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                value={price}
                onChangeText={setPrice}
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.categorySelectorText}>
                  {getSelectedCategoryName()}
                </Text>
                <Icon
                  name={showCategoryPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.pickerContainer}>
                  <TouchableOpacity
                    style={styles.pickerItem}
                    onPress={() => handleCategorySelect(null)}
                  >
                    <Text style={styles.pickerItemText}>No Category</Text>
                  </TouchableOpacity>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.pickerItem,
                        selectedCategoryId === cat.id &&
                          styles.pickerItemActive,
                      ]}
                      onPress={() => handleCategorySelect(cat.id)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedCategoryId === cat.id &&
                            styles.pickerItemTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Variants Section */}
            <View style={styles.variantsSection}>
              <View style={styles.variantsHeader}>
                <Text style={styles.sectionTitle}>Product Variants</Text>
                <TouchableOpacity
                  style={styles.toggleSwitch}
                  onPress={() => setHasVariants(!hasVariants)}
                >
                  <View
                    style={[
                      styles.switchTrack,
                      hasVariants && styles.switchTrackActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.switchThumb,
                        hasVariants && styles.switchThumbActive,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {hasVariants && (
                <>
                  {loadingVariants ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#4DB8AC" />
                      <Text style={styles.loadingText}>
                        Loading variants...
                      </Text>
                    </View>
                  ) : (
                    <>
                      {variants.length > 0 && (
                        <View style={styles.variantsList}>
                          {variants.map(variant => (
                            <View key={variant.id} style={styles.variantItem}>
                              <View style={styles.variantInfo}>
                                <Text style={styles.variantText}>
                                  {variant.size && `Size: ${variant.size}`}
                                  {variant.size && variant.color && ' | '}
                                  {variant.color && `Color: ${variant.color}`}
                                </Text>
                                <Text style={styles.variantPrice}>
                                  ₹{Number(variant.price || 0).toFixed(2)} | Stock: {Number(variant.stock || 0).toFixed(0)}
                                  </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() => handleRemoveVariant(variant.id)}
                              >
                                <Icon
                                  name="trash-2"
                                  size={18}
                                  color="#ff4444"
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </View>
                      )}

                      {showAddVariant ? (
                        <View style={styles.addVariantForm}>
                          <View style={styles.variantInputRow}>
                            <TextInput
                              style={[styles.input, styles.halfInput]}
                              placeholder="Size (S, M, L)"
                              value={variantForm.size}
                              onChangeText={text =>
                                setVariantForm({ ...variantForm, size: text })
                              }
                              placeholderTextColor="#999"
                            />
                            <TextInput
                              style={[styles.input, styles.halfInput]}
                              placeholder="Color"
                              value={variantForm.color}
                              onChangeText={text =>
                                setVariantForm({ ...variantForm, color: text })
                              }
                              placeholderTextColor="#999"
                            />
                          </View>
                          <View style={styles.variantInputRow}>
                            <TextInput
                              style={[styles.input, styles.halfInput]}
                              placeholder="Price"
                              value={variantForm.price}
                              onChangeText={text =>
                                setVariantForm({ ...variantForm, price: text })
                              }
                              placeholderTextColor="#999"
                              keyboardType="decimal-pad"
                            />
                            <TextInput
                              style={[styles.input, styles.halfInput]}
                              placeholder="Stock"
                              value={variantForm.stock}
                              onChangeText={text =>
                                setVariantForm({ ...variantForm, stock: text })
                              }
                              placeholderTextColor="#999"
                              keyboardType="numeric"
                            />
                          </View>
                          <View style={styles.variantFormButtons}>
                            <TouchableOpacity
                              style={styles.variantCancelBtn}
                              onPress={() => setShowAddVariant(false)}
                            >
                              <Text style={styles.variantCancelText}>
                                Cancel
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.variantAddBtn}
                              onPress={handleAddVariant}
                            >
                              <Text style={styles.variantAddText}>Add</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addVariantButton}
                          onPress={() => setShowAddVariant(true)}
                        >
                          <Icon name="plus" size={18} color="#4DB8AC" />
                          <Text style={styles.addVariantText}>Add Variant</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {product ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  categorySelectorText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  pickerContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerItemActive: {
    backgroundColor: '#4DB8AC20',
  },
  pickerItemText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  pickerItemTextActive: {
    color: '#4DB8AC',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#4DB8AC',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  variantsSection: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  variantsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  toggleSwitch: {
    padding: 4,
  },
  switchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchTrackActive: {
    backgroundColor: '#4DB8AC',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  variantsList: {
    marginBottom: 12,
  },
  variantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  variantInfo: {
    flex: 1,
  },
  variantText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 13,
    color: '#666',
  },
  addVariantForm: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  variantInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
  },
  variantFormButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  variantCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  variantCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  variantAddBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: '#4DB8AC',
    alignItems: 'center',
  },
  variantAddText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addVariantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4DB8AC',
    borderStyle: 'dashed',
    gap: 8,
  },
  addVariantText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4DB8AC',
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
});

export default ProductModal;
