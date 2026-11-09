import type { User } from "./user";

export interface Feedback {
  id: number;
  title: string;
  body: string;
  author: User;
  receiver: User;
}
