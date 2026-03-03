export interface Driver {
  id: string;
  name: string;
  constructor_id: string;
  price: number;
  image: string;
}

export interface Constructor {
  id: string;
  name: string;
  price: number;
  image: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface League {
  id: number;
  name: string;
  invite_code: string;
  admin_id: number;
  is_locked: number;
}

export interface Standing {
  user_id: number;
  name: string;
  points: number;
  driver1_id: string;
  driver2_id: string;
  driver3_id: string;
  driver4_id: string;
  driver5_id: string;
  constructor1_id: string;
  constructor2_id: string;
  turbo_driver_id?: string;
  is_complete: number;
}

export interface Team {
  id: number;
  user_id: number;
  league_id?: number;
  name?: string;
  driver1_id: string;
  driver2_id: string;
  driver3_id: string;
  driver4_id: string;
  driver5_id: string;
  constructor1_id: string;
  constructor2_id: string;
  turbo_driver_id?: string;
  points: number;
  is_complete: number;
}
