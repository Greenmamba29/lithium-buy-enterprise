export interface DirectoryItem {
  id: string;
  name: string;
  category: 'Mining' | 'Technology' | 'Energy Storage' | 'Investment';
  description: string;
  location: string;
  imageUrl: string;
}

export interface GeneratedImage {
  imageUrl: string;
  prompt: string;
  timestamp: number;
}
