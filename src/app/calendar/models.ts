export interface Period {
  name: string;
  classes?: string;
  timeFrame: [number, EnumTimeFrame];
  start?: number;
  headerClickable: boolean;
  timeFramePeriod: [number, EnumTime];
  width?: number;
  timeFrameHeadersId?: {bigHeader: number, smallHeader: number };
  tooltip?: string;
}

export enum EnumTime {
    Minute = 60000,
    Hour = 3600000,
    Day = 86400000,
    Week = 604800000
}

export enum EnumTimeFrame {
    Hour = 'hour',
    Day = 'day',
    Week = 'week',
    Month = 'month',
    Year = 'year'
}

export interface TimeFrameHeader {
    bigHeader: BigTimeFrameHeader[];
    smallHeader: SmallTimeFrameHeader[];
}

export interface BigTimeFrameHeader {
    name: string;
    id: number;
    start: number;
    smallHeaderIds: number[];
}

export interface SmallTimeFrameHeader {
    name: string;
    id: number;
    bigHeaderId: number;
    start: number;
    hovered: boolean;
}

export interface EventItem {
  id: number;
  name: string;
  showedName: string;
  start: number;
  end: number;
  classes?: string;
  sectionId?: number;
  personId: number;
  color?: string;
  backgroundColor?: string;
  tooltip?: string;
}

export interface Section {
  id: number;
  name: string;
  tooltip?: string;
  personIds: number[];
}

export interface Person {
  id: number;
  name: string;
  shortName?: string;
  picture?: string;
  sectionId: number;
}

export interface TreeData {
    name: string;
    picture?: string;
    isPerson: boolean;
    personId?: number;
    hovered: boolean;
    height: number;
    showChildren?: boolean
    children?: TreeData[];
}

export interface GridPosition {
    visible: boolean;
    top?: number;
    left?: number;
    width?: number;
    additionalHeight?: number;
}
