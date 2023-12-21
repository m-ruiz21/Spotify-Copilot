"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";

type Props = {
  session: Session;
  children?: React.ReactNode;
};

export const NextAuthProvider = ({ children, session }: Props) => {
  return <SessionProvider session= {session}>{children}</SessionProvider>;
};