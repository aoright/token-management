import React from 'react';
import { Layout, Menu, theme } from 'antd';
import { 
  DashboardOutlined, 
  ApiOutlined, 
  FileSearchOutlined, 
  BarChartOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import UsageLogs from './pages/UsageLogs';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = React.useState('dashboard');

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
        <div className="demo-logo-vertical" />
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
        <Header style={{ padding: 0, background: colorBgContainer }} />
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

export default App;