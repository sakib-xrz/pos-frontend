"use client";

import { useState, useEffect } from "react";
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
import {
  Plus,
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Store,
  Loader2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  useCreateShopMutation,
  useDeleteShopMutation,
  useGetShopsQuery,
  useUpdateSubscriptionMutation,
} from "@/redux/features/shop/shopApi";
import { sanitizeParams } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

// Validation schemas
const createShopSchema = Yup.object({
  name: Yup.string().required("Shop name is required"),
  branch_name: Yup.string(),
  type: Yup.string()
    .oneOf(["RESTAURANT", "PHARMACY"])
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
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build params for API call
  const params = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
    type: typeFilter,
    subscription_plan: subscriptionFilter,
    is_active: statusFilter,
  };

  const {
    data: shopData,
    isLoading,
    error,
  } = useGetShopsQuery(sanitizeParams(params));

  const [createShop, { isLoading: isCreating }] = useCreateShopMutation();
  const [deleteShop, { isLoading: isDeleting }] = useDeleteShopMutation();
  const [updateSubscription, { isLoading: isUpdating }] =
    useUpdateSubscriptionMutation();

  const shops = shopData?.data || [];
  const totalPages = shopData?.meta?.total_pages || 1;
  const totalItems = shopData?.meta?.total || 0;

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, typeFilter, subscriptionFilter, statusFilter]);

  const handleUpdate = (shop: Shop) => {
    setSelectedShop(shop);
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteClick = (shop: Shop) => {
    setShopToDelete(shop);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!shopToDelete?.id) {
      toast.error("Invalid shop selected for deletion");
      return;
    }

    try {
      await deleteShop(shopToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setShopToDelete(null);
      toast.success("Shop deleted successfully");
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete shop. Please try again.");
      }
      console.error("Delete shop error:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value === "all" ? "" : value);
  };

  const handleSubscriptionFilterChange = (value: string) => {
    setSubscriptionFilter(value === "all" ? "" : value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === "all" ? "" : value);
  };

  const createFormik = useFormik({
    initialValues: {
      name: "BFC",
      branch_name: "Mirpur Branch",
      type: "RESTAURANT",
      subscription_plan: "ONE_MONTH",
      admin_name: "BFC Admin",
      admin_email: "bfc@gmail.com",
      admin_password: "123456",
      display_name: "BFC",
      email: "bfc@gmail.com",
    },
    validationSchema: createShopSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          branch_name: values.branch_name || null,
          type: values.type,
          subscription_plan: values.subscription_plan,
          admin_name: values.admin_name,
          admin_email: values.admin_email,
          admin_password: values.admin_password,
          settings: {
            display_name: values.display_name,
            email: values.email,
          },
        };

        await createShop(payload).unwrap();
        setIsCreateDialogOpen(false);
        createFormik.resetForm();
        toast.success("Shop created successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create shop. Please try again.");
        }
        console.error("Create shop error:", error);
      }
    },
  });

  const updateFormik = useFormik({
    initialValues: {
      subscription_plan: selectedShop?.subscription_plan,
      is_active: selectedShop?.is_active,
    },
    validationSchema: updateShopSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await updateSubscription({
          id: selectedShop?.id,
          data: {
            subscription_plan: values.subscription_plan,
            is_active: values.is_active,
          },
        }).unwrap();
        setIsUpdateDialogOpen(false);
        updateFormik.resetForm();
        toast.success("Shop updated successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update shop. Please try again.");
        }
        console.error("Update shop error:", error);
      }
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

  const ShopCard = ({ shop }: { shop: Shop }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-muted-foreground" />
            <div>
              <h3 className="font-semibold text-base">{shop.name}</h3>
              {shop.branch_name && (
                <p className="text-sm text-muted-foreground">
                  {shop.branch_name}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUpdate(shop)}>
                <Edit className="mr-2 h-4 w-4" />
                Update Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => handleDeleteClick(shop)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete Shop
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <span className="font-medium">{shop.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subscription</span>
            {getSubscriptionBadge(shop.subscription_plan)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {getStatusBadge(shop.is_active)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Created</span>
            <span className="text-sm">
              {new Date(shop.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading shops...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">Failed to load shops</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {debouncedSearchQuery ||
      typeFilter ||
      subscriptionFilter ||
      statusFilter ? (
        <div>
          <p className="mb-2">No shops found matching your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("");
              setSubscriptionFilter("");
              setStatusFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <p>No shops found</p>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shop Management</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} shop{totalItems !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
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

              <div className="grid gap-2 py-4">
                {/* Shop Information */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Shop Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1">
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

                    <div className="grid gap-1">
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
                    <div className="grid gap-1">
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

                    <div className="grid gap-1">
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
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Admin Information</h3>

                  <div className="grid gap-1">
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
                    <div className="grid gap-1">
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

                    <div className="grid gap-1">
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
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Shop Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-1">
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

                    <div className="grid gap-1">
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
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Shop"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shops..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={typeFilter || "all"}
            onValueChange={handleTypeFilterChange}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="RESTAURANT">Restaurant</SelectItem>
              <SelectItem value="PHARMACY">Pharmacy</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={subscriptionFilter || "all"}
            onValueChange={handleSubscriptionFilterChange}
          >
            <SelectTrigger className="sm:w-[180px]">
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
            value={statusFilter || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : shops.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Table for large screens */}
          <div className="hidden md:block border rounded-md bg-white">
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
                {shops.map((shop: Shop) => (
                  <TableRow key={shop.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
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
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUpdate(shop)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Update Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(shop)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Shop
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Card view for small screens */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {shops.map((shop: Shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <CustomPagination
              params={{ page: currentPage }}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={updateFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Update Shop Plan</DialogTitle>
              <DialogDescription>
                Update plan for {selectedShop?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div className="grid gap-1">
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
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              shop &quot;{shopToDelete?.name}&quot; and all associated data
              including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All products and inventory</li>
                <li>All orders and transactions</li>
                <li>All user accounts</li>
                <li>All settings and configurations</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Shop"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
