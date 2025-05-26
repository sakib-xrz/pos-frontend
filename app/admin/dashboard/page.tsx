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
} from "lucide-react";

// Dummy data
const salesData = [
  { name: "Mon", total: 1200 },
  { name: "Tue", total: 1800 },
  { name: "Wed", total: 2200 },
  { name: "Thu", total: 1800 },
  { name: "Fri", total: 2400 },
  { name: "Sat", total: 3200 },
  { name: "Sun", total: 2800 },
];

const categoryData = [
  { name: "Burgers", value: 35 },
  { name: "Pizza", value: 25 },
  { name: "Drinks", value: 20 },
  { name: "Sides", value: 15 },
  { name: "Desserts", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function DashboardPage() {
  const chartConfig = {
    total: {
      label: "Revenue",
      color: "hsl(var(--chart-3))",
    },
  };

  const pieChartConfig = {
    value: {
      label: "Percentage",
    },
    burgers: {
      label: "Burgers",
      color: "#0088FE",
    },
    pizza: {
      label: "Pizza",
      color: "#00C49F",
    },
    drinks: {
      label: "Drinks",
      color: "#FFBB28",
    },
    sides: {
      label: "Sides",
      color: "#FF8042",
    },
    desserts: {
      label: "Desserts",
      color: "#8884D8",
    },
  };

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
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between space-x-2 sm:space-x-4">
              <div className="flex flex-col space-y-1 min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  Total Revenue
                </span>
                <span className="text-lg sm:text-xl md:text-2xl font-bold">
                  {formatCurrency(14500)}
                </span>
              </div>
              <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
              <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-green-500 font-medium">12%</span>
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
                  324
                </span>
              </div>
              <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
              <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-green-500 font-medium">8%</span>
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
                  {formatCurrency(44.75)}
                </span>
              </div>
              <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
              <ArrowUpRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-green-500 font-medium">3%</span>
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
                  8
                </span>
              </div>
              <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center pt-3 sm:pt-4 text-xs sm:text-sm">
              <ArrowDownRight className="mr-1 h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span className="text-red-500 font-medium">1</span>
              <span className="ml-1 text-muted-foreground truncate">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
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
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Weekly Sales</CardTitle>
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
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={(value) => `$${value}`}
                        tick={{ fontSize: 12 }}
                      />
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [`$${value}`, " Revenue"]}
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
        </TabsContent>

        <TabsContent value="categories" className="space-y-2">
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
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => {
                          // Hide labels on very small screens
                          if (window.innerWidth < 640) {
                            return "";
                          }
                          return `${name}: ${(percent * 100).toFixed(0)}%`;
                        }}
                        outerRadius="80%"
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip
                        content={
                          <ChartTooltipContent
                            formatter={(value) => [`${value}%`, "Percentage"]}
                          />
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Legend for mobile */}
              <div className="flex flex-wrap gap-2 mb-3 justify-center sm:hidden">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
