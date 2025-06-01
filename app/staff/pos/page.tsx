"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "./_components/product-card";
import { CategoryFilter } from "./_components/category-filter";
import { OrderItem } from "./_components/order-item";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { formatCurrency, sanitizeParams } from "@/lib/utils";
import { useFormik } from "formik";
import { orderSchema } from "@/lib/validation-schemas";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useGetCategoriesQuery } from "@/redux/features/category/categoryApi";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useCreateOrderMutation } from "@/redux/features/order/orderApi";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDebounce } from "@/hooks/use-debounce";

interface OrderItemType {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);

  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // API hooks
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useGetCategoriesQuery({});

  // Updated products query with search and filter parameters
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useGetProductsQuery(
    sanitizeParams({
      search: debouncedSearchQuery || undefined,
      category_id: selectedCategory || undefined,
      is_available: true,
      page: 1,
      limit: 100,
    })
  );

  const [createOrder, { isLoading: isCreatingOrder }] =
    useCreateOrderMutation();

  // Extract data from API responses
  const categories = categoriesData?.data || [];
  const products = productsData?.data || [];

  // Remove client-side filtering since it's now handled by the API
  const filteredProducts = products;

  const handleAddProduct = (product: {
    id: string;
    name: string;
    price: number;
  }) => {
    const existingItem = orderItems.find(
      (item) => item.product_id === product.id
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          id: Math.random().toString(36).substring(2, 9),
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setOrderItems(
      orderItems.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const formik = useFormik({
    initialValues: {
      note: "",
      payment_type: "CASH",
    },
    validationSchema: orderSchema,
    onSubmit: async (values) => {
      try {
        // Create order object for API
        const orderData = {
          total_amount: calculateTotal(),
          payment_type: values.payment_type,
          note: values.note || null,
          order_items: orderItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        const result = await createOrder(orderData).unwrap();

        toast.success("Order created successfully!");

        // Reset order and close dialog
        setOrderItems([]);
        setCheckoutDialogOpen(false);
        formik.resetForm();

        // Navigate to receipt page
        router.push(`/staff/receipt?orderId=${result.data?.id}`);
      } catch (error: any) {
        console.error("Order creation failed:", error);
        toast.error(error?.data?.message || "Failed to create order");
      }
    },
  });

  // Loading state
  if (categoriesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading POS system...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesError || productsError) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert className="max-w-md">
          <AlertDescription>
            Failed to load POS data. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">POS System</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-b">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  onSelect={handleAddProduct}
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  {searchQuery || selectedCategory
                    ? "No products found matching your criteria"
                    : "No products available"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Section */}
        <div className="w-full md:w-96 border-l flex flex-col bg-white">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              <h2 className="text-lg font-medium">Current Order</h2>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No items in order
              </div>
            ) : (
              <div className="space-y-2 divide-y">
                {orderItems.map((item) => (
                  <OrderItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex justify-between py-2 text-lg font-bold">
              <div>Total</div>
              <div>{formatCurrency(calculateTotal())}</div>
            </div>

            <Dialog
              open={checkoutDialogOpen}
              onOpenChange={setCheckoutDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={orderItems.length === 0}
                >
                  Checkout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={formik.handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>Complete Order</DialogTitle>
                    <DialogDescription>
                      Enter order details to complete the checkout process.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="payment_type">Payment Method</Label>
                      <RadioGroup
                        id="payment_type"
                        name="payment_type"
                        defaultValue={formik.values.payment_type}
                        onValueChange={(value) =>
                          formik.setFieldValue("payment_type", value)
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CASH" id="payment-cash" />
                          <Label htmlFor="payment-cash">Cash</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CARD" id="payment-card" />
                          <Label htmlFor="payment-card">Card</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="note">Note (Optional)</Label>
                      <Textarea
                        id="note"
                        name="note"
                        placeholder="Add any special instructions"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.note}
                      />
                      {formik.touched.note && formik.errors.note && (
                        <div className="text-sm text-red-500">
                          {formik.errors.note}
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between py-1 font-bold text-lg">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCheckoutDialogOpen(false)}
                      disabled={isCreatingOrder}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingOrder}>
                      {isCreatingOrder ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Complete Order"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => setOrderItems([])}
              disabled={orderItems.length === 0}
            >
              Clear Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
