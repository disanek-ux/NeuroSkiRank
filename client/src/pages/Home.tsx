import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { useLocation } from "wouter";
import { Zap, Users, TrendingUp, Search } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            <span className="text-xl font-bold text-white">{APP_TITLE}</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/ranking")}>
                  Ranking
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => (window.location.href = getLoginUrl())}>
                  Sign In
                </Button>
                <Button onClick={() => (window.location.href = getLoginUrl())}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Discover & Rank Neuroscience Research
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            NeuroSciRank is an academic platform that helps neuroscience researchers showcase their
            work, discover peers, and track their impact through a transparent ranking system.
          </p>
          {!isAuthenticated && (
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => (window.location.href = getLoginUrl())}>
                Create Account
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/ranking")}>
                View Rankings
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 py-20 border-t border-slate-700">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">DOI-Based Publications</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Add your research by DOI. We automatically fetch metadata from Crossref.
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Smart Ranking</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Transparent scoring based on publication recency, impact, and volume.
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Users className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Researcher Profiles</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Build your profile with institution, field, and research bio.
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Search className="w-8 h-8 text-orange-400 mb-2" />
                <CardTitle className="text-white">Discovery</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                Find researchers and publications across neuroscience.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h2>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                1
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Create Your Profile</h3>
              <p className="mt-2 text-slate-300">
                Sign up and tell us about your research field and institution.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                2
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Add Publications</h3>
              <p className="mt-2 text-slate-300">
                Submit your research papers using their DOI. We handle the rest.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                3
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Get Ranked</h3>
              <p className="mt-2 text-slate-300">
                We calculate your score weekly based on publication impact and recency.
              </p>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                4
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white">Connect & Discover</h3>
              <p className="mt-2 text-slate-300">
                Browse the global ranking and find researchers in your field.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Join thousands of neuroscience researchers on NeuroSciRank.
          </p>
          {!isAuthenticated && (
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-slate-100"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              Create Account Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8">
        <div className="container mx-auto px-4 text-center text-slate-400">
          <p>&copy; 2024 {APP_TITLE}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
