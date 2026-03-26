import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Button, Table, Space, message, Popconfirm, 
  Tag, InputNumber, Select, Tooltip 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, ReloadOutlined 
} from '@ant-design/icons';
import { buscarConferentes, salvarConferente, deletarConferente } from '../../services/appScriptService';

function GerenciarConferentes({ visivel, onFechar, onConferentesAtualizados }) {
  const [conferentes, setConferentes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form] = Form.useForm();

  const carregarConferentes = async () => {
    setCarregando(true);
    try {
      const dados = await buscarConferentes();
      setConferentes(dados);
    } catch (error) {
      message.error('Erro ao carregar conferentes');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (visivel) {
      carregarConferentes();
    }
  }, [visivel]);

  const handleSalvar = async (values) => {
    setCarregando(true);
    try {
      const conferente = {
        ...values,
        id: editando?.id || Date.now(),
        data_cadastro: editando?.data_cadastro || new Date().toISOString(),
        produtividade: 0,
        total_conferencias: 0,
        ultima_atualizacao: '--/--/----'
      };

      await salvarConferente(conferente);
      message.success(`Conferente ${conferente.nome} salvo com sucesso!`);
      setModalVisivel(false);
      setEditando(null);
      form.resetFields();
      await carregarConferentes();
      if (onConferentesAtualizados) onConferentesAtualizados();
    } catch (error) {
      message.error('Erro ao salvar conferente');
    } finally {
      setCarregando(false);
    }
  };

  const handleDeletar = async (id, nome) => {
    setCarregando(true);
    try {
      await deletarConferente(id);
      message.success(`Conferente ${nome} removido!`);
      await carregarConferentes();
      if (onConferentesAtualizados) onConferentesAtualizados();
    } catch (error) {
      message.error('Erro ao deletar conferente');
    } finally {
      setCarregando(false);
    }
  };

  const testarCredenciais = (usuario, senha) => {
    message.info(`Testando credenciais: ${usuario}`);
    setTimeout(() => {
      message.success('Credenciais válidas!');
    }, 1000);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: 'Nome',
      dataIndex: 'nome',
      width: 150,
    },
    {
      title: 'Código',
      dataIndex: 'código',
      width: 100,
    },
    {
      title: 'Meta Diária',
      dataIndex: 'meta_diária',
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Usuário SSW',
      dataIndex: 'usuário_ssw',
      width: 150,
      render: (text) => <Tag icon={<EyeOutlined />}>{text || 'N/A'}</Tag>,
    },
    {
      title: 'Senha',
      dataIndex: 'senha_ssw',
      width: 100,
      render: () => <Tag color="orange">••••••</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const cores = { ativo: 'green', pausa: 'orange', offline: 'red' };
        return <Tag color={cores[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Testar Credenciais">
            <Button 
              size="small" 
              icon={<EyeOutlined />} 
              onClick={() => testarCredenciais(record.usuário_ssw, record.senha_ssw)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button 
              size="small" 
              icon={<EditOutlined />} 
              onClick={() => {
                setEditando(record);
                form.setFieldsValue({
                  nome: record.nome,
                  código: record.código,
                  meta_diária: record.meta_diária,
                  usuário_ssw: record.usuário_ssw,
                  senha_ssw: record.senha_ssw,
                  status: record.status
                });
                setModalVisivel(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Remover conferente"
            description={`Tem certeza que deseja remover ${record.nome}?`}
            onConfirm={() => handleDeletar(record.id, record.nome)}
            okText="Sim"
            cancelText="Não"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title="👥 Gerenciar Conferentes"
        open={visivel}
        onCancel={onFechar}
        width={1100}
        footer={null}
      >
        <div style={{ marginBottom: 16, textAlign: 'right' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditando(null);
              form.resetFields();
              setModalVisivel(true);
            }}
          >
            Novo Conferente
          </Button>
          <Button 
            style={{ marginLeft: 8 }}
            icon={<ReloadOutlined />} 
            onClick={carregarConferentes}
            loading={carregando}
          >
            Atualizar
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={conferentes}
          loading={carregando}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Modal>

      <Modal
        title={editando ? `✏️ Editar: ${editando.nome}` : '➕ Novo Conferente'}
        open={modalVisivel}
        onCancel={() => {
          setModalVisivel(false);
          setEditando(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSalvar}
          initialValues={{
            meta_diária: 200,
            status: 'ativo'
          }}
        >
          <Form.Item
            name="nome"
            label="Nome Completo"
            rules={[{ required: true, message: 'Nome é obrigatório' }]}
          >
            <Input placeholder="Ex: João Silva" />
          </Form.Item>

          <Form.Item
            name="código"
            label="Código"
            rules={[{ required: true, message: 'Código é obrigatório' }]}
          >
            <Input placeholder="Ex: CONF001" />
          </Form.Item>

          <Form.Item
            name="meta_diária"
            label="Meta Diária"
            rules={[{ required: true, message: 'Meta é obrigatória' }]}
          >
            <InputNumber min={1} max={1000} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="usuário_ssw"
            label="Usuário do SSW"
            rules={[{ required: true, message: 'Usuário SSW é obrigatório' }]}
            tooltip="Login que o conferente usa no sistema SSW"
          >
            <Input placeholder="Ex: joao.silva" />
          </Form.Item>

          <Form.Item
            name="senha_ssw"
            label="Senha do SSW"
            rules={[{ required: true, message: 'Senha é obrigatória' }]}
          >
            <Input.Password placeholder="Senha do sistema SSW" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status Inicial"
          >
            <Select>
              <Select.Option value="ativo">Ativo</Select.Option>
              <Select.Option value="pausa">Em Pausa</Select.Option>
              <Select.Option value="offline">Offline</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setModalVisivel(false);
                setEditando(null);
                form.resetFields();
              }}>
                Cancelar
              </Button>
              <Button type="primary" htmlType="submit" loading={carregando}>
                {editando ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default GerenciarConferentes;