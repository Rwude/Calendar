export interface Period {
  name: string;
  classes?: string;
  timeFrame: [number, EnumTime];
  start?: number;
  headerClickable: boolean;
  timeFramePeriod: [number, EnumTime];
  width?: number;
  timeFrameHeadersId?: {bigHeader: number, smallHeader: number };
  tooltip?: string;
}

export enum EnumTime {
    Minute = 'minute',
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
  importance?: number;
  start: number;
  end: number;
  groupId?: number;
  childId: number;
  color?: string;
  backgroundColor?: string;
  dragPrecision?: [number, EnumTime];
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
    eventIndex: number;
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
