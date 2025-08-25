import { UserProfileService } from './userProfile';

export interface ScamTrend {
  location: string;
  scamType: string;
  frequency: number;
  recentReports: number;
  commonPatterns: string[];
}

export interface PersonalizedAlert {
  message: string;
  severity: 'low' | 'medium' | 'high';
  saferAlternative: string;
  userContext: string;
}

export class ScamDetectionService {
  private static instance: ScamDetectionService;
  private userProfileService: UserProfileService;

  constructor() {
    this.userProfileService = UserProfileService.getInstance();
  }

  static getInstance(): ScamDetectionService {
    if (!ScamDetectionService.instance) {
      ScamDetectionService.instance = new ScamDetectionService();
    }
    return ScamDetectionService.instance;
  }

  async analyzeMessageWithContext(message: string): Promise<PersonalizedAlert> {
    const profile = await this.userProfileService.getProfile();
    const riskLevel = this.assessRiskLevel(message, profile);
    
    return {
      message: this.generatePersonalizedMessage(message, profile, riskLevel),
      severity: riskLevel,
      saferAlternative: this.getSaferAlternative(message, profile),
      userContext: this.getUserContext(profile)
    };
  }

  private assessRiskLevel(message: string, profile: any): 'low' | 'medium' | 'high' {
    const lowerMessage = message.toLowerCase();
    let riskScore = 0;

    // Check for common scam patterns
    const highRiskPatterns = [
      'click here', 'verify account', 'suspended', 'urgent', 'limited time',
      'congratulations', 'winner', 'claim now', 'otp', 'pin code'
    ];

    const mediumRiskPatterns = [
      'promotion', 'discount', 'free', 'bonus', 'cash', 'reward'
    ];

    // Check against user's frequent apps for targeted scams
    const userApps = profile.frequentApps || [];
    userApps.forEach(app => {
      if (lowerMessage.includes(app.toLowerCase())) {
        riskScore += 2; // Higher risk for targeted app scams
      }
    });

    // Pattern matching
    highRiskPatterns.forEach(pattern => {
      if (lowerMessage.includes(pattern)) riskScore += 3;
    });

    mediumRiskPatterns.forEach(pattern => {
      if (lowerMessage.includes(pattern)) riskScore += 1;
    });

    // Risk assessment
    if (riskScore >= 5) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  private generatePersonalizedMessage(message: string, profile: any, riskLevel: string): string {
    const userName = profile.name || 'User';
    const location = profile.location || 'your area';
    const lowerMessage = message.toLowerCase();

    // Personalized alerts based on user context
    if (lowerMessage.includes('gcash') && profile.frequentApps?.includes('GCash')) {
      return `${userName}, this looks like a fake GCash promo. Official GCash promos don't come from random numbers. We've seen 5 similar scams in ${location} this week.`;
    }

    if (lowerMessage.includes('paymaya') && profile.frequentApps?.includes('PayMaya')) {
      return `${userName}, be careful! This appears to be a PayMaya phishing attempt. PayMaya never asks for PINs via SMS.`;
    }

    if (lowerMessage.includes('bpi') && profile.frequentApps?.includes('BPI Mobile')) {
      return `${userName}, this is likely a fake BPI message. Banks don't send account verification links via SMS.`;
    }

    // Generic personalized alerts
    switch (riskLevel) {
      case 'high':
        return `${userName}, this message is highly suspicious and likely a scam targeting users in ${location}. Don't click any links or share personal information.`;
      case 'medium':
        return `${userName}, this message shows suspicious patterns. Given your transaction habits, please verify this through official channels.`;
      default:
        return `${userName}, this message appears safe, but always stay vigilant when dealing with financial information.`;
    }
  }

  private getSaferAlternative(message: string, profile: any): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('gcash')) {
      return 'Check real GCash promos in your official GCash app under "Promotions"';
    }

    if (lowerMessage.includes('paymaya')) {
      return 'Open your PayMaya app to check for legitimate promotions and account status';
    }

    if (lowerMessage.includes('bpi')) {
      return 'Log into your BPI mobile app or visit a BPI branch to verify your account status';
    }

    if (lowerMessage.includes('bank') || lowerMessage.includes('account')) {
      return 'Contact your bank directly using the official number on your bank card';
    }

    return 'Verify this information through official channels or contact the company directly';
  }

  private getUserContext(profile: any): string {
    const frequentApps = profile.frequentApps || [];
    const location = profile.location || 'your area';
    
    return `Based on your frequent use of ${frequentApps.join(', ')} and location in ${location}`;
  }

  // Get location-based scam trends
  getLocationScamTrends(location: string): ScamTrend[] {
    // Mock data based on location - in real app, this would come from a database
    const trends: ScamTrend[] = [
      {
        location: location,
        scamType: 'GCash Promo Scams',
        frequency: 15,
        recentReports: 5,
        commonPatterns: ['Free load', 'Limited time offer', 'Click to claim']
      },
      {
        location: location,
        scamType: 'Bank Verification Scams',
        frequency: 8,
        recentReports: 3,
        commonPatterns: ['Account suspended', 'Verify now', 'Click here']
      },
      {
        location: location,
        scamType: 'Shopping Delivery Scams',
        frequency: 12,
        recentReports: 4,
        commonPatterns: ['Package delivery', 'Pay shipping fee', 'Failed delivery']
      }
    ];

    return trends;
  }

  // Generate community impact metrics
  getCommunityImpact(): {
    moneyProtected: number;
    usersHelped: number;
    reportsProcessed: number;
  } {
    return {
      moneyProtected: 2500000, // PHP 2.5M protected
      usersHelped: 1250,
      reportsProcessed: 850
    };
  }
}
