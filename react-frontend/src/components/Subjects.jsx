import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Subjects({ closeModal }) {
  const [view, setView] = useState("main");

  const [subjects, setSubjects] = useState([]);
  const [specialties, setSpecialties] = useState([]); // 💡 Loaded to fill the dropdown select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search filter state
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSubject, setSelectedSubject] = useState(null);

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
        const [subRes, specRes] = await Promise.all([
          fetch("/api/subject/all"),
          fetch("/api/specialty/all")
        ]);

        const subData = await subRes.json();
        const specData = await specRes.json();

        if (subRes.ok && specRes.ok) {
          setSubjects(subData);
          setSpecialties(specData);
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

  // Filtered logic for search query
  const filteredSubjects = subjects.filter((subject) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const nameMatches = subject.name?.toLowerCase().includes(query);
    const specialtyMatches = subject.specialty?.name?.toLowerCase().includes(query);
    const specialtyShortNameMatches = subject.specialty.short_name?.toLowerCase().includes(query);

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
              <input
                type="number" min="1" max="12" required value={studySemesterInput} onChange={(e) => setStudySemesterInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
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
                <input
                  type="number" min="1" max="12" required value={studySemesterInput} onChange={(e) => setStudySemesterInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
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

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? "Предмети" :
                     (view === "create") ? "Добавяне на предмет" :
                     (view === "edit") ? "Редактиране на предмет" :
                     (view === "delete") ? "Изтриване на предмет" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}