import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

const { TabPane } = Tabs;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const { setUser, setToken } = useAuthStore();

  const onLogin = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authService.login(values.email, values.password);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        message.success('登录成功！');
        navigate('/dashboard');
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: { email: string; password: string; name?: string }) => {
    setLoading(true);
    try {
      const response = await authService.register(values.email, values.password, values.name);
      
      if (response.success) {
        setUser(response.data.user);
        setToken(response.data.token);
        message.success('注册成功！');
        navigate('/dashboard');
      } else {
        message.error(response.message || '注册失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '注册失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* 背景装饰元素 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      <div className="liquid-glass-surface" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '0',
        overflow: 'hidden'
      }}>
        {/* Logo 区域 */}
        <div style={{
          textAlign: 'center',
          padding: '40px 40px 20px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)'
          }}>
            <ThunderboltOutlined style={{ 
              fontSize: '28px', 
              color: 'white' 
            }} />
          </div>
          <h1 className="liquid-text-primary" style={{ 
            margin: 0, 
            fontSize: '1.8rem',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            Token Monitor
          </h1>
          <p className="liquid-text-secondary" style={{ 
            margin: '8px 0 0 0', 
            fontSize: '1rem'
          }}>
            AI API 使用监控平台
          </p>
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            centered
          >
            <TabPane tab="登录" key="login">
              <Form
                name="login"
                onFinish={onLogin}
                autoComplete="off"
                layout="vertical"
                style={{ marginTop: '24px' }}
              >
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱地址!' },
                    { type: 'email', message: '请输入有效的邮箱地址!' }
                  ]}
                >
                  <Input
                    className="liquid-input"
                    prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="邮箱地址"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: '请输入密码!' }]}
                >
                  <Input.Password
                    className="liquid-input"
                    prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="密码"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px' }}>
                  <Button
                    className="liquid-button-primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    登录
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="注册" key="register">
              <Form
                name="register"
                onFinish={onRegister}
                autoComplete="off"
                layout="vertical"
                style={{ marginTop: '24px' }}
              >
                <Form.Item
                  name="name"
                  rules={[{ required: false }]}
                >
                  <Input
                    className="liquid-input"
                    prefix={<UserOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="姓名（可选）"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱地址!' },
                    { type: 'email', message: '请输入有效的邮箱地址!' }
                  ]}
                >
                  <Input
                    className="liquid-input"
                    prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="邮箱地址"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码!' },
                    { min: 6, message: '密码至少6位!' }
                  ]}
                >
                  <Input.Password
                    className="liquid-input"
                    prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="密码（至少6位）"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: '请确认密码!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    className="liquid-input"
                    prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
                    placeholder="确认密码"
                    size="large"
                    style={{ height: '48px' }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '32px' }}>
                  <Button
                    className="liquid-button-primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    block
                    style={{ 
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    注册
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .ant-tabs-tab-active {
          color: white !important;
        }
        
        .ant-tabs-ink-bar {
          background: white !important;
        }
      `}</style>
    </div>
  );
};

export default Login;