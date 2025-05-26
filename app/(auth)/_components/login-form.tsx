"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { loginSchema } from "@/lib/validation-schemas";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  userType: "super-admin" | "admin" | "staff";
}

export function LoginForm({ userType }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      console.log(values);
      setIsLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect based on user type
      if (userType === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/staff/pos");
      }

      setIsLoading(false);
    },
  });

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>
          {userType === "super-admin"
            ? "Super Admin"
            : userType === "admin"
              ? "Admin"
              : "Staff"}{" "}
          Login
        </CardTitle>
        <CardDescription>
          Enter your credentials to access the{" "}
          {userType === "super-admin"
            ? "super admin"
            : userType === "admin"
              ? "admin"
              : "staff"}{" "}
          panel
        </CardDescription>
      </CardHeader>
      <form onSubmit={formik.handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-red-500">{formik.errors.email}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-sm text-red-500">{formik.errors.password}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
