import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import AppHeader from "@/components/app-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Award, Calendar, Star, Trophy, User2, BarChart2, TrendingUp, Check, AlertTriangle } from "lucide-react";
import SentimentBadge from "@/components/sentiment-badge";
import PercentageDisplay from "@/components/percentage-display";
import VerificationProgress from "@/components/verification-progress";
import EmailVerificationStatus from "@/components/email-verification-status";
import BadgeDisplay from "@/components/badge-display";
import { PredictionResult } from "@shared/schema";

// This will be connected to the real API later
type UserPrediction = {
  id: number;
  assetSymbol: string;
  assetName: string;
  prediction: number;
  sentiment: string;
  date: string;
  result?: number;
  wasAccurate?: boolean;
  status: "pending" | "verified";
};

export default function ProfilePage() {
  const { user } = useAuth();
  
  // Will be replaced with a real API call later
  const { data: userPredictions, isLoading: predictionsLoading } = useQuery<UserPrediction[]>({
    queryKey: ["user-predictions"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return mock data for now
      return [
        { id: 1, assetSymbol: "BTC", assetName: "Bitcoin", prediction: 5.2, sentiment: "positive", date: "2025-04-15", result: 5.8, wasAccurate: true, status: "verified" },
        { id: 2, assetSymbol: "ETH", assetName: "Ethereum", prediction: 8.7, sentiment: "positive", date: "2025-04-14", result: 10.1, wasAccurate: true, status: "verified" },
        { id: 3, assetSymbol: "AAPL", assetName: "Apple Inc.", prediction: 3.1, sentiment: "positive", date: "2025-04-10", result: 2.9, wasAccurate: false, status: "verified" },
        { id: 4, assetSymbol: "NVDA", assetName: "NVIDIA Corporation", prediction: -2.3, sentiment: "negative", date: "2025-04-07", result: -5.1, wasAccurate: true, status: "verified" },
        { id: 5, assetSymbol: "TSLA", assetName: "Tesla, Inc.", prediction: 4.5, sentiment: "positive", date: "2025-04-22", status: "pending" },
      ];
    },
    enabled: !!user,
  });

  // Will be replaced with a real API call later
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ["user-stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        totalPredictions: 27,
        accuratePredictions: 19,
        accuracyPercentage: 70.4,
        currentRank: 4,
        verifiedStatus: false,
        joinDate: "2025-01-15",
        bestAsset: "ETH",
        bestAssetAccuracy: 87.5,
        worstAsset: "LINK",
        worstAssetAccuracy: 33.3,
      };
    },
    enabled: !!user,
  });
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Redirect to="/auth" />;
  }

  const isVerified = userStats?.verifiedStatus || false;
  const pendingPredictions = userPredictions?.filter(p => p.status === "pending").length || 0;
  
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-primary text-3xl text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{user.username}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    Joined {statsLoading ? '...' : userStats?.joinDate}
                  </CardDescription>
                  {isVerified && (
                    <Badge variant="outline" className="mt-2 bg-primary/10">
                      <Check className="h-3 w-3 mr-1" /> Verified Predictor
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium">Prediction Accuracy</div>
                      <div className="text-sm font-bold">
                        {statsLoading ? <Skeleton className="h-4 w-12" /> : `${userStats?.accuracyPercentage.toFixed(1)}%`}
                      </div>
                    </div>
                    {statsLoading ? (
                      <Skeleton className="h-2 w-full" />
                    ) : (
                      <Progress value={userStats?.accuracyPercentage} className="h-2" />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Trophy className="h-5 w-5 mb-1 text-primary" />
                      <div className="text-xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : `#${userStats?.currentRank}`}
                      </div>
                      <div className="text-xs text-muted-foreground">Current Rank</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
                      <Activity className="h-5 w-5 mb-1 text-primary" />
                      <div className="text-xl font-bold">
                        {statsLoading ? <Skeleton className="h-6 w-8" /> : userStats?.totalPredictions}
                      </div>
                      <div className="text-xs text-muted-foreground">Predictions</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Performance</div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        Best Asset
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">{statsLoading ? '...' : userStats?.bestAsset}</Badge>
                        <span className="text-sm font-medium text-green-500">
                          {statsLoading ? '...' : `${userStats?.bestAssetAccuracy}%`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Worst Asset
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="mr-2">{statsLoading ? '...' : userStats?.worstAsset}</Badge>
                        <span className="text-sm font-medium text-red-500">
                          {statsLoading ? '...' : `${userStats?.worstAssetAccuracy}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Email Verification Status */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>
                  Verify your email address to unlock advisor status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmailVerificationStatus />
              </CardContent>
            </Card>
            
            {/* Verification Progress */}
            <VerificationProgress />
            
            {/* Badge Display */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Achievement Badges</CardTitle>
                <CardDescription>
                  Badges earned for being a top predictor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {user && <BadgeDisplay userId={user.id} />}
              </CardContent>
            </Card>
          </div>

          {/* Predictions History */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Prediction History</CardTitle>
                  <CardDescription>Your past and pending predictions</CardDescription>
                </div>
                {pendingPredictions > 0 && (
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                    {pendingPredictions} Pending
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 w-full grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="verified">Verified</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="space-y-4">
                  {predictionsLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))
                  ) : (
                    userPredictions?.map(prediction => (
                      <PredictionCard key={prediction.id} prediction={prediction} />
                    ))
                  )}
                </TabsContent>
                
                <TabsContent value="verified" className="space-y-4">
                  {predictionsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    userPredictions
                      ?.filter(p => p.status === "verified")
                      .map(prediction => (
                        <PredictionCard key={prediction.id} prediction={prediction} />
                      ))
                  )}
                </TabsContent>
                
                <TabsContent value="pending" className="space-y-4">
                  {predictionsLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    userPredictions
                      ?.filter(p => p.status === "pending")
                      .map(prediction => (
                        <PredictionCard key={prediction.id} prediction={prediction} />
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PredictionCard({ prediction }: { prediction: UserPrediction }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center">
          <div className="mr-3 p-2 rounded-full bg-muted flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{prediction.assetName} ({prediction.assetSymbol})</div>
            <div className="text-sm text-muted-foreground">{prediction.date}</div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0">
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-medium">Your Prediction</div>
            <div className="flex items-center justify-end">
              <SentimentBadge sentiment={prediction.sentiment} size="sm" />
              <PercentageDisplay value={prediction.prediction} size="sm" />
            </div>
          </div>
          
          {prediction.status === "verified" && (
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-medium">Result</div>
              <div className="flex items-center justify-end">
                {prediction.wasAccurate ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500">
                    <Check className="h-3 w-3 mr-1" /> Accurate
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-500/10 text-red-500">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Missed
                  </Badge>
                )}
                <PercentageDisplay value={prediction.result || 0} size="sm" />
              </div>
            </div>
          )}
          
          {prediction.status === "pending" && (
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-medium">Status</div>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                Pending
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}