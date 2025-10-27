import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Leaf, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Restaurant {
  id: string;
  name: string;
}

interface Category {
  id: string;
  restaurant_id: string;
  name: string;
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
  display_order: number;
  menu_categories: { name: string; restaurants: { name: string } };
}

const MenuItemsAdmin = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    image_url: "",
    is_vegetarian: false,
    is_vegan: false,
    is_spicy: false,
    display_order: 0,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchCategories(selectedRestaurant);
      fetchMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setRestaurants(data || []);
      if (data && data.length > 0) {
        setSelectedRestaurant(data[0].id);
      }
    } catch (error) {
      toast.error("Failed to load restaurants");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from("menu_categories")
        .select("id, restaurant_id, name")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*, menu_categories!inner(name, restaurants!inner(name))")
        .eq("menu_categories.restaurant_id", restaurantId)
        .order("display_order");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Menu item updated successfully");
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert([itemData]);

        if (error) throw error;
        toast.success("Menu item created successfully");
      }

      setDialogOpen(false);
      resetForm();
      if (selectedRestaurant) {
        fetchMenuItems(selectedRestaurant);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save menu item");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id,
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      image_url: item.image_url || "",
      is_vegetarian: item.is_vegetarian,
      is_vegan: item.is_vegan,
      is_spicy: item.is_spicy,
      display_order: item.display_order,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Menu item deleted successfully");
      if (selectedRestaurant) {
        fetchMenuItems(selectedRestaurant);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete menu item");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      category_id: "",
      name: "",
      description: "",
      price: "",
      image_url: "",
      is_vegetarian: false,
      is_vegan: false,
      is_spicy: false,
      display_order: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold">Menu Items</h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="299.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Image</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Browse"}
                    </Button>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-md mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Dietary & Features</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_vegetarian"
                      checked={formData.is_vegetarian}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_vegetarian: checked as boolean, is_vegan: false })
                      }
                    />
                    <label htmlFor="is_vegetarian" className="text-sm cursor-pointer">
                      Vegetarian
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_vegan"
                      checked={formData.is_vegan}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_vegan: checked as boolean, is_vegetarian: false })
                      }
                    />
                    <label htmlFor="is_vegan" className="text-sm cursor-pointer">
                      Vegan
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_nonveg"
                      checked={!formData.is_vegetarian && !formData.is_vegan}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, is_vegetarian: false, is_vegan: false })
                        }
                      }}
                    />
                    <label htmlFor="is_nonveg" className="text-sm cursor-pointer">
                      Non-Veg
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_spicy"
                      checked={formData.is_spicy}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, is_spicy: checked as boolean })
                      }
                    />
                    <label htmlFor="is_spicy" className="text-sm cursor-pointer">
                      Spicy
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingItem ? "Update" : "Create"} Item
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No menu items yet. Add your first item!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.image_url && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                  <span className="text-lg font-bold text-primary">${item.price.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.menu_categories.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.description && (
                  <p className="text-sm line-clamp-2">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {item.is_vegetarian && (
                    <Badge variant="secondary" className="text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegetarian
                    </Badge>
                  )}
                  {item.is_vegan && (
                    <Badge variant="secondary" className="text-xs">
                      <Leaf className="h-3 w-3 mr-1" />
                      Vegan
                    </Badge>
                  )}
                  {item.is_spicy && (
                    <Badge variant="destructive" className="text-xs">
                      <Flame className="h-3 w-3 mr-1" />
                      Spicy
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
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

export default MenuItemsAdmin;