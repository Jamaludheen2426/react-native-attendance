// BottomNav.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';

const BottomNav = ({ navigation, activeRoute = 'Products' }) => {
  return (
    // SafeAreaView is positioned absolutely so its bottom inset pushes the content above system UI
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Products')}
        >
          <Icon
            name="home"
            size={22}
            color={activeRoute === 'Products' ? '#4DB8AC' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('ProductList')}
        >
          <Icon
            name="package"
            size={22}
            color={activeRoute === 'ProductList' ? '#4DB8AC' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('CategoryList')}
        >
          <Icon
            name="folder"
            size={22}
            color={activeRoute === 'CategoryList' ? '#4DB8AC' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Icon
            name="bar-chart-2"
            size={22}
            color={activeRoute === 'Dashboard' ? '#4DB8AC' : '#999'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Order')}
        >
          <Icon
            name="shopping-cart"
            size={22}
            color={activeRoute === 'Order' ? '#4DB8AC' : '#999'}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute', // position the safe area container above content
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 20,
    elevation: 20,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: '#fff',
    paddingVertical: 8, // slim height
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',

    // no absolute here — SafeAreaView handles positioning
    // shadow
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  navItem: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNav;
