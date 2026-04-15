import { Member } from './member';

export interface Club {
  id?: number;
  name: string;
  description: string;
  members?: Member[];
}