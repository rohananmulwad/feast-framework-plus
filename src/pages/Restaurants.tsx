import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_image_url: string | null;
  theme_color: string;
  contact_phone: string | null;
  address: string | null;
}

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error: any) {
      toast.error("Failed to load restaurants");
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8 max-w-7xl mx-auto px-4">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b">
        <div className="container py-16 max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="h-10 w-10 text-primary" />
            <h1 className="text-5xl font-bold text-foreground">Tasty Menus</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Discover delicious menus from your favorite restaurants
          </p>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="container py-12 max-w-7xl mx-auto px-4">
        {restaurants.length === 0 ? (
          <div className="text-center py-20">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No restaurants yet</h2>
            <p className="text-muted-foreground">
              Check back soon for amazing menus!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link key={restaurant.id} to={`/menu/${restaurant.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] h-full">
                  {restaurant.banner_image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={restaurant.banner_image_url}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="h-48 flex items-center justify-center"
                      style={{ backgroundColor: restaurant.theme_color }}
                    >
                      <ChefHat className="h-20 w-20 text-white/80" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {restaurant.logo_url && (
                        <img
                          src={restaurant.logo_url}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.description && (
                      <CardDescription className="line-clamp-2">
                        {restaurant.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {restaurant.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{restaurant.address}</span>
                      </div>
                    )}
                    {restaurant.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{restaurant.contact_phone}</span>
                      </div>
                    )}
                    <Button 
                      className="w-full mt-4"
                      style={{ backgroundColor: restaurant.theme_color }}
                    >
                      View Menu
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;