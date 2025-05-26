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
import { useFormik } from "formik";
import { productSchema } from "@/lib/validation-schemas";
import { formatCurrency } from "@/lib/utils";
import { Plus, MoreHorizontal, Search, Edit, Trash } from "lucide-react";
import Image from "next/image";
import { ImageUpload } from "@/components/shared/image-upload";
import Placeholder from "@/public/placeholder.jpg";
import { Card, CardContent } from "@/components/ui/card";

// Dummy data
const dummyProducts = [
  {
    id: "1",
    name: "Cheeseburger",
    price: 8.99,
    image: null,
    category_id: "1",
    is_available: true,
  },
  {
    id: "2",
    name: "Double Cheeseburger",
    price: 10.99,
    image: null,
    category_id: "1",
    is_available: true,
  },
  {
    id: "3",
    name: "Veggie Burger",
    price: 9.99,
    image: null,
    category_id: "1",
    is_available: true,
  },
  {
    id: "4",
    name: "Margherita Pizza",
    price: 12.99,
    image: null,
    category_id: "2",
    is_available: true,
  },
  {
    id: "5",
    name: "Pepperoni Pizza",
    price: 14.99,
    image: null,
    category_id: "2",
    is_available: true,
  },
  {
    id: "6",
    name: "Soda",
    price: 2.99,
    image: null,
    category_id: "3",
    is_available: true,
  },
  {
    id: "7",
    name: "Water",
    price: 1.99,
    image: null,
    category_id: "3",
    is_available: true,
  },
  {
    id: "8",
    name: "French Fries",
    price: 3.99,
    image: null,
    category_id: "4",
    is_available: true,
  },
  {
    id: "9",
    name: "Onion Rings",
    price: 4.99,
    image: null,
    category_id: "4",
    is_available: true,
  },
  {
    id: "10",
    name: "Ice Cream",
    price: 5.99,
    image: null,
    category_id: "5",
    is_available: true,
  },
];

const dummyCategories = [
  { id: "1", name: "Burgers" },
  { id: "2", name: "Pizza" },
  { id: "3", name: "Drinks" },
  { id: "4", name: "Sides" },
  { id: "5", name: "Desserts" },
];

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category_id: string;
  is_available: boolean;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<boolean | null>(
    null
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter
      ? product.category_id === categoryFilter
      : true;
    const matchesAvailability =
      availabilityFilter !== null
        ? product.is_available === availabilityFilter
        : true;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts(
        products.filter((product) => product.id !== productToDelete.id)
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleToggleAvailability = (id: string) => {
    setProducts(
      products.map((product) =>
        product.id === id
          ? { ...product, is_available: !product.is_available }
          : product
      )
    );
  };

  const addFormik = useFormik({
    initialValues: {
      name: "",
      price: "",
      image: "/placeholder.svg?height=200&width=200",
      category_id: "",
      is_available: true,
    },
    validationSchema: productSchema,
    onSubmit: (values) => {
      const newProduct = {
        id: Math.random().toString(36).substring(2, 9),
        name: values.name,
        price: Number.parseFloat(values.price),
        image: values.image,
        category_id: values.category_id,
        is_available: values.is_available,
      };

      setProducts([...products, newProduct]);
      setIsAddDialogOpen(false);
      addFormik.resetForm();
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: selectedProduct?.name || "",
      price: selectedProduct?.price.toString() || "",
      image: selectedProduct?.image || "",
      category_id: selectedProduct?.category_id || "",
      is_available: selectedProduct?.is_available || true,
    },
    validationSchema: productSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      setProducts(
        products.map((product) =>
          product.id === selectedProduct?.id
            ? {
                ...product,
                name: values.name,
                price: Number.parseFloat(values.price),
                image: values.image,
                category_id: values.category_id,
                is_available: values.is_available,
              }
            : product
        )
      );

      setIsEditDialogOpen(false);
    },
  });

  // Product Card Component for mobile view
  const ProductCard = ({ product }: { product: Product }) => (
    <Card key={product.id}>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => handleDeleteClick(product)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content Section */}
          <div className="space-y-3 mt-3">
            {/* Header with title and actions */}
            <div>
              <div>
                <h3 className="font-semibold text-base sm:text-sm lg:text-base line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {
                    dummyCategories.find((c) => c.id === product.category_id)
                      ?.name
                  }
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center">
              <span className="text-lg sm:text-base font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
            </div>

            {/* Availability Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-3">
                <Switch
                  checked={product.is_available}
                  onCheckedChange={() => handleToggleAvailability(product.id)}
                  className="data-[state=checked]:bg-green-600"
                />
                <span
                  className={`text-sm font-medium ${
                    product.is_available
                      ? "text-green-700 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {product.is_available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
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
                  Add a new product to your restaurant menu.
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
                      {dummyCategories.map((category) => (
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

                <ImageUpload
                  value={addFormik.values.image}
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
                <Button type="submit">Add Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-2 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Select
            value={categoryFilter || "all"}
            onValueChange={(value) =>
              setCategoryFilter(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="sm:w-[180px] overflow-hidden">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {dummyCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              availabilityFilter === null ? "" : availabilityFilter.toString()
            }
            onValueChange={(value) => {
              if (value === "") {
                setAvailabilityFilter(null);
              } else {
                setAvailabilityFilter(value === "true");
              }
            }}
          >
            <SelectTrigger className="sm:w-[180px] overflow-hidden">
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

      {/* Desktop Table View */}
      <div className="hidden lg:block border rounded-md bg-white">
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
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-10 h-10 relative rounded overflow-hidden">
                      <Image
                        src={product.image || Placeholder}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    {
                      dummyCategories.find((c) => c.id === product.category_id)
                        ?.name
                    }
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.is_available}
                      onCheckedChange={() =>
                        handleToggleAvailability(product.id)
                      }
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

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
                    {dummyCategories.map((category) => (
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

              <ImageUpload
                value={editFormik.values.image}
                onChange={(value) => editFormik.setFieldValue("image", value)}
                onRemove={() => editFormik.setFieldValue("image", "")}
                label="Product Image"
                placeholder="Upload product image"
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
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{productToDelete?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
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
