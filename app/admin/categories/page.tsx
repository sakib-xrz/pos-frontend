"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useFormik } from "formik";
import { categorySchema } from "@/lib/validation-schemas";
import { Plus, MoreHorizontal, Search, Trash, Loader2 } from "lucide-react";
import Image from "next/image";
import ImgUpload from "@/components/shared/img-upload";
import Placeholder from "@/public/placeholder.jpg";
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/category/categoryApi";
import { sanitizeParams } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
};

export default function CategoriesPage() {
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build params for API call
  const params = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
  };

  const {
    data: categoryData,
    isLoading,
    error,
  } = useGetCategoriesQuery(sanitizeParams(params));

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categories = categoryData?.data || [];
  const totalPages = categoryData?.meta?.total_pages || 1;
  const totalItems = categoryData?.meta?.total || 0;

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete?.id) {
      toast.error("Invalid category selected for deletion");
      return;
    }

    try {
      await deleteCategory(categoryToDelete.id).unwrap();
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      toast.success("Category deleted successfully");
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete category. Please try again.");
      }
      console.error("Delete category error:", error);
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
      image: "",
    },
    validationSchema: categorySchema,
    onSubmit: async (values) => {
      console.log(values);
      try {
        const formData = new FormData();
        formData.append("name", values.name);

        if (values.image) {
          formData.append("image", values.image);
        }

        await createCategory(formData).unwrap();
        setIsAddDialogOpen(false);
        addFormik.resetForm();
        toast.success("Category created successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create category. Please try again.");
        }
        console.error("Create category error:", error);
      }
    },
  });

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading categories...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">Failed to load categories</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {debouncedSearchQuery ? (
        <div>
          <p className="mb-2">No categories found matching your search</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
            }}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-2">No categories found</p>
          <p className="text-sm">Create your first category to get started</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} categor{totalItems !== 1 ? "ies" : "y"} found
            </p>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="max-w-md"
          >
            <form onSubmit={addFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogDescription>
                  Add a new category for your products.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Category name"
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

                <ImgUpload
                  value={
                    addFormik.values.image
                      ? new File([addFormik.values.image], "category-image")
                      : null
                  }
                  onChange={(value) => addFormik.setFieldValue("image", value)}
                  onRemove={() => addFormik.setFieldValue("image", "")}
                  label="Category Image"
                  placeholder="Upload category image"
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : categories.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Responsive Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map((category: Category) => (
              <Card
                key={category.id}
                className="group hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                    <Image
                      src={category.image || Placeholder}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(category)}
                          >
                            <Trash className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold truncate">
                    {category.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
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

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category &quot;{categoryToDelete?.name}&quot; and may affect all
              associated products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
