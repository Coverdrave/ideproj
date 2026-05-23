import { useEffect, useMemo, useState } from "react";
import PopupModal from "./_PopupModal.jsx";
import ScheduleGrid from "./ScheduleGrid.jsx";

const semesterToTerm = (semester) => (semester % 2 === 1 ? "Зимен" : "Летен");
const semesterToCourse = (semester) => Math.ceil(semester / 2);

export default function GenerateSchedule({ closeModal, updateMainMenuData }) {
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

  const [studentGroups, setStudentGroups] = useState([]);
  const [studentGroupsLoading, setStudentGroupsLoading] = useState(false);
  const [selectedStudentGroup, setSelectedStudentGroup] = useState("");
  const [selectedSubgroups, setSelectedSubgroups] = useState([]);
  const [groupsError, setGroupsError] = useState("");

  const [classesExistOtherGroupsSubgroups, setClassesExistOtherGroupsSubgroups] = useState(false);
  const [classesExistSelectedSubgroups, setClassesExistSelectedSubgroups] = useState(false);
  const [existingLectures, setExistingLectures] = useState([]);
  const [existingExercises, setExistingExercises] = useState([]);
  const [warningDialogKeepExisting, setWarningDialogKeepExisting] = useState();
  const [overrideConfirm, setOverrideConfirm] = useState(false);
  const [warningsError, setWarningsError] = useState("");
  
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

    async function loadGroupsSubgroups() {
      setStudentGroupsLoading(true);
      setGroupsError("");
      setStudentGroups([]);

      try {
        const res = await fetch (
          `/api/student_group/get_groups_subgroups/${selectedSpecialtyId}/${selectedSemester}`
        );
        const data = await res.json();

        if (res.ok) {
          setStudentGroups(data.groups);
        } else {
          setGroupsError(data.message || "Неуспешно зареждане на групите.");
        }
      } catch {
        setGroupsError("Сървърът не е достъпен.");
      } finally {
        setStudentGroupsLoading(false);
      }
    }

    loadGroupsSubgroups();
  }, [selectedSpecialtyId, selectedSemester]);

  useEffect(() => {
    if (selectedSubgroups.length < 1) {
      return;
    }

    async function loadWarningData() {
      try {
        const res = await fetch("/api/schedule/get_existing_subgroups", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            specialty_id: selectedSpecialtyId,
            semester: selectedSemester,
            group_number: selectedStudentGroup,
            selected_subgroups: selectedSubgroups
          }),
        });
        const data = await res.json();

        if (res.ok) {
          setClassesExistOtherGroupsSubgroups(data.othersHaveClasses);
          setClassesExistSelectedSubgroups(data.selectedHaveClasses);
          setExistingLectures(data.existingLectures);
          setExistingExercises(data.existingExercises);
        } else {
          setWarningsError(data.message || "Неуспешно зареждане на данни.");
        }
      } catch {
        setWarningsError("Сървърът не е достъпен.");
      }
    }

    loadWarningData();
  }, [selectedSubgroups])

  useEffect(() => {
    if (!selectedStudentGroup || !warningsAcknowledged || semesterSubjects.length > 0) {
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
  }, [selectedStudentGroup, warningDialogKeepExisting, overrideConfirm]);

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
        lecture: (warningDialogKeepExisting === true && existingLectures[subject.id]) ? {
          use_existing: existingLectures[subject.id]
        } : {
          every_week: subjectOptions[subject.id]?.lecture?.every_week ?? true,
          duration: subject.default_duration_lecture
        },
        exercise: {
          every_week: subjectOptions[subject.id]?.exercise?.every_week ?? true,
          duration: subject.default_duration_exercise
        },
      };
    });

    return nextOptions;
  }, [semesterSubjects, subjectOptions, warningDialogKeepExisting]);

  const warningsAcknowledged = 
    (!classesExistOtherGroupsSubgroups || (classesExistOtherGroupsSubgroups && warningDialogKeepExisting !== undefined)) &&
    (!classesExistSelectedSubgroups || (classesExistSelectedSubgroups && overrideConfirm));

  const canGenerate =
    Boolean(selectedSemester) &&
    Boolean(selectedStudentGroup) &&
    selectedSubgroups.length > 0 &&
    warningsAcknowledged &&
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
    setSelectedStudentGroup("");
    setSelectedSubgroups([]);
    setClassesExistOtherGroupsSubgroups(false);
    setClassesExistSelectedSubgroups(false);
    setExistingLectures([]);
    setExistingExercises([]);
    setWarningDialogKeepExisting();
    setOverrideConfirm(false);
  };

  const handleSpecialtyChange = (event) => {
    setSelectedSpecialtyId(event.target.value);
    setSelectedSemester("");
    setSubjectOptions({});
    setSemesterSubjects([]);
    setSubjectsError("");
    setGenerateError("");
    setSelectedStudentGroup("");
    setSelectedSubgroups([]);
    setClassesExistOtherGroupsSubgroups(false);
    setClassesExistSelectedSubgroups(false);
    setExistingLectures([]);
    setExistingExercises([]);
    setWarningDialogKeepExisting();
    setOverrideConfirm(false);
  };

  const handleSemesterChange = (event) => {
    setSelectedSemester(event.target.value);
    setSubjectOptions({});
    setSemesterSubjects([]);
    setSubjectsError("");
    setGenerateError("");
    setSelectedStudentGroup("");
    setSelectedSubgroups([]);
    setClassesExistOtherGroupsSubgroups(false);
    setClassesExistSelectedSubgroups(false);
    setExistingLectures([]);
    setExistingExercises([]);
    setWarningDialogKeepExisting();
    setOverrideConfirm(false);
  };

  const handleGroupChange = (event) => {
    setSelectedStudentGroup(event.target.value);
    setSelectedSubgroups(studentGroups[event.target.value] || []);
    setClassesExistOtherGroupsSubgroups(false);
    setClassesExistSelectedSubgroups(false);
    setExistingLectures([]);
    setExistingExercises([]);
    setWarningDialogKeepExisting();
    setOverrideConfirm(false);
  }

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

  const handleWarningDialogKeep = () => {
    setWarningDialogKeepExisting(true);
  }

  const handleWarningDialogDelete = () => {
    setWarningDialogKeepExisting(false);
  }

  const handleOverrideConfirm = () => {
    setOverrideConfirm(!overrideConfirm);
  }

  async function handleGenerate() {
    if (!canGenerate) return;

    setGenerating(true);
    setGenerateError("");

    try {
      const res = await fetch("/api/schedule/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_number: selectedStudentGroup,
          subgroups: selectedSubgroups,
          semester: selectedSemester,
          subjects_options: normalizedSubjectOptions,
          conflicting_exercises: (warningDialogKeepExisting === true) ? existingExercises : ""
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerateError(data.message || "Генерирането не бе успешно.");
        return;
      }

      if (!data.generated || !data.orderedClasses || Object.keys(data.orderedClasses).length === 0) {
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

  async function handleSaveGenerated() {
    try {
      const res = await fetch("/api/schedule/save_generated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialty_id: selectedSpecialtyId,
          group_number: generatedData?.info?.groupNumber,
          semester: generatedData?.info?.semester,
          subgroups: generatedData?.info.subgroups,
          generated: generatedData?.generated,
          delete_existing: (warningDialogKeepExisting === false),
          override_selected: overrideConfirm
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // alert(data.message);
        updateMainMenuData(generatedData?.info?.groupNumber, generatedData?.info?.semester);
        closeModal();
      }
    } catch {
      // setGenerateError("Сървърът не е достъпен.");
    } finally {
      // setGenerating(false);
    }
  };

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

        {groupsError ? (
          <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {groupsError}
          </p>
        ) : (
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Група
              </label>
              <select
                value={selectedStudentGroup}
                onChange={handleGroupChange}
                disabled={!selectedSemester || studentGroupsLoading}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">{studentGroupsLoading ? "Зареждане..." : "Избери група"}</option>
                {!studentGroupsLoading && studentGroups && Object.keys(studentGroups).map((groupNumber) => (
                  <option key={groupNumber} value={groupNumber}>
                    {groupNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Подгрупи
              </label>
              <div className="flex gap-2">
                {!selectedStudentGroup ? (
                  <p className="mt-1 text-gray-500">Избери група</p>
                ) : (
                  studentGroups?.[selectedStudentGroup]?.map((subgroup) => {
                    const isSelected = selectedSubgroups.includes(subgroup);

                    return (
                      <button
                        key={subgroup}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (selectedSubgroups.length < 2) return;
                            setSelectedSubgroups(selectedSubgroups.filter((s) => s !== subgroup));
                          } else {
                            setSelectedSubgroups([...selectedSubgroups, subgroup]);
                          }
                        }}
                        className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {subgroup}
                      </button>
                    );
                }))}
              </div>
            </div>
          </div>
        )}
      </div>

      {classesExistOtherGroupsSubgroups &&
        <div className="mt-4 flex justify-between items-center gap-5 rounded-lg border border-red-200 bg-red-50 p-5">
          <div className="text-7xl text-red-500">?!</div>
          <div className="text-base text-red-700">Съществуват графици за тази специалност и семестър, които ограничават опциите при генерирането на този график. Ако запазите съществуващите графици, новият график ще се напасне според тях, но ако ги изтриете ще имате достъп до всички опции.</div>
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleWarningDialogKeep}
              className={`${warningDialogKeepExisting === true ? 'bg-green-600' : 'bg-gray-200'} w-fit shrink-0 rounded-md hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed`}
            >
              Запази съществуващи
            </button>
            <button
              type="button"
              onClick={handleWarningDialogDelete}
              className={`${warningDialogKeepExisting === false ? 'bg-red-600' : 'bg-gray-200'} mt-2 w-fit shrink-0 rounded-md hover:bg-red-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed`}
            >
              Изтрий всички
            </button>
          </div>
          
        </div>
      }

      {classesExistSelectedSubgroups &&
        <div className="mt-4 flex justify-between items-center gap-5 rounded-lg border border-orange-200 bg-orange-50 p-5">
          <div className="text-7xl text-amber-500">!</div>
          <div className="text-base text-amber-700">Ако запазите генерираният график, съществуващият за избраните подгрупи ще бъде изгубен.</div>
          <div className="">
            <button
              type="button"
              onClick={handleOverrideConfirm}
              className={`${overrideConfirm ? 'bg-green-600' : 'bg-gray-200'} mt-2 w-fit shrink-0 rounded-md hover:bg-green-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed`}
            >
              Потвърждавам
            </button>
          </div>
          
        </div>
      }
      
      {warningDialogKeepExisting !== true && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-800">
              Настройки по предмети
            </h3>
            {selectedStudentGroup && !subjectsLoading && warningsAcknowledged && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {semesterSubjects.length} предмет{(semesterSubjects.length > 1) && "а"}
              </span>
            )}
          </div>

          {!selectedStudentGroup ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Избери факултет, специалност, семестър и група, за да настроиш предметите.
            </div>
          ) : !warningsAcknowledged ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
              Потвърди предупрежденията по-горе.
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
      )}

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
    <div className="flex w-min max-h-[min(85vh,calc(100vh-4rem))] flex-col p-3">
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBackToOptions}
          className="mb-3 w-fit shrink-0 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800"
        >
          ← Назад към настройките
        </button>

        <button
          type="button"
          onClick={handleSaveGenerated}
          className="mb-3 w-fit shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed"
        >
          Запази програма
        </button>
      </div>
      

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

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}
