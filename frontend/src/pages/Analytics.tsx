import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const Analytics: React.FC = () => {
  // 模拟图表数据
  const tokenUsageData = [
    { date: '01-01', tokens: 4000 },
    { date: '01-02', tokens: 3000 },
    { date: '01-03', tokens: 2000 },
    { date: '01-04', tokens: 2780 },
    { date: '01-05', tokens: 1890 },
    { date: '01-06', tokens: 2390 },
    { date: '01-07', tokens: 3490 },
  ];

  const costData = [
    { date: '01-01', cost: 40 },
    { date: '01-02', cost: 30 },
    { date: '01-03', cost: 20 },
    { date: '01-04', cost: 27.8 },
    { date: '01-05', cost: 18.9 },
    { date: '01-06', cost: 23.9 },
    { date: '01-07', cost: 34.9 },
  ];

  const platformDistributionData = [
    { name: 'OpenAI', value: 45 },
    { name: 'Anthropic', value: 25 },
    { name: 'Google', value: 20 },
    { name: 'Azure', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      <Title level={2}>数据分析</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Token 使用趋势">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tokens" fill="#8884d8" name="Token 使用量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="费用趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="cost" 
                  stroke="#82ca9d" 
                  name="费用 ($)" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="平台使用分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;