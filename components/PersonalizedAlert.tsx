import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react-native';

interface PersonalizedAlertProps {
  alert: {
    message: string;
    severity: 'low' | 'medium' | 'high';
    saferAlternative: string;
    userContext: string;
  };
  onDismiss?: () => void;
}

export default function PersonalizedAlert({ alert, onDismiss }: PersonalizedAlertProps) {
  const getAlertStyle = () => {
    switch (alert.severity) {
      case 'high':
        return {
          backgroundColor: '#FEE2E2',
          borderColor: '#DC2626',
          iconColor: '#DC2626'
        };
      case 'medium':
        return {
          backgroundColor: '#FEF3C7',
          borderColor: '#D97706',
          iconColor: '#D97706'
        };
      case 'low':
        return {
          backgroundColor: '#D1FAE5',
          borderColor: '#10B981',
          iconColor: '#10B981'
        };
    }
  };

  const getIcon = () => {
    const style = getAlertStyle();
    switch (alert.severity) {
      case 'high':
        return <AlertTriangle size={24} color={style.iconColor} />;
      case 'medium':
        return <Shield size={24} color={style.iconColor} />;
      case 'low':
        return <CheckCircle size={24} color={style.iconColor} />;
    }
  };

  const style = getAlertStyle();

  return (
    <View style={[styles.container, { 
      backgroundColor: style.backgroundColor, 
      borderColor: style.borderColor 
    }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: style.iconColor }]}>
            {alert.severity === 'high' ? 'High Risk Detected' : 
             alert.severity === 'medium' ? 'Suspicious Activity' : 'Safe Message'}
          </Text>
          <Text style={styles.context}>
            {alert.userContext}
          </Text>
        </View>
      </View>

      <Text style={styles.message}>
        {alert.message}
      </Text>

      <View style={styles.alternativeContainer}>
        <View style={styles.infoIcon}>
          <Info size={16} color={style.iconColor} />
        </View>
        <Text style={styles.alternative}>
          <Text style={[styles.alternativeLabel, { color: style.iconColor }]}>
            Safer option: 
          </Text>
          {alert.saferAlternative}
        </Text>
      </View>

      {onDismiss && (
        <TouchableOpacity 
          style={[styles.dismissButton, { borderColor: style.iconColor }]}
          onPress={onDismiss}
        >
          <Text style={[styles.dismissButtonText, { color: style.iconColor }]}>
            Got it
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  context: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12,
  },
  alternativeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  alternative: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#374151',
  },
  alternativeLabel: {
    fontWeight: '600',
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
