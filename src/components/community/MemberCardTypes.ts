
// Create a new types file for MemberCard component
export interface MemberData {
  id: string;
  username: string;
  avatar_url: string | null;
  bdsm_role: string;
  bio: string;
  last_active: string;
}

export interface MemberCardProps {
  member: MemberData;
}
