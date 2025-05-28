"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useGetSummaryQuery,
  useGetWeeklyRevenueQuery,
  useGetCategorySalesQuery,
} from "@/redux/features/stats/statsApi";
import { useMemo } from "react";
import useDesktop from "@/hooks/use-desktop";

// Generate colors dynamically
const generateColors = (count: number) => {
  const baseColors = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff88",
    "#8dd1e1",
  ];
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

export default function DashboardPage() {
  // Add the useDesktop hook to detect screen size
  const isDesktop = useDesktop(640); // Using 640px as the breakpoint (sm breakpoint)

  // API calls
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useGetSummaryQuery({});
  const {
    data: weeklyRevenueData,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useGetWeeklyRevenueQuery({});
  const {
    data: categorySalesData,
    isLoading: categoryLoading,
    error: categoryError,
  } = useGetCategorySalesQuery({});

  // Transform summary data to match expected format
  const transformedSummaryData = useMemo(() => {
    if (!summaryData?.data) return null;

    return {
      totalRevenue: summaryData.data.total_revenue,
      revenueGrowth: summaryData.data.revenue_change,
      totalOrders: summaryData.data.total_orders,
      ordersGrowth: summaryData.data.orders_change,
      avgOrderValue: summaryData.data.average_order_value,
      avgOrderGrowth: summaryData.data.avg_order_change,
      activeStaff: summaryData.data.active_staff,
      staffGrowth: summaryData.data.staff_change,
    };
  }, [summaryData]);

  // Transform weekly data to match chart format
  const transformedWeeklyData = useMemo(() => {
    if (!weeklyRevenueData?.data) return [];

    return weeklyRevenueData.data.map((item: any) => ({
      name: item.day,
      total: item.total,
    }));
  }, [weeklyRevenueData]);

  // Generate dynamic colors and pieChartConfig based on category data
  const { dynamicColors, pieChartConfig } = useMemo(() => {
    if (!categorySalesData?.data?.length) {
      return { dynamicColors: [], pieChartConfig: {} };
    }

    const colors = generateColors(categorySalesData.data.length);
    const config: Record<string, any> = {
      value: {
        label: "Percentage",
      },
    };

    categorySalesData.data.forEach((category: any, index: number) => {
      if (category?.category) {
        const key = category.category.toLowerCase().replace(/\s+/g, "");
        config[key] = {
          label: category.category,
          color: colors[index],
        };
      }
    });

    return { dynamicColors: colors, pieChartConfig: config };
  }, [categorySalesData]);

  const chartConfig = {
    total: {
      label: "Revenue",
      color: "hsl(var(--chart-3))",
    },
  };

  // Loading component
  const LoadingCard = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </CardContent>
    </Card>
  );

  // Error component
  const ErrorCard = () => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-6 flex items-center justify-center h-32">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load data</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-2 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-1 sm:space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Dashboard
          </h1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        ) : summaryError ? (
          <>
            <ErrorCard />
            <ErrorCard />
            <ErrorCard />
            <ErrorCard />
          </>
        ) : (
          <>
            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      Total Revenue
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {formatCurrency(
                        transformedSummaryData?.totalRevenue || 0
                      )}
                    </span>
                  </div>
                  <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
                  {(transformedSummaryData?.revenueGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${(transformedSummaryData?.revenueGrowth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Math.abs(transformedSummaryData?.revenueGrowth || 0)}%
                  </span>
                  <span className="ml-1 text-muted-foreground truncate">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      Total Orders
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {transformedSummaryData?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
                  {(transformedSummaryData?.ordersGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${(transformedSummaryData?.ordersGrowth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Math.abs(transformedSummaryData?.ordersGrowth || 0)}%
                  </span>
                  <span className="ml-1 text-muted-foreground truncate">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      Avg. Order Value
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {formatCurrency(
                        transformedSummaryData?.avgOrderValue || 0
                      )}
                    </span>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
                  {(transformedSummaryData?.avgOrderGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${(transformedSummaryData?.avgOrderGrowth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Math.abs(transformedSummaryData?.avgOrderGrowth || 0)}%
                  </span>
                  <span className="ml-1 text-muted-foreground truncate">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                  <div className="flex flex-col space-y-1 min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                      Active Staff
                    </span>
                    <span className="text-lg sm:text-xl md:text-2xl font-bold">
                      {transformedSummaryData?.activeStaff || 0}
                    </span>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                </div>
                <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
                  {(transformedSummaryData?.staffGrowth || 0) >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${(transformedSummaryData?.staffGrowth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {Math.abs(transformedSummaryData?.staffGrowth || 0)}
                  </span>
                  <span className="ml-1 text-muted-foreground truncate">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="sales" className="space-y-2">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger
            value="sales"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Sales Overview
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="text-xs sm:text-sm py-2 sm:py-2.5"
          >
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-2">
          {weeklyLoading ? (
            <LoadingCard />
          ) : weeklyError ? (
            <ErrorCard />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Weekly Sales
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Sales performance for the current week
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4 md:pl-2">
                <div className="overflow-hidden">
                  <ChartContainer
                    config={chartConfig}
                    className="h-auto w-full sm:h-[300px] md:h-[350px]"
                  >
                    <ResponsiveContainer height="100%">
                      <BarChart data={transformedWeeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          interval={0}
                        />
                        <YAxis
                          tickFormatter={(value) => `BDT ${value}`}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) => [
                                `BDT ${value}`,
                                " Revenue",
                              ]}
                            />
                          }
                        />
                        <Bar
                          dataKey="total"
                          fill="var(--color-total)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-2">
          {categoryLoading ? (
            <LoadingCard />
          ) : categoryError ? (
            <ErrorCard />
          ) : (
            <Card className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Sales by Category
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Distribution of sales across product categories
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 sm:p-4">
                <div className="overflow-hidden">
                  <ChartContainer
                    config={pieChartConfig}
                    className="h-auto w-full sm:h-[300px] md:h-[350px]"
                  >
                    <ResponsiveContainer height="100%">
                      <PieChart>
                        <Pie
                          data={categorySalesData?.data || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) => {
                            if (!isDesktop) {
                              return "";
                            }
                            return `${category}: ${(percent * 100).toFixed(0)}%`;
                          }}
                          outerRadius="80%"
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {(categorySalesData?.data || []).map(
                            (_entry: any, index: number) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={dynamicColors[index] || "#8884d8"}
                              />
                            )
                          )}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>

                {/* Legend for mobile */}
                <div className="flex flex-wrap gap-2 mb-3 justify-center sm:hidden">
                  {(categorySalesData?.data || []).map(
                    (category: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: dynamicColors[index] || "#8884d8",
                          }}
                        />
                        <span className="text-xs text-muted-foreground truncate">
                          {category.category}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
