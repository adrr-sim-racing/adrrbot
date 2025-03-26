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