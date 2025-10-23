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
      users: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      timestamp: string;
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
      user: User;
      timestamp: string;
    }>(`/users/${id}`);
    return response.data.user;
  },

  async create(data: CreateUserDto): Promise<string> {
    const response = await api.post<{
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
    }>("/users", data);
    return response.data.id;
  },

  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.put<{
      status: string;
      message: string;
      user: User;
      timestamp: string;
    }>(`/users/${id}`, data);
    return response.data.user;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`, { data: {} });
  },
};
