import { IGeojsonGeometry } from "./parcel-finder-response.models";

export interface IParcelDrawerGeojson {
  type: string,
  geometry: IGeojsonGeometry,
  properties: { [key: string]: any}
}
