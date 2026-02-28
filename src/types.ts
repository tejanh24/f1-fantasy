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
}

export interface Standing {
  name: string;
  points: number;
  driver1_id: string;
  driver2_id: string;
  driver3_id: string;
  driver4_id: string;
  driver5_id: string;
  constructor1_id: string;
  constructor2_id: string;
}

export interface Team {
  id: number;
  user_id: number;
  league_id: number;
  driver1_id: string;
  driver2_id: string;
  driver3_id: string;
  driver4_id: string;
  driver5_id: string;
  constructor1_id: string;
  constructor2_id: string;
  points: number;
}
