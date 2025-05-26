"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, MoreHorizontal, Search, Edit, Trash, Store } from "lucide-react";

// Validation schemas
const createShopSchema = Yup.object({
  name: Yup.string().required("Shop name is required"),
  branch_name: Yup.string(),
  type: Yup.string()
    .oneOf(["RESTAURANT", "RETAIL", "CAFE"])
    .required("Shop type is required"),
  subscription_plan: Yup.string()
    .oneOf(["ONE_MONTH", "SIX_MONTHS", "ONE_YEAR"])
    .required("Subscription plan is required"),
  admin_name: Yup.string().required("Admin name is required"),
  admin_email: Yup.string()
    .email("Invalid email address")
    .required("Admin email is required"),
  admin_password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Admin password is required"),
  display_name: Yup.string().required("Display name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Contact email is required"),
});

const updateShopSchema = Yup.object({
  subscription_plan: Yup.string()
    .oneOf(["ONE_MONTH", "SIX_MONTHS", "ONE_YEAR"])
    .required("Subscription plan is required"),
  is_active: Yup.boolean().required("Active status is required"),
});

// Dummy data
const dummyShops = [
  {
    id: "shop1",
    name: "Demo Restaurant",
    branch_name: "Main Branch",
    type: "RESTAURANT",
    subscription_plan: "ONE_YEAR",
    subscription_start: "2023-01-15T10:30:00Z",
    subscription_end: "2024-01-15T10:30:00Z",
    is_active: true,
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z",
  },
  {
    id: "shop2",
    name: "Pizza Palace",
    branch_name: "Downtown",
    type: "RESTAURANT",
    subscription_plan: "SIX_MONTHS",
    subscription_start: "2023-06-01T10:30:00Z",
    subscription_end: "2023-12-01T10:30:00Z",
    is_active: true,
    created_at: "2023-06-01T10:30:00Z",
    updated_at: "2023-06-01T10:30:00Z",
  },
  {
    id: "shop3",
    name: "Coffee Corner",
    branch_name: "Mall Branch",
    type: "CAFE",
    subscription_plan: "ONE_MONTH",
    subscription_start: "2023-11-01T10:30:00Z",
    subscription_end: "2023-12-01T10:30:00Z",
    is_active: false,
    created_at: "2023-11-01T10:30:00Z",
    updated_at: "2023-11-15T10:30:00Z",
  },
];

type Shop = {
  id: string;
  name: string;
  branch_name: string | null;
  type: string;
  subscription_plan: string;
  subscription_start: string;
  subscription_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>(dummyShops);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<boolean | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  const filteredShops = shops.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.branch_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter ? shop.type === typeFilter : true;
    const matchesSubscription = subscriptionFilter
      ? shop.subscription_plan === subscriptionFilter
      : true;
    const matchesStatus =
      statusFilter !== null ? shop.is_active === statusFilter : true;
    return matchesSearch && matchesType && matchesSubscription && matchesStatus;
  });

  const handleUpdate = (shop: Shop) => {
    setSelectedShop(shop);
    setIsUpdateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this shop? This action cannot be undone."
      )
    ) {
      setShops(shops.filter((shop) => shop.id !== id));
      //   toast({
      //     title: "Shop deleted",
      //     description: "The shop has been successfully deleted.",
      //   });
    }
  };

  const createFormik = useFormik({
    initialValues: {
      name: "",
      branch_name: "",
      type: "RESTAURANT",
      subscription_plan: "ONE_MONTH",
      admin_name: "",
      admin_email: "",
      admin_password: "",
      display_name: "",
      email: "",
    },
    validationSchema: createShopSchema,
    onSubmit: (values) => {
      const newShop: Shop = {
        id: Math.random().toString(36).substring(2, 9),
        name: values.name,
        branch_name: values.branch_name || null,
        type: values.type,
        subscription_plan: values.subscription_plan,
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(
          Date.now() +
            (values.subscription_plan === "ONE_MONTH"
              ? 30
              : values.subscription_plan === "SIX_MONTHS"
                ? 180
                : 365) *
              24 *
              60 *
              60 *
              1000
        ).toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setShops([...shops, newShop]);
      setIsCreateDialogOpen(false);
      createFormik.resetForm();
      //   toast({
      //     title: "Shop created",
      //     description: "New shop has been successfully created.",
      //   });
    },
  });

  const updateFormik = useFormik({
    initialValues: {
      subscription_plan: selectedShop?.subscription_plan || "ONE_MONTH",
      is_active: selectedShop?.is_active || true,
    },
    validationSchema: updateShopSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      setShops(
        shops.map((shop) =>
          shop.id === selectedShop?.id
            ? {
                ...shop,
                subscription_plan: values.subscription_plan,
                is_active: values.is_active,
                updated_at: new Date().toISOString(),
              }
            : shop
        )
      );

      setIsUpdateDialogOpen(false);
      // toast({
      //     title: "Shop updated",
      //     description: "Shop subscription has been successfully updated.",
      // });
    },
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge
        variant="outline"
        className="bg-green-50 text-green-600 border-green-200"
      >
        Active
      </Badge>
    ) : (
      <Badge
        variant="outline"
        className="bg-red-50 text-red-600 border-red-200"
      >
        Inactive
      </Badge>
    );
  };

  const getSubscriptionBadge = (plan: string) => {
    const colors = {
      ONE_MONTH: "bg-blue-50 text-blue-600 border-blue-200",
      SIX_MONTHS: "bg-purple-50 text-purple-600 border-purple-200",
      ONE_YEAR: "bg-green-50 text-green-600 border-green-200",
    };

    const labels = {
      ONE_MONTH: "1 Month",
      SIX_MONTHS: "6 Months",
      ONE_YEAR: "1 Year",
    };

    return (
      <Badge variant="outline" className={colors[plan as keyof typeof colors]}>
        {labels[plan as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Shop Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Shop
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl max-h-[90vh] overflow-y-auto"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <form onSubmit={createFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Shop</DialogTitle>
                <DialogDescription>
                  Create a new shop with admin user and settings.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Shop Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shop Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Shop Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Demo Restaurant"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.name}
                      />
                      {createFormik.touched.name &&
                        createFormik.errors.name && (
                          <p className="text-sm text-red-500">
                            {createFormik.errors.name}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="branch_name">
                        Branch Name (Optional)
                      </Label>
                      <Input
                        id="branch_name"
                        name="branch_name"
                        placeholder="Main Branch"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.branch_name}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Shop Type</Label>
                      <Select
                        name="type"
                        onValueChange={(value) =>
                          createFormik.setFieldValue("type", value)
                        }
                        defaultValue={createFormik.values.type}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                          <SelectItem value="RETAIL">Retail</SelectItem>
                          <SelectItem value="CAFE">Cafe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="subscription_plan">
                        Subscription Plan
                      </Label>
                      <Select
                        name="subscription_plan"
                        onValueChange={(value) =>
                          createFormik.setFieldValue("subscription_plan", value)
                        }
                        defaultValue={createFormik.values.subscription_plan}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ONE_MONTH">1 Month</SelectItem>
                          <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                          <SelectItem value="ONE_YEAR">1 Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Admin Information</h3>

                  <div className="grid gap-2">
                    <Label htmlFor="admin_name">Admin Name</Label>
                    <Input
                      id="admin_name"
                      name="admin_name"
                      placeholder="John Admin"
                      onChange={createFormik.handleChange}
                      onBlur={createFormik.handleBlur}
                      value={createFormik.values.admin_name}
                    />
                    {createFormik.touched.admin_name &&
                      createFormik.errors.admin_name && (
                        <p className="text-sm text-red-500">
                          {createFormik.errors.admin_name}
                        </p>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin_email">Admin Email</Label>
                      <Input
                        id="admin_email"
                        name="admin_email"
                        type="email"
                        placeholder="admin@pos.com"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.admin_email}
                      />
                      {createFormik.touched.admin_email &&
                        createFormik.errors.admin_email && (
                          <p className="text-sm text-red-500">
                            {createFormik.errors.admin_email}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="admin_password">Admin Password</Label>
                      <Input
                        id="admin_password"
                        name="admin_password"
                        type="password"
                        placeholder="123456"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.admin_password}
                      />
                      {createFormik.touched.admin_password &&
                        createFormik.errors.admin_password && (
                          <p className="text-sm text-red-500">
                            {createFormik.errors.admin_password}
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Shop Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="display_name">Display Name</Label>
                      <Input
                        id="display_name"
                        name="display_name"
                        placeholder="Demo Restaurant"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.display_name}
                      />
                      {createFormik.touched.display_name &&
                        createFormik.errors.display_name && (
                          <p className="text-sm text-red-500">
                            {createFormik.errors.display_name}
                          </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">Contact Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contact@restaurant.com"
                        onChange={createFormik.handleChange}
                        onBlur={createFormik.handleBlur}
                        value={createFormik.values.email}
                      />
                      {createFormik.touched.email &&
                        createFormik.errors.email && (
                          <p className="text-sm text-red-500">
                            {createFormik.errors.email}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create Shop</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shops..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) =>
              setTypeFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="RESTAURANT">Restaurant</SelectItem>
              <SelectItem value="RETAIL">Retail</SelectItem>
              <SelectItem value="CAFE">Cafe</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={subscriptionFilter || "all"}
            onValueChange={(value) =>
              setSubscriptionFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All plans" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              <SelectItem value="ONE_MONTH">1 Month</SelectItem>
              <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
              <SelectItem value="ONE_YEAR">1 Year</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={
              statusFilter === null
                ? "all"
                : statusFilter
                  ? "active"
                  : "inactive"
            }
            onValueChange={(value) => {
              if (value === "all") {
                setStatusFilter(null);
              } else {
                setStatusFilter(value === "active");
              }
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShops.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No shops found
                </TableCell>
              </TableRow>
            ) : (
              filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{shop.name}</div>
                        {shop.branch_name && (
                          <div className="text-sm text-muted-foreground">
                            {shop.branch_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{shop.type}</TableCell>
                  <TableCell>
                    {getSubscriptionBadge(shop.subscription_plan)}
                  </TableCell>
                  <TableCell>{getStatusBadge(shop.is_active)}</TableCell>
                  <TableCell>
                    {new Date(shop.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdate(shop)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update Subscription
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(shop.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Shop
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={updateFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Shop Subscription</DialogTitle>
              <DialogDescription>
                Update subscription plan and status for {selectedShop?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="subscription_plan">Subscription Plan</Label>
                <Select
                  name="subscription_plan"
                  onValueChange={(value) =>
                    updateFormik.setFieldValue("subscription_plan", value)
                  }
                  defaultValue={updateFormik.values.subscription_plan}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONE_MONTH">1 Month</SelectItem>
                    <SelectItem value="SIX_MONTHS">6 Months</SelectItem>
                    <SelectItem value="ONE_YEAR">1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="text-base">
                    Active Status
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this shop
                  </p>
                </div>
                <Switch
                  id="is_active"
                  name="is_active"
                  checked={updateFormik.values.is_active}
                  onCheckedChange={(checked) =>
                    updateFormik.setFieldValue("is_active", checked)
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">Update Shop</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
