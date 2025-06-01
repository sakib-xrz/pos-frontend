import * as Yup from "yup";

export const loginSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export const productSchema = Yup.object({
  name: Yup.string().required("Product name is required"),
  price: Yup.number()
    .positive("Price must be positive")
    .required("Price is required"),
  is_available: Yup.boolean().default(true),
  category_id: Yup.string().required("Category is required"),
});

export const categorySchema = Yup.object({
  name: Yup.string().required("Category name is required"),
});

export const orderSchema = Yup.object({
  note: Yup.string().nullable(),
  payment_type: Yup.string()
    .oneOf(["CASH", "CARD"])
    .required("Payment type is required"),
});

export const userSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  role: Yup.string().oneOf(["ADMIN", "STAFF"]).required("Role is required"),
});

export const editUserSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string().oneOf(["ADMIN", "STAFF"]).required("Role is required"),
});

export const resetPasswordSchema = Yup.object({
  new_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
