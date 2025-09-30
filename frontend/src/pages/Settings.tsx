import React from 'react';
import { Form, Input, Button, Card, Typography, Switch, Row, Col, Divider } from 'antd';
import { SaveOutlined, SyncOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Received values:', values);
    // 在实际应用中，这里会调用 API 保存设置
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
            <p><strong>应用版本:</strong> v1.0.0</p>
            <p><strong>最后更新:</strong> 2024-01-15</p>
            <p><strong>数据库状态:</strong> <span style={{ color: '#52c41a' }}>正常</span></p>
            <p><strong>API 状态:</strong> <span style={{ color: '#52c41a' }}>正常</span></p>
            
            <Divider />
            
            <Button icon={<SyncOutlined />} style={{ marginRight: 8 }}>
              检查更新
            </Button>
            <Button>备份数据</Button>
          </Card>
          
          <Card title="数据统计" style={{ marginTop: 16 }}>
            <p><strong>平台数量:</strong> 4</p>
            <p><strong>总调用次数:</strong> 1,248</p>
            <p><strong>总 Token 消耗:</strong> 2,456,890</p>
            <p><strong>总费用:</strong> $68.52</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;