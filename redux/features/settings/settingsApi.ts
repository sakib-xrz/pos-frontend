import { baseApi } from "@/redux/api/baseApi";
import { tagTypes } from "@/redux/tagTypes";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/setting",
      providesTags: [tagTypes.settings],
    }),
    updateSettings: builder.mutation({
      query: (data) => ({
        url: "/setting",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [tagTypes.settings],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
