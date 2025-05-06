
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from './StorageService';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
  password: string;
}

interface JWTPayload {
  id: string;
  email: string;
}

export class AuthService {
  private storage: StorageService;
  private JWT_SECRET = 'your-secret-key'; // In a real app, use env variables
  private TOKEN_KEY = 'auth_token';
  private USERS_KEY = 'users';

  constructor() {
    this.storage = new StorageService();
  }

  private generateToken(user: { id: string; email: string }): string {
    return jwt.sign({ id: user.id, email: user.email }, this.JWT_SECRET, { expiresIn: '7d' });
  }

  private verifyToken(token: string): JWTPayload {
    return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  async getUsers(): Promise<User[]> {
    return await this.storage.get(this.USERS_KEY) || [];
  }

  async register(email: string, password: string): Promise<{ id: string; email: string }> {
    const users = await this.getUsers();
    
    if (users.some(user => user.email === email)) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
    };

    await this.storage.set(this.USERS_KEY, [...users, newUser]);
    
    const token = this.generateToken({ id: newUser.id, email: newUser.email });
    this.saveToken(token);
    
    return { id: newUser.id, email: newUser.email };
  }

  async login(email: string, password: string): Promise<{ id: string; email: string }> {
    const users = await this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    const token = this.generateToken({ id: user.id, email: user.email });
    this.saveToken(token);
    
    return { id: user.id, email: user.email };
  }

  async getCurrentUser(): Promise<{ id: string; email: string } | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }
    
    try {
      const decoded = this.verifyToken(token);
      return { id: decoded.id, email: decoded.email };
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
