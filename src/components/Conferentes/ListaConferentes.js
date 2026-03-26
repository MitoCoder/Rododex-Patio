import React from 'react';
import { Row, Col, Empty, Alert } from 'antd';
import CardProdutividade from './CardProdutividade';
import Carregamento from '../UI/Carregamento';

function ListaConferentes({ conferentes, carregando, atualizando }) {
  if (carregando && !atualizando) {
    return <Carregamento mensagem="Carregando lista de conferentes..." />;
  }

  if (!conferentes || conferentes.length === 0) {
    return (
      <Empty 
        description="Nenhum conferente encontrado. Acesse o menu Supervisão para cadastrar."
        style={{ marginTop: 50 }}
      >
        <div style={{ marginTop: 16, color: '#999' }}>
          <p>Para cadastrar conferentes:</p>
          <p>1. Clique em "Supervisão" no rodapé</p>
          <p>2. Digite a senha: supervisao</p>
          <p>3. Clique em "Gerenciar Conferentes"</p>
          <p>4. Adicione os operadores com seus logins do SSW</p>
        </div>
      </Empty>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {conferentes.map((conferente) => (
        <Col xs={24} sm={12} md={8} lg={6} key={conferente.id}>
          <CardProdutividade conferente={conferente} />
        </Col>
      ))}
    </Row>
  );
}

export default ListaConferentes;