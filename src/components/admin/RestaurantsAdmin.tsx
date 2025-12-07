import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Settings, Palette, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import ThemeCustomizer from "./ThemeCustomizer";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  theme_color: string;
  background_color: string;
  text_color: string;
  card_color: string;
  card_text_color: string;
  price_color: string;
  category_header_color: string;
  header_gradient_start: string;
  header_gradient_end: string;
  button_color: string;
  button_text_color: string;
  border_color: string;
  font_family: string;
  contact_phone: string | null;
  address: string | null;
  is_active: boolean;
}

const RestaurantsAdmin = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    banner_image_url: "",
    theme_color: "#FF6B35",
    background_color: "#1a1f2e",
    text_color: "#FFFFFF",
    card_color: "#242a38",
    card_text_color: "#FFFFFF",
    price_color: "#FF8A4C",
    category_header_color: "#FF8A4C",
    header_gradient_start: "#000000",
    header_gradient_end: "#1a1f2e",
    button_color: "#FF6B35",
    button_text_color: "#FFFFFF",
    border_color: "#2a3441",
    font_family: "Inter",
    contact_phone: "",
    address: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("name");

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      toast.error("Failed to load restaurants");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingRestaurant) {
        const { error } = await supabase
          .from("restaurants")
          .update(formData)
          .eq("id", editingRestaurant.id);

        if (error) throw error;
        toast.success("Restaurant updated successfully");
      } else {
        const { error } = await supabase
          .from("restaurants")
          .insert([formData]);

        if (error) throw error;
        toast.success("Restaurant created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.message || "Failed to save restaurant");
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || "",
      logo_url: (restaurant as any).logo_url || "",
      banner_image_url: (restaurant as any).banner_image_url || "",
      theme_color: restaurant.theme_color || "#FF6B35",
      background_color: restaurant.background_color || "#1a1f2e",
      text_color: restaurant.text_color || "#FFFFFF",
      card_color: restaurant.card_color || "#242a38",
      card_text_color: restaurant.card_text_color || "#FFFFFF",
      price_color: restaurant.price_color || "#FF8A4C",
      category_header_color: restaurant.category_header_color || "#FF8A4C",
      header_gradient_start: restaurant.header_gradient_start || "#000000",
      header_gradient_end: restaurant.header_gradient_end || "#1a1f2e",
      button_color: restaurant.button_color || "#FF6B35",
      button_text_color: restaurant.button_text_color || "#FFFFFF",
      border_color: restaurant.border_color || "#2a3441",
      font_family: restaurant.font_family || "Inter",
      contact_phone: restaurant.contact_phone || "",
      address: restaurant.address || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    try {
      const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete restaurant");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'banner_image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${field}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, [field]: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingRestaurant(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      banner_image_url: "",
      theme_color: "#FF6B35",
      background_color: "#1a1f2e",
      text_color: "#FFFFFF",
      card_color: "#242a38",
      card_text_color: "#FFFFFF",
      price_color: "#FF8A4C",
      category_header_color: "#FF8A4C",
      header_gradient_start: "#000000",
      header_gradient_end: "#1a1f2e",
      button_color: "#FF6B35",
      button_text_color: "#FFFFFF",
      border_color: "#2a3441",
      font_family: "Inter",
      contact_phone: "",
      address: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Restaurants</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingRestaurant ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                {editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="theme" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Theme & Colors
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Restaurant Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug * (e.g., "pizza-palace")</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logo_url">Restaurant Logo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo_url"
                        type="url"
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://example.com/logo.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Browse"}
                      </Button>
                    </div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo_url')}
                      className="hidden"
                    />
                    {formData.logo_url && (
                      <img 
                        src={formData.logo_url} 
                        alt="Logo preview" 
                        className="w-24 h-24 object-cover rounded-full border-2"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="banner_image_url">Banner Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="banner_image_url"
                        type="url"
                        value={formData.banner_image_url}
                        onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                        placeholder="https://example.com/banner.jpg"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('banner-upload')?.click()}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading..." : "Browse"}
                      </Button>
                    </div>
                    <Input
                      id="banner-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner_image_url')}
                      className="hidden"
                    />
                    {formData.banner_image_url && (
                      <img 
                        src={formData.banner_image_url} 
                        alt="Banner preview" 
                        className="w-full h-32 object-cover rounded-md"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">Contact Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="theme">
                  <ThemeCustomizer
                    formData={formData}
                    onChange={(changes) => setFormData({ ...formData, ...changes })}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-6 border-t mt-6">
                <Button type="submit" className="flex-1">
                  {editingRestaurant ? "Update" : "Create"} Restaurant
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
              <CardHeader
                className="pb-3 relative"
                style={{ 
                  background: `linear-gradient(135deg, ${restaurant.theme_color}, ${restaurant.theme_color}dd)`,
                  color: "white" 
                }}
              >
                <CardTitle className="text-lg flex items-center justify-between">
                  {restaurant.name}
                  <a 
                    href={`/menu/${restaurant.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground font-mono text-xs">/{restaurant.slug}</p>
                  {restaurant.description && (
                    <p className="line-clamp-2">{restaurant.description}</p>
                  )}
                  {/* Color Preview */}
                  <div className="flex gap-1 mt-3">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border" 
                      style={{ backgroundColor: restaurant.theme_color }}
                      title="Theme"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border" 
                      style={{ backgroundColor: restaurant.background_color }}
                      title="Background"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border" 
                      style={{ backgroundColor: restaurant.card_color || '#242a38' }}
                      title="Card"
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-border" 
                      style={{ backgroundColor: restaurant.price_color || '#FF8A4C' }}
                      title="Price"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(restaurant)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(restaurant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsAdmin;