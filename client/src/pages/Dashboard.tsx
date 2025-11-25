import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [doiInput, setDoiInput] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    field: "",
    institution: "",
    bio: "",
  });

  const { data: profile, isLoading: profileLoading } = trpc.user.getMe.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: publications, isLoading: pubsLoading } = trpc.publications.getMyPublications.useQuery(
    { limit: 100, offset: 0 },
    { enabled: isAuthenticated }
  );

  const updateProfileMutation = trpc.user.updateProfile.useMutation();
  const addPublicationMutation = trpc.publications.add.useMutation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        field: profile.field || "",
        institution: profile.institution || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleAddPublication = async () => {
    if (!doiInput.trim()) return;
    try {
      await addPublicationMutation.mutateAsync({ doi: doiInput });
      setDoiInput("");
    } catch (error) {
      console.error("Failed to add publication:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/ranking")}>
              View Ranking
            </Button>
            <Button variant="outline" onClick={() => navigate("/search")}>
              Search
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!editMode ? (
                  <>
                    <div>
                      <p className="text-sm text-slate-400">Name</p>
                      <p className="text-white font-medium">{profile?.name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Email</p>
                      <p className="text-white font-medium">{profile?.email || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Field</p>
                      <p className="text-white font-medium">{profile?.field || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Institution</p>
                      <p className="text-white font-medium">{profile?.institution || "Not set"}</p>
                    </div>
                    <Button className="w-full" onClick={() => setEditMode(true)}>
                      Edit Profile
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm text-slate-400">Name</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Field</label>
                      <Input
                        value={formData.field}
                        onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Institution</label>
                      <Input
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400">Bio</label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleUpdateProfile}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditMode(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rating Card */}
            {profile?.rating && (
              <Card className="bg-slate-800 border-slate-700 mt-6">
                <CardHeader>
                  <CardTitle className="text-white">Your Ranking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400">Score</p>
                    <p className="text-3xl font-bold text-blue-400">{profile.rating.score}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Global Rank</p>
                    <p className="text-2xl font-bold text-white">
                      #{profile.rating.rank || "Unranked"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Publications</p>
                    <p className="text-xl font-bold text-white">{profile.rating.publicationCount}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Publications Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Add Publication</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter a DOI to add a publication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., 10.1038/nature12373"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button onClick={handleAddPublication} disabled={addPublicationMutation.isPending}>
                    {addPublicationMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {addPublicationMutation.error && (
                  <p className="text-red-400 text-sm">
                    {addPublicationMutation.error.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Your Publications</CardTitle>
                <CardDescription className="text-slate-400">
                  {publications?.length || 0} publications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pubsLoading ? (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  </div>
                ) : publications && publications.length > 0 ? (
                  <div className="space-y-4">
                    {publications.map((pub) => (
                      <div key={pub.id} className="border-b border-slate-700 pb-4 last:border-0">
                        <h4 className="text-white font-medium">{pub.title}</h4>
                        <p className="text-slate-400 text-sm mt-1">{pub.journal}</p>
                        <p className="text-slate-500 text-sm mt-1">
                          {pub.authors.join(", ")} ({pub.year})
                        </p>
                        <p className="text-slate-500 text-xs mt-2">DOI: {pub.doi}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No publications yet. Add your first one!</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
