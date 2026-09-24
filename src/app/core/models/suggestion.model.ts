export type SuggestionStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "IMPLEMENTED"
  | "DECLINED";
export type VoteType = "LIKE" | "DISLIKE";

export interface SuggestionAuthor {
  id: string;
  name: string;
}

export interface Suggestion {
  id: string;
  title?: string;
  content: string;
  isAnonymous: boolean;
  author?: SuggestionAuthor | null;
  status: SuggestionStatus;
  likes: number;
  dislikes: number;
  myVote: VoteType | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSuggestionPayload {
  title: string;
  content: string;
  isAnonymous: boolean;
}

export interface VoteSuggestionPayload {
  type: VoteType;
}

export interface UpdateSuggestionStatusPayload {
  status: SuggestionStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
