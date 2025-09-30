export class AlertService {
  static checkQuota(platform: any, usage: { totalTokens: number }): boolean {
    // 检查是否超出配额
    if (platform.monthlyQuota && usage.totalTokens > platform.monthlyQuota) {
      this.sendAlert(platform, 'quota_exceeded');
      return true;
    }
    
    // 检查是否达到预警阈值
    if (platform.monthlyQuota && 
        usage.totalTokens > (platform.monthlyQuota * platform.alertThreshold / 100)) {
      this.sendAlert(platform, 'threshold_reached');
      return true;
    }
    
    return false;
  }

  static sendAlert(platform: any, type: string) {
    // 发送告警（邮件、短信等）
    console.log(`Alert for platform ${platform.name}: ${type}`);
    
    // 实际项目中可以实现邮件或短信通知
    // 例如使用 nodemailer 发送邮件
  }
}