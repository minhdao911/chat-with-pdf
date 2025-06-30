import { UserProvider } from "@providers/user-provider";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
