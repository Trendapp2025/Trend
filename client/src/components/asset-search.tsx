import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search as SearchIcon } from 'lucide-react';
import { Asset } from '@shared/schema';
import AssetCard from '@/components/asset-card';
import { useQuery } from '@tanstack/react-query';

export default function AssetSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch all assets
  const { data: assets, isLoading } = useQuery<Asset[]>({
    queryKey: ['/api/assets'],
  });

  const handleSearch = () => {
    if (!assets || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    const query = searchQuery.trim().toLowerCase();
    
    // Make the search more effective with ticker symbols
    // Higher priority for exact ticker matches
    const exactSymbolMatches = assets.filter(asset => 
      asset.symbol.toLowerCase() === query
    );
    
    // If we find exact matches, return only those
    if (exactSymbolMatches.length > 0) {
      console.log("Found exact symbol matches:", exactSymbolMatches);
      setSearchResults(exactSymbolMatches);
      return;
    }
    
    // Try case-insensitive searches next
    const results = assets.filter(asset => 
      asset.name.toLowerCase().includes(query) || 
      asset.symbol.toLowerCase().includes(query) || 
      asset.type.toLowerCase().includes(query)
    );
    
    // Log the search results for debugging
    console.log("Search query:", query);
    console.log("Search results:", results);
    
    setSearchResults(results);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for asset by name, symbol, or type"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {isSearching && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {searchResults.length === 0 
              ? "No assets found matching your search" 
              : `Found ${searchResults.length} asset${searchResults.length !== 1 ? 's' : ''}`}
          </h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}