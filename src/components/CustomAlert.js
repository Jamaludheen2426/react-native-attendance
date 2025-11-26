import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

let alertQueue = [];
let currentAlert = null;
let setAlertState = null;

export const CustomAlertProvider = ({ children }) => {
  const [alert, _setAlert] = React.useState(null);

  React.useEffect(() => {
    setAlertState = _setAlert;
    return () => {
      setAlertState = null;
    };
  }, []);

  const handleDismiss = (callback) => {
    _setAlert(null);
    currentAlert = null;
    if (callback) {
      callback();
    }
    // Show next alert in queue
    setTimeout(() => {
      if (alertQueue.length > 0) {
        const nextAlert = alertQueue.shift();
        showAlert(nextAlert.title, nextAlert.message, nextAlert.buttons, nextAlert.options);
      }
    }, 100);
  };

  return (
    <>
      {children}
      {alert && (
        <Modal
          visible={true}
          animationType="fade"
          transparent={true}
          onRequestClose={() => handleDismiss()}
        >
          <View style={styles.overlay}>
            <View style={styles.alertContainer}>
              {alert.icon && (
                <View style={styles.iconContainer}>
                  <Icon
                    name={alert.icon}
                    size={48}
                    color={alert.iconColor || '#4DB8AC'}
                  />
                </View>
              )}

              {alert.title && (
                <Text style={styles.title}>{alert.title}</Text>
              )}

              <Text style={styles.message}>{alert.message}</Text>

              <View style={styles.buttonContainer}>
                {alert.buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      alert.buttons.length === 1 && styles.singleButton,
                      button.style === 'cancel' && styles.cancelButton,
                      button.style === 'destructive' && styles.destructiveButton,
                    ]}
                    onPress={() => handleDismiss(button.onPress)}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        button.style === 'cancel' && styles.cancelButtonText,
                        button.style === 'destructive' && styles.destructiveButtonText,
                      ]}
                    >
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

export const showAlert = (title, message, buttons = [{ text: 'OK' }], options = {}) => {
  const alertData = {
    title,
    message,
    buttons,
    icon: options.icon,
    iconColor: options.iconColor,
  };

  if (currentAlert) {
    // Queue the alert if another is showing
    alertQueue.push(alertData);
    return;
  }

  currentAlert = alertData;
  if (setAlertState) {
    setAlertState(alertData);
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#4DB8AC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleButton: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  destructiveButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButtonText: {
    color: '#666',
  },
  destructiveButtonText: {
    color: '#fff',
  },
});

export default CustomAlertProvider;
