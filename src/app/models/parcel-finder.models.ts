export interface ICropClassification {
    class: string,
    name: string,
    type: string,
    subtype1: string | null;
    subtype2: string | null;
}

export interface IGroupedCropClassification {
  [type: string]: {
    [subtype: string]: ICropClassification[];
  };
}

export interface ISelectedCrop {
  classification: ICropClassification;
  surface: number | null;
}