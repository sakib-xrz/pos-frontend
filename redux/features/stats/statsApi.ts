import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSummary: builder.query({
      query: () => ({
        url: "/stats/summary",
        method: "GET",
      }),
      providesTags: [tagTypes.stats],
    }),
    getWeeklyRevenue: builder.query({
      query: () => ({
        url: "/stats/weekly-sales",
        method: "GET",
      }),
      providesTags: [tagTypes.stats],
    }),
    getCategorySales: builder.query({
      query: () => ({
        url: "/stats/category-sales",
        method: "GET",
      }),
      providesTags: [tagTypes.stats],
    }),
    getSuperAdminStats: builder.query({
      query: () => ({
        url: "/stats/super-admin",
        method: "GET",
      }),
      providesTags: [tagTypes.stats],
    }),
    getRecentShopRegistrations: builder.query({
      query: ({ limit }: { limit: number }) => ({
        url: "/stats/recent-shops",
        method: "GET",
        params: { limit },
      }),
      providesTags: [tagTypes.stats],
    }),
  }),
});

export const {
  useGetSummaryQuery,
  useGetWeeklyRevenueQuery,
  useGetCategorySalesQuery,
  useGetSuperAdminStatsQuery,
  useGetRecentShopRegistrationsQuery,
} = statsApi;
