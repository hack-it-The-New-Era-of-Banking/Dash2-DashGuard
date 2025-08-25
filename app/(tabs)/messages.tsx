import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, Alert, Clipboard } from 'react-native';
import Constants from 'expo-constants';
import { MessageSquare, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, MapPin } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import * as SMS from 'expo-sms';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useTheme } from '../dark';
import PersonalizedAlert from '../../components/PersonalizedAlert';
import { ScamDetectionService } from '../../services/scamDetection';
import { UserProfileService } from '../../services/userProfile';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.geminiApiKey || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Initialize Google Geminis
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface Message {
  id: string;
  sender: string;
  preview: string;
  timestamp: string;
  risk: 'high' | 'suspicious' | 'safe';
  alert?: {
    message: string;
    severity: 'low' | 'medium' | 'high';
    saferAlternative: string;
    userContext: string;
  };
}

interface ScamTrend {
  type: string;
  count: number;
  location: string;
}

export default function MessagesScreen() {
  const { isDarkMode, colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAlert, setCurrentAlert] = useState<any>(null);
  const [locationTrends, setLocationTrends] = useState<ScamTrend[]>([]);
  
  const scamDetectionService = ScamDetectionService.getInstance();
  const userProfileService = UserProfileService.getInstance();

  useEffect(() => {
    // Check if SMS is available on the device
    const checkSmsAvailability = async () => {
      const isSmsAvailable = await SMS.isAvailableAsync();
      setIsAvailable(isSmsAvailable);
      
      if (!isSmsAvailable) {
        console.log('SMS is not available on this device');
      }
    };

    checkSmsAvailability();
  }, []);

  // Function to handle long press and copy number
  const handleLongPress = (sender: string) => {
    Clipboard.setString(sender);
    Alert.alert('Copied', `Phone number ${sender} copied to clipboard`);
  };

  // Function to add delay between API calls
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Function to generate mock message text using Gemini
  const generateMockText = async (): Promise<string> => {
    try {
      await delay(8000);
      const prompt = `Generate a random SMS message that could be either a fraud or a legitimate message, make it balance. Make it Filipino way. Just the text message, no other text.`;
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error generating mock text:', error);
      return 'Your account has been locked. Click here to verify: bit.ly/suspicious-link';
    }
  };

  // Function to analyze message using Gemini
  const analyzeMessage = async (text: string): Promise<'high' | 'suspicious' | 'safe'> => {
    try {
      await delay(8000);
      const prompt = `Sentiment Analysis for detecting if text message is subjective to scamming, phishing or fraud. Rate it as either 'high', 'suspicious', or 'safe' risk:
      "${text}"
      Only respond with one word: high, suspicious, or safe.`;

      const result = await model.generateContent(prompt);
      const response = result.response.text().toLowerCase().trim();

      if (response === 'high' || response === 'suspicious' || response === 'safe') {
        return response as 'high' | 'suspicious' | 'safe';
      }
      return 'suspicious';
    } catch (error) {
      console.error('Error analyzing message:', error);
      return 'suspicious';
    }
  };

  // Function to show risk alert
  const showRiskAlert = (risk: 'high' | 'suspicious' | 'safe', message: string) => {
    let title = '';
    let description = '';

    switch(risk) {
      case 'high':
        title = '⚠️ High Risk Message Detected';
        description = 'This message appears to be dangerous and likely a scam. Do not click any links or provide personal information.';
        break;
      case 'suspicious':
        title = '⚠️ Suspicious Message';
        description = 'This message shows some suspicious patterns. Please be cautious and verify before taking any action.';
        break;
      case 'safe':
        title = '✅ Safe Message';
        description = 'This message appears to be safe.';
        break;
    }

    Alert.alert(
      title,
      `${description}\n\nMessage content: ${message}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Function to handle scanning (in Expo, we'll need to manually add messages for demo)
  const handleScanMessage = async () => {
    if (!isAvailable || isProcessing) {
      Alert.alert('Not Available', 'SMS functionality is not available on this device');
      return;
    }

    setIsProcessing(true);
    
    const mockText = await generateMockText();
    const riskLevel = await analyzeMessage(mockText);
    
    const mockMessage = {
      id: Date.now().toString(),
      sender: `+63${Math.floor(Math.random() * 10000000).toString().padStart(9, '9')}`,
      preview: mockText,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      risk: riskLevel
    };
    
    setMessages(prevMessages => [mockMessage, ...prevMessages]);
    setTimeout(() => showRiskAlert(riskLevel, mockText), 500);
    setIsProcessing(false);
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'high':
        return <AlertTriangle size={20} color="#DC2626" />;
      case 'suspicious':
        return <AlertTriangle size={20} color="#D97706" />;
      case 'safe':
        return <CheckCircle size={20} color="#10B981" />;
      default:
        return null;
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk) {
      case 'high':
        return styles.highRisk;
      case 'suspicious':
        return styles.suspicious;
      case 'safe':
        return styles.safe;
      default:
        return {};
    }
  };

  const getRiskLabelStyle = (risk: string) => {
    switch (risk) {
      case 'high':
        return { color: '#DC2626' };
      case 'suspicious':
        return { color: '#D97706' };
      case 'safe':
        return { color: '#10B981' };
      default:
        return {};
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>Messages</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Scanned messages appear here</Text>
      </View>

      {!isAvailable && (
        <View style={styles.notSupportedBanner}>
          <AlertTriangle size={18} color="#DC2626" />
          <Text style={[styles.notSupportedText, { color: '#DC2626' }]}>SMS functionality is not available on this device</Text>
        </View>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.messageItem, { backgroundColor: colors.surface }]}
            onPress={() => showRiskAlert(item.risk, item.preview)}
            onLongPress={() => handleLongPress(item.sender)}
          >
            <View style={[styles.riskIndicator, getRiskStyle(item.risk)]}>
              {getRiskIcon(item.risk)}
            </View>
            <View style={styles.messageContent}>
              <View style={styles.messageHeader}>
                <Text style={[styles.sender, { color: colors.text }]}>{item.sender}</Text>
                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{item.timestamp}</Text>
              </View>
              <Text style={[styles.preview, { color: colors.text }]} numberOfLines={2}>
                {item.preview}
              </Text>
              <Text style={[styles.severityLabel, getRiskLabelStyle(item.risk)]}>
                {item.risk.charAt(0).toUpperCase() + item.risk.slice(1)} Risk
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages scanned yet</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={[
          styles.scanButton,
          { backgroundColor: colors.primary },
          (!isAvailable || isProcessing) && styles.disabledButton
        ]} 
        onPress={handleScanMessage}
        disabled={!isAvailable || isProcessing}
      >
        <MessageSquare size={24} color="#fff" />
        <Text style={styles.scanButtonText}>
          {isProcessing ? 'Processing...' : 'Scan Inbox'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  notSupportedBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notSupportedText: {
    marginLeft: 8,
    fontSize: 14,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  riskIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  highRisk: {
    backgroundColor: '#FEE2E2',
  },
  suspicious: {
    backgroundColor: '#FEF3C7',
  },
  safe: {
    backgroundColor: '#D1FAE5',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
  },
  scanButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 30,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
