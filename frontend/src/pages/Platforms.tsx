import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Space, 
  Typography 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const Platforms: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟平台数据
  const platformData = [
    {
      key: '1',
      name: 'OpenAI GPT-4',
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      isActive: true,
      monthlyQuota: 1000000,
      alertThreshold: 80,
    },
    {
      key: '2',
      name: 'Claude 3',
      provider: 'anthropic',
      baseUrl: 'https://api.anthropic.com',
      isActive: true,
      monthlyQuota: 500000,
      alertThreshold: 80,
    },
  ];

  const platformColumns = [
    {
      title: '平台名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: '基础 URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled />
      ),
    },
    {
      title: '月度配额',
      dataIndex: 'monthlyQuota',
      key: 'monthlyQuota',
    },
    {
      title: '预警阈值',
      dataIndex: 'alertThreshold',
      key: 'alertThreshold',
      render: (threshold: number) => `${threshold}%`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button icon={<DeleteOutlined />} danger>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const onFinish = (values: any) => {
    console.log('Received values:', values);
    setIsModalVisible(false);
  };

  return (
    <div>
      <Title level={2}>平台管理</Title>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          添加平台
        </Button>
      </div>
      
      <Table 
        dataSource={platformData} 
        columns={platformColumns} 
        pagination={false}
      />

      <Modal
        title="平台配置"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="name"
            label="平台名称"
            rules={[{ required: true, message: '请输入平台名称' }]}
          >
            <Input placeholder="例如：OpenAI GPT-4" />
          </Form.Item>
          
          <Form.Item
            name="provider"
            label="提供商"
            rules={[{ required: true, message: '请选择提供商' }]}
          >
            <Select placeholder="请选择提供商">
              <Option value="openai">OpenAI</Option>
              <Option value="anthropic">Anthropic</Option>
              <Option value="azure">Azure OpenAI</Option>
              <Option value="gemini">Google Gemini</Option>
              <Option value="custom">自定义</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="apiKeyEncrypted"
            label="API Key"
            rules={[{ required: true, message: '请输入 API Key' }]}
          >
            <Input.Password placeholder="请输入 API Key" />
          </Form.Item>
          
          <Form.Item
            name="baseUrl"
            label="基础 URL"
          >
            <Input placeholder="例如：https://api.openai.com/v1" />
          </Form.Item>
          
          <Form.Item
            name="pricingConfig"
            label="定价配置"
          >
            <Input.Group compact>
              <Input 
                style={{ width: '50%' }} 
                placeholder="输入价格 ($/1K tokens)" 
              />
              <Input 
                style={{ width: '50%' }} 
                placeholder="输出价格 ($/1K tokens)" 
              />
            </Input.Group>
          </Form.Item>
          
          <Form.Item
            name="monthlyQuota"
            label="月度配额 (tokens)"
          >
            <Input type="number" placeholder="例如：1000000" />
          </Form.Item>
          
          <Form.Item
            name="alertThreshold"
            label="预警阈值 (%)"
          >
            <Input type="number" placeholder="例如：80" />
          </Form.Item>
          
          <Form.Item
            name="isActive"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Platforms;