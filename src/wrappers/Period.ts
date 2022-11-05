import {
  formatUntisDate,
  formatUntisTime,
  testDate,
  testTime,
} from "#lib/timeformat/index.js";
import { element, period } from "#webuntis/resources/index.js";

type lessonType =
  | "lesson"
  | "officeHour"
  | "standby"
  | "breakSupervision"
  | "exam";

type lessonCode = "regular" | "cancelled" | "irregular";

type activityType = "Unterricht" | "Bereitschaft";

/**
 * Wrapper around the period objects returned by the WebUntis API.
 */
export class Period {
  /**
   * Elements that are associated with this period, grouped by their type.
   * Each list is sorted by the element ids.
   */
  readonly elements: {
    readonly classes: readonly PeriodElement[];
    readonly teachers: readonly PeriodElement[];
    readonly subjects: readonly PeriodElement[];
    readonly rooms: readonly PeriodElement[];
  };

  constructor(
    /**
     * The lesson's id.
     */
    readonly id: number,

    /**
     * Type of the lesson.
     */
    readonly lessonType: lessonType,

    /**
     * Code that contains whether the lesson is regular, irregular or cancelled.
     */
    readonly lessonCode: lessonCode,

    /**
     * Lesson number. Unique per student group.
     */
    readonly lessonNumber: number,

    /**
     * Lesson text.
     */
    readonly lessonText: string,

    /**
     * Describes a substitution if present.
     */
    readonly substitutionText: string | null,

    /**
     * Activity type of the lesson.
     */
    readonly activityType: activityType,

    /**
     * Student group for this lesson.
     */
    readonly studentGroup: string | null,

    elements: {
      classes: PeriodElement[];
      teachers: PeriodElement[];
      subjects: PeriodElement[];
      rooms: PeriodElement[];
    },

    /**
     * Date of the lesson, formatted as `yyyy-mm-dd`.
     */
    private date: string,

    /**
     * Start time of the lesson, formatted as `hh:mm`.
     */
    private startTime: string,

    /**
     * End time of the lesson, formatted as `hh:mm`.
     */
    private endTime: string
  ) {
    testDate(date);
    testTime(startTime);
    testTime(endTime);

    // Sort elements by id
    for (let e of Object.values(elements)) {
      e.sort((a, b) => a.id - b.id);
    }
    this.elements = elements;
  }

  /**
   * Creates a new instance of this class.
   * @param period the period returned by WebUntis.
   * @returns the new instance
   */
  static from(period: period) {
    return new Period(
      period.id,
      period.lstype === "bs"
        ? "breakSupervision"
        : period.lstype === "ex"
        ? "exam"
        : period.lstype === "oh"
        ? "officeHour"
        : period.lstype === "sb"
        ? "standby"
        : "lesson",
      period.code === "cancelled"
        ? "cancelled"
        : period.code === "irregular"
        ? "irregular"
        : "regular",
      period.lsnumber,
      period.lstext,
      period.substText || null,
      period.activityType,
      period.sg || null,
      {
        classes: period.kl.map(PeriodElement.from),
        rooms: period.ro.map(PeriodElement.from),
        subjects: period.su.map(PeriodElement.from),
        teachers: period.te.map(PeriodElement.from),
      },
      formatUntisDate(period.date),
      formatUntisTime(period.startTime),
      formatUntisTime(period.endTime)
    );
  }

  /**
   * Return's the lesson's date as a string, formatted as `yyyy-mm-dd`.
   * @returns the date
   */
  getDateAsString = () => this.date;

  /**
   * Parses the lesson's date into a JS {@link Date} object.
   * @returns the date object
   */
  getDateAsObject = () => new Date(this.date);

  /**
   * Return's the lesson's start time as a string, formatted as `hh:mm`.
   * @returns the start time
   */
  getStartTimeAsString = () => this.startTime;

  /**
   * Combines the lesson's date and start time into a date time, formatted as `yyyy-mm-ddThh:mm`.
   * @returns the date time
   */
  getStartDateTimeAsString = () => `${this.date}T${this.startTime}`;

  /**
   * Combines the lesson's date and start time into a date time and parses it into a {@link Date} object.
   * @returns the date object
   */
  getStartDateTimeAsObject = () => new Date(this.getStartDateTimeAsString());

  /**
   * Return's the lesson's end time as a string, formatted as `hh:mm`.
   * @returns the end time
   */
  getEndTimeAsString = () => this.endTime;

  /**
   * Combines the lesson's date and end time into a date time, formatted as `yyyy-mm-ddThh:mm`.
   * @returns the date time
   */
  getEndDateTimeAsString = () => `${this.date}T${this.endTime}`;

  /**
   * Combines the lesson's date and end time into a date time and parses it into a {@link Date} object.
   * @returns the date object
   */
  getEndDateTimeAsObject = () => new Date(this.getEndDateTimeAsString());

  /**
   * Checks whether two lessons have the same elements.
   * @param other the lesson to compare to
   * @returns whether the lessons have the same elements
   */
  hasTheSameElementsAs = (other: Period): boolean =>
    Object.entries(this.elements).every(([type, elements]) => {
      let [a, b] = [
        elements,
        other.elements[type as keyof Period["elements"]],
      ].map((elements) => elements.map((e) => e.id).join());
      return a === b;
    });

  /**
   * Checks whether this lesson deviates from its weekly schedule.
   * A deviation could be that the lesson is cancelled or has substituted or missing elements compared to its schedule.
   * @returns whether the period deviates from its schedule
   */
  deviatesFromSchedule = (): boolean =>
    this.substitutionText !== null ||
    this.lessonCode !== "regular" ||
    Object.values(this.elements)
      .flat()
      .some((element) => element.isSubstituted());

  /**
   * Checks whether two lessons belong to the same schedule.
   * Two lessons belong to the same schedule if they have the same lesson number, occur on the same weekday, and start and end at the same time.
   * @param other lesson to compare to
   * @returns whether the lessons belong to the same schedule
   */
  belongsToSameScheduleAs(other: Period): boolean {
    return (
      this.lessonNumber === other.lessonNumber &&
      this.getDateAsObject().getDay() === other.getDateAsObject().getDay() &&
      this.getStartTimeAsString() === other.getStartTimeAsString() &&
      this.getEndTimeAsString() === other.getEndTimeAsString()
    );
  }

  /**
   * Checks whether two lessons can be combined into one longer lessons.
   * Two lessons can be combined if they belong to they both occur on the same date, belong to the same schedule ({@link Period.belongsToSameScheduleAs()}),
   * one takes place directly after the other, and both have the same lesson code and elements
   * @param other lesson to compare to
   * @returns whether the lessons can be combined
   */
  canBeCombinedWith = (other: Period): boolean =>
    // belong to the same schedule and occur on the same date
    this.lessonNumber === other.lessonNumber &&
    this.getDateAsString() === other.getDateAsString() &&
    // one lesson starts immediately after the other lesson ends
    (this.getStartTimeAsString() === other.getEndTimeAsString() ||
      other.getStartTimeAsString() === this.getEndTimeAsString()) &&
    // both lessons have the same elements and substitution status
    this.lessonCode === other.lessonCode &&
    this.hasTheSameElementsAs(other);

  /**
   * Combines two lessons into one longer lesson. Should only be used after checking {@link Period.canBeCombinedWith()}.
   * @param other lesson to combine with
   * @returns a new period that takes the start date from the earlier of lessons and the end date from the later. All other properties are equal to this period
   */
  combineWith(other: Period): Period {
    let [earlier, later] = [this, other].sort(
      (a, b) =>
        a.getStartDateTimeAsObject().valueOf() -
        b.getStartDateTimeAsObject().valueOf()
    );

    return new Period(
      this.id,
      this.lessonType,
      this.lessonCode,
      this.lessonNumber,
      this.lessonText,
      this.substitutionText,
      this.activityType,
      this.studentGroup,
      this.elements as ConstructorParameters<typeof Period>[8],
      this.getDateAsString(),
      earlier!.getStartTimeAsString(),
      later!.getEndTimeAsString()
    );
  }
}

/**
 * Wrapper around an element included in a {@link Period}.
 */
export class PeriodElement {
  constructor(
    /**
     * Id of the element.
     */
    readonly id: number,

    /**
     * Short name of the element.
     */
    readonly name: string,

    /**
     * Longer name of the element.
     */
    readonly longName: string
  ) {}

  /**
   * Creates a new instance of this class.
   * @param element the element returned by WebUntis.
   * @returns an instance of either {@link PeriodElement} or {@link SubstitutedPeriodElement}
   */
  static from(element: element) {
    return element.orgid && element.orgname
      ? new SubstitutedPeriodElement(
          element.id,
          element.name,
          element.longname,
          element.orgid,
          element.orgname
        )
      : new PeriodElement(element.id, element.name, element.longname);
  }

  /**
   * Returns whether the element is substituted.
   * @returns whether the element is substituted
   */
  isSubstituted = () => this instanceof SubstitutedPeriodElement;
}

/**
 * Wrapper around a substituted element included in a {@link Period}.
 */
export class SubstitutedPeriodElement extends PeriodElement {
  constructor(
    id: number,
    name: string,
    longName: string,
    readonly originalId: number,
    readonly originalName: string
  ) {
    super(id, name, longName);
  }
}
