import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"all" | "users" | "publications">("all");

  const { data: results, isLoading } = trpc.search.query.useQuery(
    { q: query, type: searchType, limit: 50 },
    { enabled: query.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Search</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/ranking")}>
              Ranking
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SearchIcon className="w-6 h-6" />
              Find Researchers & Publications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <Input
                placeholder="Search by name, field, journal, DOI..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={searchType === "all" ? "default" : "outline"}
                  onClick={() => setSearchType("all")}
                >
                  All
                </Button>
                <Button
                  type="button"
                  variant={searchType === "users" ? "default" : "outline"}
                  onClick={() => setSearchType("users")}
                >
                  Researchers
                </Button>
                <Button
                  type="button"
                  variant={searchType === "publications" ? "default" : "outline"}
                  onClick={() => setSearchType("publications")}
                >
                  Publications
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {query.length === 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <p className="text-slate-400">Enter a search query to get started</p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Users Results */}
            {results?.users && results.users.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Researchers</h2>
                <div className="space-y-3">
                  {results.users.map((user: any) => (
                    <Card
                      key={user.id}
                      className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white">{user.name}</h3>
                        <p className="text-slate-400 text-sm">{user.field}</p>
                        <p className="text-slate-500 text-sm">{user.institution}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Publications Results */}
            {results?.publications && results.publications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Publications</h2>
                <div className="space-y-3">
                  {results.publications.map((pub: any) => (
                    <Card key={pub.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">{pub.title}</h3>
                        <div className="space-y-1">
                          {pub.journal && (
                            <p className="text-slate-400 text-sm">
                              <span className="font-medium">Journal:</span> {pub.journal}
                            </p>
                          )}
                          <p className="text-slate-400 text-sm">
                            <span className="font-medium">Authors:</span> {pub.authors.join(", ")}
                          </p>
                          <p className="text-slate-400 text-sm">
                            <span className="font-medium">Year:</span> {pub.year}
                          </p>
                          <p className="text-slate-500 text-xs">
                            <span className="font-medium">DOI:</span> {pub.doi}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!results?.users || results.users.length === 0) &&
              (!results?.publications || results.publications.length === 0) && (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-12 text-center">
                    <p className="text-slate-400">No results found for "{query}"</p>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
