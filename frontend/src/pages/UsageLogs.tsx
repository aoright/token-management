import React, { useState } from 'react';
import { 
  Table, 
  Form, 
  DatePicker, 
  Select, 
  Button, 
  Space, 
  Typography,
  Input
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UsageLogs: React.FC = () => {
  const [form] = Form.useForm();
  
  // 模拟使用记录数据
  const logData = [
    {
      key: '1',
      platform: 'OpenAI GPT-4',
      model: 'gpt-4-turbo',
      promptTokens: 128,
      completionTokens: 356,
      totalTokens: 484,
      estimatedCost: 0.0242,
      createdAt: '2024-01-15 14:30:22',
    },
    {
      key: '2',
      platform: 'Claude 3',
      model: 'claude-3-opus',
      promptTokens: 85,
      completionTokens: 210,
      totalTokens: 295,
      estimatedCost: 0.0186,
      createdAt: '2024-01-15 10:15:45',
    },
    {
      key: '3',
      platform: 'GPT-3.5 Turbo',
      model: 'gpt-3.5-turbo',
      promptTokens: 256,
      completionTokens: 124,
      totalTokens: 380,
      estimatedCost: 0.0015,
      createdAt: '2024-01-14 16:42:18',
    },
  ];

  const logColumns = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
    },
    {
      title: '模型',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '提示词 Token',
      dataIndex: 'promptTokens',
      key: 'promptTokens',
    },
    {
      title: '完成 Token',
      dataIndex: 'completionTokens',
      key: 'completionTokens',
    },
    {
      title: '总 Token',
      dataIndex: 'totalTokens',
      key: 'totalTokens',
    },
    {
      title: '预估费用 ($)',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  const onFinish = (values: any) => {
    console.log('Received values:', values);
    // 在实际应用中，这里会调用 API 进行筛选
  };

  return (
    <div>
      <Title level={2}>使用记录</Title>
      
      <Form
        form={form}
        layout="inline"
        onFinish={onFinish}
        style={{ marginBottom: 24 }}
      >
        <Form.Item name="dateRange" label="时间范围">
          <RangePicker
            defaultValue={[
              dayjs().subtract(7, 'days'),
              dayjs()
            ]}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        
        <Form.Item name="platform" label="平台">
          <Select placeholder="请选择平台" style={{ width: 150 }}>
            <Option value="openai">OpenAI</Option>
            <Option value="anthropic">Anthropic</Option>
            <Option value="azure">Azure</Option>
            <Option value="gemini">Gemini</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="model" label="模型">
          <Input placeholder="模型名称" />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              筛选
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
      
      <Table 
        dataSource={logData} 
        columns={logColumns} 
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  );
};

export default UsageLogs;