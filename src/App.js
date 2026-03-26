import React, { useState, useEffect } from 'react';
import { Layout, Typography, message } from 'antd';
import Cabecalho from './components/Layout/Cabecalho';
import ListaConferentes from './components/Conferentes/ListaConferentes';
import useProdutividade from './hooks/useProdutividade';

const { Content, Footer } = Layout;
const { Title } = Typography;

function App() {
  const [atualizando, setAtualizando] = useState(false);
  const { 
    conferentes, 
    carregando, 
    erro, 
    atualizarDados,
    ultimaAtualizacao 
  } = useProdutividade();

  // Exibir mensagem de erro se houver
  useEffect(() => {
    if (erro) {
      message.error(`Erro ao carregar dados: ${erro}`);
    }
  }, [erro]);

  // Atualização periódica a cada 6 segundos (entre 4-8 segundos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      setAtualizando(true);
      atualizarDados();
      setTimeout(() => setAtualizando(false), 1000);
    }, 6000);

    return () => clearInterval(intervalo);
  }, [atualizarDados]);

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
      <Footer style={{ textAlign: 'center' }}>
        Rododex Pátio ©2024 - Sistema de Medição de Produtividade
      </Footer>
    </Layout>
  );
}

export default App;