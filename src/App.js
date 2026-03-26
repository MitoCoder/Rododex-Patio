import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, message, Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Cabecalho from './components/Layout/Cabecalho';
import ListaConferentes from './components/Conferentes/ListaConferentes';
import SupervisaoModal from './components/Supervisao/SupervisaoModal';
import useProdutividade from './hooks/useProdutividade';
import { obterProdutividadeSSW } from './services/sswService';

const { Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [atualizando, setAtualizando] = useState(false);
  const [supervisaoVisivel, setSupervisaoVisivel] = useState(false);
  const [dadosSSW, setDadosSSW] = useState({});
  
  const { 
    conferentes, 
    carregando, 
    erro, 
    atualizarDados,
    ultimaAtualizacao,
    recarregarConferentes
  } = useProdutividade();

  // Função para buscar dados do SSW individualmente para cada conferente
  const buscarDadosSSW = useCallback(async () => {
    if (!conferentes || conferentes.length === 0) return;
    
    console.log('🔄 Buscando dados do SSW para todos os conferentes...');
    const novosDados = {};
    
    for (const conf of conferentes) {
      try {
        console.log(`📡 Consultando SSW para: ${conf.nome} (usuário: ${conf.usuarioSSW})`);
        const dados = await obterProdutividadeSSW(conf);
        novosDados[conf.id] = dados;
        console.log(`✅ Dados obtidos para ${conf.nome}:`, dados);
      } catch (err) {
        console.error(`❌ Erro ao buscar dados SSW para ${conf.nome}:`, err);
        novosDados[conf.id] = { erro: err.message, produtividade: 0, totalConferencias: 0 };
      }
    }
    
    setDadosSSW(novosDados);
    console.log('✅ Todos os dados do SSW atualizados');
  }, [conferentes]);

  // Atualização periódica a cada 6 segundos
  useEffect(() => {
    const intervalo = setInterval(async () => {
      setAtualizando(true);
      await atualizarDados();
      await buscarDadosSSW();
      setTimeout(() => setAtualizando(false), 1000);
    }, 6000);

    return () => clearInterval(intervalo);
  }, [atualizarDados, buscarDadosSSW]);

  // Buscar dados iniciais quando conferentes carregarem
  useEffect(() => {
    if (conferentes && conferentes.length > 0) {
      buscarDadosSSW();
    }
  }, [conferentes, buscarDadosSSW]);

  // Exibir mensagem de erro se houver
  useEffect(() => {
    if (erro) {
      message.error(`Erro ao carregar dados: ${erro}`);
    }
  }, [erro]);

  // Forçar atualização manual
  const forcarAtualizacao = async () => {
    setAtualizando(true);
    await atualizarDados();
    await buscarDadosSSW();
    setTimeout(() => setAtualizando(false), 1000);
  };

  return (
    <Layout>
      <Cabecalho 
        ultimaAtualizacao={ultimaAtualizacao} 
        atualizando={atualizando}
      />
      <Content style={{ padding: '24px 50px', marginTop: 64 }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <Title level={2} style={{ marginBottom: 24 }}>
            Produtividade dos Conferentes
          </Title>
          <ListaConferentes 
            conferentes={conferentes} 
            carregando={carregando}
            atualizando={atualizando}
          />
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', position: 'relative' }}>
        <div>
          Rododex Pátio ©2024 - Sistema de Medição de Produtividade
        </div>
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => setSupervisaoVisivel(true)}
          style={{ position: 'absolute', right: 50, bottom: 20 }}
        >
          Supervisão
        </Button>
      </Footer>
      
      <SupervisaoModal
        visivel={supervisaoVisivel}
        onFechar={() => setSupervisaoVisivel(false)}
        conferentes={conferentes}
        dadosSSW={dadosSSW}
        carregando={carregando}
        onAtualizar={forcarAtualizacao}
      />
    </Layout>
  );
}

export default App;