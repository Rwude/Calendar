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
  groupId?: number;
  childId: number;
  color?: string;
  backgroundColor?: string;
  dragPrecision?: [number, EnumTime];
  tooltip?: string;
}

export interface Group {
  id: number;
  name: string;
  tooltip?: string;
  childIds: number[];
}

export interface Child {
  id: number;
  name: string;
  shortName?: string;
  picture?: string;
  groupId: number;
}

export interface TreeData {
    name: string;
    picture?: string;
    isChild: boolean;
    id: number;
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
    zIndex?: number;
    additionalHeight?: number;
}

export interface GroupPosition {
    top?: number;
    left?: number;
    width?: number;
    color: string;
}
