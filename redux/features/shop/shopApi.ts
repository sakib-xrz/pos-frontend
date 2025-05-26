import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShops: builder.query({
      query: (params) => ({
        url: "/shops",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.shop],
    }),
    createShop: builder.mutation({
      query: (data) => ({
        url: "/shops",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.shop],
    }),
    updateSubscription: builder.mutation({
      query: ({ id, data }) => ({
        url: `/shops/${id}/subscription`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.shop],
    }),
    deleteShop: builder.mutation({
      query: (id) => ({
        url: `/shops/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.shop],
    }),
  }),
});

export const {
  useGetShopsQuery,
  useCreateShopMutation,
  useDeleteShopMutation,
  useUpdateSubscriptionMutation,
} = shopApi;
