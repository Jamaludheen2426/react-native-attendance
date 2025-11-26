import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import CategoryModal from '../components/CategoryModal';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
} from '../utils/api';
import { showAlert } from '../components/CustomAlert';

const CategoryListScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // Store all categories for search
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setAllCategories(data || []);
      filterCategories(data || [], searchText);
    } catch (error) {
      showAlert('Error', error.message || 'Failed to fetch categories');
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCategories = (categoryList, search) => {
    let filtered = categoryList;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = categoryList.filter(category =>
        category.name?.toLowerCase().includes(searchLower) ||
        category.sku?.toLowerCase().includes(searchLower) ||
        category.description?.toLowerCase().includes(searchLower)
      );
    }

    setCategories(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setSearchText('');
    fetchCategories();
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (allCategories.length > 0) {
        filterCategories(allCategories, searchText);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setModalVisible(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setModalVisible(true);
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory.id, categoryData);
        setModalVisible(false);
        showAlert('Success', 'Category updated successfully');
      } else {
        // Add new category
        await createCategory(categoryData);
        setModalVisible(false);
        showAlert('Success', 'Category created successfully');
      }
      // Refresh the list
      await fetchCategories();
    } catch (error) {
      showAlert('Error', error.message || 'Failed to save category');
      console.error('Save category error:', error);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      // First, check if the category has any products
      const productsInCategory = await getProducts({ category_id: category.id });
      const productCount = productsInCategory?.length || 0;

      if (productCount > 0) {
        // Category has products - show warning alert
        Alert.alert(
          'Category Has Products',
          `This category has ${productCount} product${productCount !== 1 ? 's' : ''}.\n\nDeleting this category will also soft-delete all products in it.\n\nDo you want to continue?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete All',
              style: 'destructive',
              onPress: () => confirmDeleteCategory(category.id),
            },
          ],
          { cancelable: true }
        );
      } else {
        // Category is empty - simple confirmation
        Alert.alert(
          'Delete Category',
          `Are you sure you want to delete "${category.name}"?\n\nThis category has no products.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => confirmDeleteCategory(category.id),
            },
          ],
          { cancelable: true }
        );
      }
    } catch (error) {
      console.error('Error checking products in category:', error);
      showAlert('Error', 'Failed to check category products. Please try again.');
    }
  };

  const confirmDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      showAlert('Success', 'Category deleted successfully');
      await fetchCategories();
    } catch (error) {
      showAlert('Error', error.message || 'Failed to delete category');
      console.error('Delete category error:', error);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.sku ? <Text style={styles.categorySku}>SKU: {item.sku}</Text> : null}
        {item.description ? (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
        >
          <Icon name="edit-2" size={18} color="#4DB8AC" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
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
        title="Categories"
        showNotification={true}
        showMenu={true}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories by name, SKU or description..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Icon name="x" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results Count */}
      {searchText.trim() && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            Showing {categories.length} of {allCategories.filter(c =>
              c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
              c.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
              c.description?.toLowerCase().includes(searchText.toLowerCase())
            ).length} results
          </Text>
        </View>
      )}

      <View style={styles.content}>
        {loading && categories.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4DB8AC" />
            <Text style={styles.loadingText}>Loading categories...</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id?.toString() || item._id}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="folder" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchText ? `No results for "${searchText}"` : 'No categories yet'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchText ? 'Try different keywords' : 'Tap the + button to add a category'}
                </Text>
              </View>
            }
          />
        )}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddCategory}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <BottomNav navigation={navigation} activeRoute="CategoryList" />

      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
        category={selectedCategory}
      />
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
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 0,
  },
  resultsInfo: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categorySku: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  categoryActions: {
    flexDirection: 'row',
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

export default CategoryListScreen;
