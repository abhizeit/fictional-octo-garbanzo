"use client";

import { LoginForm } from "@/app/login/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { otpSent } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center max-w-5xl w-full mx-auto">
      <Card className="login-card w-full relative z-10 backdrop-blur-xl bg-card/80 border-border/50 shadow-2xl animate-fade-in-up">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto mb-2">
            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <svg
                className="h-8 w-8 text-primary-foreground"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
            {otpSent ? "Enter OTP" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {otpSent
              ? "Enter the OTP sent to your phone"
              : "Sign in to access your admin dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
