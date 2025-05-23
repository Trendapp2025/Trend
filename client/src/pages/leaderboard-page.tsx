import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import AppHeader from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock, Trophy, Medal, User2, Star, Calendar, Award, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data for leaderboard until API is fully implemented
const MOCK_MONTHS = [
  { value: "2025-04", label: "April 2025", isCurrent: true },
  { value: "2025-03", label: "March 2025", isCurrent: false },
  { value: "2025-02", label: "February 2025", isCurrent: false },
];

type LeaderboardUser = {
  id: number;
  username: string;
  totalPredictions: number;
  accuratePredictions: number;
  accuracyPercentage: number;
  rank: number;
  isVerified: boolean;
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-04");
  
  // This will be replaced with a real API call in the future
  const { data: leaderboardData, isLoading } = useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard", selectedMonth],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data
      return [
        { id: 1, username: "Trend1", totalPredictions: 35, accuratePredictions: 28, accuracyPercentage: 80, rank: 1, isVerified: true },
        { id: 5, username: "CryptoTrader", totalPredictions: 42, accuratePredictions: 31, accuracyPercentage: 73.8, rank: 2, isVerified: true },
        { id: 8, username: "StockWhiz", totalPredictions: 29, accuratePredictions: 21, accuracyPercentage: 72.4, rank: 3, isVerified: false },
        { id: 12, username: "MarketMaster", totalPredictions: 51, accuratePredictions: 36, accuracyPercentage: 70.6, rank: 4, isVerified: true },
        { id: 7, username: "PredictionPro", totalPredictions: 23, accuratePredictions: 16, accuracyPercentage: 69.6, rank: 5, isVerified: false },
      ];
    },
    // For demo purposes, this is enabled without a real API
    enabled: true,
  });
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  const getRankBadge = (rank: number) => {
    if (rank >= 1 && rank <= 5) {
      const colors = {
        1: "text-cyan-400", // Diamond
        2: "text-slate-300", // Platinum
        3: "text-yellow-500", // Gold
        4: "text-zinc-400", // Silver
        5: "text-amber-700", // Bronze
      };
      
      return (
        <div className="relative">
          <Trophy className={`h-6 w-6 ${colors[rank as keyof typeof colors]}`} />
          <span className="absolute top-[35%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[9px] font-bold">
            {rank}
          </span>
        </div>
      );
    }
    
    return <span className="text-sm font-medium">{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Top Predictors Leaderboard
            </h1>
            <p className="text-muted-foreground">
              See who has the most accurate predictions each month
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-primary" />
                Monthly Rankings
              </CardTitle>
              <CardDescription>
                Users are ranked based on prediction accuracy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={selectedMonth} onValueChange={setSelectedMonth} className="w-full">
                <TabsList className="mb-6">
                  {MOCK_MONTHS.map((month) => (
                    <TabsTrigger key={month.value} value={month.value} className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {month.label}
                      {month.isCurrent && (
                        <Badge variant="outline" className="ml-2 bg-primary/10">
                          Current
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {MOCK_MONTHS.map((month) => (
                  <TabsContent key={month.value} value={month.value} className="w-full">
                    {isLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
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
                              <TableHead className="w-12">Rank</TableHead>
                              <TableHead>Predictor</TableHead>
                              <TableHead className="text-right">Predictions</TableHead>
                              <TableHead className="text-right">Accuracy</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {leaderboardData?.map((predictor) => (
                              <TableRow key={predictor.id}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center justify-center">
                                    {getRankBadge(predictor.rank)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <User2 className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <span className="font-medium">{predictor.username}</span>
                                    {predictor.isVerified && (
                                      <Badge variant="secondary" className="ml-2">Verified</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {predictor.accuratePredictions} / {predictor.totalPredictions}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end">
                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                    <span className="font-medium">{predictor.accuracyPercentage.toFixed(1)}%</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    {month.isCurrent && (
                      <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p>Rankings are updated at the end of each month.</p>
                        <p>Keep making accurate predictions to improve your rank!</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="bg-muted rounded-lg p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">How Rankings Work</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Users are ranked based on prediction accuracy percentage</li>
                  <li>Only predictions from the current month are counted</li>
                  <li>A minimum of 5 predictions is required to appear on the leaderboard</li>
                  <li className="font-medium text-foreground">To earn verification badge:</li>
                  <ul className="list-circle list-inside ml-5 space-y-1">
                    <li>Minimum 3 months account age</li>
                    <li>At least 15 predictions submitted</li>
                  </ul>
                </ul>
              </div>
              <div className="bg-card rounded-md p-4 border shadow-sm flex flex-col items-center md:min-w-[180px]">
                <h4 className="font-medium mb-2">Your Current Rank</h4>
                {user && (
                  <>
                    <div className="text-4xl font-bold mb-1 text-primary">
                      {user.username === "Trend1" ? "#1" : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.username === "Trend1" ? "Accuracy: 80%" : "Make more predictions!"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}