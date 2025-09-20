import { RecurrenceConfig } from '../types/accountsPayable';

export class RecurrenceCalculator {
  /**
   * Valida se a configuração de recorrência está completa
   */
  static validateRecurrenceConfig(
    occurrence: string,
    config: Partial<RecurrenceConfig>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    switch (occurrence) {
      case 'weekly':
      case 'biweekly':
        if (!config.day_of_week) {
          errors.push('Dia da semana é obrigatório para recorrência semanal/quinzenal');
        }
        break;

      case 'monthly':
      case 'quarterly':
      case 'semiannual':
      case 'annual':
        if (!config.day_of_month || config.day_of_month < 1 || config.day_of_month > 31) {
          errors.push('Dia do mês deve ser entre 1 e 31');
        }
        break;

      case 'installments':
        if (!config.installment_count || config.installment_count < 2 || config.installment_count > 120) {
          errors.push('Número de parcelas deve ser entre 2 e 120');
        }
        if (!config.installment_day || config.installment_day < 1 || config.installment_day > 31) {
          errors.push('Dia do vencimento deve ser entre 1 e 31');
        }
        break;

      case 'unique':
        // Sem validação adicional
        break;

      default:
        errors.push('Tipo de ocorrência inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera preview das próximas datas de vencimento
   */
  static generatePreviewDates(
    startDate: string,
    occurrence: string,
    config: Partial<RecurrenceConfig>,
    maxItems: number = 5
  ): Date[] {
    const dates: Date[] = [];
    const start = new Date(startDate);
    
    switch (occurrence) {
      case 'weekly':
        const dayOfWeek = parseInt(config.day_of_week || '0');
        let currentDate = new Date(start);
        
        // Ajustar para o próximo dia da semana
        while (currentDate.getDay() !== dayOfWeek) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        for (let i = 0; i < maxItems; i++) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 7);
        }
        break;

      case 'biweekly':
        for (let i = 0; i < maxItems; i++) {
          const date = new Date(start);
          date.setDate(date.getDate() + (i * 14));
          dates.push(date);
        }
        break;

      case 'monthly':
        for (let i = 0; i < maxItems; i++) {
          const date = new Date(start);
          date.setMonth(date.getMonth() + i);
          
          // Ajustar para o dia correto do mês
          if (config.day_of_month) {
            date.setDate(Math.min(config.day_of_month, this.getDaysInMonth(date)));
          }
          
          dates.push(date);
        }
        break;

      case 'quarterly':
        for (let i = 0; i < maxItems; i++) {
          const date = new Date(start);
          date.setMonth(date.getMonth() + (i * 3));
          
          if (config.day_of_month) {
            date.setDate(Math.min(config.day_of_month, this.getDaysInMonth(date)));
          }
          
          dates.push(date);
        }
        break;

      case 'semiannual':
        for (let i = 0; i < maxItems; i++) {
          const date = new Date(start);
          date.setMonth(date.getMonth() + (i * 6));
          
          if (config.day_of_month) {
            date.setDate(Math.min(config.day_of_month, this.getDaysInMonth(date)));
          }
          
          dates.push(date);
        }
        break;

      case 'annual':
        for (let i = 0; i < maxItems; i++) {
          const date = new Date(start);
          date.setFullYear(date.getFullYear() + i);
          
          if (config.day_of_month) {
            date.setDate(Math.min(config.day_of_month, this.getDaysInMonth(date)));
          }
          
          dates.push(date);
        }
        break;

      case 'installments':
        const installmentCount = Math.min(config.installment_count || 0, maxItems);
        for (let i = 0; i < installmentCount; i++) {
          const date = new Date(start);
          date.setMonth(date.getMonth() + i);
          
          if (config.installment_day) {
            date.setDate(Math.min(config.installment_day, this.getDaysInMonth(date)));
          }
          
          dates.push(date);
        }
        break;
    }

    return dates;
  }

  /**
   * Formata descrição da recorrência
   */
  static getRecurrenceDescription(
    occurrence: string,
    config: Partial<RecurrenceConfig>
  ): string {
    switch (occurrence) {
      case 'unique':
        return 'Pagamento único';

      case 'weekly':
        const dayName = this.getDayName(parseInt(config.day_of_week || '0'));
        return `Toda ${dayName}`;

      case 'biweekly':
        return 'A cada 15 dias';

      case 'monthly':
        return config.day_of_month 
          ? `Todo dia ${config.day_of_month} do mês`
          : 'Mensalmente';

      case 'quarterly':
        return config.day_of_month
          ? `Dia ${config.day_of_month} a cada 3 meses`
          : 'Trimestralmente';

      case 'semiannual':
        return config.day_of_month
          ? `Dia ${config.day_of_month} a cada 6 meses`
          : 'Semestralmente';

      case 'annual':
        return config.day_of_month
          ? `Dia ${config.day_of_month} anualmente`
          : 'Anualmente';

      case 'installments':
        return `${config.installment_count || 0} parcelas mensais`;

      default:
        return 'Configuração inválida';
    }
  }

  /**
   * Obtém o nome do dia da semana
   */
  private static getDayName(dayNumber: number): string {
    const days = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira',
      'Quinta-feira', 'Sexta-feira', 'Sábado'
    ];
    return days[dayNumber] || 'Dia inválido';
  }

  /**
   * Obtém o número de dias no mês
   */
  private static getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Formata data para exibição
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  /**
   * Verifica se duas contas pertencem à mesma série
   */
  static belongsToSameSeries(account1: any, account2: any): boolean {
    return account1.series_id && account1.series_id === account2.series_id;
  }

  /**
   * Ordena contas por data de vencimento
   */
  static sortAccountsByDueDate(accounts: any[]): any[] {
    return accounts.sort((a, b) => {
      const dateA = new Date(a.due_date);
      const dateB = new Date(b.due_date);
      return dateA.getTime() - dateB.getTime();
    });
  }
}