"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormik } from "formik";
import {
  userSchema,
  editUserSchema,
  resetPasswordSchema,
} from "@/lib/validation-schemas";
import { sanitizeParams } from "@/lib/utils";
import {
  Plus,
  MoreHorizontal,
  Search,
  Edit,
  Trash,
  Key,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useResetPasswordMutation,
  useDeleteUserMutation,
} from "@/redux/features/user/userApi";
import { useDebounce } from "@/hooks/use-debounce";
import CustomPagination from "@/components/shared/custom-pagination";
import { toast } from "sonner";
import { useCurrentUser } from "@/redux/features/auth/authSlice";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export default function UsersPage() {
  const me = useCurrentUser();

  // Search and pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [roleFilter, setRoleFilter] = useState<string>("");

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build params for API call
  const params = {
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchQuery,
    role: roleFilter,
  };

  const {
    data: userData,
    isLoading,
    error,
  } = useGetUsersQuery(sanitizeParams(params));

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [resetPassword, { isLoading: isResettingPassword }] =
    useResetPasswordMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = userData?.data || [];
  const totalPages = userData?.meta?.total_pages || 1;
  const totalItems = userData?.meta?.total || 0;

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, roleFilter]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete?.id) {
      toast.error("Invalid user selected for deletion");
      return;
    }

    try {
      await deleteUser(userToDelete.id).unwrap();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      toast.success("User deleted successfully");
    } catch (error: any) {
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete user. Please try again.");
      }
      console.error("Delete user error:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const addFormik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "STAFF",
    },
    validationSchema: userSchema,
    onSubmit: async (values) => {
      try {
        await createUser(values).unwrap();
        setIsAddDialogOpen(false);
        addFormik.resetForm();
        toast.success("User created successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to create user. Please try again.");
        }
        console.error("Create user error:", error);
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: selectedUser?.name || "",
      email: selectedUser?.email || "",
      role: selectedUser?.role || "STAFF",
    },
    validationSchema: editUserSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!selectedUser?.id) {
        toast.error("Invalid user selected for update");
        return;
      }

      try {
        await updateUser({
          id: selectedUser.id,
          data: values,
        }).unwrap();
        setIsEditDialogOpen(false);
        setSelectedUser(null);
        editFormik.resetForm();
        toast.success("User updated successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to update user. Please try again.");
        }
        console.error("Update user error:", error);
      }
    },
  });

  const resetPasswordFormik = useFormik({
    initialValues: {
      new_password: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      if (!selectedUser?.id) {
        toast.error("Invalid user selected for password reset");
        return;
      }

      try {
        await resetPassword({
          id: selectedUser.id,
          data: { new_password: values.new_password },
        }).unwrap();
        setIsResetPasswordDialogOpen(false);
        resetPasswordFormik.resetForm();
        toast.success("Password reset successfully");
      } catch (error: any) {
        if (error?.data?.message) {
          toast.error(error.data.message);
        } else if (error?.message) {
          toast.error(error.message);
        } else {
          toast.error("Failed to reset password. Please try again.");
        }
        console.error("Reset password error:", error);
      }
    },
  });

  const isMe = (id: string) => {
    return me?.id === id;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return (
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-600 border-purple-200"
          >
            Admin
          </Badge>
        );
      case "STAFF":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200"
          >
            Staff
          </Badge>
        );
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Loading component
  const LoadingState = () => (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <span className="ml-2 text-muted-foreground">Loading users...</span>
    </div>
  );

  // Error component
  const ErrorState = () => (
    <div className="text-center py-8">
      <p className="text-red-500 mb-2">Failed to load users</p>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Try Again
      </Button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      {debouncedSearchQuery || roleFilter ? (
        <div>
          <p className="mb-2">No users found matching your filters</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setRoleFilter("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div>
          <p className="mb-2">No users found</p>
          <p className="text-sm">Create your first user to get started</p>
        </div>
      )}
    </div>
  );

  // User Card Component for mobile view
  const UserCard = ({ user }: { user: User }) => (
    <Card>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between w-full">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarImage
                src={`/placeholder.svg?height=80&width=80`}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-semibold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isMe(user.id)}>
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(user)}>
                  <Edit className="h-4 w-4" />
                  Edit User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                  <Key className="h-4 w-4" />
                  Reset Password
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteClick(user)}
                >
                  <Trash className="h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <h3 className="font-semibold text-base">{user.name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              {getRoleBadge(user.role)}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Joined</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="text-sm font-medium">
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground mt-1">
              {totalItems} user{totalItems !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <form onSubmit={addFormik.handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-2 py-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Full name"
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    value={addFormik.values.name}
                  />
                  {addFormik.touched.name && addFormik.errors.name && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.name}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    value={addFormik.values.email}
                  />
                  {addFormik.touched.email && addFormik.errors.email && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.email}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={addFormik.handleChange}
                    onBlur={addFormik.handleBlur}
                    value={addFormik.values.password}
                  />
                  {addFormik.touched.password && addFormik.errors.password && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.password}
                    </p>
                  )}
                </div>

                <div className="grid gap-1">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    name="role"
                    onValueChange={(value) =>
                      addFormik.setFieldValue("role", value)
                    }
                    defaultValue={addFormik.values.role}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  {addFormik.touched.role && addFormik.errors.role && (
                    <p className="text-sm text-red-500">
                      {addFormik.errors.role}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:justify-between mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={roleFilter || "all"}
            onValueChange={(value) =>
              setRoleFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="STAFF">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <ErrorState />
      ) : isLoading ? (
        <LoadingState />
      ) : users.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block border rounded-md bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={`/placeholder.svg?height=32&width=32`}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isMe(user.id)}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResetPassword(user)}
                          >
                            <Key className="h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash className="h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.map((user: any) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <CustomPagination
              params={{ page: currentPage }}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={editFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Make changes to the user details.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Full name"
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  value={editFormik.values.name}
                />
                {editFormik.touched.name && editFormik.errors.name && (
                  <p className="text-sm text-red-500">
                    {editFormik.errors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email address"
                  onChange={editFormik.handleChange}
                  onBlur={editFormik.handleBlur}
                  value={editFormik.values.email}
                />
                {editFormik.touched.email && editFormik.errors.email && (
                  <p className="text-sm text-red-500">
                    {editFormik.errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="role">Role</Label>
                <Select
                  name="role"
                  onValueChange={(value) =>
                    editFormik.setFieldValue("role", value)
                  }
                  defaultValue={editFormik.values.role}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                  </SelectContent>
                </Select>
                {editFormik.touched.role && editFormik.errors.role && (
                  <p className="text-sm text-red-500">
                    {editFormik.errors.role}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
      >
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <form onSubmit={resetPasswordFormik.handleSubmit}>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Reset password for {selectedUser?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 py-4">
              <div className="grid gap-1">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  name="new_password"
                  type="password"
                  placeholder="New password"
                  onChange={resetPasswordFormik.handleChange}
                  onBlur={resetPasswordFormik.handleBlur}
                  value={resetPasswordFormik.values.new_password}
                />
                {resetPasswordFormik.touched.new_password &&
                  resetPasswordFormik.errors.new_password && (
                    <p className="text-sm text-red-500">
                      {resetPasswordFormik.errors.new_password}
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isResettingPassword}>
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              user &quot;{userToDelete?.name}&quot; and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
