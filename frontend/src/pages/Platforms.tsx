import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Space, 
  Typography,
  message,
  Popconfirm,
  Spin
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { platformService, Platform } from '../services/platform.service';

const { Title } = Typography;
const { Option } = Select;

const Platforms: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadPlatforms();
  }, []);

  const loadPlatforms = async () => {
    try {
      setLoading(true);
      const data = await platformService.getAll();
      setPlatforms(data);
    } catch (error) {
      console.error('加载平台失败:', error);
      message.error('加载平台数据失败');
    } finally {
      setLoading(false);
    }
  };

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
      render: (provider: string) => {
        const providerMap: { [key: string]: string } = {
          openai: 'OpenAI',
          anthropic: 'Anthropic',
          azure: 'Azure OpenAI',
          gemini: 'Google Gemini',
          custom: '自定义'
        };
        return providerMap[provider] || provider;
      },
    },
    {
      title: '基础 URL',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      render: (url: string) => url || '-',
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
      render: (quota: number) => quota ? quota.toLocaleString() : '-',
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
      render: (_: any, record: Platform) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个平台吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button icon={<DeleteOutlined />} danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingPlatform(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    form.setFieldsValue({
      ...platform,
      inputPrice: platform.pricingConfig?.input,
      outputPrice: platform.pricingConfig?.output,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await platformService.delete(id);
      message.success('删除成功');
      loadPlatforms();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleOk = () => {
    form.submit();
  };

  const onFinish = async (values: any) => {
    try {
      setSubmitting(true);
      
      const platformData = {
        ...values,
        pricingConfig: {
          input: parseFloat(values.inputPrice) || 0,
          output: parseFloat(values.outputPrice) || 0,
        },
      };
      
      // 移除临时字段
      delete platformData.inputPrice;
      delete platformData.outputPrice;

      if (editingPlatform) {
        await platformService.update(editingPlatform.id, platformData);
        message.success('更新成功');
      } else {
        await platformService.create(platformData);
        message.success('创建成功');
      }
      
      setIsModalVisible(false);
      loadPlatforms();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载平台数据中...</div>
      </div>
    );
  }

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
        dataSource={platforms.map(p => ({ ...p, key: p.id }))} 
        columns={platformColumns} 
        pagination={false}
        locale={{
          emptyText: (
            <div style={{ padding: '40px', color: '#999' }}>
              <PlusOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <div>暂无平台配置</div>
              <div style={{ fontSize: '12px', marginTop: '8px' }}>
                点击上方"添加平台"按钮开始配置您的第一个AI平台
              </div>
            </div>
          )
        }}
      />

      <Modal
        title={editingPlatform ? "编辑平台" : "添加平台"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            isActive: true,
            alertThreshold: 80,
          }}
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
          
          <Form.Item label="定价配置 ($/1K tokens)">
            <Input.Group compact>
              <Form.Item
                name="inputPrice"
                noStyle
                rules={[{ required: true, message: '请输入输入价格' }]}
              >
                <Input 
                  style={{ width: '50%' }} 
                  placeholder="输入价格" 
                  type="number"
                  step="0.001"
                />
              </Form.Item>
              <Form.Item
                name="outputPrice"
                noStyle
                rules={[{ required: true, message: '请输入输出价格' }]}
              >
                <Input 
                  style={{ width: '50%' }} 
                  placeholder="输出价格" 
                  type="number"
                  step="0.001"
                />
              </Form.Item>
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
            rules={[{ required: true, message: '请输入预警阈值' }]}
          >
            <Input type="number" placeholder="例如：80" min={1} max={100} />
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