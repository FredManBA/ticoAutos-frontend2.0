export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  token?: string | null;
  temporaryToken?: string | null;
  email: string;
  fullName: string;
  message: string;
}

export interface VerifyTwoFactorRequest {
  temporaryToken: string;
  code: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  cedula: string;
  phoneNumber: string;
}

export interface CompleteGoogleRegistrationRequest {
  registrationToken: string;
  cedula: string;
}

export interface RegistrationResponse {
  id: number;
  fullName: string;
  email: string;
  status: string;
  message: string;
}

export interface CedulaLookupResponse {
  cedula: string;
  fullName: string;
}

export interface MessageResponse {
  message: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
}
