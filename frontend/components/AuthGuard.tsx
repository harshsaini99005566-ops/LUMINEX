import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  // AuthGuard disabled for unrestricted dashboard access
  return <>{children}</>;
}
