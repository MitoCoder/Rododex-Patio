import React from 'react';
import { Layout, Typography, Badge, Space } from 'antd';
import { SyncOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const { Header } = Layout;
const { Title, Text } = Typography;

function Cabecalho({ ultimaAtualizacao, atualizando }) {
  const dataFormatada = ultimaAtualizacao 
    ? dayjs(ultimaAtualizacao).locale('pt-br').format('DD/MM/YYYY HH:mm:ss')
    : 'Nunca atualizado';

  return (
    <Header style={{ 
      background: '#001529', 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'fixed',
      top: 0,
      zIndex: 1,
      width: '100%'
    }}>
      <Title level={3} style={{ color: 'white', margin: 0 }}>
        Rododex Pátio
      </Title>
      <Space>
        {atualizando ? (
          <Badge 
            status="processing" 
            icon={<SyncOutlined spin />} 
            text={<Text style={{ color: 'white' }}>Atualizando...</Text>}
          />
        ) : (
          <Badge 
            status="success" 
            icon={<CheckCircleOutlined />} 
            text={<Text style={{ color: 'white' }}>Última atualização: {dataFormatada}</Text>}
          />
        )}
      </Space>
    </Header>
  );
}

export default Cabecalho;