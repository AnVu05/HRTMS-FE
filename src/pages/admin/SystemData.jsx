import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockUsers } from '@/mock/adminMockData';
import { useQuery } from '@tanstack/react-query';
import adminApi from '@/api/adminApi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const userFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  status: z.string().optional(),
});

function UserFormDialog({ mode, initialData, trigger }) {
  const isEdit = mode === 'edit';
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: initialData?.username || "",
      email: initialData?.email || "",
      password: initialData?.password || "",
      role: initialData?.role || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  const onSubmit = (data) => {
    console.log(isEdit ? "Update user data:" : "Create user data:", data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details and role for this user account." : "Enter the details to create a new user account."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Username</Label>
            <div className="col-span-3">
              <Input id="username" {...form.register("username")} />
              {form.formState.errors.username && <p className="text-sm text-red-500 mt-1">{form.formState.errors.username.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <div className="col-span-3">
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-sm text-red-500 mt-1">{form.formState.errors.email.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">Password</Label>
            <div className="col-span-3">
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  {...form.register("password")} 
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-sm text-red-500 mt-1">{form.formState.errors.password.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">Role</Label>
            <div className="col-span-3">
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">ADMIN</SelectItem>
                      <SelectItem value="DOCTOR">DOCTOR</SelectItem>
                      <SelectItem value="REFEREE">REFEREE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && <p className="text-sm text-red-500 mt-1">{form.formState.errors.role.message}</p>}
            </div>
          </div>
          {isEdit && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Controller
                  name="status"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                        <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
              {isEdit ? "Update Account" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const raceFormatSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  entryFee: z.string().optional(),
  firstPrizePercent: z.string().optional(),
  secondPrizePercent: z.string().optional(),
  thirdPrizePercent: z.string().optional(),
  allowedBreed: z.string().optional(),
  allowedHorseAge: z.string().optional(),
  minJockeyExperience: z.string().optional(),
  minWeight: z.string().optional(),
  maxWeight: z.string().optional(),
  baseWeight: z.string().optional(),
  applyFemaleAllowance: z.string().optional(),
  status: z.string().optional(),
});

function RaceFormatFormDialog({ mode, initialData, trigger }) {
  const isEdit = mode === 'edit';
  const form = useForm({
    resolver: zodResolver(raceFormatSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      entryFee: initialData?.entryFee?.toString() || "",
      firstPrizePercent: initialData?.firstPrizePercent?.toString() || "",
      secondPrizePercent: initialData?.secondPrizePercent?.toString() || "",
      thirdPrizePercent: initialData?.thirdPrizePercent?.toString() || "",
      allowedBreed: initialData?.allowedBreed || "",
      allowedHorseAge: initialData?.allowedHorseAge || "",
      minJockeyExperience: initialData?.minJockeyExperience?.toString() || "",
      minWeight: initialData?.minWeight?.toString() || "",
      maxWeight: initialData?.maxWeight?.toString() || "",
      baseWeight: initialData?.baseWeight?.toString() || "",
      applyFemaleAllowance: initialData?.applyFemaleAllowance?.toString() || "",
      status: initialData?.status || "ACTIVE",
    },
  });

  const onSubmit = (data) => {
    console.log(isEdit ? "Update race format data:" : "Create race format data:", data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Update Race Format" : "Create New Race Format"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details for this race format." : "Enter the details to create a new race format. Status will be set to ACTIVE by default."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="entryFee">Entry Fee</Label>
            <Input id="entryFee" type="number" {...form.register("entryFee")} />
          </div>
          <div className="flex flex-col gap-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="firstPrizePercent">First Prize (%)</Label>
            <Input id="firstPrizePercent" type="number" {...form.register("firstPrizePercent")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="secondPrizePercent">Second Prize (%)</Label>
            <Input id="secondPrizePercent" type="number" {...form.register("secondPrizePercent")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="thirdPrizePercent">Third Prize (%)</Label>
            <Input id="thirdPrizePercent" type="number" {...form.register("thirdPrizePercent")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowedBreed">Allowed Breed</Label>
            <Controller
              name="allowedBreed"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="allowedBreed">
                    <SelectValue placeholder="Select breed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Thoroughbred">Thoroughbred</SelectItem>
                    <SelectItem value="Quarter">Quarter</SelectItem>
                    <SelectItem value="Standardbred">Standardbred</SelectItem>
                    <SelectItem value="Arabian">Arabian</SelectItem>
                    <SelectItem value="Appaloosa">Appaloosa</SelectItem>
                    <SelectItem value="Paint">Paint</SelectItem>
                    <SelectItem value="Orlov Trotter">Orlov Trotter</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="allowedHorseAge">Allowed Horse Age</Label>
            <Input id="allowedHorseAge" {...form.register("allowedHorseAge")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="minJockeyExperience">Min Jockey Exp (years)</Label>
            <Input id="minJockeyExperience" type="number" {...form.register("minJockeyExperience")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="minWeight">Min Weight (kg)</Label>
            <Input id="minWeight" type="number" {...form.register("minWeight")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="maxWeight">Max Weight (kg)</Label>
            <Input id="maxWeight" type="number" {...form.register("maxWeight")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="baseWeight">Base Weight (kg)</Label>
            <Input id="baseWeight" type="number" {...form.register("baseWeight")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="applyFemaleAllowance">Female Allowance (kg)</Label>
            <Input id="applyFemaleAllowance" type="number" step="0.1" {...form.register("applyFemaleAllowance")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            {isEdit ? (
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input id="status" {...form.register("status")} disabled />
            )}
          </div>
          <DialogFooter className="col-span-2 mt-4">
            <Button type="submit" className="bg-[#f59e0b] hover:bg-[#d97706] text-white w-full sm:w-auto">
              {isEdit ? "Update Format" : "Create Format"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SystemData() {
  const { data: raceFormats = [], isLoading: loadingFormats } = useQuery({
    queryKey: ['raceFormats'],
    queryFn: adminApi.getRaceFormats
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Data Management</h2>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="raceFormats">Race Formats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Users</CardTitle>
              <UserFormDialog 
                mode="create"
                trigger={
                  <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Create User
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.status}</TableCell>
                      <TableCell>
                        <UserFormDialog 
                          mode="edit"
                          initialData={u}
                          trigger={
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={!['ADMIN', 'DOCTOR', 'REFEREE'].includes(u.role)}
                            >
                              Edit Role
                            </Button>
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="raceFormats">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Race Formats</CardTitle>
              <RaceFormatFormDialog 
                mode="create"
                trigger={
                  <Button className="bg-[#f59e0b] hover:bg-[#d97706] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Format
                  </Button>
                }
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingFormats ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Loading...</TableCell>
                    </TableRow>
                  ) : raceFormats.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell>{f.id}</TableCell>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>{f.description}</TableCell>
                      <TableCell>
                        <Badge variant={f.status === 'ACTIVE' ? 'default' : f.status === 'INACTIVE' ? 'secondary' : 'destructive'}>
                          {f.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <RaceFormatFormDialog 
                            mode="edit"
                            initialData={f}
                            trigger={<Button variant="outline" size="sm" disabled={f.status !== 'ACTIVE'}>Edit</Button>}
                          />
                          <Button variant="destructive" size="sm" disabled={f.status === 'DELETE'}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
