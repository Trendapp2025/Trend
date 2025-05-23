import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { queryClient } from "@/lib/queryClient";
import AppHeader from "@/components/app-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, User2, CoinsIcon, CirclePlus, Edit, Trash2, Check, X, Filter, RefreshCcw, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Asset, User } from "@shared/schema";

// Define admin-specific user type to match our mock data structure
type AdminUser = {
  id: number;
  username: string;
  password: string;
  isVerified: boolean;
  totalPredictions: number;
  accuratePredictions: number;
};

// Define admin-specific asset type to match our UI needs
type AdminAsset = Asset & {
  currentSentiment: string;
  currentPrediction: number;
};

type NewAssetData = {
  name: string;
  symbol: string;
  type: string;
  currentPrice: number;
};

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("userlist");
  const [assetFilter, setAssetFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // If user is not admin, redirect to home
  if (!user || user.username !== "admin") {
    return <Redirect to="/" />;
  }

  // This will be connected to a real API later
  const { data: assets, isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["admin", "assets"],
    queryFn: async () => {
      // Simulate API call to get all assets
      await new Promise(resolve => setTimeout(resolve, 800));
      const response = await fetch("/api/assets");
      return await response.json();
    },
  });

  // Connessione all'API reale per ottenere i dati degli utenti
  const { data: users, isLoading: usersLoading, isError: usersError } = useQuery<User[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      try {
        console.log("Iniziando richiesta per /api/admin/users");
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          console.error("Risposta non ok:", response.status, response.statusText);
          throw new Error(`Errore nel recupero degli utenti: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Dati utenti ricevuti:", data);
        return data;
      } catch (error) {
        console.error("Errore nel recupero degli utenti:", error);
        toast({
          variant: "destructive",
          title: "Errore",
          description: "Impossibile recuperare i dati degli utenti. Controlla la console per maggiori dettagli.",
        });
        throw error;
      }
    },
    retry: 1,
  });

  // Will connect to a real API later
  const addAssetMutation = useMutation({
    mutationFn: async (data: NewAssetData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
      toast({
        title: "Asset added successfully",
        description: "The new asset has been added to the database.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to add asset",
        description: "There was an error adding the asset. Please try again.",
      });
    }
  });

  // Will connect to a real API later
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: number) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
      toast({
        title: "Asset deleted",
        description: "The asset has been removed from the database.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to delete asset",
        description: "There was an error deleting the asset. Please try again.",
      });
    }
  });

  // Will connect to a real API later
  const toggleUserVerificationMutation = useMutation({
    mutationFn: async ({ userId, emailVerified }: { userId: number, emailVerified: boolean }) => {
      try {
        // Qui implementeremo la chiamata API effettiva più tardi
        // Per ora è ancora simulata
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
      } catch (error) {
        console.error("Errore nell'aggiornamento dello stato di verifica:", error);
        throw new Error("Failed to update user verification status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "User status updated",
        description: "The user's verification status has been updated.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: "There was an error updating the user. Please try again.",
      });
    }
  });

  // Filter assets based on type and search query
  const filteredAssets = assets?.filter(asset => {
    const matchesType = assetFilter === "all" || 
      (assetFilter === "crypto" && asset.type === "cryptocurrency") ||
      (assetFilter === "stock" && asset.type === "stock");
    
    const matchesSearch = searchQuery === "" || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Filter users based on verification status and search query
  const filteredUsers = users?.filter(user => {
    const matchesVerification = userFilter === "all" || 
      (userFilter === "verified" && user.emailVerified) ||
      (userFilter === "unverified" && !user.emailVerified);
    
    const matchesSearch = searchQuery === "" || 
      user.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesVerification && matchesSearch;
  });

  const handleAddAsset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newAsset: NewAssetData = {
      name: formData.get("name") as string,
      symbol: formData.get("symbol") as string,
      type: formData.get("type") as string,
      currentPrice: parseFloat(formData.get("currentPrice") as string),
    };
    
    addAssetMutation.mutate(newAsset);
    form.reset();
  };

  const handleDeleteAsset = (assetId: number) => {
    deleteAssetMutation.mutate(assetId);
  };

  const handleToggleUserVerification = (userId: number, currentStatus: boolean) => {
    toggleUserVerificationMutation.mutate({ userId, emailVerified: !currentStatus });
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "assets"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    toast({
      title: "Data refreshed",
      description: "The latest data has been loaded.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center">
                <Shield className="h-8 w-8 mr-2 text-primary" />
                {t("admin.dashboard")}
              </h1>
              <p className="text-muted-foreground">
                {t("admin.description")}
              </p>
            </div>
            <Button variant="outline" onClick={refreshData} className="flex items-center">
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t("admin.refresh_data")}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Tabs defaultValue="userlist" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="assets" className="flex items-center">
                  <CoinsIcon className="h-4 w-4 mr-2" />
                  {t("admin.assets_tab")}
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center">
                  <User2 className="h-4 w-4 mr-2" />
                  {t("admin.users_tab")}
                </TabsTrigger>
                <TabsTrigger value="userlist" className="flex items-center">
                  <User2 className="h-4 w-4 mr-2" />
                  {t("admin.userlist_tab")}
                </TabsTrigger>
              </TabsList>

              {/* Assets Tab */}
              <TabsContent value="assets">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Assets</CardTitle>
                        <CardDescription>
                          Manage the assets available on the platform
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex items-center">
                            <CirclePlus className="h-4 w-4 mr-2" />
                            Add Asset
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Asset</DialogTitle>
                            <DialogDescription>
                              Enter the details for the new asset to add to the platform.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleAddAsset}>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" name="name" className="col-span-3" required />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="symbol" className="text-right">Symbol</Label>
                                <Input id="symbol" name="symbol" className="col-span-3" required />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="type" className="text-right">Type</Label>
                                <Select name="type" defaultValue="stock">
                                  <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="stock">Stock</SelectItem>
                                    <SelectItem value="cryptocurrency">Cryptocurrency</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="currentPrice" className="text-right">Current Price</Label>
                                <Input id="currentPrice" name="currentPrice" type="number" step="0.01" min="0" className="col-span-3" required />
                              </div>
                            </div>
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit" disabled={addAssetMutation.isPending}>
                                {addAssetMutation.isPending ? "Adding..." : "Add Asset"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={assetFilter} onValueChange={setAssetFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="crypto">Cryptocurrencies</SelectItem>
                            <SelectItem value="stock">Stocks</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input 
                          placeholder="Search assets..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {assetsLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Symbol</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Sentiment</TableHead>
                              <TableHead>Prediction</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredAssets?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                  No assets found matching your filters.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredAssets?.map((asset) => (
                                <TableRow key={asset.id}>
                                  <TableCell className="font-medium">{asset.name}</TableCell>
                                  <TableCell>{asset.symbol}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">
                                      {asset.type === "cryptocurrency" ? "Crypto" : "Stock"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant={
                                        asset.sentiment === "positive" ? "default" :
                                        asset.sentiment === "negative" ? "destructive" : "secondary"
                                      }
                                    >
                                      {asset.sentiment || "neutral"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {asset.prediction && (
                                      <span className={
                                        parseFloat(asset.prediction) > 0 ? "text-green-500" : 
                                        parseFloat(asset.prediction) < 0 ? "text-red-500" : ""
                                      }>
                                        {parseFloat(asset.prediction) >= 0 ? "+" : ""}
                                        {parseFloat(asset.prediction).toFixed(2)}%
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500">
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              This will permanently remove {asset.name} ({asset.symbol}) from the platform. This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                              onClick={() => handleDeleteAsset(asset.id)}
                                              className="bg-red-500 text-white hover:bg-red-600"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredAssets?.length || 0} of {assets?.length || 0} assets
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Users</CardTitle>
                        <CardDescription>
                          Manage users and their permissions
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Select value={userFilter} onValueChange={setUserFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Filter users" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="verified">Verified Only</SelectItem>
                            <SelectItem value="unverified">Unverified Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                        <Input 
                          placeholder="Search users..." 
                          className="pl-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {usersLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>ID</TableHead>
                              <TableHead>Username</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Registrato il</TableHead>
                              <TableHead>Stato Email</TableHead>
                              <TableHead>Previsioni</TableHead>
                              <TableHead>Precisione</TableHead>
                              <TableHead className="text-right">Azioni</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredUsers?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                                  Nessun utente trovato con i filtri attuali.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredUsers?.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>{user.id}</TableCell>
                                  <TableCell className="font-medium">{user.username}</TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('it-IT', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    }) : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {user.emailVerified ? (
                                      <Badge className="bg-green-500">Verificata</Badge>
                                    ) : (
                                      <Badge variant="outline">Non verificata</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>{user.totalPredictions}</TableCell>
                                  <TableCell>
                                    {user.totalPredictions === 0 ? (
                                      "N/A"
                                    ) : (
                                      <span className="font-medium">
                                        {((user.accuratePredictions / user.totalPredictions) * 100).toFixed(1)}%
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant={user.emailVerified ? "outline" : "default"}
                                        size="sm"
                                        onClick={() => handleToggleUserVerification(user.id, user.emailVerified)}
                                        disabled={toggleUserVerificationMutation.isPending}
                                      >
                                        {user.emailVerified ? (
                                          <>
                                            <X className="h-4 w-4 mr-1" />
                                            Annulla verifica
                                          </>
                                        ) : (
                                          <>
                                            <Check className="h-4 w-4 mr-1" />
                                            Verifica
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Visualizzando {filteredUsers?.length || 0} di {users?.length || 0} utenti
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* User List Tab */}
              <TabsContent value="userlist">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Elenco completo degli utenti</CardTitle>
                        <CardDescription>
                          Visualizzazione dettagliata di tutti gli utenti registrati
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
                          toast({
                            title: "Elenco aggiornato",
                            description: "I dati degli utenti sono stati aggiornati.",
                          });
                        }} 
                        className="flex items-center"
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Aggiorna
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex-1 relative mb-6">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input 
                        placeholder="Cerca utenti..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    {usersLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users?.filter(user => 
                          searchQuery === "" || 
                          user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((user) => (
                          <Card key={user.id} className="overflow-hidden">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg flex items-center">
                                    <span>#{user.id}</span>
                                    <span className="mx-1">·</span>
                                    <span>{user.username}</span>
                                  </CardTitle>
                                  <CardDescription className="text-sm truncate mt-1">
                                    {user.email}
                                  </CardDescription>
                                </div>
                                {user.emailVerified ? (
                                  <Badge className="bg-green-500 self-start">{t("admin.userlist.verified")}</Badge>
                                ) : (
                                  <Badge variant="outline" className="self-start">{t("admin.userlist.not_verified")}</Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 gap-1 text-sm">
                                <div className="text-muted-foreground">{t("admin.userlist.registered")}:</div>
                                <div>
                                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString(t("language") === "it" ? 'it-IT' : 'en-US') : 'N/A'}
                                </div>
                                
                                <div className="text-muted-foreground">{t("admin.userlist.predictions")}:</div>
                                <div>{user.totalPredictions}</div>
                                
                                <div className="text-muted-foreground">{t("admin.userlist.accuracy")}:</div>
                                <div>
                                  {user.totalPredictions === 0 ? (
                                    "N/A"
                                  ) : (
                                    <span>
                                      {((user.accuratePredictions / user.totalPredictions) * 100).toFixed(1)}%
                                    </span>
                                  )}
                                </div>

                                <div className="text-muted-foreground">{t("admin.userlist.badge")}:</div>
                                <div>{user.currentBadge || t("admin.userlist.none")}</div>
                              </div>
                              
                              <div className="flex justify-center mt-4">
                                <Button
                                  variant={user.emailVerified ? "outline" : "default"}
                                  size="sm"
                                  onClick={() => handleToggleUserVerification(user.id, user.emailVerified)}
                                  disabled={toggleUserVerificationMutation.isPending}
                                  className="w-full"
                                >
                                  {user.emailVerified ? (
                                    <>
                                      <X className="h-4 w-4 mr-1" />
                                      {t("admin.users.unverify")}
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      {t("admin.users.verify")}
                                    </>
                                  )}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      {t("admin.users.showing", {
                        filtered: users?.filter(user => 
                          searchQuery === "" || 
                          user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length || 0,
                        total: users?.length || 0
                      })}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}