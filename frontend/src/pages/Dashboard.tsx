import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography } from 'antd';
import { 
  RiseOutlined, 
  FallOutlined, 
  ApiOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  // 模拟统计数据
  const stats = [
    {
      title: '今日 Token 消耗',
      value: 12840,
      icon: <RiseOutlined />,
      color: '#3f8600',
    },
    {
      title: '今日费用 (¥)',
      value: 3.24,
      icon: <RiseOutlined />,
      color: '#3f8600',
    },
    {
      title: '本月 Token 消耗',
      value: 245680,
      icon: <FallOutlined />,
      color: '#cf1322',
    },
    {
      title: '本月费用 (¥)',
      value: 68.52,
      icon: <FallOutlined />,
      color: '#cf1322',
    },
  ];

  // 平台使用情况表格数据
  const platformData = [
    {
      key: '1',
      platform: 'OpenAI GPT-4',
      provider: 'OpenAI',
      tokens: 85620,
      cost: 25.68,
      trend: '+12%',
    },
    {
      key: '2',
      platform: 'Claude 3',
      provider: 'Anthropic',
      tokens: 62450,
      cost: 18.74,
      trend: '+5%',
    },
    {
      key: '3',
      platform: 'Gemini Pro',
      provider: 'Google',
      tokens: 48560,
      cost: 9.71,
      trend: '-3%',
    },
    {
      key: '4',
      platform: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      tokens: 32180,
      cost: 1.29,
      trend: '+22%',
    },
  ];

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

  return (
    <div>
      <Title level={2}>仪表板</Title>
      <Row gutter={16}>
        {stats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="平台使用情况">
            <Table 
              dataSource={platformData} 
              columns={platformColumns} 
              pagination={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;