export {};

export type Roles = "admin" | "user";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
      free_chats?: string;
      free_messages?: string;
    };
  }
}
