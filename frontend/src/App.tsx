import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Menu, theme, Avatar, Dropdown, Space } from 'antd';
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
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div style={{ 
          height: 32, 
          margin: 16, 
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold'
        }}>
          Token Monitor
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          onSelect={({ key }) => setSelectedKey(key)}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: '仪表板',
            },
            {
              key: 'platforms',
              icon: <ApiOutlined />,
              label: '平台管理',
            },
            {
              key: 'usage',
              icon: <FileSearchOutlined />,
              label: '使用记录',
            },
            {
              key: 'analytics',
              icon: <BarChartOutlined />,
              label: '数据分析',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: '系统设置',
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div />
          <Space>
            <span>欢迎，{user?.name || user?.email}</span>
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar 
                style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} 
                icon={<UserOutlined />} 
              />
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
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