import { getAsaasConfig } from '../common/env'

export const ASAAS_CONFIG = {
  // Token de produção do Asaas
  PROD_TOKEN: '$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjY3Y2NjZWM2LWUwYmQtNGIzZC1hMWJmLWM4YzYwMGZhYzA0Yzo6JGFhY2hfYTMyNjY1NTMtODc2Yi00MGNjLTg0MTQtNWUwYWFhNWFkNTBk',
  
  // URLs da API
  BASE_URL_PROD: 'https://www.asaas.com/api/v3',
  BASE_URL_SANDBOX: 'https://sandbox.asaas.com/api/v3',
  
  // Configuração atual
  getCurrentConfig: () => {
    const envConfig = getAsaasConfig()
    const isProduction = process.env.NODE_ENV === 'production'
    
    return {
      token: isProduction ? ASAAS_CONFIG.PROD_TOKEN : envConfig.token,
      baseUrl: isProduction ? ASAAS_CONFIG.BASE_URL_PROD : ASAAS_CONFIG.BASE_URL_SANDBOX,
      isProduction,
      headers: {
        'Content-Type': 'application/json',
        'access_token': isProduction ? ASAAS_CONFIG.PROD_TOKEN : envConfig.token
      }
    }
  }
}

export default ASAAS_CONFIG