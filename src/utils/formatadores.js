import dayjs from 'dayjs';

/**
 * Formata um número para o formato brasileiro
 * @param {number} numero - Número a ser formatado
 * @returns {string} Número formatado
 */
export function formatarNumero(numero) {
  return new Intl.NumberFormat('pt-BR').format(numero);
}

/**
 * Formata um valor percentual
 * @param {number} valor - Valor a ser formatado (0-100)
 * @returns {string} Percentual formatado
 */
export function formatarPercentual(valor) {
  return `${formatarNumero(valor)}%`;
}

/**
 * Formata uma data para o padrão brasileiro
 * @param {string|Date} data - Data a ser formatada
 * @returns {string} Data formatada
 */
export function formatarData(data) {
  if (!data) return '--/--/----';
  return dayjs(data).locale('pt-br').format('DD/MM/YYYY HH:mm:ss');
}

/**
 * Calcula o percentual de produtividade em relação à meta
 * @param {number} atual - Valor atual
 * @param {number} meta - Meta estabelecida
 * @returns {number} Percentual calculado
 */
export function calcularPercentualProdutividade(atual, meta) {
  if (!meta || meta === 0) return 0;
  return (atual / meta) * 100;
}

/**
 * Retorna a cor baseada no percentual de produtividade
 * @param {number} percentual - Percentual de produtividade
 * @returns {string} Cor em formato hexadecimal
 */
export function obterCorProdutividade(percentual) {
  if (percentual >= 100) return '#52c41a'; // Verde
  if (percentual >= 75) return '#1890ff'; // Azul
  if (percentual >= 50) return '#faad14'; // Amarelo
  return '#f5222d'; // Vermelho
}