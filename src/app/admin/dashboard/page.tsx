'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { useAuth } from '@/components/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Users, 
  FileText, 
  Heart, 
  MessageCircle, 
  Upload, 
  Trash2,
  CheckCircle,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';
import { getPoetryData, deletePoetryById } from '@/lib/data';
import { getRequests, updateRequestStatus, deleteRequestById } from '@/lib/requests';
import { getAllUsers } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import type { Poetry, PoemRequest, User as UserDoc } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, userDoc, loading, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [poems, setPoems] = useState<Poetry[]>([]);
  const [requests, setRequests] = useState<PoemRequest[]>([]);
  const [users, setUsers] = useState<UserDoc[]>([]);
  const [stats, setStats] = useState({
    totalPoems: 0,
    totalUsers: 0,
    pendingRequests: 0,
    completedRequests: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      const [poemsData, requestsData, usersData] = await Promise.all([
        getPoetryData(),
        getRequests(),
        getAllUsers(),
      ]);

      setPoems(poemsData);
      setRequests(requestsData);
      setUsers(usersData);

      // Calculate stats
      const totalLikes = poemsData.reduce((sum, poem) => sum + (poem.likes?.length || 0), 0);
      const totalComments = poemsData.reduce((sum, poem) => sum + (poem.commentsCount || poem.comments?.length || 0), 0);
      const pendingRequests = requestsData.filter(req => !req.completed).length;
      const completedRequests = requestsData.filter(req => req.completed).length;

      setStats({
        totalPoems: poemsData.length,
        totalUsers: usersData.length,
        pendingRequests,
        completedRequests,
        totalLikes,
        totalComments,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  const handleDeletePoem = async (poemId: string, poemTitle: string) => {
    try {
      await deletePoetryById(poemId);
      await loadAdminData();
      toast({
        title: 'Poem deleted',
        description: `"${poemTitle}" has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete the poem. Please try again.',
      });
    }
  };

  const handleToggleRequestStatus = async (requestId: string, completed: boolean) => {
    try {
      await updateRequestStatus(requestId, completed);
      await loadAdminData();
      toast({
        title: 'Request updated',
        description: `Request has been marked as ${completed ? 'completed' : 'pending'}.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Failed to update request status. Please try again.',
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    try {
      await deleteRequestById(requestId);
      await loadAdminData();
      toast({
        title: 'Request deleted',
        description: 'Request has been deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: 'Failed to delete the request. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user || !userDoc || !isAdmin) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <Shield className="w-16 h-16 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-headline font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need admin privileges to access this page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container mx-auto px-4 py-8 pt-24"
      >
        <div className="max-w-6xl mx-auto">
          {/* Admin Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-headline font-bold mb-4">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage poems, users, and requests</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Poems</p>
                    <p className="text-3xl font-bold">{stats.totalPoems}</p>
                  </div>
                  <FileText className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                    <p className="text-3xl font-bold">{stats.pendingRequests}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                    <p className="text-3xl font-bold">{stats.totalLikes}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Comments</p>
                    <p className="text-3xl font-bold">{stats.totalComments}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold">{stats.completedRequests}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/admin/upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Poem
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/requests">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View All Requests
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Management Tabs */}
          <Tabs defaultValue="poems" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="poems">Poems Management</TabsTrigger>
              <TabsTrigger value="requests">Requests Management</TabsTrigger>
              <TabsTrigger value="users">Users Management</TabsTrigger>
            </TabsList>

            <TabsContent value="poems" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Poems</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Likes</TableHead>
                          <TableHead>Comments</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {poems.map((poem) => (
                          <TableRow key={poem.id}>
                            <TableCell className="font-medium">{poem.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{poem.genre}</Badge>
                            </TableCell>
                            <TableCell>{poem.likes?.length || 0}</TableCell>
                            <TableCell>{poem.commentsCount || poem.comments?.length || 0}</TableCell>
                            <TableCell>{format(new Date(poem.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Poem</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{poem.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePoem(poem.id, poem.title)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Poetry Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Requester</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Genre</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {requests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{request.name}</TableCell>
                            <TableCell>{request.topic}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{request.genre}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={request.completed ? 'default' : 'outline'}>
                                {request.completed ? 'Completed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleRequestStatus(request.id, !request.completed)}
                                >
                                  {request.completed ? 'Mark Pending' : 'Mark Complete'}
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Request</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this request? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteRequest(request.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.uid}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{format(new Date(user.createdAt), 'MMM d, yyyy')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </motion.main>
    </>
  );
}