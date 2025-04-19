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

export type OpenverseImageResult = {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  creator: string;
  creator_url: string;
  license: string;
  provider: string;
  source: string;
  type: string;
  extension?: string;
  aspect_ratio?: string;
  height?: number;
  width?: number;
  tags?: { name: string }[];
  is_sensitive?: boolean;
};

export type OpenverseAudioResult = {
  id: string;
  url: string;
  title: string;
  creator: string;
  creator_url: string;
  license: string;
  provider: string;
  source: string;
  type: string;
  extension?: string;
  tags?: { name: string }[];
  is_sensitive?: boolean;
  duration?: number;
  waveform?: number[];
};

export type OpenverseParams = {
  query: string;
  page?: number;
  license?: string[];
  source?: string[];
  extension?: string[];
  aspect_ratio?: string;
  size?: string;
  type?: "image" | "audio";
  sensitive?: boolean;
  blur_sensitive?: boolean;
  image_type?: string;
  use_commercial?: boolean;
  modifiable?: boolean;
};

export class OpenverseApi {
  static BASE_URL = import.meta.env.DEV
    ? "https://api.openverse.org/v1"
    : "https://api.openverse.org/v1";
  private token?: string;

  constructor(token?: string) {
    this.token = token;
  }

  async searchImages(
    params: OpenverseParams,
    signal?: AbortSignal
  ): Promise<{ results: OpenverseImageResult[]; total: number }> {
    const url = this.buildUrl("images", params);
    console.log("Fetching Images URL:", url);
    const res = await fetch(url, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      signal,
    });
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    console.log("Images API response (full):", JSON.stringify(json, null, 2));
    return {
      results: json.results || [],
      total: json.result_count || 0,
    };
  }

  async searchAudio(
    params: OpenverseParams,
    signal?: AbortSignal
  ): Promise<{ results: OpenverseAudioResult[]; total: number }> {
    const url = this.buildUrl("audio", params);
    console.log("Fetching Audio URL:", url);
    const res = await fetch(url, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      signal,
    });
    if (!res.ok) {
      throw new Error(`API request failed: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    console.log("Audio API response (full):", JSON.stringify(json, null, 2));
    return {
      results: (json.results || []).map((result: any) => ({
        ...result,
        waveform: Array.isArray(result.waveform)
          ? result.waveform
          : Array(100)
              .fill(0)
              .map(() => Math.random() * 0.5),
        duration: result.duration || 0,
      })),
      total: json.result_count || 0,
    };
  }

  private buildUrl(type: "images" | "audio", params: OpenverseParams) {
    const validLicenses = [
      "pdm",
      "cc0",
      "by",
      "by-sa",
      "by-nc",
      "by-nc-sa",
      "by-nd",
      "by-nc-nd",
    ];
    const validExtensions = ["jpg", "png", "gif"];
    const validSources = [
      "nasa",
      "flickr",
      "wikimedia",
      "europeana",
      "rijksmuseum",
      "smithsonian",
      "brooklynmuseum",
    ];
    const validAspectRatios = ["tall", "wide", "square"];
    const validSizes = ["small", "medium", "large"];
    const validImageTypes = ["photo", "illustration", "digitized_artwork"];

    const u = new URL(`${OpenverseApi.BASE_URL}/${type}/`);
    if (params.query) u.searchParams.set("q", params.query);
    if (params.page) u.searchParams.set("page", String(params.page));
    if (params.license?.length) {
      const licenses = params.license.filter((l) => validLicenses.includes(l));
      if (licenses.length) u.searchParams.set("license", licenses.join(","));
    }
    if (params.source?.length) {
      const sources = params.source.filter((s) => validSources.includes(s));
      if (sources.length) u.searchParams.set("source", sources.join(","));
    }
    if (params.extension?.length) {
      const extensions = params.extension.filter((e) =>
        validExtensions.includes(e)
      );
      if (extensions.length)
        u.searchParams.set("extension", extensions.join(","));
    }
    if (
      params.aspect_ratio &&
      validAspectRatios.includes(params.aspect_ratio)
    ) {
      u.searchParams.set("aspect_ratio", params.aspect_ratio);
    }
    if (params.size && validSizes.includes(params.size)) {
      u.searchParams.set("size", params.size);
    }
    if (params.image_type && validImageTypes.includes(params.image_type)) {
      u.searchParams.set("category", params.image_type);
    }
    if (params.sensitive !== undefined) {
      u.searchParams.set("mature", params.sensitive ? "true" : "false");
    }
    if (params.blur_sensitive !== undefined) {
      u.searchParams.set(
        "filter_dead",
        params.blur_sensitive ? "true" : "false"
      );
    }

    const licenseTypes: string[] = [];
    if (params.use_commercial) licenseTypes.push("commercial");
    if (params.modifiable) licenseTypes.push("modification");
    if (licenseTypes.length) {
      u.searchParams.set("license_type", licenseTypes.join(","));
    }

    return u.toString();
  }
}
