export interface SalesUser {
  id: number;
  user_id: number;
  starting_date: string;
  generation: number;
  property_type: string;
  probation_status: string;
  probation_extended: boolean;
  current_rank: number;
  _user: [{
    full_name: string;
    profile_image: string | null;
  }];
  _rank?: {
    rank_name: string;
  };
}

export interface MentorData {
  mentor1: {
    id: number;
    user_id: number;
  };
  result1: SalesUser[];
}

export interface Action {
  name: string;
  done: number;
  target: number;
}

export interface Skillset {
  name: string;
  score: number;
}

export interface SkillsetScores {
  wording: number;
  tonality: number;
  rapport: number;
  total?: number;
}

export interface Requirement {
  name: string;
  completed: boolean;
}

export interface WeeklyPerformance {
  week: number;
  actions: Action[];
  skillsets: Skillset[];
  skillsetScores?: SkillsetScores[];
  requirements: Requirement[];
  comment: string;
}

export interface DashboardMetadata {
  mentorDashboard_actionKpi_masterData: { kpi_name: string }[];
  mentorDashboard_skillsetKpi_masterData: { kpi_name: string }[];
  mentorDashboard_requirement_masterData: { requirement_name: string }[];
}

export interface SalesProgressData {
  result1: {
    kpi_action_progress_kpi_id: number;
    kpi_action_progress_count: number;
    _kpi: {
      kpi_name: string;
      kpi_type: string;
    };
  }[];
  kpi_skillset_progress_max: {
    kpi_skillset_progress_kpi_id: number;
    kpi_skillset_progress_total_score: number;
  }[];
  requirement_progress1: {
    requirement_progress_requirement_id: number;
    requirement_progress_count: number;
    _requirement: {
      requirement_name: string;
    }[];
  }[];
}

export interface TargetState {
  type: 'action' | 'skillset' | 'requirement';
  id: number;
  name: string;
  currentTarget: number;
  newTarget: number;
} 