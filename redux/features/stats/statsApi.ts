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
  }),
});

export const {
  useGetSummaryQuery,
  useGetWeeklyRevenueQuery,
  useGetCategorySalesQuery,
} = statsApi;
