// Tipos globais do frontend
export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}