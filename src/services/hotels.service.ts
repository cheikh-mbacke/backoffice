// src/services/hotels.service.ts
import api from "../config/api";
import {
  Hotel,
  CreateHotelDto,
  UpdateHotelDto,
  PaginatedResponse,
  HotelUser,
} from "../types";

export const hotelsService = {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Hotel>> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      hotels: Hotel[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>("/hotels", {
      params: { page, limit },
    });

    return {
      status: "success" as const,
      data: response.data.hotels,
      pagination: {
        ...response.data.pagination,
        totalPages: response.data.pagination.pages,
      },
      timestamp: response.data.timestamp,
    };
  },

  async getById(id: string): Promise<Hotel> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      hotel: Hotel;
    }>(`/hotels/${id}`);
    return response.data.hotel;
  },

  async create(data: CreateHotelDto): Promise<{ id: string; message: string }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      id: string;
      name: string;
      address?: string;
      createdAt: string;
    }>("/hotels", data);
    return { id: response.data.id, message: response.data.message };
  },

  async update(
    id: string,
    data: UpdateHotelDto
  ): Promise<{ hotel: Hotel; message: string }> {
    const response = await api.put<{
      status: string;
      message: string;
      timestamp: string;
      hotel: Hotel;
    }>(`/hotels/${id}`, data);
    return { hotel: response.data.hotel, message: response.data.message };
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{
      status: string;
      message: string;
      timestamp: string;
    }>(`/hotels/${id}`, { data: {} });
    return { message: response.data.message };
  },

  async getHotelUsers(
    id: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<HotelUser>> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      users: HotelUser[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/hotels/${id}/users`, {
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
};
