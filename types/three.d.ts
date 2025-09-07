// Minimal ambient declaration for OBJLoader to satisfy TypeScript without
// conflicting with three's internal types. We don't extend Loader to avoid
// duplicate identifier issues if types evolve.
declare module 'three/examples/jsm/loaders/OBJLoader.js' {
  export class OBJLoader {
    load(url: string, onLoad: (group: any) => void, onProgress?: (event: any) => void, onError?: (event: any) => void): void;
    parse(data: string): any;
  }
}
