"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Dummy order data
const dummyOrder = {
  id: "order123",
  total_amount: 32.97,
  status: "PAID",
  payment_type: "CASH",
  table_number: "12",
  note: "No onions please",
  created_by: "user-id",
  created_at: "2023-05-23T12:34:56Z",
  order_items: [
    {
      id: "item1",
      product_id: "1",
      name: "Cheeseburger",
      price: 8.99,
      quantity: 2,
    },
    {
      id: "item2",
      product_id: "8",
      name: "French Fries",
      price: 3.99,
      quantity: 1,
    },
    { id: "item3", product_id: "6", name: "Soda", price: 2.99, quantity: 2 },
  ],
};

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch order
    const fetchOrder = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOrder(dummyOrder);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Loading receipt...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg">Order not found</div>
          <Link href="/staff/pos">
            <Button className="mt-4">Back to POS</Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = order.order_items.reduce(
    (total: number, item: any) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <div className="mb-4 print:hidden">
        <Link href="/staff/pos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to POS
          </Button>
        </Link>
      </div>

      <Card className="border-2">
        <CardHeader className="text-center border-b">
          <CardTitle>Receipt</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Restaurant Name</h2>
            <p className="text-sm text-muted-foreground">
              123 Main Street, City
            </p>
            <p className="text-sm text-muted-foreground">Tel: (123) 456-7890</p>
          </div>

          <div className="mb-6 text-sm">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span>{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{new Date(order.created_at).toLocaleString()}</span>
            </div>
            {order.table_number && (
              <div className="flex justify-between">
                <span>Table:</span>
                <span>{order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Payment:</span>
              <span>{order.payment_type}</span>
            </div>
          </div>

          <div className="border-t border-b py-4 mb-4">
            <div className="font-medium mb-2">Items</div>
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm py-1">
                <span>
                  {item.quantity} x {item.name}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {order.note && (
            <div className="mt-4 text-sm">
              <div className="font-medium">Note:</div>
              <div className="text-muted-foreground">{order.note}</div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Thank you for your order!</p>
            <p>Please come again</p>
          </div>
        </CardContent>
        <CardFooter className="print:hidden">
          <Button onClick={handlePrint} className="w-full">
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
