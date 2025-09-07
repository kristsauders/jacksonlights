declare module 'three';
declare module 'three/examples/jsm/loaders/OBJLoader' {
  export class OBJLoader {
    load(url:string, onLoad:(obj:any)=>void, onProgress?:any, onError?:any):void;
  }
}