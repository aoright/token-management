import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Spin, message } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  ApiOutlined, 
  FileTextOutlined 
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
      icon: <RiseOutlined />,
      color: '#3f8600',
    },
    {
      title: '今日费用 (¥)',
      value: stats.today.estimatedCost,
      precision: 2,
      icon: <RiseOutlined />,
      color: '#3f8600',
    },
    {
      title: '总 Token 消耗',
      value: stats.total.totalTokens,
      icon: <ApiOutlined />,
      color: '#1890ff',
    },
    {
      title: '总费用 (¥)',
      value: stats.total.estimatedCost,
      precision: 2,
      icon: <FileTextOutlined />,
      color: '#1890ff',
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
    },
    {
      title: '费用 (¥)',
      dataIndex: 'cost',
      key: 'cost',
      sorter: (a: any, b: any) => a.cost - b.cost,
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载数据中...</div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>仪表板</Title>
      <Row gutter={16}>
        {statsCards.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card 
            title="平台使用情况"
            extra={
              <span style={{ color: '#666', fontSize: '14px' }}>
                {platforms.length > 0 ? `共 ${platforms.length} 个平台` : '暂无平台数据'}
              </span>
            }
          >
            {platformData.length > 0 ? (
              <Table 
                dataSource={platformData} 
                columns={platformColumns} 
                pagination={false}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <ApiOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>暂无平台使用数据</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
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