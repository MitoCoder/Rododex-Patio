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
        description="Nenhum conferente encontrado"
        style={{ marginTop: 50 }}
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {conferentes.map(conferente => (
        <Col xs={24} sm={12} md={8} lg={6} key={conferente.id}>
          <CardProdutividade conferente={conferente} />
        </Col>
      ))}
    </Row>
  );
}

export default ListaConferentes;