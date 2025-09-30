import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Switch, Row, Col, Divider, message, Spin } from 'antd';
import { SaveOutlined, SyncOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

interface SystemInfo {
  version: string;
  lastUpdate: string;
  databaseStatus: string;
  apiStatus: string;
  statistics: {
    platformCount: number;
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
  };
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 获取系统信息
  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const response = await api.get('/system/info');
      setSystemInfo(response.data);
    } catch (error) {
      console.error('获取系统信息失败:', error);
      message.error('获取系统信息失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  const onFinish = (values: any) => {
    console.log('Received values:', values);
    message.success('设置保存成功');
    // 在实际应用中，这里会调用 API 保存设置
  };

  const handleCheckUpdate = () => {
    message.info('检查更新功能开发中...');
  };

  const handleBackupData = () => {
    message.info('数据备份功能开发中...');
  };

  return (
    <div>
      <Title level={2}>系统设置</Title>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="基本设置">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                autoRefresh: true,
                notifications: true,
                darkMode: false,
              }}
            >
              <Form.Item
                name="appName"
                label="应用名称"
              >
                <Input placeholder="Token Monitor" />
              </Form.Item>
              
              <Form.Item
                name="autoRefresh"
                label="自动刷新"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="refreshInterval"
                label="刷新间隔 (秒)"
              >
                <Input type="number" placeholder="30" />
              </Form.Item>
              
              <Divider />
              
              <Form.Item
                name="notifications"
                label="启用通知"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="通知邮箱"
              >
                <Input placeholder="your@email.com" />
              </Form.Item>
              
              <Divider />
              
              <Form.Item
                name="darkMode"
                label="暗黑模式"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit">
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="系统信息">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : systemInfo ? (
              <>
                <p><strong>应用版本:</strong> {systemInfo.version}</p>
                <p><strong>最后更新:</strong> {systemInfo.lastUpdate}</p>
                <p><strong>数据库状态:</strong> <span style={{ color: systemInfo.databaseStatus === 'normal' ? '#52c41a' : '#ff4d4f' }}>
                  {systemInfo.databaseStatus === 'normal' ? '正常' : '异常'}
                </span></p>
                <p><strong>API 状态:</strong> <span style={{ color: systemInfo.apiStatus === 'normal' ? '#52c41a' : '#ff4d4f' }}>
                  {systemInfo.apiStatus === 'normal' ? '正常' : '异常'}
                </span></p>
                
                <Divider />
                
                <Button icon={<SyncOutlined />} style={{ marginRight: 8 }} onClick={handleCheckUpdate}>
                  检查更新
                </Button>
                <Button onClick={handleBackupData}>备份数据</Button>
              </>
            ) : (
              <p>无法获取系统信息</p>
            )}
          </Card>
          
          <Card title="数据统计" style={{ marginTop: 16 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
              </div>
            ) : systemInfo ? (
              <>
                <p><strong>平台数量:</strong> {systemInfo.statistics.platformCount}</p>
                <p><strong>总调用次数:</strong> {systemInfo.statistics.totalCalls.toLocaleString()}</p>
                <p><strong>总 Token 消耗:</strong> {systemInfo.statistics.totalTokens.toLocaleString()}</p>
                <p><strong>总费用:</strong> ${systemInfo.statistics.totalCost.toFixed(4)}</p>
              </>
            ) : (
              <p>无法获取统计数据</p>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;