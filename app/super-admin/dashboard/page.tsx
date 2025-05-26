"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Users, DollarSign, TrendingUp } from "lucide-react";

export default function SuperAdminDashboardPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all shops and system metrics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">91.7% active rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Shop Registrations</CardTitle>
            <CardDescription>Latest shops added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Pizza Palace
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Downtown Branch
                  </p>
                </div>
                <div className="ml-auto font-medium">2 days ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Burger King
                  </p>
                  <p className="text-sm text-muted-foreground">Mall Branch</p>
                </div>
                <div className="ml-auto font-medium">5 days ago</div>
              </div>
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Coffee Corner
                  </p>
                  <p className="text-sm text-muted-foreground">Main Street</p>
                </div>
                <div className="ml-auto font-medium">1 week ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Overview of subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">One Month</span>
                <span className="text-sm text-muted-foreground">8 shops</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Six Months</span>
                <span className="text-sm text-muted-foreground">10 shops</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">One Year</span>
                <span className="text-sm text-muted-foreground">6 shops</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
