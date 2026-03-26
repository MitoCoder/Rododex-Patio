import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Space, Button, message, Tabs, Card, Statistic, Row, Col, Tooltip } from 'antd';
import { EyeOutlined, ReloadOutlined, CheckCircleOutlined, UserAddOutlined, ChromeOutlined } from '@ant-design/icons';
import GerenciarConferentes from './GerenciarConferentes';
import AbrirSSW from './AbrirSSW';

function SupervisaoModal({ visivel, onFechar, conferentes, dadosSSW, carregando, onAtualizar }) {
  const [senha, setSenha] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [dadosDetalhados, setDadosDetalhados] = useState([]);
  const [gerenciarVisivel, setGerenciarVisivel] = useState(false);
  const [abrirSSWVisivel, setAbrirSSWVisivel] = useState(false);

  const SENHA_SUPERVISAO = 'supervisao';

  const handleAutenticar = () => {
    if (senha === SENHA_SUPERVISAO) {
      setAutenticado(true);
      message.success('Acesso autorizado!');
    } else {
      message.error('Senha incorreta!');
    }
  };

  useEffect(() => {
    if (conferentes && conferentes.length > 0) {
      const detalhes = conferentes.map(conf => ({
        ...conf,
        dadosSSW: dadosSSW[conf.id] || null,
      }));
      setDadosDetalhados(detalhes);
    }
  }, [conferentes, dadosSSW]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      width: 150,
    },
    {
      title: 'Código',
      dataIndex: 'codigo',
      key: 'codigo',
      width: 100,
    },
    {
      title: 'Usuário SSW',
      dataIndex: 'usuarioSSW',
      key: 'usuarioSSW',
      width: 120,
      render: (text) => <Tag color="blue">{text || 'N/A'}</Tag>,
    },
    {
      title: 'Produtividade',
      dataIndex: 'produtividade',
      key: 'produtividade',
      width: 100,
      render: (valor, record) => (
        <Tag color={valor > record.metaDiaria ? 'green' : valor > 0 ? 'orange' : 'default'}>
          {valor}/{record.metaDiaria}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const cores = { ativo: 'green', pausa: 'orange', offline: 'red' };
        return <Tag color={cores[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Dados do SSW',
      key: 'ssw',
      width: 250,
      render: (_, record) => {
        const dados = dadosSSW[record.id];
        if (!dados) return <Tag color="gray">Aguardando consulta</Tag>;
        
        if (dados.detalhes?.volumesLidos !== undefined) {
          return (
            <Space direction="vertical" size="small">
              <Tooltip title="Volumes lidos / Total">
                <Tag color="green">📦 {dados.detalhes.volumesLidos}/{dados.detalhes.totalVolumes}</Tag>
              </Tooltip>
              <Tooltip title="Placa do veículo">
                <Tag color="blue">🚛 {dados.detalhes.placa || 'N/A'}</Tag>
              </Tooltip>
              <Tooltip title="Percentual concluído">
                <Tag color="cyan">📊 {dados.detalhes.percentualConcluido || 0}%</Tag>
              </Tooltip>
            </Space>
          );
        }
        
        return (
          <Space direction="vertical" size="small">
            <Tooltip title="Manifestos abertos">
              <Tag color="blue">📦 {dados.detalhes?.manifestosAbertos || '0'}</Tag>
            </Tooltip>
            <Tooltip title="Romaneios abertos">
              <Tag color="cyan">📄 {dados.detalhes?.romaneiosAbertos || '0'}</Tag>
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: 'Última Atualização',
      dataIndex: 'ultimaAtualizacao',
      key: 'ultimaAtualizacao',
      width: 120,
    },
  ];

  const items = [
    {
      key: '1',
      label: '📊 Lista de Conferentes',
      children: (
        <Table
          columns={columns}
          dataSource={dadosDetalhados}
          loading={carregando}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1100 }}
          rowKey="id"
        />
      ),
    },
    {
      key: '2',
      label: '📡 Log de Consultas SSW',
      children: (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, fontSize: 12 }}>
            {JSON.stringify(dadosSSW, null, 2)}
          </pre>
        </div>
      ),
    },
    {
      key: '3',
      label: '🔧 Diagnóstico',
      children: (
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total de Conferentes"
                value={conferentes?.length || 0}
                suffix="operadores"
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Conferentes Ativos"
                value={conferentes?.filter(c => c.status === 'ativo').length || 0}
                suffix="operadores"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={24} style={{ marginTop: 16 }}>
            <Card title="Status da API SSW">
              <Space direction="vertical">
                <p><CheckCircleOutlined style={{ color: 'green' }} /> Endpoint: /api/ssw-proxy</p>
                <p>Total de consultas realizadas: {Object.keys(dadosSSW).length}</p>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={onAtualizar}
                  loading={carregando}
                >
                  Forçar Atualização
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  // Modal de autenticação
  if (!autenticado) {
    return (
      <>
        <Modal
          title="🔐 Acesso Restrito - Supervisão"
          open={visivel}
          onCancel={onFechar}
          footer={[
            <Button key="cancel" onClick={onFechar}>Cancelar</Button>,
            <Button key="submit" type="primary" onClick={handleAutenticar}>Acessar</Button>,
          ]}
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p>Digite a senha de supervisão para visualizar os dados detalhados:</p>
            <input
              type="password"
              style={{ 
                width: '100%', 
                padding: '8px', 
                fontSize: '16px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px'
              }}
              placeholder="Senha de supervisão"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAutenticar()}
              autoFocus
            />
          </div>
        </Modal>
        <GerenciarConferentes
          visivel={gerenciarVisivel}
          onFechar={() => setGerenciarVisivel(false)}
          onConferentesAtualizados={onAtualizar}
        />
        <AbrirSSW
          visivel={abrirSSWVisivel}
          onFechar={() => setAbrirSSWVisivel(false)}
          conferentes={conferentes}
          onDadosExtraidos={(dados, conferenteId) => {
            console.log('Dados extraídos:', dados);
            message.success(`Dados do conferente extraídos com sucesso!`);
            onAtualizar();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Modal
        title={
          <Space>
            <span>👁️ Supervisão - Dados do Sistema</span>
            <Button 
              type="primary" 
              size="small" 
              icon={<UserAddOutlined />} 
              onClick={() => setGerenciarVisivel(true)}
            >
              Gerenciar Conferentes
            </Button>
            <Button 
              type="default" 
              size="small" 
              icon={<ChromeOutlined />} 
              onClick={() => setAbrirSSWVisivel(true)}
              style={{ background: '#52c41a', color: 'white', borderColor: '#52c41a' }}
            >
              Abrir SSW
            </Button>
          </Space>
        }
        open={visivel}
        onCancel={() => {
          setAutenticado(false);
          setSenha('');
          onFechar();
        }}
        width={1200}
        footer={[
          <Button key="close" onClick={() => {
            setAutenticado(false);
            setSenha('');
            onFechar();
          }}>
            Fechar
          </Button>
        ]}
      >
        <Tabs defaultActiveKey="1" items={items} />
      </Modal>
      
      <GerenciarConferentes
        visivel={gerenciarVisivel}
        onFechar={() => setGerenciarVisivel(false)}
        onConferentesAtualizados={onAtualizar}
      />
      
      <AbrirSSW
        visivel={abrirSSWVisivel}
        onFechar={() => setAbrirSSWVisivel(false)}
        conferentes={conferentes}
        onDadosExtraidos={(dados, conferenteId) => {
          console.log('Dados extraídos:', dados);
          message.success(`Dados do conferente extraídos com sucesso!`);
          onAtualizar();
        }}
      />
    </>
  );
}

export default SupervisaoModal;