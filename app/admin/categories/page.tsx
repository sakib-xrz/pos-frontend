"use client";

import { useState } from "react";
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
import { Plus, MoreHorizontal, Search, Edit, Trash } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/shared/image-upload";
import Placeholder from "@/public/placeholder.jpg";

// Updated dummy data with images
const dummyCategories: Category[] = [
  {
    id: "1",
    name: "Burgers",
    image: null,
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z",
  },
  {
    id: "2",
    name: "Pizza",
    image: null,
    created_at: "2023-01-15T10:35:00Z",
    updated_at: "2023-01-15T10:35:00Z",
  },
  {
    id: "3",
    name: "Drinks",
    image: null,
    created_at: "2023-01-15T10:40:00Z",
    updated_at: "2023-01-15T10:40:00Z",
  },
  {
    id: "4",
    name: "Sides",
    image: null,
    created_at: "2023-01-15T10:45:00Z",
    updated_at: "2023-01-15T10:45:00Z",
  },
  {
    id: "5",
    name: "Desserts",
    image: null,
    created_at: "2023-01-15T10:50:00Z",
    updated_at: "2023-01-15T10:50:00Z",
  },
];

interface Category {
  id: string;
  name: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState(dummyCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(
        categories.filter((category) => category.id !== categoryToDelete)
      );
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const addFormik = useFormik({
    initialValues: {
      name: "",
      image: "",
    },
    validationSchema: categorySchema,
    onSubmit: (values) => {
      const newCategory = {
        id: Math.random().toString(36).substring(2, 9),
        name: values.name,
        image: values.image || "/placeholder.svg?height=100&width=100",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setCategories([...categories, newCategory as Category]);
      setIsAddDialogOpen(false);
      addFormik.resetForm();
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: selectedCategory?.name || "",
      image: selectedCategory?.image || "",
    },
    validationSchema: categorySchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      setCategories(
        categories.map((category) =>
          category.id === selectedCategory?.id
            ? {
                ...category,
                name: values.name,
                image: values.image,
                updated_at: new Date().toISOString(),
              }
            : category
        )
      );

      setIsEditDialogOpen(false);
    },
  });

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
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

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
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

                <ImageUpload
                  value={addFormik.values.image}
                  onChange={(value) => addFormik.setFieldValue("image", value)}
                  onRemove={() => addFormik.setFieldValue("image", "")}
                  label="Category Image"
                  placeholder="Upload category image"
                />
              </div>

              <DialogFooter>
                <Button type="submit">Add Category</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Responsive Card Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-muted/50 rounded-lg p-8">
            <p className="text-muted-foreground">No categories found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCategories.map((category) => (
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
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(category.id)}
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
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent
          className="max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <form onSubmit={editFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Make changes to the category.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Category name"
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

              <ImageUpload
                value={editFormik.values.image}
                onChange={(value) => editFormik.setFieldValue("image", value)}
                onRemove={() => editFormik.setFieldValue("image", "")}
                label="Category Image"
                placeholder="Upload category image"
              />
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              category and may affect all associated products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
