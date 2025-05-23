import { Asset } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

interface AssetCardProps {
  asset: Asset;
}

export default function AssetCard({ asset }: AssetCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{asset.name}</span>
          <span className="text-sm font-medium text-muted-foreground">{asset.symbol}</span>
        </CardTitle>
        <CardDescription>{asset.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {asset.sentiment === "positive" ? (
              <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
            ) : asset.sentiment === "negative" ? (
              <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-blue-100 mr-1" />
            )}
            <span className="text-sm font-medium">
              {asset.sentiment === "positive" ? "Bullish" : 
               asset.sentiment === "negative" ? "Bearish" : "Neutral"}
            </span>
          </div>
          <div className="text-sm font-medium">
            {Number(asset.prediction) > 0 ? "+" : ""}{Number(asset.prediction).toFixed(2)}%
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/assets/${asset.symbol}`}>
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
