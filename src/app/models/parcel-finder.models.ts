export interface cropClassification {
    class: string,
    name: string,
    type: string,
    subtype1: string | null;
    subtype2: string | null;
}

export interface GroupedCropClassification {
  [type: string]: {
    [subtype: string]: cropClassification[];
  };
}