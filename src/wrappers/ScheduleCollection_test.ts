import { assert } from "../../deps.ts";
import { Time } from "../../lib/datetime/mod.ts";
import {
  Lesson,
  LessonElement,
  LessonElementCollection,
  ScheduleCollection,
} from "./mod.ts";

Deno.test("ScheduleCollection.fromLessons() - weekly lessons should be combined into one schedule", () => {
  let { schedules } = ScheduleCollection.fromLessons(WEEKLY_LESSONS);

  assert(
    schedules.length === 1,
    "Only one schedule should be created",
  );

  assert(
    schedules[0]?.lessons.unchanged.length === 2,
    "Both lessons should be in the 'unchanged' lesson list",
  );
});

Deno.test("ScheduleCollection.combineSequentialSchedules() - should combine sequential schedules", () => {
  let { schedules } = ScheduleCollection.fromLessons(COMBINABLE_SCHEDULES)
    .combineSequentialSchedules();

  assert(
    schedules.length === 1,
    "Schedules should be combined into one",
  );
});

Deno.test("ScheduleCollection.combineSequentialSchedules() - should notice occurrences that can ony partially be combined", () => {
  let { schedules } = ScheduleCollection.fromLessons(
    PARTIALLY_DIFFERENT_OCCURRENCE,
  ).combineSequentialSchedules();

  assert(
    schedules.length === 1,
    "Schedules should be combined into one",
  );

  assert(
    schedules[0]?.lessons.changed.length === 2,
    "The last two lessons don't match the combined schedule and therefore should count as 'changed'",
  );
});

Deno.test("ScheduleCollection.combineSequentialSchedules() - should notice occurrences that can ony partially be combined because of different elements", () => {
  let { schedules } = ScheduleCollection.fromLessons(
    PARTIALLY_DIFFERENT_OCCURRENCE_ELEMENTS,
  ).combineSequentialSchedules();

  assert(
    schedules.length === 1,
    "Schedules should be combined into one",
  );

  assert(
    schedules[0]?.lessons.changed.length === 2,
    "The last two lessons don't match the combined schedule and therefore should count as 'changed'",
  );
});

const WEEKLY_LESSONS = [
  new Lesson(
    1,
    new Date("2022-04-20"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    2,
    new Date("2022-04-27"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
];

const COMBINABLE_SCHEDULES = [
  new Lesson(
    1,
    new Date("2022-04-20"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    2,
    new Date("2022-04-20"),
    new Time(13, 0),
    new Time(14, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
];

const PARTIALLY_DIFFERENT_OCCURRENCE = [
  new Lesson(
    1,
    new Date("2022-04-20"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    2,
    new Date("2022-04-20"),
    new Time(13, 0),
    new Time(14, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    3,
    new Date("2022-04-27"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    4,
    new Date("2022-04-27"),
    new Time(13, 0),
    new Time(14, 0),
    "lesson",
    "cancelled",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
];

const PARTIALLY_DIFFERENT_OCCURRENCE_ELEMENTS = [
  new Lesson(
    1,
    new Date("2022-04-20"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    2,
    new Date("2022-04-20"),
    new Time(13, 0),
    new Time(14, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [],
    }),
  ),
  new Lesson(
    3,
    new Date("2022-04-27"),
    new Time(12, 0),
    new Time(13, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [new LessonElement(1, "1")],
    }),
  ),
  new Lesson(
    4,
    new Date("2022-04-27"),
    new Time(13, 0),
    new Time(14, 0),
    "lesson",
    "regular",
    1,
    "",
    null,
    "",
    "1",
    new LessonElementCollection({
      classes: [],
      rooms: [],
      subjects: [],
      teachers: [new LessonElement(2, "2")],
    }),
  ),
];
