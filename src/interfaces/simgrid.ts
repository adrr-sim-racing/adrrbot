export interface RaceData {
  id: number;
  race_name: string;
  track: string;
  starts_at: string;
  display_name: string;
  results_available: boolean;
  hot_lap: boolean;
  ended: boolean;
}

export interface ChampionshipData {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  capacity: number;
  spots_taken: number;
  teams_enabled: boolean;
  entry_fee_required: boolean;
  entry_fee_cents: number;
  accepting_registrations: boolean;
  races: [RaceData];
  image: string;
  host_name: string;
  game_name: string;
  url: string;
  results_url: string;
}

export interface ChampionshipCarClass {
  id: number;
  display_name: string;
  championship_id: string;
  capacity: string;
}

export interface SimGridTeam {
  team_id: number;
  name: string;
  total_races_started: number;
  total_wins: number;
  total_podiums: number;
  total_penalty_rate: number;
}

export interface SimGridRating {
  game_id: number;
  rating: number;
  preferred: boolean;
}

export interface SimGridUser {
  user_id: number;
  username: string;
  steam64_id: string;
  discord_uid: string;
  preferred_name: string;
  teams: SimGridTeam[];
  total_races_started: number;
  total_wins: number;
  total_podiums: number;
  simgrid_pro_active: null | boolean;
  boosted_hosts: any[];
  grid_ratings: SimGridRating[];
}
