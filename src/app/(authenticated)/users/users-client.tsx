'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { updateUserRole, removeUserFromLibrary } from '@/lib/actions/users';
import { Profile, Library } from '@/lib/types';
import { Users, Edit, X } from 'lucide-react';
import { format } from 'date-fns';

interface UsersClientProps {
    initialUsers: (Profile & { libraries?: { name: string } | null })[];
    allLibraries: Library[];
}

export function UsersClient({ initialUsers, allLibraries }: UsersClientProps) {
    const [users, setUsers] = useState(initialUsers);
    const [editingUser, setEditingUser] = useState<Profile | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedLibraryId, setSelectedLibraryId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEditUser = (user: Profile) => {
        setEditingUser(user);
        setSelectedRole(user.role);
        setSelectedLibraryId(user.library_id || '');
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;

        setIsLoading(true);
        try {
            await updateUserRole(
                editingUser.id,
                selectedRole,
                selectedLibraryId || null
            );
            toast.success('User updated successfully');
            setEditingUser(null);
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFromLibrary = async (userId: string) => {
        if (!confirm('Remove user from their library? They will be set to default librarian role.')) return;

        try {
            await removeUserFromLibrary(userId);
            toast.success('User removed from library');
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove user');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'system_operator':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'library_admin':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">User Management</h1>
                <p className="text-muted-foreground">Manage all users across libraries</p>
            </div>

            {users.length === 0 ? (
                <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No users yet</h3>
                    <p className="text-muted-foreground">Users appear here when they sign up</p>
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Library</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.email}</TableCell>
                                <TableCell>{user.name || '-'}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.libraries?.name || (
                                        <span className="text-muted-foreground">Unassigned</span>
                                    )}
                                </TableCell>
                                <TableCell>{format(new Date(user.created_at), 'MMM d, yyyy')}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleEditUser(user)}
                                            title="Edit user"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {user.library_id && user.role !== 'system_operator' && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => handleRemoveFromLibrary(user.id)}
                                                className="text-destructive hover:text-destructive"
                                                title="Remove from library"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Update role and library assignment for {editingUser?.email}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            >
                                <option value="librarian">Librarian</option>
                                <option value="library_admin">Library Admin</option>
                                <option value="system_operator">System Operator</option>
                            </select>
                        </div>
                        
                        {selectedRole !== 'system_operator' && (
                            <div className="grid gap-2">
                                <Label htmlFor="library">Assigned Library</Label>
                                <select
                                    id="library"
                                    value={selectedLibraryId}
                                    onChange={(e) => setSelectedLibraryId(e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                >
                                    <option value="">No library assigned</option>
                                    {allLibraries.map((library) => (
                                        <option key={library.id} value={library.id}>
                                            {library.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveUser} disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
