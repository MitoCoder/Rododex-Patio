import React, { useState, useEffect } from 'react';
import { Modal, Button, Select, Space, message, Alert, Tag, Descriptions } from 'antd';
import { ChromeOutlined, ExportOutlined } from '@ant-design/icons';

function AbrirSSW({ conferentes, visivel, onFechar, onDadosExtraidos }) {
  const [conferenteSelecionadoId, setConferenteSelecionadoId] = useState(null);
  const [janelaSSW, setJanelaSSW] = useState(null);
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const [extraindo, setExtraindo] = useState(false);
  const [conferenteAtual, setConferenteAtual] = useState(null);

  // Função para normalizar os campos do conferente
  const normalizarConferente = (conf) => {
    if (!conf) return null;
    return {
      id: conf.id,
      nome: conf.nome,
      codigo: conf.codigo || conf.código,
      metaDiaria: conf.metaDiaria || conf.meta_diária,
      status: conf.status,
      // Normalizar o campo de usuário SSW (pode vir com acento ou sem)
      usuarioSSW: conf.usuarioSSW || conf.usuário_ssw || conf.usuario_ssw || '',
      senhaSSW: conf.senhaSSW || conf.senha_ssw || '',
      produtividade: conf.produtividade || 0,
      totalConferencias: conf.totalConferencias || conf.total_conferencias || 0,
      ultimaAtualizacao: conf.ultimaAtualizacao || conf.ultima_atualizacao
    };
  };

  // Log para debug
  useEffect(() => {
    if (conferentes && conferentes.length > 0) {
      console.log('📋 Conferentes recebidos no AbrirSSW:', conferentes);
      console.log('📋 Primeiro conferente normalizado:', normalizarConferente(conferentes[0]));
    }
  }, [conferentes]);

  // Quando o modal é aberto, resetar o estado
  useEffect(() => {
    if (visivel) {
      setConferenteSelecionadoId(null);
      setConferenteAtual(null);
      setDadosExtraidos(null);
      if (janelaSSW && !janelaSSW.closed) {
        janelaSSW.close();
        setJanelaSSW(null);
      }
    }
  }, [visivel]);

  // Atualizar conferente atual quando selecionado
  useEffect(() => {
    console.log('🔍 ID selecionado:', conferenteSelecionadoId);
    console.log('📋 Conferentes disponíveis:', conferentes);
    
    if (conferenteSelecionadoId && conferentes && conferentes.length > 0) {
      const idNumero = parseInt(conferenteSelecionadoId);
      const encontrado = conferentes.find(c => c.id === idNumero);
      if (encontrado) {
        const normalizado = normalizarConferente(encontrado);
        console.log('👤 Conferente encontrado e normalizado:', normalizado);
        setConferenteAtual(normalizado);
      } else {
        setConferenteAtual(null);
      }
    } else {
      setConferenteAtual(null);
    }
  }, [conferenteSelecionadoId, conferentes]);

  const abrirSSW = () => {
    console.log('🚀 Tentando abrir SSW para conferente:', conferenteAtual);
    
    if (!conferenteAtual) {
      message.warning('Selecione um conferente primeiro');
      return;
    }

    if (!conferenteAtual.usuarioSSW) {
      message.error('Conferente não tem usuário SSW cadastrado!');
      message.info('Vá em "Gerenciar Conferentes" e adicione o usuário e senha do SSW.');
      return;
    }

    // Abrir a página de login do SSW
    const url = 'https://sistema.ssw.inf.br/bin/sswbar/login';
    
    // Abrir em uma nova janela
    const janela = window.open(url, '_blank', 'width=900,height=700,menubar=yes,toolbar=yes,location=yes,resizable=yes');
    
    if (janela) {
      setJanelaSSW(janela);
      setDadosExtraidos(null);
      message.info(`Janela aberta! Faça login como: ${conferenteAtual.usuarioSSW}`);
      
      // Aguardar a janela carregar e tentar preencher automaticamente
      const timer = setTimeout(() => {
        try {
          const doc = janela.document;
          
          const dominio = doc.getElementById('dominio');
          const cpf = doc.getElementById('cpf');
          const usuario = doc.getElementById('usuario');
          const senha = doc.getElementById('senha');
          
          if (dominio) dominio.value = 'ET1';
          if (cpf) cpf.value = '11152463802';
          if (usuario) usuario.value = conferenteAtual.usuarioSSW;
          if (senha) senha.value = conferenteAtual.senhaSSW;
          
          message.success('Credenciais preenchidas! Clique em "Entrar"');
        } catch (err) {
          console.log('Não foi possível preencher automaticamente', err);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      message.error('Pop-up bloqueado! Permita pop-ups para este site.');
    }
  };

  const extrairDados = () => {
    console.log('📊 Tentando extrair dados da janela...');
    
    if (!janelaSSW) {
      message.error('Nenhuma janela do SSW aberta');
      return;
    }
    
    if (janelaSSW.closed) {
      message.error('A janela do SSW foi fechada');
      setJanelaSSW(null);
      return;
    }

    setExtraindo(true);

    try {
      const doc = janelaSSW.document;
      
      if (doc.getElementById('dominio')) {
        message.warning('Você ainda não fez login! Faça login primeiro.');
        setExtraindo(false);
        return;
      }
      
      const totalQtde = doc.getElementById('total_qtde')?.innerText || '0';
      const capQtde = doc.getElementById('cap_qtde')?.innerText || '0';
      const falQtde = doc.getElementById('fal_qtde')?.innerText || '0';
      const totalPeso = doc.getElementById('total_peso')?.innerText || '0';
      const capPeso = doc.getElementById('cap_peso')?.innerText || '0';
      const totalVlr = doc.getElementById('total_vlr')?.innerText || '0';
      const capVlr = doc.getElementById('cap_vlr')?.innerText || '0';
      
      const placa = doc.getElementById('placa')?.value || 'N/A';
      const usuario = doc.getElementById('usuario')?.value || 'N/A';
      const filial = doc.getElementById('filial')?.value || 'N/A';
      
      const totalVolumes = parseInt(totalQtde) || 0;
      const volumesLidos = parseInt(capQtde) || 0;
      
      const dados = {
        id: conferenteAtual?.id,
        nome: conferenteAtual?.nome,
        produtividade: volumesLidos,
        totalConferencias: volumesLidos,
        ultimaBipagem: new Date().toISOString(),
        status: volumesLidos > 0 ? 'ativo' : 'pausa',
        detalhes: {
          placa: placa,
          totalVolumes: totalVolumes,
          volumesLidos: volumesLidos,
          volumesFaltam: parseInt(falQtde) || 0,
          pesoLido: parseFloat(capPeso.replace(',', '.')) || 0,
          pesoTotal: parseFloat(totalPeso.replace(',', '.')) || 0,
          valorLido: parseFloat(capVlr.replace(',', '.')) || 0,
          valorTotal: parseFloat(totalVlr.replace(',', '.')) || 0,
          usuarioLogado: usuario,
          filial: filial,
          percentualConcluido: totalVolumes > 0 ? ((volumesLidos / totalVolumes) * 100).toFixed(1) : 0
        }
      };
      
      console.log('✅ Dados extraídos:', dados);
      setDadosExtraidos(dados);
      message.success(`Dados extraídos! ${volumesLidos}/${totalVolumes} volumes lidos.`);
      
      if (onDadosExtraidos) {
        onDadosExtraidos(dados, conferenteAtual?.id);
      }
      
    } catch (err) {
      console.error('❌ Erro ao extrair dados:', err);
      message.error('Erro ao extrair dados. Certifique-se de que está na tela de Carga de Romaneio');
    } finally {
      setExtraindo(false);
    }
  };

  const fecharJanela = () => {
    if (janelaSSW && !janelaSSW.closed) {
      janelaSSW.close();
    }
    setJanelaSSW(null);
    setDadosExtraidos(null);
  };

  const opcoes = conferentes?.map(c => ({
    value: c.id,
    label: `${c.nome || 'Sem nome'} (${normalizarConferente(c).usuarioSSW || 'sem usuário'})`
  })) || [];

  console.log('📋 Opções do dropdown:', opcoes);

  return (
    <Modal
      title={
        <Space>
          <ChromeOutlined style={{ color: '#52c41a' }} />
          <span>Abrir Sistema SSW</span>
        </Space>
      }
      open={visivel}
      onCancel={() => {
        fecharJanela();
        onFechar();
      }}
      width={650}
      footer={[
        <Button key="fechar" onClick={() => {
          fecharJanela();
          onFechar();
        }}>
          Fechar
        </Button>,
        <Button 
          key="extrair" 
          type="primary" 
          onClick={extrairDados}
          loading={extraindo}
          disabled={!janelaSSW || janelaSSW.closed}
          icon={<ExportOutlined />}
        >
          Extrair Dados
        </Button>
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        <Alert
          message="📌 Como usar:"
          description={
            <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
              <li>Selecione um conferente abaixo</li>
              <li>Clique em <strong>"Abrir SSW"</strong> (nova janela será aberta)</li>
              <li>As credenciais serão pré-preenchidas - clique em <strong>"Entrar"</strong></li>
              <li>Navegue até a tela de <strong>"Carga de Romaneio"</strong></li>
              <li>Clique em <strong>"Extrair Dados"</strong> para capturar os valores</li>
            </ol>
          }
          type="info"
          style={{ marginBottom: 16 }}
        />
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Conferente:</label>
          <Select
            style={{ width: '100%' }}
            placeholder="Selecione um conferente"
            options={opcoes}
            onChange={(value) => {
              console.log('🖱️ Valor selecionado:', value);
              setConferenteSelecionadoId(value);
            }}
            value={conferenteSelecionadoId}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
        </div>
        
        {conferenteAtual && (
          <div style={{ marginBottom: 16, padding: 12, background: '#e6f7ff', borderRadius: 8, border: '1px solid #91d5ff' }}>
            <strong>✅ Conferente selecionado:</strong><br />
            Nome: {conferenteAtual.nome}<br />
            Usuário SSW: <Tag color="blue">{conferenteAtual.usuarioSSW || 'Não cadastrado'}</Tag>
          </div>
        )}
        
        {!conferenteAtual && conferenteSelecionadoId && (
          <Alert
            message="⚠️ Conferente não encontrado"
            description={`ID selecionado: ${conferenteSelecionadoId}. Verifique se o conferente foi cadastrado corretamente.`}
            type="warning"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
        
        <Button 
          type="primary" 
          icon={<ChromeOutlined />} 
          onClick={abrirSSW}
          block
          size="large"
          disabled={!conferenteAtual || !conferenteAtual.usuarioSSW}
          style={{ marginBottom: 16 }}
        >
          Abrir SSW {conferenteAtual && conferenteAtual.usuarioSSW ? `(${conferenteAtual.usuarioSSW})` : ''}
        </Button>
        
        {janelaSSW && !janelaSSW.closed && (
          <Alert
            message="✅ Janela aberta"
            description="A janela do SSW está aberta. Após fazer login e ir para a tela de Carga de Romaneio, clique em 'Extrair Dados'."
            type="success"
            style={{ marginBottom: 16 }}
            showIcon
          />
        )}
        
        {dadosExtraidos && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="📊 Dados Extraídos"
              description={
                <div style={{ marginTop: 8 }}>
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Conferente">{dadosExtraidos.nome}</Descriptions.Item>
                    <Descriptions.Item label="Placa">
                      <Tag color="blue">{dadosExtraidos.detalhes.placa}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Produtividade">
                      <Tag color="green">{dadosExtraidos.detalhes.volumesLidos}/{dadosExtraidos.detalhes.totalVolumes} volumes</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Percentual">
                      <Tag color="cyan">{dadosExtraidos.detalhes.percentualConcluido}%</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Peso Conferido">
                      {dadosExtraidos.detalhes.pesoLido} kg
                    </Descriptions.Item>
                    <Descriptions.Item label="Valor Conferido">
                      R$ {dadosExtraidos.detalhes.valorLido.toFixed(2)}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              }
              type="success"
              showIcon
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AbrirSSW;