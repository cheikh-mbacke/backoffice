// src/services/hotels.service.ts
import api from "../config/api";
import {
  Hotel,
  CreateHotelDto,
  UpdateHotelDto,
  PaginatedResponse,
} from "../types";

export const hotelsService = {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Hotel>> {
    const response = await api.get<{
      status: string;
      message: string;
      hotels: Hotel[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      timestamp: string;
    }>("/hotels", {
      params: { page, limit },
    });
    return {
      data: response.data.hotels,
      pagination: response.data.pagination,
    };
  },

  async getById(id: string): Promise<Hotel> {
    const response = await api.get<{
      status: string;
      hotel: Hotel;
      timestamp: string;
    }>(`/hotels/${id}`);
    return response.data.hotel;
  },

  async create(data: CreateHotelDto): Promise<string> {
    const response = await api.post<{
      status: string;
      message: string;
      id: string;
      name: string;
      address?: string;
      createdAt: string;
      timestamp: string;
    }>("/hotels", data);
    return response.data.id;
  },

  async update(id: string, data: UpdateHotelDto): Promise<Hotel> {
    const response = await api.put<{
      status: string;
      message: string;
      hotel: Hotel;
      timestamp: string;
    }>(`/hotels/${id}`, data);
    return response.data.hotel;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/hotels/${id}`, { data: {} });
  },
};
