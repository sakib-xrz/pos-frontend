import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.product],
    }),
    createProduct: build.mutation({
      query: (data) => ({
        url: "/products",
        method: "POST",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.product],
    }),
    updateProduct: build.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: "PATCH",
        body: data,
        formData: true,
      }),
      invalidatesTags: [tagTypes.product],
    }),
    updateProductAvailability: build.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}/availability`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [tagTypes.product],
    }),
    deleteProduct: build.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [tagTypes.product],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductAvailabilityMutation,
  useDeleteProductMutation,
} = productApi;
