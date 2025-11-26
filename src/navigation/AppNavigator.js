// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import POS screens
import WelcomeScreen from '../screens/WelcomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import OrderScreen from '../screens/OrderScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateProductScreen from '../screens/CreateProductScreen';
import CategoryListScreen from '../screens/CategoryListScreen';
import ProductListScreen from '../screens/ProductListScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
        />
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
        />
        <Stack.Screen
          name="ProductDetails"
          component={ProductDetailsScreen}
        />
        <Stack.Screen
          name="Order"
          component={OrderScreen}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
        />
        <Stack.Screen
          name="CreateProduct"
          component={CreateProductScreen}
        />
        <Stack.Screen
          name="CategoryList"
          component={CategoryListScreen}
        />
        <Stack.Screen
          name="ProductList"
          component={ProductListScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;