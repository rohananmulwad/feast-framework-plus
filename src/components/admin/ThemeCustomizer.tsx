import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Palette, Type, Layout, Sparkles } from "lucide-react";

interface ThemeFormData {
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
}

interface ThemeCustomizerProps {
  formData: ThemeFormData;
  onChange: (data: Partial<ThemeFormData>) => void;
}

const fontOptions = [
  { value: "Inter", label: "Inter (Modern)" },
  { value: "Poppins", label: "Poppins (Friendly)" },
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Montserrat", label: "Montserrat (Clean)" },
  { value: "Roboto", label: "Roboto (Classic)" },
  { value: "Lora", label: "Lora (Serif)" },
  { value: "Nunito", label: "Nunito (Rounded)" },
  { value: "Raleway", label: "Raleway (Stylish)" },
  { value: "Open Sans", label: "Open Sans (Readable)" },
  { value: "Oswald", label: "Oswald (Bold)" },
];

const ColorInput = ({ 
  id, 
  label, 
  value, 
  onChange,
  description 
}: { 
  id: string; 
  label: string; 
  value: string; 
  onChange: (value: string) => void;
  description?: string;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id} className="text-sm font-medium">{label}</Label>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
    <div className="flex gap-2">
      <div className="relative">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-1 cursor-pointer border-2 rounded-lg"
        />
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#FFFFFF"
        className="flex-1 font-mono text-sm"
      />
    </div>
  </div>
);

const ThemeCustomizer = ({ formData, onChange }: ThemeCustomizerProps) => {
  return (
    <div className="space-y-6">
      {/* Primary Colors Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Palette className="h-5 w-5" />
          <h4 className="font-semibold">Primary Colors</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
          <ColorInput
            id="theme_color"
            label="Primary / Theme Color"
            value={formData.theme_color}
            onChange={(value) => onChange({ theme_color: value })}
            description="Main accent color for buttons, links"
          />
          <ColorInput
            id="background_color"
            label="Page Background"
            value={formData.background_color}
            onChange={(value) => onChange({ background_color: value })}
            description="Main background of the menu page"
          />
          <ColorInput
            id="text_color"
            label="Text Color"
            value={formData.text_color}
            onChange={(value) => onChange({ text_color: value })}
            description="Primary text color"
          />
          <ColorInput
            id="border_color"
            label="Border Color"
            value={formData.border_color}
            onChange={(value) => onChange({ border_color: value })}
            description="Dividers and card borders"
          />
        </div>
      </div>

      <Separator />

      {/* Card Styling Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Layout className="h-5 w-5" />
          <h4 className="font-semibold">Card & Item Styling</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
          <ColorInput
            id="card_color"
            label="Card Background"
            value={formData.card_color}
            onChange={(value) => onChange({ card_color: value })}
            description="Background of menu item cards"
          />
          <ColorInput
            id="card_text_color"
            label="Card Text Color"
            value={formData.card_text_color}
            onChange={(value) => onChange({ card_text_color: value })}
            description="Text inside cards"
          />
          <ColorInput
            id="price_color"
            label="Price Color"
            value={formData.price_color}
            onChange={(value) => onChange({ price_color: value })}
            description="Color for price display"
          />
          <ColorInput
            id="category_header_color"
            label="Category Title Color"
            value={formData.category_header_color}
            onChange={(value) => onChange({ category_header_color: value })}
            description="Color for category headings"
          />
        </div>
      </div>

      <Separator />

      {/* Header & Buttons Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Sparkles className="h-5 w-5" />
          <h4 className="font-semibold">Header & Buttons</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-7">
          <ColorInput
            id="header_gradient_start"
            label="Header Gradient Start"
            value={formData.header_gradient_start}
            onChange={(value) => onChange({ header_gradient_start: value })}
            description="Top color of header overlay"
          />
          <ColorInput
            id="header_gradient_end"
            label="Header Gradient End"
            value={formData.header_gradient_end}
            onChange={(value) => onChange({ header_gradient_end: value })}
            description="Bottom color of header overlay"
          />
          <ColorInput
            id="button_color"
            label="Button Background"
            value={formData.button_color}
            onChange={(value) => onChange({ button_color: value })}
            description="Primary button color"
          />
          <ColorInput
            id="button_text_color"
            label="Button Text Color"
            value={formData.button_text_color}
            onChange={(value) => onChange({ button_text_color: value })}
            description="Text on buttons"
          />
        </div>
      </div>

      <Separator />

      {/* Typography Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Type className="h-5 w-5" />
          <h4 className="font-semibold">Typography</h4>
        </div>
        <div className="pl-7">
          <Label htmlFor="font_family">Font Family</Label>
          <p className="text-xs text-muted-foreground mb-2">Choose a font style for your menu</p>
          <Select
            value={formData.font_family}
            onValueChange={(value) => onChange({ font_family: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Live Preview */}
      <Separator />
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-muted-foreground">Live Preview</h4>
        <div 
          className="rounded-xl p-4 border-2 transition-all duration-300"
          style={{ 
            backgroundColor: formData.background_color,
            borderColor: formData.border_color,
            fontFamily: formData.font_family
          }}
        >
          <h3 
            className="text-lg font-bold mb-2"
            style={{ color: formData.category_header_color }}
          >
            Category Name
          </h3>
          <div 
            className="rounded-lg p-3 flex justify-between items-center"
            style={{ 
              backgroundColor: formData.card_color,
              borderColor: formData.border_color,
              border: '1px solid'
            }}
          >
            <div>
              <p style={{ color: formData.card_text_color }} className="font-medium">
                Menu Item Name
              </p>
              <p style={{ color: formData.card_text_color, opacity: 0.7 }} className="text-sm">
                Description text...
              </p>
            </div>
            <span style={{ color: formData.price_color }} className="font-bold text-lg">
              ₹249
            </span>
          </div>
          <button
            className="mt-3 px-4 py-2 rounded-lg font-medium transition-all"
            style={{ 
              backgroundColor: formData.button_color,
              color: formData.button_text_color
            }}
          >
            Sample Button
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
