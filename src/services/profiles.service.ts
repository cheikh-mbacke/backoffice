// src/services/profiles.service.ts
import api from "../config/api";
import {
  Profile,
  CreateProfileDto,
  UpdateProfileDto,
  PaginatedResponse,
} from "../types";

export const profilesService = {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Profile>> {
    const response = await api.get<{
      status: string;
      message: string;
      profiles: Profile[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      timestamp: string;
    }>("/profiles", {
      params: { page, limit },
    });
    return {
      status: "success" as const,
      data: response.data.profiles,
      pagination: {
        ...response.data.pagination,
        totalPages: response.data.pagination.pages,
      },
      timestamp: response.data.timestamp,
    };
  },

  async getById(id: string): Promise<Profile> {
    const response = await api.get<{
      status: string;
      profile: Profile;
      timestamp: string;
    }>(`/profiles/${id}`);
    return response.data.profile;
  },

  async getByUserId(userId: string): Promise<Profile[]> {
    const response = await api.get<{
      status: string;
      profiles: Profile[];
      timestamp: string;
    }>(`/profiles/user/${userId}`);
    return response.data.profiles;
  },

  async create(data: CreateProfileDto): Promise<string> {
    const response = await api.post<{
      status: string;
      message: string;
      id: string;
      name: string;
      role: string;
      isActive: boolean;
      isDefault: boolean;
      userId: string;
      hotelId: string;
      createdAt: string;
      timestamp: string;
    }>("/profiles", data);
    return response.data.id;
  },

  async update(id: string, data: UpdateProfileDto): Promise<Profile> {
    const response = await api.put<{
      status: string;
      message: string;
      profile: Profile;
      timestamp: string;
    }>(`/profiles/${id}`, data);
    return response.data.profile;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/profiles/${id}`, { data: {} });
  },
};
