import { IGeojsonGeometry } from "./parcel-finder-response.models";

export interface IParcelDrawerGeojson extends IGeojsonGeometry {
  properties: { [key: string]: any}
}
