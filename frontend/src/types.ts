export interface GenerateSeoInput {
  input: {
    product_name: string;
    category: string;
    keywords: string[];
  };
}

export interface SeoResult {
  title: string;
  meta_description: string;
  h1: string;
  description: string;
  bullets: string[];
}
