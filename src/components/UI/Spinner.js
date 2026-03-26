import React from 'react';
import { Spin } from 'antd';

function Spinner({ tamanho = 'default' }) {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      zIndex: 9999
    }}>
      <Spin size={tamanho} />
    </div>
  );
}

export default Spinner;