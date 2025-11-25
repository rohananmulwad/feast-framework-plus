import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChefHat, Flame, Menu as MenuIcon, Phone, MapPin, X, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Veg and Non-Veg Icon Components
const VegIcon = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center w-5 h-5 border-2 border-green-600 ${className}`}>
    <div className="w-2 h-2 rounded-full bg-green-600" />
  </div>
);

const NonVegIcon = ({ className = "" }: { className?: string }) => (
  <div className={`inline-flex items-center justify-center w-5 h-5 border-2 border-red-600 ${className}`}>
    <div className="w-2 h-2 rounded-full bg-red-600" />
  </div>
);

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  banner_image_url: string | null;
  theme_color: string;
  background_color: string;
  contact_phone: string | null;
  address: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_spicy: boolean;
}

const RestaurantMenu = () => {
  const { slug } = useParams<{ slug: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [dietFilter, setDietFilter] = useState<"all" | "veg" | "non-veg">("all");

  useEffect(() => {
    if (slug) {
      fetchRestaurantData();
    }
  }, [slug]);

  const fetchRestaurantData = async () => {
    try {
      // Fetch restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_active", true)
        .order("display_order");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);
      if (categoriesData && categoriesData.length > 0) {
        setActiveCategory(categoriesData[0].id);
      }

      // Fetch menu items
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", (categoriesData || []).map(c => c.id))
        .eq("is_available", true)
        .order("display_order");

      if (itemsError) throw itemsError;
      setMenuItems(itemsData || []);
    } catch (error: any) {
      toast.error("Failed to load menu");
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const getCategoryItems = (categoryId: string) => {
    return menuItems.filter(item => {
      if (item.category_id !== categoryId) return false;
      
      if (dietFilter === "veg") {
        return item.is_vegetarian || item.is_vegan;
      } else if (dietFilter === "non-veg") {
        return !item.is_vegetarian && !item.is_vegan;
      }
      return true;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-64 w-full" />
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Skeleton className="h-96 lg:col-span-1" />
            <div className="lg:col-span-3 space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Restaurant not found</h1>
          <p className="text-muted-foreground">The restaurant you're looking for doesn't exist</p>
        </div>
      </div>
    );
  }

  const CategoryNav = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={mobile ? "space-y-2" : "sticky top-24 space-y-2"}>
      <h3 className="font-bold mb-4 text-lg px-2 text-foreground/90">Categories</h3>
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => scrollToCategory(category.id)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 font-medium ${
            activeCategory === category.id
              ? "shadow-lg scale-[1.02]"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:scale-[1.01]"
          }`}
          style={
            activeCategory === category.id
              ? { 
                  backgroundColor: restaurant.theme_color, 
                  color: "white",
                  boxShadow: `0 4px 12px ${restaurant.theme_color}40`
                }
              : {}
          }
        >
          {category.name}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: restaurant.background_color }}>
      {/* Header Banner */}
      <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        {restaurant.banner_image_url ? (
          <>
            <img
              src={restaurant.banner_image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: restaurant.theme_color }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <ChefHat className="relative h-24 w-24 sm:h-32 sm:w-32 text-white/20" />
          </div>
        )}
        
        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white animate-slide-up">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-4">
              {restaurant.logo_url && (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                  <img
                    src={restaurant.logo_url}
                    alt=""
                    className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-white shadow-2xl object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 drop-shadow-lg tracking-tight">
                  {restaurant.name}
                </h1>
                {restaurant.description && (
                  <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
                    {restaurant.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Info Bar with Filters */}
      <div className="border-b border-border/50 bg-card/95 backdrop-blur-lg sticky top-0 z-40 shadow-lg">
        <div className="container max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm">
              {restaurant.address && (
                <div className="flex items-start sm:items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 sm:mt-0 flex-shrink-0" />
                  <span className="line-clamp-1">{restaurant.address}</span>
                </div>
              )}
              {restaurant.contact_phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{restaurant.contact_phone}</span>
                </div>
              )}
            </div>

            {/* Diet Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium mr-1 hidden sm:inline">Filter:</span>
              <Button
                variant={dietFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setDietFilter("all")}
                className="h-9 px-4 transition-all duration-300 hover:scale-105 font-medium"
              >
                All
              </Button>
              <Button
                variant={dietFilter === "veg" ? "default" : "outline"}
                size="sm"
                onClick={() => setDietFilter("veg")}
                className="h-9 px-3 sm:px-4 gap-2 transition-all duration-300 hover:scale-105 font-medium"
                style={dietFilter === "veg" ? { backgroundColor: "#16a34a" } : {}}
              >
                <VegIcon />
                <span className="hidden sm:inline">Veg</span>
              </Button>
              <Button
                variant={dietFilter === "non-veg" ? "default" : "outline"}
                size="sm"
                onClick={() => setDietFilter("non-veg")}
                className="h-9 px-3 sm:px-4 gap-2 transition-all duration-300 hover:scale-105 font-medium"
                style={dietFilter === "non-veg" ? { backgroundColor: "#dc2626" } : {}}
              >
                <NonVegIcon />
                <span className="hidden sm:inline">Non-Veg</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <CategoryNav />
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="rounded-full h-14 w-14 sm:h-16 sm:w-16 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 animate-scale-in border-2 border-background"
                  style={{ backgroundColor: restaurant.theme_color }}
                >
                  <MenuIcon className="h-6 w-6 sm:h-7 sm:w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-80">
                <ScrollArea className="h-full py-6">
                  <CategoryNav mobile />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3 space-y-8 sm:space-y-12">
            {categories.map(category => {
              const items = getCategoryItems(category.id);
              if (items.length === 0) return null;

              return (
                <div key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                  <div className="mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      {category.name}
                    </h2>
                    {category.description && (
                      <p className="text-muted-foreground leading-relaxed">{category.description}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {items.map((item, index) => (
                      <Card 
                        key={item.id} 
                        className="overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer group bg-gradient-to-br from-card to-card/80 animate-slide-up"
                        style={{ animationDelay: `${index * 0.03}s`, animationFillMode: 'both' }}
                        onClick={() => {
                          setSelectedItem(item);
                          setQuantity(1);
                        }}
                      >
                        <CardContent className="p-0">
                          <div className="flex gap-3 sm:gap-4 p-3 sm:p-4">
                            {item.image_url && (
                              <div className="relative flex-shrink-0">
                                <img
                                  src={item.image_url}
                                  alt={item.name}
                                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start gap-2 mb-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {(item.is_vegetarian || item.is_vegan) ? (
                                      <VegIcon />
                                    ) : (
                                      <NonVegIcon />
                                    )}
                                  </div>
                                  <h3 className="font-semibold text-base sm:text-lg leading-tight group-hover:text-primary transition-colors duration-300">
                                    {item.name}
                                  </h3>
                                </div>
                                <span
                                  className="font-bold text-base sm:text-lg whitespace-nowrap flex-shrink-0"
                                  style={{ color: restaurant.theme_color }}
                                >
                                  ₹{item.price.toFixed(2)}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {item.is_spicy && (
                                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                                    <Flame className="h-3 w-3 mr-1" />
                                    Spicy
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="text-center py-20 md:py-32">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-muted/50 blur-2xl rounded-full" />
                  <ChefHat className="relative h-16 w-16 md:h-20 md:w-20 mx-auto text-muted-foreground" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">No menu items yet</h2>
                <p className="text-muted-foreground text-lg">Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dish Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden animate-scale-in">
          {selectedItem && (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Image */}
              {selectedItem.image_url && (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover animate-fade-in"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Name with Diet Icon */}
                <div className="flex items-start gap-3">
                  {(selectedItem.is_vegetarian || selectedItem.is_vegan) ? (
                    <VegIcon className="mt-1" />
                  ) : (
                    <NonVegIcon className="mt-1" />
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold flex-1">{selectedItem.name}</h2>
                </div>

                {/* Dietary Badges */}
                {selectedItem.is_spicy && (
                  <Badge variant="destructive">
                    <Flame className="h-3 w-3 mr-1" />
                    Spicy
                  </Badge>
                )}

                {/* Description */}
                {selectedItem.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedItem.description}
                  </p>
                )}

              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantMenu;