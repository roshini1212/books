import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BookOpen, CheckCircle2, TrendingUp, ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface ReadingStats {
  total_books_read: number;
  total_books_to_read: number;
  favorite_genre: string | null;
  reading_streak: number;
}

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: statsData, error: statsError } = await supabase
          .from("reading_stats")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (statsError) throw statsError;
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookshelf
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 shadow-glow-primary p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-primary/30">
                  <AvatarFallback className="text-3xl font-bold bg-gradient-cosmic text-foreground">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1
                    className="text-4xl font-black mb-2 bg-gradient-holographic bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]"
                    style={{ fontFamily: "'Orbitron', sans-serif" }}
                  >
                    {profile.username}
                  </h1>
                  {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                  <p className="text-sm text-muted-foreground mt-2">
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {isOwnProfile && (
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              )}
            </div>
          </Card>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 shadow-glow-primary p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-cosmic rounded-lg">
                    <BookOpen className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">To Read</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total_books_to_read}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-2 border-secondary/30 shadow-glow-secondary p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-cosmic rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-3xl font-bold text-foreground">{stats.total_books_read}</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-2 border-accent/30 shadow-glow-accent p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-cosmic rounded-lg">
                    <TrendingUp className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Streak</p>
                    <p className="text-3xl font-bold text-foreground">{stats.reading_streak} days</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {stats?.favorite_genre && (
            <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/30 shadow-glow-primary p-6 mt-6">
              <h2 className="text-xl font-bold text-foreground mb-2">Favorite Genre</h2>
              <p className="text-2xl text-primary font-semibold">{stats.favorite_genre}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
