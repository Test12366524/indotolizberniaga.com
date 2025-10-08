import { apiSlice } from "../base-query";
import {
  Role,
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/types/admin/role";

export const roleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔍 Get All Role (with pagination)
    getRoleList: builder.query<
      {
        data: Role[];
        last_page: number;
        current_page: number;
        total: number;
        per_page: number;
      },
      { page: number; paginate: number }
    >({
      query: ({ page, paginate }) => ({
        url: `/role/roles`,
        method: "GET",
        params: {
          page,
          paginate,
        },
      }),
      transformResponse: (response: RoleResponse) => ({
        data: response.data.data,
        last_page: response.data.last_page,
        current_page: response.data.current_page,
        total: response.data.total,
        per_page: response.data.per_page,
      }),
    }),

    // 🔍 Get Simpanan Category by ID
    getRoleById: builder.query<Role, number>({
      query: (id) => ({
        url: `/role/roles/${id}`,
        method: "GET",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
    }),

    // ➕ Create Simpanan Category
    createRole: builder.mutation<
      Role,
      CreateRoleRequest
    >({
      query: (payload) => ({
        url: `/role/roles`,
        method: "POST",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
    }),

    // ✏️ Update Simpanan Category by ID
    updateRole: builder.mutation<
      Role,
      { id: number; payload: UpdateRoleRequest }
    >({
      query: ({ id, payload }) => ({
        url: `/role/roles/${id}`,
        method: "PUT",
        body: payload,
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: Role;
      }) => response.data,
    }),

    // ❌ Delete Simpanan Category by ID
    deleteRole: builder.mutation<
      { code: number; message: string },
      number
    >({
      query: (id) => ({
        url: `/role/roles/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: {
        code: number;
        message: string;
        data: null;
      }) => response,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoleListQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
