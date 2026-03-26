import React from 'react';
import { Layout, Typography } from 'antd';

const { Footer } = Layout;
const { Text } = Typography;

function Rodape() {
  const anoAtual = new Date().getFullYear();

  return (
    <Footer style={{ textAlign: 'center', background: '#f0f2f5' }}>
      <Text type="secondary">
        Rododex Pátio ©{anoAtual} - Sistema de Medição de Produtividade | 
        Dados atualizados em tempo real
      </Text>
    </Footer>
  );
}

export default Rodape;