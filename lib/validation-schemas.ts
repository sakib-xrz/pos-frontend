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
  table_number: Yup.string().nullable(),
  note: Yup.string().nullable(),
  payment_type: Yup.string()
    .oneOf(["CASH", "CARD"])
    .required("Payment type is required"),
});

export const couponSchema = Yup.object({
  code: Yup.string().required("Coupon code is required"),
  type: Yup.string()
    .oneOf(["PERCENTAGE", "FIXED"])
    .required("Coupon type is required"),
  value: Yup.number()
    .positive("Value must be positive")
    .required("Value is required"),
  is_active: Yup.boolean().default(true),
  expires_at: Yup.date().nullable(),
});
