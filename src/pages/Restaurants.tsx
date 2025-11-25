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
      <div className="relative overflow-hidden border-b border-border/50 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="container relative py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center gap-4 md:gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <ChefHat className="relative h-12 w-12 md:h-16 md:w-16 text-primary animate-scale-in" />
            </div>
            <div className="space-y-3">
              <h1 className="font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Discover Culinary Excellence
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Explore diverse menus crafted with passion and served with pride
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurants Grid */}
      <div className="container py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6">
        {restaurants.length === 0 ? (
          <div className="text-center py-20 md:py-32">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-muted/50 blur-2xl rounded-full" />
              <ChefHat className="relative h-16 w-16 md:h-20 md:w-20 mx-auto text-muted-foreground" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">No restaurants yet</h2>
            <p className="text-muted-foreground text-lg">
              Check back soon for amazing menus!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {restaurants.map((restaurant, index) => (
              <Link 
                key={restaurant.id} 
                to={`/menu/${restaurant.slug}`}
                className="animate-slide-up group"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <Card className="relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 h-full bg-gradient-to-br from-card to-card/80">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    {restaurant.banner_image_url ? (
                      <>
                        <img
                          src={restaurant.banner_image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </>
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center relative overflow-hidden"
                        style={{ backgroundColor: restaurant.theme_color }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                        <ChefHat className="relative h-24 w-24 text-white/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6" />
                      </div>
                    )}
                    
                    {/* Logo Overlay */}
                    {restaurant.logo_url && (
                      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-1 rounded-full border-2 border-background shadow-lg">
                        <img
                          src={restaurant.logo_url}
                          alt=""
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <CardHeader className="space-y-3 pb-4">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                      {restaurant.name}
                    </CardTitle>
                    {restaurant.description && (
                      <CardDescription className="line-clamp-2 text-base leading-relaxed">
                        {restaurant.description}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {restaurant.address && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                      )}
                      {restaurant.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{restaurant.contact_phone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* CTA Button */}
                    <Button 
                      className="w-full mt-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:translate-y-0"
                      style={{ 
                        backgroundColor: restaurant.theme_color,
                        borderColor: restaurant.theme_color 
                      }}
                    >
                      <span>View Menu</span>
                      <ChefHat className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
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