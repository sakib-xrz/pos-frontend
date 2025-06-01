/* eslint-disable @next/next/no-img-element */
"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useGetOrderQuery } from "@/redux/features/order/orderApi";
import { useGetSettingsQuery } from "@/redux/features/settings/settingsApi";

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const { data: orderResponse, isLoading: isOrderLoading } = useGetOrderQuery(
    orderId,
    {
      skip: !orderId,
    }
  );
  const order = orderResponse?.data;

  const { data: settingsResponse } = useGetSettingsQuery(undefined, {
    skip: !orderId,
  });
  const settings = settingsResponse?.data;

  const handlePrint = () => {
    window.print();
  };

  if (isOrderLoading) {
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

  const subtotal =
    order.order_items?.reduce(
      (total: number, item: any) =>
        total + Number.parseFloat(item.price) * item.quantity,
      0
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-100 py-4 print:bg-white print:py-0">
      {/* Navigation - Hidden on print */}
      <div className="mb-4 px-4 print:hidden">
        <Link href="/staff/pos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to POS
          </Button>
        </Link>
      </div>

      {/* Receipt Container */}
      <div className="mx-auto max-w-[320px] bg-white shadow-lg print:shadow-none print:max-w-none">
        {/* Receipt Paper */}
        <div className="receipt-paper font-mono text-xs leading-tight p-4 print:p-2">
          {/* Header */}
          <div className="text-center mb-3">
            {settings?.show_logo_on_receipt && settings?.logo_url && (
              <div className="mb-2">
                <img
                  src={settings.logo_url || "/placeholder.svg"}
                  alt={settings.display_name || "Restaurant Logo"}
                  className="h-12 w-auto mx-auto"
                />
              </div>
            )}
            <div className="font-bold text-sm uppercase tracking-wide">
              {settings?.display_name || "RESTAURANT NAME"}
            </div>
            <div className="text-[10px] mt-1 leading-tight">
              {settings?.address || "123 Main Street, City"}
            </div>
            <div className="text-[10px]">
              TEL: {settings?.phone_number || "(123) 456-7890"}
            </div>
          </div>

          {/* Dashed line separator */}
          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Order Info */}
          <div className="mb-3 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span>ORDER#:</span>
              <span>{order.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span>TIME:</span>
              <span>{new Date(order.created_at).toLocaleTimeString()}</span>
            </div>
            {order.table_number && (
              <div className="flex justify-between">
                <span>TABLE:</span>
                <span>{order.table_number}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>CASHIER:</span>
              <span>{order.user?.name || "STAFF"}</span>
            </div>
          </div>

          {/* Dashed line separator */}
          <div className="border-t border-dashed border-gray-400 my-2"></div>

          {/* Items Table */}
          <div className="mb-3">
            {/* Table Header */}
            <div className="text-[9px] font-bold uppercase border-b border-dashed border-gray-400 pb-1 mb-2">
              <div className="grid grid-cols-12 gap-1">
                <div className="col-span-5">ITEM</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-right">UNIT</div>
                <div className="col-span-3 text-right">TOTAL</div>
              </div>
            </div>

            {/* Table Rows */}
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="mb-1">
                <div className="grid grid-cols-12 gap-1 text-[10px] items-center">
                  <div className="col-span-5 uppercase leading-tight">
                    {item.product?.name || "UNKNOWN ITEM"}
                  </div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-right">
                    {formatCurrency(Number.parseFloat(item.price), false)}
                  </div>
                  <div className="col-span-3 text-right font-medium">
                    {formatCurrency(
                      Number.parseFloat(item.price) * item.quantity,
                      false
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mb-3 text-[11px] space-y-1">
            <div className="border-t border-dashed border-gray-400 my-1"></div>
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[10px] mt-2">
              <span>PAYMENT:</span>
              <span>{order.payment_type}</span>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2"></div>
              <div className="mb-3 text-[10px]">
                <div className="font-medium">NOTE:</div>
                <div className="mt-1">{order.note}</div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <div className="text-center text-[10px] leading-tight">
            <div className="mb-1">
              {settings?.receipt_footer_text || "THANK YOU FOR YOUR BUSINESS!"}
            </div>
            <div className="text-[9px] text-gray-500">PLEASE COME AGAIN</div>
          </div>
        </div>
      </div>

      {/* Print Button - Hidden on print */}
      <div className="mt-4 px-4 print:hidden flex justify-center">
        <Button onClick={handlePrint} className="w-full max-w-[320px]">
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
      </div>

      <style jsx>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .receipt-paper {
            width: 80mm;
            margin: 0;
            padding: 5mm;
            font-size: 10px;
          }
        }

        .receipt-paper {
          background: linear-gradient(
            to bottom,
            #ffffff 0%,
            #ffffff 98%,
            #f5f5f5 100%
          );
          position: relative;
        }

        .receipt-paper::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: repeating-linear-gradient(
            to right,
            transparent 0px,
            transparent 3px,
            #ddd 3px,
            #ddd 6px
          );
        }
      `}</style>
    </div>
  );
}
