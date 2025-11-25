declare module 'drawflow' {
  export default class Drawflow {
    constructor(container: HTMLElement, render?: any);
    
    reroute: boolean;
    reroute_fix_curvature: boolean;
    force_first_input: boolean;
    drawflow: any;
    
    start(): void;
    clear(): void;
    export(): any;
    import(data: any): void;
    addNode(name: string, inputs: number, outputs: number, posx: number, posy: number, classoverride: string, data: any, html: string): void;
    removeNode(id: string): void;
    on(event: string, callback: (data: any) => void): void;
  }
}

declare module 'drawflow/dist/drawflow.min.css';
