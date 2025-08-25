import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  location: string;
  frequentApps: string[];
  riskLevel: 'low' | 'medium' | 'high';
  points: number;
  badges: string[];
  joinDate: Date;
  reportsSubmitted: number;
  scamsBlocked: number;
  transactionHabits: {
    frequentPaymentApps: string[];
    averageTransactionAmount: number;
    frequentMerchants: string[];
  };
}

export class UserProfileService {
  private static instance: UserProfileService;
  private userProfile: UserProfile | null = null;

  static getInstance(): UserProfileService {
    if (!UserProfileService.instance) {
      UserProfileService.instance = new UserProfileService();
    }
    return UserProfileService.instance;
  }

  async initializeProfile(): Promise<UserProfile> {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        this.userProfile = JSON.parse(savedProfile);
        return this.userProfile!;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }

    // Default profile for Maria use case
    this.userProfile = {
      name: 'Maria',
      location: 'Cavite',
      frequentApps: ['GCash', 'PayMaya', 'BPI Mobile'],
      riskLevel: 'medium',
      points: 150,
      badges: ['Community Protector', 'First Reporter'],
      joinDate: new Date(),
      reportsSubmitted: 5,
      scamsBlocked: 12,
      transactionHabits: {
        frequentPaymentApps: ['GCash', 'PayMaya'],
        averageTransactionAmount: 2500,
        frequentMerchants: ['7-Eleven', 'Shopee', 'Grab']
      }
    };

    await this.saveProfile();
    return this.userProfile;
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.userProfile) {
      return await this.initializeProfile();
    }
    return this.userProfile;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    if (this.userProfile) {
      this.userProfile = { ...this.userProfile, ...updates };
      await this.saveProfile();
    }
  }

  async addPoints(points: number): Promise<number> {
    if (this.userProfile) {
      this.userProfile.points += points;
      await this.checkForNewBadges();
      await this.saveProfile();
      return this.userProfile.points;
    }
    return 0;
  }

  async addBadge(badge: string): Promise<void> {
    if (this.userProfile && !this.userProfile.badges.includes(badge)) {
      this.userProfile.badges.push(badge);
      await this.saveProfile();
    }
  }

  async incrementReports(): Promise<void> {
    if (this.userProfile) {
      this.userProfile.reportsSubmitted += 1;
      await this.addPoints(10); // 10 points per report
      await this.saveProfile();
    }
  }

  async incrementScamsBlocked(): Promise<void> {
    if (this.userProfile) {
      this.userProfile.scamsBlocked += 1;
      await this.addPoints(5); // 5 points per blocked scam
      await this.saveProfile();
    }
  }

  private async checkForNewBadges(): Promise<void> {
    if (!this.userProfile) return;

    const { points, reportsSubmitted, scamsBlocked } = this.userProfile;

    // Badge logic
    if (points >= 50 && !this.userProfile.badges.includes('Community Protector')) {
      await this.addBadge('Community Protector');
    }
    if (points >= 200 && !this.userProfile.badges.includes('Scam Hunter')) {
      await this.addBadge('Scam Hunter');
    }
    if (reportsSubmitted >= 10 && !this.userProfile.badges.includes('Vigilant Reporter')) {
      await this.addBadge('Vigilant Reporter');
    }
    if (scamsBlocked >= 25 && !this.userProfile.badges.includes('Shield Guardian')) {
      await this.addBadge('Shield Guardian');
    }
  }

  private async saveProfile(): Promise<void> {
    if (this.userProfile) {
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(this.userProfile));
      } catch (error) {
        console.error('Error saving user profile:', error);
      }
    }
  }

  // Get personalized risk assessment
  getRiskAssessment(): string {
    if (!this.userProfile) return 'medium';
    
    const { frequentApps, transactionHabits } = this.userProfile;
    let riskScore = 0;

    // Higher risk for frequent financial app users
    if (frequentApps.includes('GCash') || frequentApps.includes('PayMaya')) {
      riskScore += 2;
    }
    
    // Higher risk for high transaction amounts
    if (transactionHabits.averageTransactionAmount > 5000) {
      riskScore += 1;
    }

    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }

  // Get personalized safety tips
  getPersonalizedTips(): string[] {
    if (!this.userProfile) return [];

    const tips: string[] = [];
    const { frequentApps, name } = this.userProfile;

    if (frequentApps.includes('GCash')) {
      tips.push(`${name}, always verify GCash promos in your official app, not through SMS links.`);
    }
    if (frequentApps.includes('PayMaya')) {
      tips.push(`${name}, PayMaya will never ask for your PIN via SMS or calls.`);
    }
    
    tips.push(`${name}, be extra cautious of messages mentioning your frequently used apps.`);
    return tips;
  }
}
