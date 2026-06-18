export interface User {
  createdAt?: string
  email: string
  firstName: string | null
  id?: number
  lastName: string | null
  updatedAt?: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput extends LoginInput {
  firstName?: string
  lastName?: string
  referralCode?: string
}
