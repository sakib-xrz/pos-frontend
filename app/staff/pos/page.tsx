"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

interface MobileCartSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  orderItems: OrderItemType[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearOrder: () => void;
  onProceedToCheckout: () => void;
}

const MobileCartSheetComponent: React.FC<MobileCartSheetProps> = ({
  isOpen,
  onOpenChange,
  orderItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearOrder,
  onProceedToCheckout,
}) => {
  const totalItems = orderItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalAmount = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Current Order ({totalItems} items)
          </SheetTitle>
          <SheetDescription className="text-left">
            Review your order and proceed to checkout
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4">
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items in order
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <OrderItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  quantity={item.quantity}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between py-2 text-lg font-bold">
            <div>Total</div>
            <div>{formatCurrency(totalAmount)}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onClearOrder}
              disabled={orderItems.length === 0}
              className="h-12"
            >
              Clear Order
            </Button>
            <Button
              onClick={onProceedToCheckout}
              disabled={orderItems.length === 0}
              className="h-12"
            >
              Checkout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default function POSPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Automatically close mobile cart sheet if order items are empty
  useEffect(() => {
    if (isMobile && orderItems.length === 0 && mobileCartOpen) {
      setMobileCartOpen(false);
    }
  }, [orderItems, isMobile, mobileCartOpen]);

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

    // Show toast on mobile for better feedback
    if (isMobile) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const handleRemoveItem = useCallback((id: string) => {
    setOrderItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  const handleUpdateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        handleRemoveItem(id);
        return;
      }
      setOrderItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    },
    [handleRemoveItem]
  );

  const handleClearOrder = useCallback(() => {
    setOrderItems([]);
  }, []);

  const handleProceedToMobileCheckout = useCallback(() => {
    setMobileCartOpen(false);
    setCheckoutDialogOpen(true);
  }, [setCheckoutDialogOpen, setMobileCartOpen]);

  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
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
        setMobileCartOpen(false);
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
      <div className="flex items-center justify-center h-screen px-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm sm:text-base">Loading POS system...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (categoriesError || productsError) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <Alert className="max-w-md mx-auto">
          <AlertDescription className="text-center">
            Failed to load POS data. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Desktop Order Sidebar
  const DesktopOrderSidebar = () => (
    <div className="w-96 border-l flex flex-col bg-white">
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

        <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full mt-4"
              size="lg"
              disabled={orderItems.length === 0}
            >
              Checkout
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
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

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutDialogOpen(false)}
                  disabled={isCreatingOrder}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="w-full sm:w-auto"
                >
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
  );

  return (
    <div className="flex flex-col h-screen relative">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">POS System</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 sm:p-4 border-b">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 h-10 text-base sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="border-b">
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-auto p-3 sm:p-4">
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
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
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <div className="text-base sm:text-sm">
                    {searchQuery || selectedCategory
                      ? "No products found matching your criteria"
                      : "No products available"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Order Sidebar - Hidden on mobile */}
        {!isMobile && <DesktopOrderSidebar />}
      </div>

      {/* Mobile Cart Sheet */}
      {isMobile && (
        <MobileCartSheetComponent
          isOpen={mobileCartOpen}
          onOpenChange={setMobileCartOpen}
          orderItems={orderItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearOrder={handleClearOrder}
          onProceedToCheckout={handleProceedToMobileCheckout}
        />
      )}

      {/* Mobile Floating Cart Button */}
      {isMobile && orderItems.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            onClick={() => setMobileCartOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <div className="relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-3 -right-3 bg-white text-primary text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {getTotalItems()}
              </span>
            </div>
          </Button>
        </div>
      )}

      {/* Mobile Checkout Dialog */}
      {isMobile && (
        <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
          <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
            <form onSubmit={formik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Complete Order</DialogTitle>
                <DialogDescription>
                  Enter order details to complete the checkout process.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="grid gap-3">
                  <Label htmlFor="payment_type" className="text-base">
                    Payment Method
                  </Label>
                  <RadioGroup
                    id="payment_type"
                    name="payment_type"
                    defaultValue={formik.values.payment_type}
                    onValueChange={(value) =>
                      formik.setFieldValue("payment_type", value)
                    }
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="CASH" id="payment-cash" />
                      <Label htmlFor="payment-cash" className="text-base">
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="CARD" id="payment-card" />
                      <Label htmlFor="payment-card" className="text-base">
                        Card
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="note" className="text-base">
                    Note (Optional)
                  </Label>
                  <Textarea
                    id="note"
                    name="note"
                    placeholder="Add any special instructions"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.note}
                    className="min-h-[80px] text-base"
                  />
                  {formik.touched.note && formik.errors.note && (
                    <div className="text-sm text-red-500">
                      {formik.errors.note}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between py-2 font-bold text-xl">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCheckoutDialogOpen(false)}
                  disabled={isCreatingOrder}
                  className="w-full h-12 text-base"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="w-full h-12 text-base"
                >
                  {isCreatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
      )}
    </div>
  );
}
