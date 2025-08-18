// Schemas de validação comuns
import { z } from 'zod'

export const emailSchema = z.string().email('Email inválido')
export const cnpjSchema = z.string().regex(/^\\d{14}$/, 'CNPJ inválido')