import { Photo } from './Photo';

export interface Issue {
  id: string;

  title: string;

  description: string;

  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  photos: Photo[];

  resolved: boolean;
}