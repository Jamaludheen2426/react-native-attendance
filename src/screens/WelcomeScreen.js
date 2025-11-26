import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />

      <View style={styles.content}>
        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <View style={styles.logoShape1} />
            <View style={styles.logoShape2} />
            <View style={styles.logoShape3} />
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.tagline}>SIMPLIFY YOUR SALES</Text>
        <Text style={styles.title}>Set up your POS</Text>
        <Text style={styles.title}>system in minutes</Text>

        {/* Description */}
        <Text style={styles.description}>
          Effortlessly manage your online store with our powerful
        </Text>
        <Text style={styles.description}>
          Point of Sale app. From tracking inventory to processing
        </Text>
        <Text style={styles.description}>
          payments, we've got you covered.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    position: 'relative',
  },
  logoShape1: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#4DB8AC',
    borderTopLeftRadius: 10,
    top: 0,
    left: 0,
  },
  logoShape2: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: '#2196F3',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    top: 0,
    right: 0,
  },
  logoShape3: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 60,
    borderRightWidth: 0,
    borderBottomWidth: 60,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5BC0BE',
    bottom: 0,
    left: 0,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    letterSpacing: 1,
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 40,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 50,
  },
  loginButton: {
    backgroundColor: '#4DB8AC',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createAccountButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  createAccountButtonText: {
    color: '#1a1a1a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;
