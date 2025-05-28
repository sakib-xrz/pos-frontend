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
import { formatCurrency } from "@/lib/utils";
import { CalendarIcon, MoreHorizontal, Search, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Example order data structure
const dummyOrders = [
  {
    id: "523c961a-9f2e-49ed-af76-2ad575972a56",
    order_number: "A9210D",
    total_amount: 500,
    status: "PAID",
    payment_type: "CASH",
    created_at: "2025-05-28T19:51:50.241Z",
    user: { name: "Md Sakibul Islam" },
  },
  {
    id: "order2",
    order_number: "B4567E",
    total_amount: 45.5,
    status: "OPEN",
    payment_type: "CARD",
    created_at: "2025-05-27T13:45:12Z",
    user: { name: "Jane Smith" },
  },
  {
    id: "order3",
    order_number: "C7890F",
    total_amount: 22.75,
    status: "CANCELLED",
    payment_type: "CASH",
    created_at: "2025-05-26T10:15:30Z",
    user: { name: "John Doe" },
  },
  {
    id: "order4",
    order_number: "D1234G",
    total_amount: 67.25,
    status: "PAID",
    payment_type: "CARD",
    created_at: "2025-05-25T18:22:45Z",
    user: { name: "Robert Johnson" },
  },
  {
    id: "order5",
    order_number: "E5678H",
    total_amount: 18.5,
    status: "OPEN",
    payment_type: "CASH",
    created_at: "2025-05-24T19:05:10Z",
    user: { name: "Jane Smith" },
  },
];

const dummyOrderItems = [
  {
    id: "item1",
    order_id: "523c961a-9f2e-49ed-af76-2ad575972a56",
    product_id: "1",
    name: "Cheeseburger",
    price: 8.99,
    quantity: 2,
  },
  {
    id: "item2",
    order_id: "523c961a-9f2e-49ed-af76-2ad575972a56",
    product_id: "8",
    name: "French Fries",
    price: 3.99,
    quantity: 1,
  },
  {
    id: "item3",
    order_id: "523c961a-9f2e-49ed-af76-2ad575972a56",
    product_id: "6",
    name: "Soda",
    price: 2.99,
    quantity: 2,
  },
  {
    id: "item4",
    order_id: "order2",
    product_id: "4",
    name: "Margherita Pizza",
    price: 12.99,
    quantity: 1,
  },
  {
    id: "item5",
    order_id: "order2",
    product_id: "5",
    name: "Pepperoni Pizza",
    price: 14.99,
    quantity: 2,
  },
  {
    id: "item6",
    order_id: "order2",
    product_id: "7",
    name: "Water",
    price: 1.99,
    quantity: 1,
  },
];

type Order = {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_type: string;
  created_at: string;
  user: { name: string };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(dummyOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [dateTo, setDateTo] = useState<Date | null>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    // Search by order ID or order number
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by status
    const matchesStatus = statusFilter ? order.status === statusFilter : true;

    // Filter by payment type
    const matchesPayment = paymentFilter
      ? order.payment_type === paymentFilter
      : true;

    // Filter by date range
    const orderDate = new Date(order.created_at);
    const matchesDateFrom = dateFrom ? orderDate >= dateFrom : true;
    const matchesDateTo = dateTo
      ? orderDate <= new Date(dateTo.setHours(23, 59, 59, 999))
      : true;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPayment &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    setOrders(
      orders.map((order) => (order.id === id ? { ...order, status } : order))
    );
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

  const getOrderItems = (orderId: string) => {
    return dummyOrderItems.filter((item) => item.order_id === orderId);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter(null);
    setPaymentFilter(null);
    setDateFrom(new Date(new Date().setDate(new Date().getDate() - 30)));
    setDateTo(new Date());
  };

  // Order Card Component for mobile view
  const OrderCard = ({ order }: { order: Order }) => (
    <Card key={order.id}>
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
                  disabled={order.status === "OPEN"}
                >
                  Mark as Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "PAID")}
                  disabled={order.status === "PAID"}
                >
                  Mark as Paid
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                  disabled={order.status === "CANCELLED"}
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
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-6">
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by order ID"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <Select
            value={statusFilter || ""}
            onValueChange={(value) => setStatusFilter(value || null)}
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
            value={paymentFilter || ""}
            onValueChange={(value) => setPaymentFilter(value || null)}
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    #{order.order_number}
                  </TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.user.name}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>{order.payment_type}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                          disabled={order.status === "OPEN"}
                        >
                          Mark as Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order.id, "PAID")}
                          disabled={order.status === "PAID"}
                        >
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateStatus(order.id, "CANCELLED")
                          }
                          disabled={order.status === "CANCELLED"}
                          className="text-red-600"
                        >
                          Cancel Order
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
        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent
          className="max-w-md"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Date:</div>
                <div>{new Date(selectedOrder.created_at).toLocaleString()}</div>

                <div className="text-muted-foreground">Staff:</div>
                <div>{selectedOrder.user.name}</div>

                <div className="text-muted-foreground">Payment:</div>
                <div>{selectedOrder.payment_type}</div>

                <div className="text-muted-foreground">Status:</div>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="space-y-1">
                  {getOrderItems(selectedOrder.id).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} x {item.name}
                      </span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span>
                    {formatCurrency(selectedOrder.total_amount / 1.1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%):</span>
                  <span>
                    {formatCurrency(
                      selectedOrder.total_amount -
                        selectedOrder.total_amount / 1.1
                    )}
                  </span>
                </div>
                <div className="flex justify-between font-medium mt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
