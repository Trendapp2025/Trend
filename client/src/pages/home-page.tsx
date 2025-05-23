import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import AppHeader from "@/components/app-header";
import AssetList from "@/components/asset-list";
import AssetSearch from "@/components/asset-search";
import SuggestAssetForm from "@/components/suggest-asset-form";
import ShareApp from "@/components/share-app";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, BarChart3, Coins, LineChart, Search, Plus, ListPlus, Globe, Trophy } from "lucide-react";
import AssetCard from "@/components/asset-card";
import SentimentSummaryChart from "@/components/sentiment-summary-chart";
import { Button } from "@/components/ui/button";
import { LanguageSelectorCard } from "@/components/language-selector";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function HomePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false);

  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Filter assets by sentiment and type
  const positiveAssets = assets?.filter(asset => asset.sentiment === "positive") || [];
  const negativeAssets = assets?.filter(asset => asset.sentiment === "negative") || [];
  const neutralAssets = assets?.filter(asset => asset.sentiment === "neutral") || [];
  
  // Sort by prediction percentage (highest first for positive, lowest first for negative)
  const topPositive = [...positiveAssets].sort((a, b) => Number(b.prediction) - Number(a.prediction)).slice(0, 3);
  const topNegative = [...negativeAssets].sort((a, b) => Number(a.prediction) - Number(b.prediction)).slice(0, 3);
  
  // Filter assets by type
  const cryptoAssets = assets?.filter(asset => asset.type === "cryptocurrency") || [];
  const stockAssets = assets?.filter(asset => asset.type === "stock") || [];

  // Calculate overall statistics
  const positivePercentage = assets?.length 
    ? Math.round((positiveAssets.length / assets.length) * 100) 
    : 0;
  
  const negativePercentage = assets?.length 
    ? Math.round((negativeAssets.length / assets.length) * 100) 
    : 0;
    
  const neutralPercentage = assets?.length 
    ? Math.round((neutralAssets.length / assets.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <section className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {user ? t("home.welcome_user", {username: user.username}) : t("home.welcome")}
              </h1>
              <p className="text-muted-foreground">
                {t("home.subtitle")}
                {!user && (
                  <span className="ml-2">
                    - <a href="/auth" className="text-primary hover:underline">{t("auth.signin")}</a> {t("home.login_prompt")}
                  </span>
                )}
              </p>
            </div>

            {/* Suggest Asset Dialog */}
            <Dialog open={suggestDialogOpen} onOpenChange={setSuggestDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <ListPlus className="h-4 w-4 mr-2" />
                  {t("asset.suggest")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{t("asset.suggest_title")}</DialogTitle>
                  <DialogDescription>
                    {t("asset.suggest_description")}
                  </DialogDescription>
                </DialogHeader>
                <SuggestAssetForm />
              </DialogContent>
            </Dialog>
          </div>
        </section>

        {/* Market Sentiment Overview Section */}
        {/* Search Section */}
        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2 text-primary" />
                {t("search.title")}
              </CardTitle>
              <CardDescription>
                {t("search.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssetSearch />
            </CardContent>
          </Card>
        </section>

        {/* Market Sentiment Overview Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t("home.total_assets")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12" /> : assets?.length || 0}</div>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-3">
              <SentimentSummaryChart 
                positivePercentage={positivePercentage} 
                negativePercentage={negativePercentage}
                neutralPercentage={neutralPercentage}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        {/* App Info Section */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-background to-muted">
            <CardHeader>
              <CardTitle className="text-xl">{t("home.how_it_works")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t("home.track_assets")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("home.track_description")}
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t("home.make_predictions")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("home.predictions_description")}
                  </p>
                </div>
                
                <div className="flex flex-col items-center text-center p-4">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t("home.earn_badges")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("home.badges_description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Language Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-primary" />
                  {t("language.title")}
                </CardTitle>
                <CardDescription>
                  {t("language.description")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LanguageSelectorCard />
              </CardContent>
            </Card>
            
            {/* Share App Section */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  {t("share.share_with_friends")}
                </CardTitle>
                <CardDescription>
                  {t("share.invite_friends")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ShareApp size="lg" />
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Top Performers Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center">
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                {t("sentiment.top_positive")}
              </CardTitle>
              <CardDescription>{t("sentiment.bullish")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topPositive.length > 0 ? (
                <div className="space-y-4">
                  {topPositive.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center p-3 bg-green-50/50 rounded-lg">
                      <div>
                        <div className="font-medium">{asset.name} ({asset.symbol})</div>
                        <div className="text-sm text-muted-foreground">{asset.type}</div>
                      </div>
                      <div className="text-green-600 font-bold">+{Number(asset.prediction).toFixed(2)}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("sentiment.no_positive")}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold flex items-center">
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                {t("sentiment.top_negative")}
              </CardTitle>
              <CardDescription>{t("sentiment.bearish")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topNegative.length > 0 ? (
                <div className="space-y-4">
                  {topNegative.map((asset) => (
                    <div key={asset.id} className="flex justify-between items-center p-3 bg-red-50/50 rounded-lg">
                      <div>
                        <div className="font-medium">{asset.name} ({asset.symbol})</div>
                        <div className="text-sm text-muted-foreground">{asset.type}</div>
                      </div>
                      <div className="text-red-600 font-bold">{Number(asset.prediction).toFixed(2)}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {t("sentiment.no_negative")}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Crypto Assets Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Coins className="h-6 w-6 mr-2 text-primary" />
            {t("asset.crypto_title")}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[180px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cryptoAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cryptoAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {t("asset.no_crypto")}
            </div>
          )}
        </section>

        {/* Stock Assets Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <LineChart className="h-6 w-6 mr-2 text-primary" />
            {t("asset.stock_title")}
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-[180px]">
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stockAssets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stockAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              {t("asset.no_stock")}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
