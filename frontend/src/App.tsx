import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  ApiOutlined,
  FileSearchOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import UsageLogs from './pages/UsageLogs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const { Header, Sider, Content } = Layout;

// 主应用布局组件
const AppLayout: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人信息',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  const renderContent = () => {
    switch (selectedKey) {
      case 'dashboard':
        return <Dashboard />;
      case 'platforms':
        return <Platforms />;
      case 'usage':
        return <UsageLogs />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        className="liquid-sidebar"
        width={280}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: 'transparent',
          borderRight: 'none'
        }}
      >
        <div className="liquid-logo">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              T
            </div>
            Token Monitor
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          style={{ 
            background: 'transparent',
            border: 'none',
            padding: '0 12px'
          }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: '仪表板',
              className: selectedKey === 'dashboard' ? 'liquid-menu-item active' : 'liquid-menu-item',
            },
            {
              key: 'platforms',
              icon: <ApiOutlined />,
              label: '平台管理',
              className: selectedKey === 'platforms' ? 'liquid-menu-item active' : 'liquid-menu-item',
            },
            {
              key: 'usage',
              icon: <FileSearchOutlined />,
              label: '使用记录',
              className: selectedKey === 'usage' ? 'liquid-menu-item active' : 'liquid-menu-item',
            },
            {
              key: 'analytics',
              icon: <BarChartOutlined />,
              label: '数据分析',
              className: selectedKey === 'analytics' ? 'liquid-menu-item active' : 'liquid-menu-item',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: '系统设置',
              className: selectedKey === 'settings' ? 'liquid-menu-item active' : 'liquid-menu-item',
            },
          ]}
        />
      </Sider>
      <Layout style={{ background: 'transparent' }}>
        <Header className="liquid-header" style={{ 
          padding: '0 32px', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px'
        }}>
          <div />
          <Space size="large">
            <span className="liquid-text-primary" style={{ 
              fontSize: '16px',
              fontWeight: '500'
            }}>
              欢迎回来，{user?.name || user?.email || '用户'}
            </span>
            <Dropdown menu={userMenu} placement="bottomRight">
              <div className="liquid-glass" style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.2))'
              }}>
                <UserOutlined style={{ fontSize: '20px', color: 'rgba(0, 0, 0, 0.7)' }} />
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ padding: '0', background: 'transparent' }}>
          <div className="liquid-content">
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;