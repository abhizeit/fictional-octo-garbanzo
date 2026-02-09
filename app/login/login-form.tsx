"use client";

import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2, AlertCircle, KeyRound } from "lucide-react";

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[0-9]{10}$/, "Phone number must be  exactly 10 digits"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(1, "OTP is required")
    .regex(/^[0-9]{4}$/, "OTP must be exactly 4 digits"),
});

type PhoneFormData = z.infer<typeof phoneSchema>;
type OTPFormData = z.infer<typeof otpSchema>;

export function LoginForm() {
  const { requestOTP, verifyOTP, otpSent, resetOtpFlow, developmentOTP } =
    useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const phoneForm = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
    mode: "onBlur",
  });

  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onBlur",
  });

  const onRequestOTP = async (data: PhoneFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await requestOTP(data.phone);
      // Success - OTP sent, UI will switch to OTP input
    } catch (error: any) {
      console.error("Request OTP error:", error);

      let errorMessage = "Failed to send OTP. Please try again.";
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle OTP verification (Step 2)
  const onVerifyOTP = async (data: OTPFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      await verifyOTP(data.otp);
    } catch (error: any) {
      console.error("Verify OTP error:", error);

      let errorMessage = "Invalid OTP. Please try again.";
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.error?.message) {
        errorMessage = error.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle change phone number
  const handleChangePhone = () => {
    resetOtpFlow();
    phoneForm.reset();
    otpForm.reset();
    setServerError(null);
  };

  return (
    <div className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-sm text-destructive flex-1">{serverError}</p>
        </div>
      )}

      {/* Development OTP Display */}
      {developmentOTP && otpSent && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
          <KeyRound className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary mb-1">
              Development Mode
            </p>
            <p className="text-xs text-muted-foreground">
              Your OTP is:{" "}
              <strong className="text-primary text-lg">{developmentOTP}</strong>
            </p>
          </div>
        </div>
      )}

      {!otpSent ? (
        /* Step 1: Phone Number Input */
        <form
          onSubmit={phoneForm.handleSubmit(onRequestOTP)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="flex gap-2">
              <div className="flex items-center bg-muted px-3 rounded-lg border">
                <span className="text-sm font-medium">+91</span>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter 10-digit number"
                  className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  {...phoneForm.register("phone")}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  maxLength={10}
                />
              </div>
            </div>
            {phoneForm.formState.errors.phone && (
              <p className="text-sm text-destructive animate-fade-in">
                {phoneForm.formState.errors.phone.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </form>
      ) : (
        /* Step 2: OTP Input */
        <form
          onSubmit={otpForm.handleSubmit(onVerifyOTP)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium">
              Enter OTP
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 4-digit OTP"
                className="pl-10 h-12 text-center text-2xl font-semibold tracking-widest transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                {...otpForm.register("otp")}
                disabled={isSubmitting}
                autoComplete="one-time-code"
                maxLength={4}
                autoFocus
              />
            </div>
            {otpForm.formState.errors.otp && (
              <p className="text-sm text-destructive animate-fade-in">
                {otpForm.formState.errors.otp.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          {/* Change Phone Number */}
          <button
            type="button"
            onClick={handleChangePhone}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            disabled={isSubmitting}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}
