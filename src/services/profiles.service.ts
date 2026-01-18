// src/services/profiles.service.ts
import api from "../config/api";
import {
  Profile,
  CreateProfileDto,
  UpdateProfileDto,
  PaginatedResponse,
  UserRole,
} from "../types";

export const profilesService = {
  async getAll(page = 1, limit = 10): Promise<PaginatedResponse<Profile>> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      profiles: Profile[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
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
      message: string;
      timestamp: string;
      id: string;
      name: string;
      avatarUrl: string;
      role: string;
      isActive: boolean;
      isDefault: boolean;
      userId: string;
      hotelId: string;
      createdAt: string;
      updatedAt: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      hotel: {
        id: string;
        name: string;
      };
    }>(`/profiles/${id}`);

    // Le backend retourne directement le profil dans data, pas dans data.profile
    return {
      id: response.data.id,
      name: response.data.name,
      avatarUrl: response.data.avatarUrl,
      role: response.data.role as UserRole,
      isActive: response.data.isActive,
      isDefault: response.data.isDefault,
      userId: response.data.userId,
      hotelId: response.data.hotelId,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
      user: response.data.user as any,
      hotel: response.data.hotel as any,
    };
  },

  async getByUserId(userId: string): Promise<Profile[]> {
    const response = await api.get<{
      status: string;
      message: string;
      timestamp: string;
      profiles: Profile[];
    }>(`/profiles/user/${userId}`);
    return response.data.profiles;
  },

  async create(
    data: CreateProfileDto
  ): Promise<{ id: string; message: string }> {
    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      id: string;
      name: string;
      role: string;
      isActive: boolean;
      isDefault: boolean;
      userId: string;
      hotelId: string;
      createdAt: string;
    }>("/profiles", data);

    return { id: response.data.id, message: response.data.message };
  },

  async update(
    id: string,
    data: UpdateProfileDto
  ): Promise<{ profile: Profile; message: string }> {
    const response = await api.put<{
      status: string;
      message: string;
      timestamp: string;
      id: string;
      name: string;
      avatarUrl: string;
      role: string;
      isActive: boolean;
      isDefault: boolean;
      userId: string;
      hotelId: string;
      createdAt: string;
      updatedAt: string;
    }>(`/profiles/${id}`, data);

    // Le backend retourne le profil directement dans la réponse
    const profile: Profile = {
      id: response.data.id,
      name: response.data.name,
      role: response.data.role as UserRole,
      isActive: response.data.isActive,
      isDefault: response.data.isDefault,
      userId: response.data.userId,
      hotelId: response.data.hotelId,
      avatarUrl: response.data.avatarUrl,
      createdAt: response.data.createdAt,
      updatedAt: response.data.updatedAt,
    };

    return {
      profile,
      message: response.data.message,
    };
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{
      status: string;
      message: string;
      timestamp: string;
    }>(`/profiles/${id}`, { data: {} });
    return { message: response.data.message };
  },

  async uploadAvatar(profileId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<{
      status: string;
      message: string;
      timestamp: string;
      avatarUrl: string;
    }>(`/profiles/${profileId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.avatarUrl;
  },

  async deleteAvatar(profileId: string): Promise<void> {
    await api.delete(`/profiles/${profileId}/avatar`);
  },

  async setProfilePin(
    profileId: string,
    pin?: string,
    currentPin?: string,
    newPin?: string
  ): Promise<void> {
    if (currentPin && newPin) {
      await api.post(`/profiles/${profileId}/pin`, { currentPin, newPin });
    } else if (pin) {
      await api.post(`/profiles/${profileId}/pin`, { pin });
    } else {
      throw new Error("Vous devez fournir soit pin, soit currentPin et newPin");
    }
  },

  async changeProfilePin(
    profileId: string,
    currentPin: string,
    newPin: string
  ): Promise<void> {
    await api.put(`/profiles/${profileId}/pin`, { currentPin, newPin });
  },
};
