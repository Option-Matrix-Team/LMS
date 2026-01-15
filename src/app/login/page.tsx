import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your library account",
};

export default function LoginPage() {
  return <LoginForm />;
}
