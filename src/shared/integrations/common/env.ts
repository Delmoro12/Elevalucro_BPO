export const ENV_CONFIG = {
  ASAAS: {
    PROD_TOKEN: process.env.ASAAS_PROD_TOKEN || '',
    SANDBOX_TOKEN: process.env.ASAAS_SANDBOX_TOKEN || '',
    BASE_URL_PROD: 'https://www.asaas.com/api/v3',
    BASE_URL_SANDBOX: 'https://sandbox.asaas.com/api/v3',
    IS_PRODUCTION: process.env.NODE_ENV === 'production'
  },
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }
}

export const getAsaasConfig = () => {
  const isProduction = ENV_CONFIG.ASAAS.IS_PRODUCTION
  return {
    token: isProduction ? ENV_CONFIG.ASAAS.PROD_TOKEN : ENV_CONFIG.ASAAS.SANDBOX_TOKEN,
    baseUrl: isProduction ? ENV_CONFIG.ASAAS.BASE_URL_PROD : ENV_CONFIG.ASAAS.BASE_URL_SANDBOX,
    isProduction
  }
}