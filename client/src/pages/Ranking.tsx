import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Medal, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function Ranking() {
  const [, navigate] = useLocation();
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);

  const { data: topUsers, isLoading } = trpc.ranking.getTopUsers.useQuery({
    limit,
    offset,
  });

  const getMedalColor = (rank: number | null) => {
    if (!rank) return "text-slate-400";
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-orange-400";
    return "text-slate-400";
  };

  const getMedalIcon = (rank: number | null) => {
    if (!rank) return "🏅";
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "🏅";
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">NeuroSciRank Rankings</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Search
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              Top Neuroscience Researchers
            </CardTitle>
            <CardDescription className="text-slate-400">
              Rankings updated weekly based on publication impact and recency
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          </div>
        ) : topUsers && topUsers.length > 0 ? (
          <>
            <div className="space-y-3">
              {topUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-slate-800 border-slate-700 hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-6">
                      <div className="flex-shrink-0 text-4xl">
                        {getMedalIcon(user.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">{user.name}</h3>
                            <p className="text-slate-400 text-sm">{user.field}</p>
                            <p className="text-slate-500 text-sm">{user.institution}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-400">{user.score}</p>
                            <p className="text-slate-400 text-sm">Score</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-2xl font-bold text-white">#{user.rank}</p>
                        <p className="text-slate-400 text-sm">{user.publicationCount} pubs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-4 mt-8">
              <Button
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={topUsers.length < limit}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <p className="text-slate-400">No rankings available yet. Check back soon!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
