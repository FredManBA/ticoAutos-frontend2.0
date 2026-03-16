//Model  
export interface LoginRequest {
  email: string; 
  password: string;
}

// Modelo of request
export interface AuthResponse {
  token: string;
  userName: string;
 
}
