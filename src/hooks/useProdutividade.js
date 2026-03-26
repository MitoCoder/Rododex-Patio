import { useState, useEffect, useCallback } from 'react';
import { obterProdutividadeSSW } from '../services/sswService';
import { buscarConferentes, salvarProdutividade } from '../services/appScriptService';

function useProdutividade() {
  const [conferentes, setConferentes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);

  /**
   * Normaliza os campos do conferente vindo do AppScript
   */
  const normalizarConferente = (dados) => {
    return {
      id: dados.id,
      nome: dados.nome,
      codigo: dados.código || dados.codigo,
      metaDiaria: dados.meta_diária || dados.meta_diaria || 0,
      status: dados.status,
      dataCadastro: dados.data_cadastro,
      usuarioSSW: dados.usuário_ssw || dados.usuario_ssw,
      senhaSSW: dados.senha_ssw,
      produtividade: dados.produtividade || 0,
      totalConferencias: dados.total_conferencias || 0,
      ultimaAtualizacao: dados.ultima_atualizacao || '--/--/----'
    };
  };

  const carregarConferentes = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);
      
      console.log('🔄 Carregando conferentes do AppScript...');
      const dados = await buscarConferentes();
      
      if (dados && Array.isArray(dados) && dados.length > 0) {
        console.log('✅ Dados brutos recebidos:', dados);
        
        // Normaliza os dados para o formato usado nos componentes
        const conferentesNormalizados = dados.map(normalizarConferente);
        console.log('✅ Dados normalizados:', conferentesNormalizados);
        
        setConferentes(conferentesNormalizados);
      } else {
        console.warn('⚠️ Nenhum dado retornado');
        setErro('Nenhum conferente encontrado');
        setConferentes([]);
      }
      
    } catch (err) {
      console.error('❌ Erro ao carregar conferentes:', err);
      setErro(`Erro ao carregar dados: ${err.message}`);
      setConferentes([]);
    } finally {
      setCarregando(false);
    }
  }, []);

  const atualizarProdutividadeConferente = useCallback(async (conferente) => {
    try {
      console.log(`📡 Consultando SSW para: ${conferente.nome}`);
      
      // Obtém dados atualizados do sistema SSW
      const dadosSSW = await obterProdutividadeSSW(conferente);
      console.log(`📊 Dados do SSW para ${conferente.nome}:`, dadosSSW);
      
      // Atualiza o conferente com os novos dados
      const conferenteAtualizado = {
        ...conferente,
        produtividade: dadosSSW.produtividade,
        totalConferencias: dadosSSW.totalConferencias,
        ultimaAtualizacao: new Date().toLocaleTimeString(),
        status: dadosSSW.status
      };
      
      // Salva no AppScript (formato que o AppScript espera)
      await salvarProdutividade({
        id: conferente.id,
        produtividade: dadosSSW.produtividade,
        totalConferencias: dadosSSW.totalConferencias,
        status: dadosSSW.status
      });
      
      return conferenteAtualizado;
    } catch (err) {
      console.error(`❌ Erro ao atualizar conferente ${conferente.nome}:`, err);
      return conferente;
    }
  }, []);

  const atualizarDados = useCallback(async () => {
    if (!conferentes || conferentes.length === 0) {
      console.log('📭 Nenhum conferente para atualizar');
      return;
    }
    
    try {
      console.log('🔄 Atualizando todos os conferentes...');
      
      const conferentesAtualizados = await Promise.all(
        conferentes.map(conferente => atualizarProdutividadeConferente(conferente))
      );
      
      setConferentes(conferentesAtualizados);
      setUltimaAtualizacao(new Date());
      
      console.log('✅ Atualização concluída!');
    } catch (err) {
      console.error('❌ Erro ao atualizar dados:', err);
      setErro('Falha ao atualizar dados de produtividade');
    }
  }, [conferentes, atualizarProdutividadeConferente]);

  useEffect(() => {
    carregarConferentes();
  }, [carregarConferentes]);

  return {
    conferentes,
    carregando,
    erro,
    atualizarDados,
    ultimaAtualizacao
  };
}

export default useProdutividade;