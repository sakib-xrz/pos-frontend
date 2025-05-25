"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ImageUpload } from "@/components/shared/image-upload";

// Validation schema
const settingsSchema = Yup.object({
  restaurant_name: Yup.string().required("Restaurant name is required"),
  address: Yup.string().required("Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  logo_url: Yup.string(),
  receipt_header_text: Yup.string(),
  receipt_footer_text: Yup.string(),
  show_logo_on_receipt: Yup.boolean(),
});

// Dummy data
const dummySettings = {
  restaurant_name: "Delicious Restaurant",
  address: "123 Main Street, City, State, 12345",
  phone_number: "(123) 456-7890",
  email: "info@deliciousrestaurant.com",
  logo_url: null,
  receipt_header_text: "Thank you for dining with us!",
  receipt_footer_text: "Please come again soon!",
  show_logo_on_receipt: true,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(dummySettings);

  const formik = useFormik({
    initialValues: settings,
    validationSchema: settingsSchema,
    onSubmit: (values) => {
      // Simulate API call
      setTimeout(() => {
        setSettings(values);
        // toast({
        //   title: "Settings updated",
        //   description:
        //     "Your restaurant settings have been updated successfully.",
        // });
      }, 1000);
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Settings</h1>
          <p className="text-muted-foreground">
            Manage your restaurant information and receipt settings
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={formik.handleSubmit}>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
            <CardDescription>
              Update your restaurant details and receipt configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restaurant Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant_name">Restaurant Name</Label>
                  <Input
                    id="restaurant_name"
                    name="restaurant_name"
                    placeholder="Enter restaurant name"
                    value={formik.values.restaurant_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.restaurant_name &&
                    formik.errors.restaurant_name && (
                      <p className="text-sm text-red-500">
                        {formik.errors.restaurant_name}
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete address"
                  value={formik.values.address}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={3}
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-sm text-red-500">
                    {formik.errors.address}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  placeholder="Enter phone number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.phone_number && formik.errors.phone_number && (
                  <p className="text-sm text-red-500">
                    {formik.errors.phone_number}
                  </p>
                )}
              </div>
            </div>

            {/* Logo Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Restaurant Logo</h3>
              <ImageUpload
                value={formik.values.logo_url}
                onChange={(value) => formik.setFieldValue("logo_url", value)}
                onRemove={() => formik.setFieldValue("logo_url", "")}
                label="Restaurant Logo"
                placeholder="Upload your restaurant logo"
              />
            </div>

            {/* Receipt Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Receipt Settings</h3>

              <div className="space-y-2">
                <Label htmlFor="receipt_header_text">Receipt Header Text</Label>
                <Textarea
                  id="receipt_header_text"
                  name="receipt_header_text"
                  placeholder="Text to appear at the top of receipts"
                  value={formik.values.receipt_header_text}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                />
                {formik.touched.receipt_header_text &&
                  formik.errors.receipt_header_text && (
                    <p className="text-sm text-red-500">
                      {formik.errors.receipt_header_text}
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receipt_footer_text">Receipt Footer Text</Label>
                <Textarea
                  id="receipt_footer_text"
                  name="receipt_footer_text"
                  placeholder="Text to appear at the bottom of receipts"
                  value={formik.values.receipt_footer_text}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                />
                {formik.touched.receipt_footer_text &&
                  formik.errors.receipt_footer_text && (
                    <p className="text-sm text-red-500">
                      {formik.errors.receipt_footer_text}
                    </p>
                  )}
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="show_logo_on_receipt" className="text-base">
                    Show Logo on Receipt
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your restaurant logo on printed receipts
                  </p>
                </div>
                <Switch
                  id="show_logo_on_receipt"
                  name="show_logo_on_receipt"
                  checked={formik.values.show_logo_on_receipt}
                  onCheckedChange={(checked) =>
                    formik.setFieldValue("show_logo_on_receipt", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full md:w-auto"
            >
              {formik.isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
