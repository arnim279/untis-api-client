/** Different time units, represented in milliseconds. */
export enum TimeUnits {
  Millisecond = 1,
  Second = 1000 * TimeUnits.Millisecond,
  Minute = 60 * TimeUnits.Second,
  Hour = 60 * TimeUnits.Minute,
  Day = 24 * TimeUnits.Hour,
  Week = 7 * TimeUnits.Day,
}
