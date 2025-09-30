import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Form, 
  DatePicker, 
  Select, 
  Button, 
  Space, 
  Typography,
  Input,
  message
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { usageService } from '../services/usage.service';
import { platformService } from '../services/platform.service';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UsageLogs: React.FC = () => {
  const [form] = Form.useForm();
  const [logs, setLogs] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取平台列表
  const fetchPlatforms = async () => {
    try {
      const platforms = await platformService.getAll();
      setPlatforms(platforms || []);
    } catch (error) {
      console.error('获取平台列表失败:', error);
    }
  };

  // 获取使用记录
  const fetchLogs = async (params: any = {}) => {
    setLoading(true);
    try {
      const response = await usageService.getLogs({
        page: pagination.current,
        limit: pagination.pageSize,
        ...params,
      });
      
      const logsWithKey = (response.logs || []).map((log: any) => ({
        ...log,
        key: log.id,
        platform: log.platformName,
        createdAt: dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      }));
      
      setLogs(logsWithKey);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));
    } catch (error) {
      console.error('获取使用记录失败:', error);
      message.error('获取使用记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
    fetchLogs();
  }, []);

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
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: '完成 Token',
      dataIndex: 'completionTokens',
      key: 'completionTokens',
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: '总 Token',
      dataIndex: 'totalTokens',
      key: 'totalTokens',
      render: (value: number) => value?.toLocaleString() || 0,
    },
    {
      title: '预估费用 ($)',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (value: number) => `$${(value || 0).toFixed(4)}`,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  const onFinish = (values: any) => {
    const params: any = {};
    
    if (values.dateRange) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD');
      params.endDate = values.dateRange[1].format('YYYY-MM-DD');
    }
    
    if (values.platform) {
      params.platformId = values.platform;
    }
    
    if (values.model) {
      params.model = values.model;
    }
    
    fetchLogs(params);
  };

  const handleTableChange = (paginationInfo: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
    
    const formValues = form.getFieldsValue();
    const params: any = {};
    
    if (formValues.dateRange) {
      params.startDate = formValues.dateRange[0].format('YYYY-MM-DD');
      params.endDate = formValues.dateRange[1].format('YYYY-MM-DD');
    }
    
    if (formValues.platform) {
      params.platformId = formValues.platform;
    }
    
    if (formValues.model) {
      params.model = formValues.model;
    }
    
    fetchLogs(params);
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
          <Select placeholder="请选择平台" style={{ width: 150 }} allowClear>
            {platforms.map(platform => (
              <Option key={platform.id} value={platform.id}>
                {platform.name}
              </Option>
            ))}
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
        dataSource={logs} 
        columns={logColumns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      />
    </div>
  );
};

export default UsageLogs;