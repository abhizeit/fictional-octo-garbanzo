"use client";

import { useEffect, useState } from "react";
import { Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCustomer } from "@/lib/hooks/use-customers";
import type { CustomerDetail, CustomerUpdateInput } from "../customer.types";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
] as const;

type GenderValue = (typeof GENDER_OPTIONS)[number]["value"];

export function CustomerPersonalInfoCard({
  customer,
}: {
  customer: CustomerDetail;
}) {
  const updateCustomer = useUpdateCustomer();
  const [name, setName] = useState(customer.name ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    customer.date_of_birth ?? "",
  );
  const [gender, setGender] = useState<GenderValue | "">(
    customer.gender ?? "",
  );

  useEffect(() => {
    setName(customer.name ?? "");
    setEmail(customer.email ?? "");
    setDateOfBirth(customer.date_of_birth ?? "");
    setGender(customer.gender ?? "");
  }, [
    customer.name,
    customer.email,
    customer.date_of_birth,
    customer.gender,
  ]);

  const handleSave = () => {
    const payload: CustomerUpdateInput = {
      name: name.trim() || undefined,
      email: email.trim() ? email.trim().toLowerCase() : null,
      date_of_birth: dateOfBirth.trim() ? dateOfBirth.trim() : null,
      gender: gender || null,
    };
    updateCustomer.mutate({ id: customer.id, data: payload });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserRound className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update the customer&apos;s profile details. Phone is managed via the
          mobile OTP flow.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Full name</Label>
            <Input
              id="customer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone</Label>
            <Input
              id="customer-phone"
              value={customer.phone}
              disabled
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-dob">Date of birth</Label>
            <Input
              id="customer-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={gender || "none"}
              onValueChange={(value) =>
                setGender(value === "none" ? "" : (value as GenderValue))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not specified</SelectItem>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Customer code</Label>
            <Input value={customer.code} disabled className="font-mono" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateCustomer.isPending}
          >
            {updateCustomer.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save personal info"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
