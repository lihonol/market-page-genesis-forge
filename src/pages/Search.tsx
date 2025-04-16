
import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useData, GeneratedLink, LinkPage } from "@/contexts/DataContext";
import { Search as SearchIcon, Eye, Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(LinkPage | GeneratedLink)[]>([]);
  const [searched, setSearched] = useState(false);
  const { searchDatabase } = useData();

  const handleSearch = () => {
    if (!query.trim()) return;
    
    const searchResults = searchDatabase(query);
    setResults(searchResults);
    setSearched(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Helper function to determine if result is a LinkPage
  const isLinkPage = (result: LinkPage | GeneratedLink): result is LinkPage => {
    return (result as LinkPage).title !== undefined;
  };

  return (
    <DashboardLayout title="Search">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Database</CardTitle>
            <CardDescription>
              Search for links, pages, and content in your Book Market database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or content..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>

        {searched && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              Search Results {results.length > 0 && `(${results.length})`}
            </h2>
            
            {results.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-muted-foreground">
                    No results found for "{query}". Try another search term.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <Card key={result.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      {isLinkPage(result) ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold">{result.title}</h3>
                              <p className="text-sm text-muted-foreground">Page ID: {result.id}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/preview/${result.id}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Page
                            </Button>
                          </div>
                          
                          <p className="text-muted-foreground">{result.content}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Menu Items</h4>
                              <div className="flex flex-wrap gap-2">
                                {result.menuItems.map((item, idx) => (
                                  <span 
                                    key={idx} 
                                    className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                                  >
                                    {item.title}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold">Created</h4>
                              <div className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(result.createdAt), "PPP")}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Products</h4>
                            <div className="flex overflow-x-auto pb-2 space-x-2">
                              {result.gridItems.slice(0, 4).map((item) => (
                                <div key={item.id} className="shrink-0 w-16">
                                  <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="w-16 h-16 object-cover rounded-md mb-1"
                                  />
                                  <p className="text-xs truncate">{item.title}</p>
                                </div>
                              ))}
                              {result.gridItems.length > 4 && (
                                <div className="shrink-0 w-16 h-16 flex items-center justify-center bg-muted rounded-md">
                                  <span className="text-xs">+{result.gridItems.length - 4}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold">Generated Link</h3>
                              <p className="text-sm text-muted-foreground">Link ID: {result.id}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`/preview/${result.pageId}`, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-2" /> View Page
                            </Button>
                          </div>
                          
                          <div className="p-3 bg-muted rounded-md">
                            <div className="flex items-center">
                              <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm font-medium break-all">{result.fullLink}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold">Page ID</h4>
                              <p className="text-sm mt-1">{result.pageId}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold">Created</h4>
                              <div className="flex items-center mt-1">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">
                                  {format(new Date(result.createdAt), "PPP")}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-semibold">Visits</h4>
                              <p className="text-sm mt-1">{result.visits} views</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
