import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, message } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  ApiOutlined, 
  FileTextOutlined,
  DollarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { usageService, UsageStats } from '../services/usage.service';
import { platformService, Platform } from '../services/platform.service';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformData, setPlatformData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // 并行加载统计数据和平台数据
      const [statsData, platformsData] = await Promise.all([
        usageService.getStats(),
        platformService.getAll()
      ]);
      
      setStats(statsData);
      setPlatforms(platformsData);
      
      // 为每个平台获取使用统计
      const platformUsageData = await Promise.all(
        platformsData.map(async (platform) => {
          try {
            const platformStats = await usageService.getStats(platform.id);
            return {
              key: platform.id,
              platform: platform.name,
              provider: platform.provider,
              tokens: platformStats.total.totalTokens,
              cost: platformStats.total.estimatedCost,
              trend: '+0%', // 可以后续计算趋势
            };
          } catch (error) {
            return {
              key: platform.id,
              platform: platform.name,
              provider: platform.provider,
              tokens: 0,
              cost: 0,
              trend: '0%',
            };
          }
        })
      );
      
      setPlatformData(platformUsageData);
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败，请稍后重试');
      
      // 如果是新用户没有数据，显示空状态
      setStats({
        total: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
        today: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 }
      });
      setPlatformData([]);
    } finally {
      setLoading(false);
    }
  };

  // 构建统计卡片数据
  const statsCards = stats ? [
    {
      title: '今日 Token 消耗',
      value: stats.today.totalTokens,
      icon: <ThunderboltOutlined style={{ color: '#f59e0b' }} />,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.8), rgba(251, 191, 36, 0.8))',
    },
    {
      title: '今日费用',
      value: `¥${stats.today.estimatedCost.toFixed(2)}`,
      icon: <DollarOutlined style={{ color: '#10b981' }} />,
      gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.8), rgba(52, 211, 153, 0.8))',
    },
    {
      title: '总 Token 消耗',
      value: stats.total.totalTokens,
      icon: <ApiOutlined style={{ color: '#3b82f6' }} />,
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8))',
    },
    {
      title: '总费用',
      value: `¥${stats.total.estimatedCost.toFixed(2)}`,
      icon: <FileTextOutlined style={{ color: '#8b5cf6' }} />,
      gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(168, 85, 247, 0.8))',
    },
  ] : [];

  const platformColumns = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: 'Token 消耗',
      dataIndex: 'tokens',
      key: 'tokens',
      sorter: (a: any, b: any) => a.tokens - b.tokens,
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: '费用 (¥)',
      dataIndex: 'cost',
      key: 'cost',
      sorter: (a: any, b: any) => a.cost - b.cost,
      render: (value: number) => `¥${value.toFixed(2)}`,
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
    },
  ];

  if (loading) {
    return (
      <div className="liquid-glass-surface" style={{ 
        textAlign: 'center', 
        padding: '80px',
        margin: '40px auto',
        maxWidth: '300px'
      }}>
        <Spin size="large" />
        <div style={{ marginTop: 20 }} className="liquid-text-primary">
          加载数据中...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} className="liquid-text-primary" style={{ 
          margin: 0, 
          fontSize: '2.5rem',
          fontWeight: '700',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          仪表板
        </Title>
        <p className="liquid-text-secondary" style={{ 
          margin: '8px 0 0 0', 
          fontSize: '1.1rem',
          fontWeight: '400'
        }}>
          实时监控您的 AI API 使用情况
        </p>
      </div>

      <Row gutter={[24, 24]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <div className="liquid-stats-card" style={{
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '24px',
                opacity: 0.7,
                color: 'rgba(0, 0, 0, 0.6)'
              }}>
                {stat.icon}
              </div>
              <div className="liquid-text-primary" style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>
                {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
              </div>
              <div className="liquid-text-secondary" style={{ fontSize: '0.9rem' }}>
                {stat.title}
              </div>
            </div>
          </Col>
        ))}
      </Row>
      
      <Row style={{ marginTop: 32 }}>
        <Col span={24}>
          <Card 
            className="liquid-glass-surface"
            title={
              <span className="liquid-text-primary" style={{ 
                fontSize: '1.3rem', 
                fontWeight: '600' 
              }}>
                平台使用情况
              </span>
            }
            extra={
              <span className="liquid-text-secondary" style={{ fontSize: '14px' }}>
                {platforms.length > 0 ? `共 ${platforms.length} 个平台` : '暂无平台数据'}
              </span>
            }
            style={{
              border: 'none',
              borderRadius: '20px'
            }}
          >
            {platformData.length > 0 ? (
              <Table 
                dataSource={platformData} 
                columns={platformColumns} 
                pagination={false}
                style={{ background: 'transparent' }}
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 40px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ApiOutlined style={{ 
                    fontSize: '36px', 
                    color: 'rgba(255, 255, 255, 0.6)' 
                  }} />
                </div>
                <div className="glass-text-primary" style={{ 
                  fontSize: '18px', 
                  fontWeight: '600',
                  marginBottom: '8px'
                }}>
                  暂无平台使用数据
                </div>
                <div className="glass-text-secondary" style={{ fontSize: '14px' }}>
                  请先添加平台配置，然后开始使用API服务
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;