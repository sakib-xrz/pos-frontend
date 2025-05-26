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
import userLogin from "@/services/auth/userLogin";
import { useDispatch } from "react-redux";
import { setToken } from "@/redux/features/auth/authSlice";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface LoginFormProps {
  userType: "super-admin" | "admin" | "staff";
}

export function LoginForm({ userType }: LoginFormProps) {
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const response = await userLogin(values);
        const access_token = response?.data?.access_token;
        dispatch(setToken({ token: access_token }));
        toast.success("Logged in successfully");
      } catch (error) {
        formik.resetForm();
        // @ts-expect-error Error message is a string
        setError(error.message);
      }
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
        <CardContent className="space-y-2">
          <div className="space-y-1">
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
          <div className="space-y-1">
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

          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-destructive/10 text-center"
            >
              <AlertDescription className="font-medium">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
