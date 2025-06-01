"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store, Users, TrendingUp } from "lucide-react";
import {
  useGetSuperAdminStatsQuery,
  useGetRecentShopRegistrationsQuery,
} from "@/redux/features/stats/statsApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function SuperAdminDashboardPage() {
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetSuperAdminStatsQuery(
    {},
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const {
    data: recentShopsData,
    isLoading: recentShopsLoading,
    error: recentShopsError,
  } = useGetRecentShopRegistrationsQuery(
    { limit: 2 },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const stats = statsData?.data;
  const recentShops = recentShopsData?.data || [];

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of all shops and system metrics
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : statsError ? (
              <div className="text-destructive">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.total_shops || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.shops_change
                    ? stats.shops_change > 0
                      ? `+${stats.shops_change}`
                      : stats.shops_change
                    : "0"}{" "}
                  from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : statsError ? (
              <div className="text-destructive">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.active_shops || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.active_rate || 0}% active rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : statsError ? (
              <div className="text-destructive">Error loading data</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.total_users || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.users_change
                    ? stats.users_change > 0
                      ? `+${stats.users_change}`
                      : stats.users_change
                    : "0"}{" "}
                  from last month
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Shop Registrations</CardTitle>
            <CardDescription>Latest shops added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            {recentShopsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </div>
                ))}
              </div>
            ) : recentShopsError ? (
              <div className="text-destructive">Error loading recent shops</div>
            ) : recentShops.length > 0 ? (
              <div className="space-y-2">
                {recentShops.map((shop: any) => (
                  <div key={shop.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {shop.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {shop.branch_name || "Main Branch"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">{shop.time_ago}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">
                No recent registrations
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Overview of subscription plans</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : statsError ? (
              <div className="text-destructive">
                Error loading subscription data
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">One Month</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.subscription_breakdown?.ONE_MONTH || 0} shops
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Six Months</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.subscription_breakdown?.SIX_MONTHS || 0} shops
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">One Year</span>
                  <span className="text-sm text-muted-foreground">
                    {stats?.subscription_breakdown?.ONE_YEAR || 0} shops
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
