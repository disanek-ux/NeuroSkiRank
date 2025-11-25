import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Building2, BookOpen } from "lucide-react";

export default function UserProfile() {
  const [match, params] = useRoute("/users/:id");
  const [, navigate] = useLocation();

  if (!match || !params?.id) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400">User not found</p>
      </div>
    );
  }

  const userId = parseInt(params.id);

  const { data: profile, isLoading } = trpc.user.getPublicProfile.useQuery({
    userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900">
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              ← Back
            </Button>
          </div>
        </nav>
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-slate-400">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/ranking")}>
            ← Back to Rankings
          </Button>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Search
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{profile.name}</CardTitle>
                <CardDescription className="text-slate-400">{profile.field}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.institution && (
                  <div className="flex gap-3">
                    <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-400">Institution</p>
                      <p className="text-white">{profile.institution}</p>
                    </div>
                  </div>
                )}

                {profile.bio && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Bio</p>
                    <p className="text-white">{profile.bio}</p>
                  </div>
                )}

                {profile.rating && (
                  <div className="pt-4 border-t border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Score</p>
                        <p className="text-2xl font-bold text-blue-400">{profile.rating.score}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Rank</p>
                        <p className="text-2xl font-bold text-white">
                          #{profile.rating.rank || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Publications */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Publications ({profile.publications?.length || 0})
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Research papers and publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profile.publications && profile.publications.length > 0 ? (
                  <div className="space-y-4">
                    {profile.publications.map((pub) => (
                      <div key={pub.id} className="border-b border-slate-700 pb-4 last:border-0">
                        <h4 className="text-white font-medium mb-2">{pub.title}</h4>
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
                        {pub.abstract && (
                          <p className="text-slate-400 text-sm mt-3">{pub.abstract}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No publications yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
