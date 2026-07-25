// web/frontend/lib/types.ts

export type Topic = "docker" | "kubernetes" | "linux" | "git" | "jenkins" | "terraform" | "nginx";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface Lab {
  id: string;
  title: string;
  order: number;
  xp: number;
  estimated_minutes: number | null;
  setup_type: string | null;
  seed_commands: string | null;
  resource_limits_cpu: number | null;
  resource_limits_mem: number | null;
  completed: boolean;
  xp_awarded: number;
}

export interface Section {
  id: string;
  title: string;
  order: number;
  xp: number;                  // reading XP from section.yaml
  content: string | null;
  labs: Lab[];
  section_completed: boolean;  // true = reading scrolled to end (or future: questions done)
}

export interface AuthorInfo {
  name: string;
  is_official: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string | null;
  topic: Topic;
  difficulty: Difficulty;
  estimated_minutes: number | null;
  tags: string[];
  total_xp: number;
  total_sections: number;
  completed_sections: number;
  author: AuthorInfo;
  is_official_verified: boolean;
}

export interface ModuleDetail extends Module {
  sections: Section[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  xp: number;
  unverified_xp: number;
  streak_days: number;
  is_maintainer: boolean;
  completed_labs: string[];      // lab IDs (tld check)
  completed_sections: string[];  // section IDs (reading / future: questions)
}

export type ModuleStatus = 'draft' | 'published' | 'verified';

export interface BuilderLabInput {
  id: string;
  title: string;
  order: number;
  xp: number;
  estimated_minutes: number | null;
  setup_type: string | null;
  seed_commands: string[];
  validator_script: string;
  cleanup_script: string;
}

export interface BuilderSectionInput {
  id: string;
  title: string;
  order: number;
  xp: number;
  content: string;
  labs: BuilderLabInput[];
}

export interface BuilderModuleInput {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: string;
  estimated_minutes: number | null;
  tags: string[];
  sections: BuilderSectionInput[];
}

export interface BuilderDraftListItem {
  id: string;
  title: string;
  topic: string | null;
  difficulty: string | null;
  total_sections: number;
  total_xp: number;
  status: ModuleStatus;
  is_official_verified: boolean;
  created_at: string;
  submitted_at: string | null;
}

