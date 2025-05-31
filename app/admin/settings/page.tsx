"use client";

import { useState, useEffect } from "react";
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
import ImgUpload from "@/components/shared/img-upload";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/redux/features/settings/settingsApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

// Validation schema
const settingsSchema = Yup.object({
  display_name: Yup.string().required("Business name is required"),
  address: Yup.string().required("Address is required"),
  phone_number: Yup.string().required("Phone number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  receipt_header_text: Yup.string(),
  receipt_footer_text: Yup.string(),
  show_logo_on_receipt: Yup.boolean(),
});

export default function SettingsPage() {
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    error: settingsError,
  } = useGetSettingsQuery({});

  const [updateSettings, { isLoading: isUpdating }] =
    useUpdateSettingsMutation();

  const [logoFile, setLogoFile] = useState<File | null>(null);

  const formik = useFormik({
    initialValues: {
      display_name: "",
      address: "",
      phone_number: "",
      email: "",
      logo_url: null as string | null,
      receipt_header_text: "",
      receipt_footer_text: "",
      show_logo_on_receipt: true,
    },
    validationSchema: settingsSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Append all form fields
        formData.append("display_name", values.display_name);
        formData.append("address", values.address);
        formData.append("phone_number", values.phone_number);
        formData.append("email", values.email);
        formData.append("receipt_header_text", values.receipt_header_text);
        formData.append("receipt_footer_text", values.receipt_footer_text);
        formData.append(
          "show_logo_on_receipt",
          values.show_logo_on_receipt.toString()
        );

        // Only append logo file if a new file is selected
        if (logoFile) {
          formData.append("logo", logoFile);
        }

        await updateSettings(formData).unwrap();
        window.location.reload();
        toast.success("Settings updated successfully");
        setLogoFile(null); // Reset logo file after successful update
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update settings. Please try again.");
        }
        console.error("Update settings error:", error);
      }
    },
  });

  // Update form values when settings data is loaded
  useEffect(() => {
    if (settingsData?.data) {
      const settings = settingsData.data;
      formik.setValues({
        display_name: settings.display_name || "",
        address: settings.address || "",
        phone_number: settings.phone_number || "",
        email: settings.email || "",
        logo_url: settings.logo_url || null,
        receipt_header_text: settings.receipt_header_text || "",
        receipt_footer_text: settings.receipt_footer_text || "",
        show_logo_on_receipt: settings.show_logo_on_receipt ?? true,
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsData]);

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
  };

  // Loading component
  if (isLoadingSettings) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">
            Loading settings...
          </span>
        </div>
      </div>
    );
  }

  // Error component
  if (settingsError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <p className="text-red-500 mb-2">Failed to load settings</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col space-y-1 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Business Settings</h1>
          <p className="text-muted-foreground">
            Manage your business information and receipt settings
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={formik.handleSubmit}>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your business details and receipt configuration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Restaurant Basic Information */}
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="display_name">Business Name</Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    placeholder="Enter business name"
                    value={formik.values.display_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.display_name &&
                    formik.errors.display_name && (
                      <p className="text-sm text-red-500">
                        {formik.errors.display_name}
                      </p>
                    )}
                </div>

                <div className="space-y-1">
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

              <div className="space-y-1">
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

              <div className="space-y-1">
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
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Business Logo</h3>
              {formik.values.logo_url && !logoFile && (
                <div>
                  <Label>Current Logo</Label>
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border mb-2">
                    <Image
                      src={formik.values.logo_url}
                      alt="Current logo"
                      className="w-full h-full object-cover"
                      width={100}
                      height={100}
                      quality={100}
                    />
                  </div>
                </div>
              )}
              <ImgUpload
                value={logoFile}
                onChange={handleLogoChange}
                onRemove={handleLogoRemove}
                label={
                  formik.values.logo_url ? "New Business Logo" : "Business Logo"
                }
                placeholder="Upload new logo"
              />
            </div>

            {/* Receipt Settings */}
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Receipt Settings</h3>

              <div className="space-y-1">
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

              <div className="space-y-1">
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
                    Display your business logo on printed receipts
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
              disabled={isUpdating}
              className="w-full md:w-auto"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
