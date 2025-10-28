// src/services/users.service.ts
import api from "../config/api";
import {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResponse,
} from "../types";

export const usersService = {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>("/users", {
      params: { page, limit },
    });

    return {
      status: "success" as const,
      data: response.data.users,
      pagination: {
        ...response.data.pagination,
        totalPages: response.data.pagination.pages,
      },
      timestamp: response.data.timestamp,
    };
  },

  async getById(id: string): Promise<User> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      user: User;
    }>(`/users/${id}`);
    return response.data.user;
  },

  async create(data: CreateUserDto): Promise<{
    status: string;
    message: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    hotelId: string | null;
    createdAt: string;
    timestamp: string;
  }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      hotelId: string | null;
      createdAt: string;
    }>("/users", data);
    return response.data;
  },

  async update(
    id: string,
    data: UpdateUserDto
  ): Promise<{
    status: string;
    message: string;
    timestamp: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    hotelId: string | null;
    phone?: string;
    position?: string;
    isDefault: boolean;
    updatedAt: string;
  }> {
    const response = await api.put<{
      status: string;
      message: string;
      timestamp: string;
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      hotelId: string | null;
      phone?: string;
      position?: string;
      isDefault: boolean;
      updatedAt: string;
    }>(`/users/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{
      status: string;
      message: string;
      timestamp: string;
    }>(`/users/${id}`, { data: {} });
    return { message: response.data.message };
  },

  async generatePassword(): Promise<{ password: string; message: string }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      password: string;
    }>("/users/generate-password");
    return { password: response.data.password, message: response.data.message };
  },

  async sendCredentials(
    userId: string,
    password?: string,
    includePassword: boolean = false,
    emailTo?: string
  ): Promise<{ message: string }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
    }>(`/users/${userId}/send-credentials`, {
      password,
      includePassword,
      emailTo,
    });
    return { message: response.data.message };
  },
};
