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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, sanitizeParams } from "@/lib/utils";
import { CalendarIcon, MoreHorizontal, Search, X, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  useGetOrdersQuery,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/features/order/orderApi";
import { useDebounce } from "@/hooks/use-debounce";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  category: {
    id: string;
    name: string;
  };
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: string;
  product: Product;
};

type Order = {
  id: string;
  order_number: string;
  total_amount: string | number;
  status: string;
  payment_type: string;
  note?: string;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email?: string;
    role: string;
  };
  order_items?: OrderItem[];
};

export default function OrdersPage() {
  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [dateTo, setDateTo] = useState<Date | null>(new Date());

  // Dialog states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build params for API call
  const params = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
    status: statusFilter,
    payment_type: paymentFilter,
    date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
    date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
  };

  const {
    data: orderData,
    isLoading,
    error,
  } = useGetOrdersQuery(sanitizeParams(params));

  const { data: selectedOrderData, isLoading: isLoadingOrderDetails } =
    useGetOrderQuery(selectedOrderId, {
      skip: !selectedOrderId,
    });

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const orders = orderData?.data || [];
  const totalPages = orderData?.meta?.total_pages || 1;
  const totalItems = orderData?.meta?.total || 0;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, paymentFilter, dateFrom, dateTo]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrderId(order.id);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus({
        id,
        data: { status },
      }).unwrap();
      toast.success(`Order status updated to ${status.toLowerCase()}`);
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update order status. Please try again.");
      }
      console.error("Update order status error:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200"
          >
            Open
          </Badge>
        );
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200"
          >
            Paid
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-600 border-red-200"
          >
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setPaymentFilter("");
    setDateFrom(new Date(new Date().setDate(new Date().getDate() - 30)));
    setDateTo(new Date());
  };

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading orders...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">Failed to load orders</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {debouncedSearchQuery || statusFilter || paymentFilter ? (
        <div>
          <p className="mb-2">No orders found matching your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-2">No orders found</p>
          <p className="text-sm">
            Orders will appear here once customers place them
          </p>
        </div>
      )}
    </div>
  );

  // Order Card Component for mobile view
  const OrderCard = ({ order }: { order: Order }) => (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-base">
                  #{order.order_number}
                </h3>
                {getStatusBadge(order.status)}
              </div>
              <p className="text-sm text-muted-foreground mb-1">
                {new Date(order.created_at).toLocaleDateString()} at{" "}
                {new Date(order.created_at).toLocaleTimeString()}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                Staff: {order.user.name}
              </p>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  disabled={isUpdating}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "OPEN")}
                  disabled={
                    order.status === "OPEN" ||
                    !canUpdateStatus(order.status, "OPEN") ||
                    isUpdating
                  }
                >
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "PAID")}
                  disabled={
                    order.status === "PAID" ||
                    !canUpdateStatus(order.status, "PAID") ||
                    isUpdating
                  }
                >
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                  disabled={
                    order.status === "CANCELLED" ||
                    !canUpdateStatus(order.status, "CANCELLED") ||
                    isUpdating
                  }
                  className="text-red-600 focus:text-red-600"
                >
                  Cancel Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Payment and Total Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Payment:</span>
              <span className="text-sm font-medium">{order.payment_type}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-base font-semibold">Total:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(Number(order.total_amount))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Helper function to check if status transition is allowed
  const canUpdateStatus = (
    currentStatus: string,
    targetStatus: string
  ): boolean => {
    // Cannot update status of a cancelled order
    if (currentStatus === "CANCELLED") {
      return false;
    }

    // Cannot reopen a paid order
    if (currentStatus === "PAID" && targetStatus === "OPEN") {
      return false;
    }

    return true;
  };

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} order{totalItems !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) =>
              setStatusFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Payment Type Filter */}
          <Select
            value={paymentFilter || "all"}
            onValueChange={(value) =>
              setPaymentFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All payment types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment types</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>

          {/* Date From Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-transparent",
                  !dateFrom && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : "Date from"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom || undefined}
                onSelect={(date) => setDateFrom(date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Date To Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-transparent",
                  !dateTo && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : "Date to"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo || undefined}
                onSelect={(date) => setDateTo(date || null)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Id</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      #{order.order_number}
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()} at{" "}
                      {new Date(order.created_at).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{order.user.name}</TableCell>
                    <TableCell>
                      {formatCurrency(Number(order.total_amount))}
                    </TableCell>
                    <TableCell>{order.payment_type}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewOrder(order)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(order.id, "OPEN")}
                            disabled={
                              order.status === "OPEN" ||
                              !canUpdateStatus(order.status, "OPEN") ||
                              isUpdating
                            }
                          >
                            Mark as Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(order.id, "PAID")}
                            disabled={
                              order.status === "PAID" ||
                              !canUpdateStatus(order.status, "PAID") ||
                              isUpdating
                            }
                          >
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(order.id, "CANCELLED")
                            }
                            disabled={
                              order.status === "CANCELLED" ||
                              !canUpdateStatus(order.status, "CANCELLED") ||
                              isUpdating
                            }
                            className="text-red-600"
                          >
                            Cancel Order
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
          <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order: Order) => (
              <OrderCard key={order.id} order={order} />
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

      {/* Order Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent
          className="max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrderData?.data?.order_number
                ? `Order #${selectedOrderData.data.order_number}`
                : "Loading order details..."}
            </DialogDescription>
          </DialogHeader>

          {isLoadingOrderDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Loading details...
              </span>
            </div>
          ) : selectedOrderData?.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Date:</div>
                <div>
                  {new Date(selectedOrderData.data.created_at).toLocaleString()}
                </div>

                <div className="text-muted-foreground">Staff:</div>
                <div>{selectedOrderData.data.user.name}</div>

                <div className="text-muted-foreground">Payment:</div>
                <div>{selectedOrderData.data.payment_type}</div>

                <div className="text-muted-foreground">Status:</div>
                <div>{getStatusBadge(selectedOrderData.data.status)}</div>
              </div>

              {selectedOrderData.data.order_items &&
                selectedOrderData.data.order_items.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrderData.data.order_items.map(
                        (item: OrderItem) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.quantity} x {item.product.name}
                            </span>
                            <span>
                              {formatCurrency(
                                Number(item.price) * item.quantity
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Add note if it exists */}
              {selectedOrderData.data.note && (
                <div className="border-t pt-4">
                  <div className="text-muted-foreground text-sm mb-1">
                    Note:
                  </div>
                  <div className="text-sm">{selectedOrderData.data.note}</div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>
                    {formatCurrency(
                      Number(selectedOrderData.data.total_amount) / 1.1
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%):</span>
                  <span>
                    {formatCurrency(
                      Number(selectedOrderData.data.total_amount) -
                        Number(selectedOrderData.data.total_amount) / 1.1
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      Number(selectedOrderData.data.total_amount)
                    )}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load order details
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
