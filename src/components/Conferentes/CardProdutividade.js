import React from 'react';
import { Card, Statistic, Progress, Tag, Space, Avatar, Tooltip } from 'antd';
import { 
  UserOutlined, 
  RiseOutlined, 
  FallOutlined, 
  TrophyOutlined,
  ClockCircleOutlined 
} from '@ant-design/icons';

function CardProdutividade({ conferente }) {
  // Verificar se conferente existe
  if (!conferente) {
    return null;
  }

  // Valores padrão para evitar undefined
  const {
    nome = 'Conferente',
    codigo = '---',
    produtividade = 0,
    totalConferencias = 0,
    metaDiaria = 200,
    ultimaAtualizacao = '--/--/----',
    status = 'offline'
  } = conferente;

  const percentual = metaDiaria > 0 ? (produtividade / metaDiaria) * 100 : 0;
  const estaAcimaDaMeta = produtividade >= metaDiaria;
  const corProgresso = estaAcimaDaMeta ? '#52c41a' : '#faad14';

  const getStatusTag = () => {
    switch (status) {
      case 'ativo':
        return <Tag color="success">Ativo</Tag>;
      case 'pausa':
        return <Tag color="warning">Em Pausa</Tag>;
      case 'offline':
        return <Tag color="default">Offline</Tag>;
      default:
        return <Tag color="default">Desconhecido</Tag>;
    }
  };

  return (
    <Card 
      className="card-produtividade"
      hoverable
      style={{ borderRadius: 8 }}
      actions={[
        <Tooltip title="Produtividade atual" key="prod">
          <Space>
            <RiseOutlined /> {produtividade}/{metaDiaria}
          </Space>
        </Tooltip>,
        <Tooltip title="Total de conferências" key="total">
          <Space>
            <ClockCircleOutlined /> {totalConferencias}
          </Space>
        </Tooltip>
      ]}
    >
      <Card.Meta
        avatar={
          <Avatar 
            size={48} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: estaAcimaDaMeta ? '#52c41a' : '#1890ff' 
            }} 
          />
        }
        title={
          <Space>
            <strong>{nome}</strong>
            {getStatusTag()}
          </Space>
        }
        description={`Código: ${codigo}`}
      />
      
      <div style={{ marginTop: 16 }}>
        <Statistic
          title="Produtividade"
          value={produtividade}
          suffix={`/ ${metaDiaria}`}
          precision={0}
          valueStyle={{ color: estaAcimaDaMeta ? '#3f8600' : '#cf1322' }}
          prefix={estaAcimaDaMeta ? <RiseOutlined /> : <FallOutlined />}
        />
        
        <Progress 
          percent={Math.min(percentual, 100)} 
          status={estaAcimaDaMeta ? "success" : "active"}
          strokeColor={corProgresso}
          style={{ marginTop: 12 }}
        />
        
        {estaAcimaDaMeta && (
          <Tag icon={<TrophyOutlined />} color="gold" style={{ marginTop: 8 }}>
            Meta Superada!
          </Tag>
        )}
        
        <div style={{ 
          fontSize: 12, 
          color: '#999', 
          marginTop: 12,
          textAlign: 'right' 
        }}>
          Última atualização: {ultimaAtualizacao}
        </div>
      </div>
    </Card>
  );
}

export default CardProdutividade;