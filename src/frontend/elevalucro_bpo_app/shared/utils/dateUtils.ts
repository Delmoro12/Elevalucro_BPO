// Utilitários para manipulação de datas

/**
 * Converte data brasileira (DD/MM/YYYY) para formato ISO (YYYY-MM-DD)
 * Suporte para diferentes formatos de entrada
 */
export function convertBrazilianDateToISO(brazilianDate: string): string {
  if (!brazilianDate) return '';
  
  // Remove espaços em branco
  const cleanDate = brazilianDate.trim();
  
  // Verifica se já está no formato ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return cleanDate;
  }
  
  // Converte formato brasileiro DD/MM/YYYY para YYYY-MM-DD
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleanDate)) {
    const [day, month, year] = cleanDate.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Converte formato DD-MM-YYYY para YYYY-MM-DD
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleanDate)) {
    const [day, month, year] = cleanDate.split('-');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // Se não conseguir converter, retorna vazio
  console.warn('Formato de data não reconhecido:', brazilianDate);
  return '';
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato brasileiro (DD/MM/YYYY)
 */
export function convertISODateToBrazilian(isoDate: string): string {
  if (!isoDate) return '';
  
  // Verifica se está no formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  }
  
  return isoDate;
}

/**
 * Valida se uma data está em formato válido
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  
  // Tenta converter para formato ISO
  const isoDate = convertBrazilianDateToISO(dateString);
  if (!isoDate) return false;
  
  // Verifica se é uma data válida
  const date = new Date(isoDate);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formata data para exibição em português
 */
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const isoDate = convertBrazilianDateToISO(dateString);
    if (!isoDate) return dateString;
    
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  } catch (error) {
    console.warn('Erro ao formatar data:', error);
    return dateString;
  }
}