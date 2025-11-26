import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { CustomAlertProvider } from './src/components/CustomAlert';

const App = () => {
  return (
    <SafeAreaProvider>
      <CustomAlertProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </CustomAlertProvider>
    </SafeAreaProvider>
  );
};

export default App;