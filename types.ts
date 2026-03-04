
export interface GeneratedIcon {
  id: string;
  idea: string;
  imageUrl: string;
  videoUrl?: string;
  isAnimating: boolean;
  status: 'idle' | 'generating-video' | 'complete';
  timestamp: number;
  format: 'icon' | 'banner';
}

export interface StyleConfig {
  colorTone: string;
  colorRange: string;
  lightingType: string;
  lightingDirection: string;
  arrangement: string;
  primaryColor: string;
  format: 'icon' | 'banner';
}

export interface AppState {
  icons: GeneratedIcon[];
  isGeneratingIcon: boolean;
  error: string | null;
  hasApiKey: boolean;
  styleConfig: StyleConfig;
}

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  colorTone: "naturalistic with slight saturation boost",
  colorRange: "harmonious muted tones with gentle contrast",
  lightingType: "soft ambient light",
  lightingDirection: "subtle top-right direction",
  arrangement: "central dominant object, with supporting elements symmetrically placed",
  primaryColor: "#6366f1", // Default Indigo
  format: 'icon'
};

export const getIconStyleJson = (config: StyleConfig) => {
  const isBanner = config.format === 'banner';
  
  return {
    "icon_style": {
      "perspective": "isometric",
      "geometry": {
        "proportions": isBanner ? "16:9 ratio canvas, with objects distributed across the horizontal span" : "1:1 ratio canvas, with objects fitting comfortably within margins",
        "element_arrangement": isBanner ? "dynamic horizontal composition, featuring a primary scene with secondary elements spread to the sides" : config.arrangement
      },
      "composition": {
        "element_count": isBanner ? "4–6 main objects" : "2–4 main objects",
        "spatial_depth": "layered to create sense of dimension and slight elevation",
        "scale_consistency": "uniform object scale across set",
        "scene_density": isBanner ? "moderate, creating a rich horizontal landscape" : "minimal to moderate, maintaining clarity and visual focus"
      },
      "lighting": {
        "type": config.lightingType,
        "light_source": config.lightingDirection,
        "shadow": "gentle drop shadows below and behind objects",
        "highlighting": "mild edge illumination to define forms"
      },
      "textures": {
        "material_finish": "semi-matte to satin surfaces",
        "surface_treatment": "smooth with light tactile variation (e.g., wood grain, soft textures)",
        "texture_realism": "stylized naturalism without hyper-realistic noise"
      },
      "render_quality": {
        "resolution": "high-resolution octane 3D rendering",
        "edge_definition": "crisp, no outlines; separation achieved via lighting and depth",
        "visual_clarity": "clean, readable shapes with minimal clutter"
      },
      "color_palette": {
        "tone": config.colorTone,
        "range": config.colorRange,
        "primary_accent": config.primaryColor,
        "usage": `distinct colors per object featuring ${config.primaryColor} as the dominant primary accent to improve identification and readability`
      },
      "background": {
        "color": "#FFFFFF",
        "style": "pure white, flat",
        "texture": "none"
      },
      "stylistic_tone": "premium, friendly, clean with lifestyle or service-oriented appeal",
      "icon_behavior": {
        "branding_alignment": "neutral enough for broad applications",
        "scalability": "legible at small and medium sizes",
        "interchangeability": "part of a cohesive icon system with interchangeable subject matter"
      }
    }
  };
};
