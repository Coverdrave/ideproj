import { useEffect, useMemo, useState } from "react";
import PopupModal from "./_PopupModal.jsx";
import ScheduleGrid from "./ScheduleGrid.jsx";

const semesterToTerm = (semester) => (semester % 2 === 1 ? "Зимен" : "Летен");
const semesterToCourse = (semester) => Math.ceil(semester / 2);

const SUBGROUPS = ["А", "Б"];

export default function GenerateSchedule({ close }) {
  const [view, setView] = useState("options");

  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [facultiesError, setFacultiesError] = useState("");

  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [semesterSubjects, setSemesterSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  const [subjectOptions, setSubjectOptions] = useState({});

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [generatedData, setGeneratedData] = useState(null);

  useEffect(() => {
    async function loadFaculties() {
      setFacultiesLoading(true);
      setFacultiesError("");

      try {
        const res = await fetch("/api/faculty/all_with_specialties");
        const data = await res.json();

        if (res.ok) {
          setFaculties(data);
        } else {
          setFacultiesError(data.message || "Неуспешно зареждане на факултетите.");
        }
      } catch {
        setFacultiesError("Сървърът не е достъпен.");
      } finally {
        setFacultiesLoading(false);
      }
    }

    loadFaculties();
  }, []);

  useEffect(() => {
    if (!selectedSpecialtyId || !selectedSemester) {
      setSemesterSubjects([]);
      return;
    }

    async function loadSubjects() {
      setSubjectsLoading(true);
      setSubjectsError("");
      setSemesterSubjects([]);

      try {
        const res = await fetch(
          `/api/specialty/${selectedSpecialtyId}/semester_subjects/${selectedSemester}`
        );
        const data = await res.json();

        if (res.ok) {
          setSemesterSubjects(data);
        } else {
          setSubjectsError(data.message || "Неуспешно зареждане на предметите.");
        }
      } catch {
        setSubjectsError("Сървърът не е достъпен.");
      } finally {
        setSubjectsLoading(false);
      }
    }

    loadSubjects();
  }, [selectedSpecialtyId, selectedSemester]);

  const selectedFaculty = useMemo(
    () => faculties.find((f) => f.id === Number(selectedFacultyId)) ?? null,
    [faculties, selectedFacultyId]
  );

  const specialties = useMemo(
    () => selectedFaculty?.specialties ?? [],
    [selectedFaculty]
  );

  const selectedSpecialty = useMemo(
    () => specialties.find((s) => s.id === Number(selectedSpecialtyId)) ?? null,
    [specialties, selectedSpecialtyId]
  );

  const availableSemesters = useMemo(() => {
    if (!selectedSpecialty?.duration_semester) return [];
    return Array.from(
      { length: selectedSpecialty.duration_semester },
      (_, idx) => idx + 1
    );
  }, [selectedSpecialty]);

  const normalizedSubjectOptions = useMemo(() => {
    const nextOptions = {};

    semesterSubjects.forEach((subject) => {
      nextOptions[subject.id] = {
        lecture: {
          every_week:
            subjectOptions[subject.id]?.lecture?.every_week ?? true,
        },
        exercise: {
          every_week:
            subjectOptions[subject.id]?.exercise?.every_week ?? true,
        },
      };
    });

    return nextOptions;
  }, [semesterSubjects, subjectOptions]);

  const canGenerate =
    Boolean(selectedSemester) &&
    !subjectsLoading &&
    semesterSubjects.length > 0 &&
    !generating;

  const handleFacultyChange = (event) => {
    setSelectedFacultyId(event.target.value);
    setSelectedSpecialtyId("");
    setSelectedSemester("");
    setSubjectOptions({});
    setSemesterSubjects([]);
    setSubjectsError("");
    setGenerateError("");
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialtyId(event.target.value);
    setSelectedSemester("");
    setSubjectOptions({});
    setSemesterSubjects([]);
    setSubjectsError("");
    setGenerateError("");
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
    setSubjectOptions({});
    setGenerateError("");
  };

  const updateEveryWeek = (subjectId, type, value) => {
    setSubjectOptions((prev) => ({
      ...prev,
      [subjectId]: {
        lecture: {
          every_week: prev[subjectId]?.lecture?.every_week ?? true,
        },
        exercise: {
          every_week: prev[subjectId]?.exercise?.every_week ?? true,
        },
        [type]: {
          every_week: value,
        },
      },
    }));
  };

  const handleBackToOptions = () => {
    setView("options");
    setGenerateError("");
  };

  async function handleGenerate() {
    if (!canGenerate) return;

    setGenerating(true);
    setGenerateError("");

    try {
      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subgroups: SUBGROUPS,
          subjects_options: normalizedSubjectOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.message || "Генерирането не бе успешно.");
        return;
      }

      if (!data.b || !data.orderedClasses || Object.keys(data.orderedClasses).length === 0) {
        setGenerateError(
          "Не бе намерено валидно разписание с текущите настройки. Опитайте да промените опциите."
        );
        return;
      }

      setGeneratedData(data);
      setView("result");
    } catch {
      setGenerateError("Сървърът не е достъпен.");
    } finally {
      setGenerating(false);
    }
  }

  const optionsBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        {facultiesError && (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {facultiesError}
          </p>
        )}

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Факултет
            </label>
            <select
              value={selectedFacultyId}
              onChange={handleFacultyChange}
              disabled={facultiesLoading}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {facultiesLoading ? "Зареждане..." : "Избери факултет"}
              </option>
              {faculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Специалност
            </label>
            <select
              value={selectedSpecialtyId}
              onChange={handleSpecialtyChange}
              disabled={!selectedFaculty}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Избери специалност</option>
              {specialties.map((specialty) => (
                <option key={specialty.id} value={specialty.id}>
                  {specialty.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Семестър
            </label>
            <select
              value={selectedSemester}
              onChange={handleSemesterChange}
              disabled={!selectedSpecialty}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Избери семестър</option>
              {availableSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}. семестър - {semesterToTerm(semester)} (Курс{" "}
                  {semesterToCourse(semester)})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-800">
            Настройки по предмети
          </h3>
          {selectedSemester && !subjectsLoading && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {semesterSubjects.length} предмет(а)
            </span>
          )}
        </div>

        {!selectedSemester ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Избери факултет, специалност и семестър, за да настроиш предметите.
          </div>
        ) : subjectsLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-500" />
          </div>
        ) : subjectsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {subjectsError}
          </div>
        ) : semesterSubjects.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
            Няма намерени предмети за избрания семестър.
          </div>
        ) : (
          <div className="space-y-3">
            {semesterSubjects.map((subject) => {
              const lectureEveryWeek =
                normalizedSubjectOptions[subject.id]?.lecture?.every_week ?? true;
              const exerciseEveryWeek =
                normalizedSubjectOptions[subject.id]?.exercise?.every_week ?? true;

              return (
                <div
                  key={subject.id}
                  className="rounded-lg border border-slate-200 p-3 transition hover:border-blue-300"
                >
                  <div className="mb-3">
                    <p className="font-semibold text-slate-800">{subject.name}</p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="mb-2 text-sm font-medium text-slate-700">Лекция</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateEveryWeek(subject.id, "lecture", true)}
                          className={`rounded-md border px-3 py-2 text-sm transition ${
                            lectureEveryWeek
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
                          }`}
                        >
                          Всяка седмица
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEveryWeek(subject.id, "lecture", false)}
                          className={`rounded-md border px-3 py-2 text-sm transition ${
                            !lectureEveryWeek
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-violet-400"
                          }`}
                        >
                          През седмица
                        </button>
                      </div>
                    </div>

                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="mb-2 text-sm font-medium text-slate-700">
                        Упражнение
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => updateEveryWeek(subject.id, "exercise", true)}
                          className={`rounded-md border px-3 py-2 text-sm transition ${
                            exerciseEveryWeek
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-emerald-400"
                          }`}
                        >
                          Всяка седмица
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEveryWeek(subject.id, "exercise", false)}
                          className={`rounded-md border px-3 py-2 text-sm transition ${
                            !exerciseEveryWeek
                              ? "border-violet-600 bg-violet-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-violet-400"
                          }`}
                        >
                          През седмица
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {generateError && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {generateError}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {generating ? "Генериране..." : "Генерирай програма"}
        </button>
      </div>
    </div>
  );

  const resultBody = (
    <div className="flex w-min max-h-min flex-col p-3">
      <button
        type="button"
        onClick={handleBackToOptions}
        className="mb-3 w-fit shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
      >
        ← Назад към настройките
      </button>

      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white p-2 shadow-inner">
        <div className="inline-block min-w-max pb-2">
          {generatedData && <ScheduleGrid apiData={generatedData} />}
        </div>
      </div>
    </div>
  );

  const body = view === "result" ? resultBody : optionsBody;
  const headerText =
    view === "result" ? "Генерирана програма" : "Генериране на програма";

  return <PopupModal close={close} headerText={headerText} body={body} />;
}
