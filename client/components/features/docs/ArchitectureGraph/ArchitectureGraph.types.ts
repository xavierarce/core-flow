export interface LayerNode {
  label: string;
  detail?: string;
  color?: string;
}

export interface Layer {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  textColor: string;
  bgClass: string;
  borderClass: string;
  nodes: Array<LayerNode>;
}
