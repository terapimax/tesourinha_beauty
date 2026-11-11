import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type CategoryId = 'cabelo' | 'barba' | 'estetica' | 'unhas' | 'depilacao' | 'spa' | 'maquiagem';

export interface Category {
  id: CategoryId;
  name: string;
  icon: IconName;
}

export interface Service {
  id: string;
  categoryId: CategoryId;
  name: string;
  description: string;
  durationMin: number;
  priceFrom: number;
  icon: IconName;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string; // ISO
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  categoryIds: CategoryId[];
  serviceIds: string[];
  rating: number;
  reviewsCount: number;
  distanceKm: number;
  neighborhood: string;
  bio: string;
  yearsExperience: number;
  tesourinhaAlumni: boolean;
  avatarColor: string;
  imageUrl?: string;
  workingHours: string[]; // ex.: ["09:00", "10:00", ...]
  reviews: Review[];
}

export type CourseLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  categoryId: CategoryId | 'gestao';
  level: CourseLevel;
  durationHours: number;
  modality: 'Presencial' | 'Online' | 'Híbrido';
  startDate: string; // ISO
  seats: number;
  seatsTaken: number;
  icon: IconName;
  description: string;
  modules: string[];
  certificate: boolean;
}

export type JobType = 'Tempo integral' | 'Meio período' | 'Freelance' | 'Comissionado';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  salary?: string;
  postedAt: string; // ISO
  icon: IconName;
  description: string;
  requirements: string[];
  benefits: string[];
}

export type BookingStatus = 'confirmado' | 'concluido' | 'cancelado';

export interface Booking {
  id: string;
  professionalId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: BookingStatus;
  createdAt: string;
  notes?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
}

export interface Resume {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  role: string;
  experience: string;
  about: string;
}
