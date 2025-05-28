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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFormik } from "formik";
import { productSchema } from "@/lib/validation-schemas";
import { formatCurrency, sanitizeParams } from "@/lib/utils";
import {
  Plus,
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import ImgUpload from "@/components/shared/img-upload";
import Placeholder from "@/public/placeholder.jpg";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductAvailabilityMutation,
} from "@/redux/features/product/productApi";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useDebounce } from "@/hooks/use-debounce";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category_id: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export default function ProductsPage() {
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("");

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build params for API call
  const params = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
    category_id: categoryFilter,
    is_available: availabilityFilter,
  };

  const {
    data: productData,
    isLoading,
    error,
  } = useGetProductsQuery(sanitizeParams(params));

  const { data: categoryData } = useGetCategoriesQuery({});
  const categories = categoryData?.data || [];

  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [updateProductAvailability] = useUpdateProductAvailabilityMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const products = productData?.data || [];
  const totalPages = productData?.meta?.total_pages || 1;
  const totalItems = productData?.meta?.total || 0;

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, categoryFilter, availabilityFilter]);

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete?.id) {
      toast.error("Invalid product selected for deletion");
      return;
    }

    try {
      await deleteProduct(productToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      toast.success("Product deleted successfully");
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete product. Please try again.");
      }
      console.error("Delete product error:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addFormik = useFormik({
    initialValues: {
      name: "",
      price: "",
      image: "",
      category_id: "",
      is_available: true,
    },
    validationSchema: productSchema,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("price", values.price);
        formData.append("category_id", values.category_id);
        formData.append("is_available", values.is_available.toString());

        if (values.image) {
          formData.append("image", values.image);
        }

        await createProduct(formData).unwrap();
        setIsAddDialogOpen(false);
        addFormik.resetForm();
        toast.success("Product created successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create product. Please try again.");
        }
        console.error("Create product error:", error);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: selectedProduct?.name,
      price: selectedProduct?.price.toString(),
      image: "",
      category_id: selectedProduct?.category_id,
      is_available: selectedProduct?.is_available,
    },
    validationSchema: productSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!selectedProduct?.id) {
        toast.error("Invalid product selected for update");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("name", values.name || "");
        formData.append("price", values.price || "");
        formData.append("category_id", values.category_id || "");
        formData.append("is_available", values.is_available?.toString() || "");

        if (values.image) {
          formData.append("image", values.image);
        }

        await updateProduct({
          id: selectedProduct.id,
          data: formData,
        }).unwrap();
        setIsEditDialogOpen(false);
        setSelectedProduct(null);
        editFormik.resetForm();
        toast.success("Product updated successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update product. Please try again.");
        }
        console.error("Update product error:", error);
      }
    },
  });

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading products...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">Failed to load products</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {debouncedSearchQuery || categoryFilter || availabilityFilter ? (
        <div>
          <p className="mb-2">No products found matching your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("");
              setAvailabilityFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-2">No products found</p>
          <p className="text-sm">Create your first product to get started</p>
        </div>
      )}
    </div>
  );

  // Product Card Component for mobile view
  const ProductCard = ({ product }: { product: Product }) => (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between w-full">
            <Image
              src={product.image || Placeholder}
              alt={product.name}
              className="object-cover rounded-lg w-20 h-20"
              width={100}
              height={100}
            />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Edit className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteClick(product)}
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h3 className="font-semibold text-base">{product.name}</h3>
              <p className="text-sm text-muted-foreground">
                {
                  categories.find((c: any) => c.id === product.category_id)
                    ?.name
                }
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-medium">
                {formatCurrency(product.price)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={
                  product.is_available
                    ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }
              >
                {product.is_available ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} product{totalItems !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <form onSubmit={addFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Product name"
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    value={addFormik.values.name}
                  />
                  {addFormik.touched.name && addFormik.errors.name && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    value={addFormik.values.price}
                  />
                  {addFormik.touched.price && addFormik.errors.price && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.price}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    name="category_id"
                    onValueChange={(value) =>
                      addFormik.setFieldValue("category_id", value)
                    }
                    defaultValue={addFormik.values.category_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {addFormik.touched.category_id &&
                    addFormik.errors.category_id && (
                      <p className="text-sm text-red-500">
                        {addFormik.errors.category_id}
                      </p>
                    )}
                </div>

                <ImgUpload
                  value={
                    addFormik.values.image
                      ? new File([addFormik.values.image], "product-image")
                      : null
                  }
                  onChange={(value) => addFormik.setFieldValue("image", value)}
                  onRemove={() => addFormik.setFieldValue("image", "")}
                  label="Product Image"
                  placeholder="Upload product image"
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    name="is_available"
                    checked={addFormik.values.is_available}
                    onCheckedChange={(checked) =>
                      addFormik.setFieldValue("is_available", checked)
                    }
                  />
                  <Label htmlFor="is_available">Available</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add Product"}
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
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) =>
              setCategoryFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category: any) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={availabilityFilter || "all"}
            onValueChange={(value) =>
              setAvailabilityFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All availability</SelectItem>
              <SelectItem value="true">Available</SelectItem>
              <SelectItem value="false">Unavailable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : products.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-center">Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 relative rounded overflow-hidden">
                        <Image
                          src={product.image || Placeholder}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      {
                        categories.find(
                          (c: any) => c.id === product.category_id
                        )?.name
                      }
                    </TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.is_available}
                        onCheckedChange={async () => {
                          try {
                            await updateProductAvailability({
                              id: product.id,
                              data: {
                                is_available: !product.is_available,
                              },
                            }).unwrap();
                            toast.success("Product availability updated");
                          } catch (error: any) {
                            console.log(error);
                            toast.error(
                              "Failed to update product availability"
                            );
                          }
                        }}
                      />
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
                          <DropdownMenuItem onClick={() => handleEdit(product)}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(product)}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={editFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to the product details.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Product name"
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  value={editFormik.values.name}
                />
                {editFormik.touched.name && editFormik.errors.name && (
                  <p className="text-sm text-red-500">
                    {editFormik.errors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  value={editFormik.values.price}
                />
                {editFormik.touched.price && editFormik.errors.price && (
                  <p className="text-sm text-red-500">
                    {editFormik.errors.price}
                  </p>
                )}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="category_id">Category</Label>
                <Select
                  name="category_id"
                  onValueChange={(value) =>
                    editFormik.setFieldValue("category_id", value)
                  }
                  defaultValue={editFormik.values.category_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editFormik.touched.category_id &&
                  editFormik.errors.category_id && (
                    <p className="text-sm text-red-500">
                      {editFormik.errors.category_id}
                    </p>
                  )}
              </div>

              {selectedProduct?.image && (
                <div>
                  <Label>Current Image</Label>
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border mb-2">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              <ImgUpload
                value={
                  editFormik.values.image
                    ? new File([editFormik.values.image], "product-image")
                    : null
                }
                onChange={(value) => editFormik.setFieldValue("image", value)}
                onRemove={() => editFormik.setFieldValue("image", "")}
                label={
                  selectedProduct?.image
                    ? "New Product Image"
                    : "Upload Product Image"
                }
                placeholder={
                  selectedProduct?.image
                    ? "Upload new image"
                    : "Upload product image"
                }
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  name="is_available"
                  checked={editFormik.values.is_available}
                  onCheckedChange={(checked) =>
                    editFormik.setFieldValue("is_available", checked)
                  }
                />
                <Label htmlFor="is_available">Available</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product &quot;{productToDelete?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
