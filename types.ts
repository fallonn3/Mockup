export enum MockupCategory {
  STATIONERY = 'Papelaria',
  FACADE = 'Fachada de Loja',
  PACKAGING = 'Embalagem de Produto',
  TSHIRT = 'Camiseta',
  HOODIE = 'Moletom',
  MUG = 'Caneca',
  MOBILE = 'Smartphone',
  DESKTOP = 'Monitor Desktop',
  TABLET = 'Tablet',
  POSTER = 'Poster na Parede',
  TOTE_BAG = 'Ecobag'
}

export interface GeneratedImage {
  id: string;
  url: string | null;
  loading: boolean;
  error: string | null;
}

export interface GenerateRequest {
  image: string; // base64
  category: MockupCategory;
  description: string;
}
