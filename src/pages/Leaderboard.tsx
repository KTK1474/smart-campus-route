import { ArrowLeft, Trophy, TrendingUp, Award, Medal, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Leaderboard - Gamified eco-score rankings
 * Shows individual users and departments with badges and achievements
 */
const Leaderboard = () => {
  const navigate = useNavigate();

  const users = [
    { rank: 1, name: "Priya Sharma", dept: "CS", score: 4850, co2: "52.3 kg", badge: "🌟" },
    { rank: 2, name: "Rahul Kumar", dept: "EE", score: 4620, co2: "48.7 kg", badge: "🏆" },
    { rank: 3, name: "Aisha Patel", dept: "ME", score: 4390, co2: "45.2 kg", badge: "🥇" },
    { rank: 4, name: "Arjun Singh", dept: "CE", score: 4150, co2: "42.8 kg", badge: "⭐" },
    { rank: 5, name: "Sneha Reddy", dept: "BT", score: 3920, co2: "39.5 kg", badge: "🌱" },
  ];

  const departments = [
    { rank: 1, name: "Computer Science", members: 450, avgScore: 3850, co2: "18.2 tons" },
    { rank: 2, name: "Electrical Eng.", members: 380, avgScore: 3720, co2: "16.8 tons" },
    { rank: 3, name: "Mechanical Eng.", members: 420, avgScore: 3590, co2: "15.4 tons" },
  ];

  const achievements = [
    { name: "Green Warrior", desc: "Saved 50kg CO₂", icon: "🌿", rarity: "rare" },
    { name: "Eco Pioneer", desc: "100 green routes", icon: "🚶", rarity: "epic" },
    { name: "Carbon Crusher", desc: "Top 1% saver", icon: "💚", rarity: "legendary" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">Eco-Leaderboard</h1>
            <p className="text-muted-foreground">Compete for sustainability supremacy</p>
          </div>
          <Button variant="outline">
            <Award className="w-4 h-4 mr-2" />
            My Profile
          </Button>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users">Top Users</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:shadow-card ${
                      user.rank <= 3 ? "bg-gradient-eco/10" : "bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 font-bold text-primary text-lg">
                      {user.rank}
                    </div>
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-gradient-eco text-white">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{user.name}</h3>
                        <span className="text-2xl">{user.badge}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.dept} Department</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{user.score}</p>
                      <p className="text-sm text-muted-foreground">eco-points</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-eco-green">{user.co2}</p>
                      <p className="text-xs text-muted-foreground">CO₂ saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Departments Tab */}
          <TabsContent value="departments" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                {departments.map((dept) => (
                  <div
                    key={dept.rank}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/20 hover:shadow-card transition-all"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/10 font-bold text-secondary text-lg">
                      {dept.rank}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground">{dept.members} members</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{dept.avgScore}</p>
                      <p className="text-xs text-muted-foreground">avg score</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-semibold text-eco-green">{dept.co2}</p>
                      <p className="text-xs text-muted-foreground">CO₂ saved</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.name}
                  className="p-6 text-center space-y-4 hover:shadow-glow transition-shadow"
                >
                  <div className="text-6xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{achievement.name}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                  </div>
                  <Badge
                    variant={
                      achievement.rarity === "legendary"
                        ? "default"
                        : achievement.rarity === "epic"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {achievement.rarity}
                  </Badge>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Your Stats */}
        <Card className="p-6 bg-gradient-eco text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Your Eco-Score</h3>
              <p className="text-white/80">Keep pushing for the top!</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">2,458</p>
              <p className="text-white/80">Rank #47</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">+145</p>
              <p className="text-sm text-white/80">This week</p>
            </div>
            <div className="text-center">
              <Zap className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-white/80">Achievements</p>
            </div>
            <div className="text-center">
              <Medal className="w-6 h-6 mx-auto mb-2" />
              <p className="text-2xl font-bold">38.4kg</p>
              <p className="text-sm text-white/80">CO₂ saved</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
