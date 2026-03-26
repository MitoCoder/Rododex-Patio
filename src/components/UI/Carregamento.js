import React from 'react';
import { Spin, Space } from 'antd';

function Carregamento({ mensagem = 'Carregando dados...', tamanho = 'large' }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '200px' 
    }}>
      <Space direction="vertical" align="center" size="middle">
        <Spin size={tamanho} />
        <span style={{ color: '#666' }}>{mensagem}</span>
      </Space>
    </div>
  );
}

export default Carregamento;