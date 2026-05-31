import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Subjects({ closeModal }) {
  const [view, setView] = useState("main");

  const [subjects, setSubjects] = useState([]);
  const [specialties, setSpecialties] = useState([]); // 💡 Loaded to fill the dropdown select
  const [lecturers, setLecturers] = useState([]); // 💡 Loaded to fill the lecturers assignment list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [lecturerSearch, setLecturerSearch] = useState("");

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [assignedLecturers, setAssignedLecturers] = useState([]); // Working pivot local state cache

  const [nameInput, setNameInput] = useState("");
  const [shortenedNameInput, setShortenedNameInput] = useState("");
  const [studySemesterInput, setStudySemesterInput] = useState("1");
  const [lectureInput, setLectureInput] = useState("2");
  const [exerciseInput, setExerciseInput] = useState("2");
  const [specialtyIdInput, setSpecialtyIdInput] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [subRes, specRes, lectRes] = await Promise.all([
          fetch("/api/subject/all"),
          fetch("/api/specialty/all"),
          fetch("/api/lecturer/all").catch(() => null) // Graceful fallbacks if standalone route structures vary
        ]);

        const subData = await subRes.json();
        const specData = await specRes.json();
        const lectData = lectRes ? await lectRes.json() : [];

        if (subRes.ok && specRes.ok) {
          setSubjects(subData);
          setSpecialties(specData);
          setLecturers(lectData);
        } else {
          setError("Неуспешно зареждане на първоначалните данни.");
        }
      } catch {
        setError("Сървърът не е достъпен.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (selectedSubject && view === "edit") {
      setNameInput(selectedSubject.name);
      setShortenedNameInput(selectedSubject.shortened_name);
      setStudySemesterInput(selectedSubject.study_semester.toString());
      setLectureInput(selectedSubject.default_duration_lecture.toString());
      setExerciseInput(selectedSubject.default_duration_exercise.toString());
      setSpecialtyIdInput(selectedSubject.specialty_id);
      setFormError("");
    }

    if (selectedSubject && view === "lecturers") {
      // Map existing back-end pivots safely into working local format array
      const currentPivots = selectedSubject.lecturers?.map(l => ({
        lecturer_id: l.id,
        type: l.pivot?.type || 'both' // Default fallback allocation
      })) || [];
      setAssignedLecturers(currentPivots);
      setLecturerSearch("");
      setFormError("");
    }
  }, [selectedSubject, view]);

  function resetForm() {
    setNameInput("");
    setShortenedNameInput("");
    setStudySemesterInput("1");
    setLectureInput("2");
    setExerciseInput("2");
    setSpecialtyIdInput(specialties[0]?.id || "");
    setFormError("");
  }

  // Automatically adapt selected semester option if the user changes specialty
  // to avoid leaving a stale semester index out of range.
  useEffect(() => {
    if (!specialtyIdInput) return;
    const currentSpec = specialties.find(s => s.id === Number(specialtyIdInput));
    if (currentSpec && Number(studySemesterInput) > currentSpec.duration_semester) {
      setStudySemesterInput("1");
    }
  }, [specialtyIdInput, specialties]);

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!nameInput.trim() || !shortenedNameInput.trim() || !specialtyIdInput) {
      setFormError("Моля, попълнете всички задължителни полета.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/subject/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          shortened_name: shortenedNameInput,
          study_semester: Number(studySemesterInput),
          default_duration_lecture: Number(lectureInput),
          default_duration_exercise: Number(exerciseInput),
          specialty_id: Number(specialtyIdInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSubjects((prev) => [...prev, data]);
        resetForm();
        setView("main");
      } else {
        setFormError(data.message || "Грешка при създаване на дисциплината.");
      }
    } catch {
      setFormError("Сървърът не отговаря.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleEditFormSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`/api/subject/update/${selectedSubject.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          shortened_name: shortenedNameInput,
          study_semester: Number(studySemesterInput),
          default_duration_lecture: Number(lectureInput),
          default_duration_exercise: Number(exerciseInput),
          specialty_id: Number(specialtyIdInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSubjects((prev) =>
          prev.map((s) => (s.id === selectedSubject.id ? data : s))
        );
        setView("main");
      } else {
        setFormError(data.message || "Грешка при обновяване на данните.");
      }
    } catch {
      setFormError("Сървърът не отговаря.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteSubject() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/subject/delete/${selectedSubject.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setSubjects((prev) => prev.filter((s) => s.id !== selectedSubject.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при изтриване на дисциплината.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Toggles assignments seamlessly inside structural matrix caches
  function handleToggleLecturerAssignment(lecturerId) {
    setAssignedLecturers((prev) => {
      const exists = prev.find((item) => item.lecturer_id === lecturerId);
      if (exists) {
        return prev.filter((item) => item.lecturer_id !== lecturerId);
      } else {
        return [...prev, { lecturer_id: lecturerId, type: "both" }];
      }
    });
  }

  // Changes internal relational key properties inside assigned items
  function handleChangePivotType(lecturerId, chosenType) {
    setAssignedLecturers((prev) =>
      prev.map((item) =>
        item.lecturer_id === lecturerId ? { ...item, type: chosenType } : item
      )
    );
  }

async function handleSaveLecturers(e) {
  e.preventDefault();
  setFormLoading(true);
  setFormError("");
  try {
    const res = await fetch(`/api/subject/update_lecturers/${selectedSubject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lecturers: assignedLecturers })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      setSubjects((prev) => 
        prev.map((s) => (s.id === selectedSubject.id ? data.subject : s))
      );
      setView("main");
    } else {
      setFormError(data.message || "Грешка при записване на преподавателите.");
    }
  } catch {
    setFormError("Сървърът не отговаря.");
  } finally {
    setFormLoading(false);
  }
}

  // Formats semester options text dynamically (e.g., 3 -> "2 курс, зимен семестър")
  function formatSemesterLabel(semNumber) {
    const course = Math.ceil(semNumber / 2);
    const type = semNumber % 2 !== 0 ? "зимен" : "летен";
    return `${course} курс, ${type}`;
  }

  // Generates an array of option nodes up to the chosen specialty's duration
  function renderSemesterOptions() {
    if (!specialtyIdInput) return <option value="1">1 семестър</option>;
    
    const activeSpecialty = specialties.find(s => s.id === Number(specialtyIdInput));
    const totalSemesters = activeSpecialty?.duration_semester || 8; 

    const options = [];
    for (let i = 1; i <= totalSemesters; i++) {
      options.push(
        <option key={i} value={i}>
          {formatSemesterLabel(i)} ({i} сем.)
        </option>
      );
    }
    return options;
  }

  // Filtered logic for search query
  const filteredSubjects = subjects.filter((subject) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const nameMatches = subject.name?.toLowerCase().includes(query);
    const specialtyMatches = subject.specialty?.name?.toLowerCase().includes(query);
    const specialtyShortNameMatches = subject.specialty?.short_name?.toLowerCase().includes(query);

    return nameMatches || specialtyMatches || specialtyShortNameMatches;
  });

  const mainBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      {loading && <p className="text-slate-500 text-center py-4">Зареждане...</p>}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Търсене по име или специалност"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setView("create");
          }}
          className="w-fit shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition"
        >
          Създаване
        </button>
      </div>

      {!loading && !error && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse bg-white text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold tracking-wider">
              <tr className="border-b border-slate-200">
                <th scope="col" className="px-6 py-3 w-1">Име</th>
                <th scope="col" className="px-6 py-3">Специалност</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{subject.name}</td>
                    <td className="px-6 py-4">{subject.specialty?.name || `ID: ${subject.specialty_id}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setView("lecturers");
                          }}
                          className="rounded-md bg-purple-50 px-2 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          Преподаватели
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setView("edit");
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSubject(subject);
                            setView("delete");
                          }}
                          className="rounded-md bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Изтриване
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm">
                    Няма намерени предмети по зададените критерии.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <tr>
                <td colSpan="3" className="px-6 py-3 font-medium">
                  Показване на {filteredSubjects.length} резултат{filteredSubjects.length !== 1 && "а"}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );

  const createBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex">
        <button
          type="button"
          onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
        <form onSubmit={handleCreateFormSubmit} className="space-y-4 w-full max-w-xl mx-auto">
          {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Име на предмета</label>
              <input
                type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Съкратено име</label>
              <input
                type="text" required value={shortenedNameInput} onChange={(e) => setShortenedNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Прилежаща Специалност</label>
            <select
              value={specialtyIdInput} required onChange={(e) => setSpecialtyIdInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>Изберете специалност...</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.short_name})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Учебен семестър</label>
              <select
                value={studySemesterInput} required onChange={(e) => setStudySemesterInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {renderSemesterOptions()}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Продълж. лекции</label>
              <input
                type="number" min="0" max="10" required value={lectureInput} onChange={(e) => setLectureInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Продълж. упражнения</label>
              <input
                type="number" min="0" max="10" required value={exerciseInput} onChange={(e) => setExerciseInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit" disabled={formLoading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
            >
              {formLoading ? "Записване..." : "Създай"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const editBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex">
        <button
          type="button" onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
        {selectedSubject ? (
          <form onSubmit={handleEditFormSubmit} className="space-y-4 w-full max-w-xl mx-auto">
            {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Име на дисциплината</label>
                <input
                  type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Съкратено име</label>
                <input
                  type="text" required value={shortenedNameInput} onChange={(e) => setShortenedNameInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Прилежаща Специалност</label>
              <select
                value={specialtyIdInput} required onChange={(e) => setSpecialtyIdInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.short_name})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Учебен семестър</label>
                <select
                  value={studySemesterInput} required onChange={(e) => setStudySemesterInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                >
                  {renderSemesterOptions()}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Продълж. лекции</label>
                <input
                  type="number" min="0" max="10" required value={lectureInput} onChange={(e) => setLectureInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Продълж. упражнения</label>
                <input
                  type="number" min="0" max="10" required value={exerciseInput} onChange={(e) => setExerciseInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit" disabled={formLoading}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-400"
              >
                {formLoading ? "Записване..." : "Запази промените"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-slate-500 text-sm">Няма избран предмет.</p>
        )}
      </div>
    </div>
  );

  const deleteBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex">
        <button
          type="button" onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center">
        {selectedSubject ? (
          <div className="max-w-md w-full space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Изтриване на предмет</h3>
              <p className="text-sm text-slate-500">
                Сигурни ли сте, че искате да изтриете предмета <span className="font-semibold text-slate-800">"{selectedSubject.name}"</span>?
              </p>
              <p className="text-xs text-rose-600 font-medium bg-rose-50 rounded p-2 border border-rose-100">
                ⚠️ Внимание: Това действие ще премахне свързаните часове!
              </p>
            </div>

            {deleteError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium text-left">{deleteError}</div>}

            <div className="flex items-center gap-3 justify-center">
              <button
                type="button" disabled={deleteLoading} onClick={() => setView("main")}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Oтказ
              </button>
              <button
                type="button" disabled={deleteLoading} onClick={handleDeleteSubject}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-400"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избран предмет.</p>
        )}
      </div>
    </div>
  );

// 📌 Split and filter based on original database configuration
  const sortedAndFilteredLecturers = (() => {
    const query = lecturerSearch.toLowerCase().trim();
    
    // 1. Determine which lecturer IDs were already bound in the database initially
    const originalDbIds = new Set(selectedSubject?.lecturers?.map(l => l.id) || []);

    // 2. Filter the master pool based on the search input string
    const matchQuery = (l) => !query || l.names?.toLowerCase().includes(query) || l.titla?.toLowerCase().includes(query);
    const filteredMasterPool = lecturers.filter(matchQuery);

    // 3. Separate into fixed original-db and unassigned containers
    const originalDbGroup = [];
    const absoluteNewGroup = [];

    filteredMasterPool.forEach(l => {
      if (originalDbIds.has(l.id)) {
        originalDbGroup.push(l);
      } else {
        absoluteNewGroup.push(l);
      }
    });

    return { originalDbGroup, absoluteNewGroup };
  })();

  const lecturersBody = (
    <div className="w-[min(95vw,750px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex mb-3">
        <button
          type="button"
          onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium transition"
        >
          ← Назад
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Управление на преподаватели за:</h3>
        <p className="text-sm text-blue-600 font-bold mb-4">{selectedSubject?.name}</p>

        {/* 🔍 Search Input Field */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={lecturerSearch}
            onChange={(e) => setLecturerSearch(e.target.value)}
            placeholder="Търсене на преподавател по име"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          />
        </div>

        <form onSubmit={handleSaveLecturers} className="space-y-4">
          {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-4 py-2.5 w-1 text-center">Статус</th>
                  <th className="px-4 py-2.5">Преподавател</th>
                  <th className="px-4 py-2.5 text-right pr-6">Тип заетост</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                
                {/* 📌 SECTION 1: SYSTEMATICALLY STUCK UP TOP (PRE-EXISTING DATABASE ASSIGNMENTS) */}
                {sortedAndFilteredLecturers.originalDbGroup.length > 0 && (
                  <tr className="bg-slate-100/90 font-bold text-slate-700 text-xs uppercase tracking-wider sticky top-[37px] z-10 border-y border-slate-200">
                    <td colSpan="3" className="px-4 py-2 bg-purple-50 text-purple-900">Добавени ({sortedAndFilteredLecturers.originalDbGroup.length})</td>
                  </tr>
                )}
                {sortedAndFilteredLecturers.originalDbGroup.map((lecturer) => {
                  const currentAssignment = assignedLecturers.find(item => item.lecturer_id === lecturer.id);
                  const isAssigned = !!currentAssignment;

                  return (
                    <tr key={`db-orig-${lecturer.id}`} className={`hover:bg-slate-50 transition-colors ${isAssigned ? "bg-purple-50/20" : "bg-rose-50/20 text-slate-400"}`}>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleLecturerAssignment(lecturer.id)}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition-all shadow-sm ${isAssigned ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300"}`}
                        >
                          {isAssigned ? "Избран" : "Премахнат"}
                        </button>
                      </td>
                      <td className={`px-4 py-3 font-medium ${isAssigned ? "text-slate-900" : "line-through text-slate-400"}`}>
                        {lecturer.names}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className={`inline-flex rounded-md shadow-sm border border-slate-200 bg-slate-50 p-0.5 transition-opacity ${!isAssigned ? "opacity-20 pointer-events-none" : ""}`}>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'lecture')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'lecture' ? "bg-purple-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Лекции
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'exercise')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'exercise' ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Упражнения
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'both')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'both' ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            И двете
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* 📌 SECTION 2: OTHER AVAILABLE LECTURERS */}
                {sortedAndFilteredLecturers.absoluteNewGroup.length > 0 && (
                  <tr className="bg-slate-100/90 font-bold text-slate-700 text-xs uppercase tracking-wider sticky top-[37px] z-10 border-y border-slate-200">
                    <td colSpan="3" className="px-4 py-2 bg-slate-100 text-slate-800">Недобавени ({sortedAndFilteredLecturers.absoluteNewGroup.length})</td>
                  </tr>
                )}
                {sortedAndFilteredLecturers.absoluteNewGroup.map((lecturer) => {
                  const currentAssignment = assignedLecturers.find(item => item.lecturer_id === lecturer.id);
                  const isAssigned = !!currentAssignment;

                  return (
                    <tr key={`db-new-${lecturer.id}`} className={`hover:bg-slate-50 transition-colors ${isAssigned ? "bg-emerald-50/30" : ""}`}>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleLecturerAssignment(lecturer.id)}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition-all shadow-sm ${isAssigned ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"}`}
                        >
                          {isAssigned ? "Избран" : "Добави"}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {lecturer.titla ? `${lecturer.titla} ` : ""}{lecturer.names}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className={`inline-flex rounded-md shadow-sm border border-slate-200 bg-slate-50 p-0.5 transition-opacity ${!isAssigned ? "opacity-25 pointer-events-none" : ""}`}>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'lecture')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'lecture' ? "bg-purple-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Лекции
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'exercise')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'exercise' ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Упражнения
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangePivotType(lecturer.id, 'both')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'both' ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            И двете
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty State Fallback */}
                {sortedAndFilteredLecturers.originalDbGroup.length === 0 && sortedAndFilteredLecturers.absoluteNewGroup.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm">
                      Няма намерени преподаватели по въведените критерии.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setView("main")}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 transition-colors"
            >
              {formLoading ? "Записване..." : "Запази заетостта"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : 
               (view === "lecturers") ? lecturersBody : (<></>);

  const headerText = (view === "main") ? "Предмети" :
                     (view === "create") ? "Добавяне на предмет" :
                     (view === "edit") ? "Редактиране на предмет" :
                     (view === "delete") ? "Изтриване на предмет" :
                     (view === "lecturers") ? "Преподаватели по предмет" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}