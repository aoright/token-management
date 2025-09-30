import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Spin, message } from 'antd';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usageService } from '../services/usage.service';
import { platformService } from '../services/platform.service';
import dayjs from 'dayjs';

const { Title } = Typography;

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [tokenUsageData, setTokenUsageData] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [platformDistributionData, setPlatformDistributionData] = useState<any[]>([]);

  // 获取分析数据
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // 获取最近7天的使用记录
      const endDate = dayjs();
      const startDate = endDate.subtract(6, 'days');
      
      const logsResponse = await usageService.getLogs({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        limit: 1000,
      });

      const platforms = await platformService.getAll();
      
      // 处理Token使用趋势数据
      const dailyUsage: { [key: string]: number } = {};
      const dailyCost: { [key: string]: number } = {};
      const platformUsage: { [key: string]: number } = {};

      // 初始化最近7天的数据
      for (let i = 0; i < 7; i++) {
        const date = startDate.add(i, 'days').format('MM-DD');
        dailyUsage[date] = 0;
        dailyCost[date] = 0;
      }

      // 统计数据
      (logsResponse.logs || []).forEach((log: any) => {
        const date = dayjs(log.createdAt).format('MM-DD');
        const platformName = log.platformName || 'Unknown';
        
        if (dailyUsage[date] !== undefined) {
          dailyUsage[date] += log.totalTokens || 0;
          dailyCost[date] += log.estimatedCost || 0;
        }
        
        platformUsage[platformName] = (platformUsage[platformName] || 0) + (log.totalTokens || 0);
      });

      // 转换为图表数据格式
      const tokenData = Object.entries(dailyUsage).map(([date, tokens]) => ({
        date,
        tokens,
      }));

      const costChartData = Object.entries(dailyCost).map(([date, cost]) => ({
        date,
        cost: Number(cost.toFixed(2)),
      }));

      const platformData = Object.entries(platformUsage).map(([name, value]) => ({
        name,
        value,
      }));

      setTokenUsageData(tokenData);
      setCostData(costChartData);
      setPlatformDistributionData(platformData);
      
    } catch (error) {
      console.error('获取分析数据失败:', error);
      message.error('获取分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载分析数据中...</div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>数据分析</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Token 使用趋势（最近7天）">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tokenUsageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [value?.toLocaleString(), 'Token 使用量']} />
                <Legend />
                <Bar dataKey="tokens" fill="#8884d8" name="Token 使用量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="费用趋势（最近7天）">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(4)}`, '费用']} />
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
            {platformDistributionData.length > 0 ? (
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
                  <Tooltip formatter={(value) => [value?.toLocaleString(), 'Token 使用量']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                暂无使用数据
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;