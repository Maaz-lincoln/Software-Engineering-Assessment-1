export type LicenseOption =
  | "pdm"
  | "cc0"
  | "by"
  | "by-sa"
  | "by-nd"
  | "by-nc"
  | "by-nc-sa"
  | "by-nc-nd";
export interface Filters {
  license?: string[];
  use_commercial?: boolean;
  modifiable?: boolean;
  extension?: string[];
  source?: string[];
  aspect_ratio?: string;
  size?: string;
  image_type?: string;
  sensitive?: boolean;
  blur_sensitive?: boolean;
}
