import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import AppHeader from "@/components/app-header";
import SentimentBadge from "@/components/sentiment-badge";
import OpinionForm from "@/components/opinion-form";
import OpinionList from "@/components/opinion-list";
import PercentageDisplay from "@/components/percentage-display";
import AssetAnalytics from "@/components/asset-analytics";
import SocialShare from "@/components/social-share";
import { Asset, Opinion } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, TrendingUp, ArrowLeft, Share2, Clock, Star, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function AssetDetailPage() {
  const [, params] = useRoute("/assets/:symbol");
  const symbol = params?.symbol || "";
  const { user } = useAuth();

  const { data: asset, isLoading: isLoadingAsset } = useQuery<Asset>({
    queryKey: [`/api/assets/${symbol}`],
  });

  const { data: opinions, isLoading: isLoadingOpinions } = useQuery<Opinion[]>({
    queryKey: [`/api/assets/${symbol}/opinions`],
  });

  // Calculate average sentiment and prediction
  const calculateAverageSentiment = () => {
    if (!opinions || opinions.length === 0) return "neutral";
    
    const sentimentCounts = opinions.reduce(
      (acc, opinion) => {
        acc[opinion.sentiment] = (acc[opinion.sentiment] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    
    const maxSentiment = Object.entries(sentimentCounts).reduce(
      (max, [sentiment, count]) => (count > max.count ? { sentiment, count } : max),
      { sentiment: "neutral", count: 0 }
    );
    
    return maxSentiment.sentiment;
  };

  const calculateAveragePrediction = () => {
    if (!opinions || opinions.length === 0) return 0;
    
    const totalPrediction = opinions.reduce(
      (sum, opinion) => {
        // Ensure we're working with numbers
        const predictionValue = typeof opinion.prediction === 'string' 
          ? parseFloat(opinion.prediction) 
          : Number(opinion.prediction);
          
        return sum + predictionValue;
      }, 
      0 // Starting with initial value of 0
    );
    
    return totalPrediction / opinions.length;
  };

  const averageSentiment = opinions ? calculateAverageSentiment() : "neutral";
  const averagePrediction = opinions ? calculateAveragePrediction() : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assets
        </Link>
        
        {isLoadingAsset ? (
          <Skeleton className="h-10 w-1/3 mb-4" />
        ) : (
          <h1 className="text-3xl font-bold tracking-tight mb-4">{asset?.name} ({asset?.symbol})</h1>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Community Sentiment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                {isLoadingOpinions ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="flex items-center">
                    <SentimentBadge sentiment={averageSentiment} size="lg" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Prediction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                {isLoadingOpinions ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <PercentageDisplay value={averagePrediction} size="lg" />
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Opinions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 text-primary mr-2" />
                <div className="text-2xl font-bold">
                  {isLoadingOpinions ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    opinions?.length || 0
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {!isLoadingAsset && asset && (
            <div className="md:col-span-3">
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Market Analytics
                    </CardTitle>
                    <CardDescription>
                      Detailed analysis and sentiment trends
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Updated {new Date().toLocaleDateString()}</span>
                    </div>
                    {!isLoadingOpinions && (
                      <SocialShare 
                        assetSymbol={asset.symbol} 
                        assetName={asset.name} 
                        sentiment={averageSentiment} 
                        prediction={averagePrediction}
                        size="sm"
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <AssetAnalytics assetId={asset.id} assetSymbol={asset.symbol} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Community Opinions</CardTitle>
                    <CardDescription>
                      What others are saying about {asset?.symbol}
                    </CardDescription>
                  </div>
                  {!isLoadingOpinions && opinions && opinions.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {opinions.length} {opinions.length === 1 ? 'opinion' : 'opinions'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingOpinions ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-4 w-1/4 mb-2" />
                          <Skeleton className="h-3 w-1/3" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-12 w-full" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : opinions && opinions.length > 0 ? (
                  <OpinionList opinions={opinions} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No opinions yet. Be the first to share your thoughts!
                  </div>
                )}
              </CardContent>
              {!isLoadingOpinions && opinions && opinions.length > 5 && (
                <CardFooter className="flex justify-center border-t pt-4">
                  <Button variant="outline" size="sm">
                    View More Opinions
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2 text-primary" />
                  Share Your Opinion
                </CardTitle>
                <CardDescription>
                  Add your sentiment and prediction
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">
                      You need to be logged in to share your opinion
                    </p>
                    <Button asChild>
                      <Link href="/auth">Sign In / Register</Link>
                    </Button>
                  </div>
                ) : (
                  asset && (
                    <OpinionForm 
                      assetId={asset.id} 
                      assetSymbol={asset.symbol} 
                      userId={user.id} 
                    />
                  )
                )}
              </CardContent>
              {user && (
                <CardFooter className="text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    Your predictions are used to calculate your accuracy score
                  </div>
                </CardFooter>
              )}
            </Card>
            
            {/* Add a "People you might follow" card */}
            <div className="mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Top Predictors for {asset?.symbol}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingOpinions ? (
                    <>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm">
                      Follow top predictors to see their insights in your feed
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
