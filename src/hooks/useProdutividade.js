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
    if (!dados) return null;
    
    return {
      id: dados.id || 0,
      nome: dados.nome || 'Conferente',
      codigo: dados.código || dados.codigo || '---',
      metaDiaria: dados.meta_diária || dados.meta_diaria || 200,
      status: dados.status || 'offline',
      dataCadastro: dados.data_cadastro || new Date().toISOString(),
      usuarioSSW: dados.usuário_ssw || dados.usuario_ssw || '',
      senhaSSW: dados.senha_ssw || '',
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
        const conferentesNormalizados = dados
          .map(normalizarConferente)
          .filter(conf => conf !== null);
        console.log('✅ Dados normalizados:', conferentesNormalizados);
        setConferentes(conferentesNormalizados);
      } else {
        console.warn('⚠️ Nenhum dado retornado, usando array vazio');
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

  /**
   * Atualiza a produtividade de um conferente específico
   */
  const atualizarProdutividadeConferente = useCallback(async (conferente) => {
    if (!conferente || !conferente.usuarioSSW) {
      console.warn(`⚠️ Conferente sem credenciais: ${conferente?.nome}`);
      return conferente;
    }
    
    try {
      console.log(`📡 Consultando SSW para: ${conferente.nome} (usuário: ${conferente.usuarioSSW})`);
      
      const dadosSSW = await obterProdutividadeSSW(conferente);
      console.log(`📊 Dados do SSW para ${conferente.nome}:`, dadosSSW);
      
      const conferenteAtualizado = {
        ...conferente,
        produtividade: dadosSSW.produtividade || 0,
        totalConferencias: dadosSSW.totalConferencias || 0,
        ultimaAtualizacao: new Date().toLocaleTimeString(),
        status: dadosSSW.status || conferente.status
      };
      
      await salvarProdutividade({
        id: conferente.id,
        produtividade: conferenteAtualizado.produtividade,
        totalConferencias: conferenteAtualizado.totalConferencias,
        status: conferenteAtualizado.status
      });
      
      return conferenteAtualizado;
    } catch (err) {
      console.error(`❌ Erro ao atualizar conferente ${conferente.nome}:`, err);
      return conferente;
    }
  }, []);

  /**
   * Atualiza todos os conferentes
   */
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
    ultimaAtualizacao,
    recarregarConferentes: carregarConferentes
  };
}

export default useProdutividade;