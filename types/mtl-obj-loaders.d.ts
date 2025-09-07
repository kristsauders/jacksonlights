declare module 'three/examples/jsm/loaders/MTLLoader' {
  export class MTLLoader {
    constructor(manager?: any);
    setResourcePath(path: string): this;
    load(url: string, onLoad: (mtl: any)=>void, onProgress?: any, onError?: any): void;
    preload(): void;
  }
}

declare module 'three/examples/jsm/loaders/OBJLoader' {
  // Augment existing class (minimal) – if already declared, this merges.
  interface OBJLoader {
    setMaterials?(mtls: any): this;
  }
}