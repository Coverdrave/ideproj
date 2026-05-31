import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Lecturers({ closeModal }) {
  const [view, setView] = useState("main");

  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedLecturer, setSelectedLecturer] = useState(null);

  // Form Inputs matching migration fields
  const [namesInput, setNamesInput] = useState("");
  const [titlesInput, setTitlesInput] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [allSubjects, setAllSubjects] = useState([]); // Loaded from your database
  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const [subjectSearch, setSubjectSearch] = useState("");

  const [dbAssignedIds, setDbAssignedIds] = useState([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [lecturersRes, subjectsRes] = await Promise.all([
          fetch("/api/lecturer/all"),
          fetch("/api/subject/all") // Adjust this endpoint to match your subjects route
        ]);

        const lecturersData = await lecturersRes.json();
        const subjectsData = await subjectsRes.json();

        if (lecturersRes.ok && subjectsRes.ok) {
          setLecturers(lecturersData);
          setAllSubjects(subjectsData);
        } else {
          setError("Неуспешно зареждане на данните.");
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
    if (selectedLecturer && view === "edit") {
      setNamesInput(selectedLecturer.names);
      setTitlesInput(selectedLecturer.titles);
      setFormError("");
    }
  }, [selectedLecturer, view]);

  function resetForm() {
    setNamesInput("");
    setTitlesInput("");
    setFormError("");
  }

  useEffect(() => {
    if (selectedLecturer && view === "subjects") {
      const initialAssignments = selectedLecturer.subjects?.map(s => ({
        subject_id: s.id,
        type: s.pivot?.type || 'lecture'
      })) || [];
      
      setAssignedSubjects(initialAssignments);
      
      // 📌 Capture snapshot of IDs saved in database BEFORE edits occur
      const originalIds = selectedLecturer.subjects?.map(s => s.id) || [];
      setDbAssignedIds(originalIds);
      
      setFormError("");
      setSubjectSearch(""); // Clear search automatically on reopen
    }
  }, [selectedLecturer, view]);

  // Add or remove subject assignment entirely
  function handleToggleSubjectAssignment(subjectId) {
    setAssignedSubjects(prev => {
      const exists = prev.some(item => item.subject_id === subjectId);
      if (exists) {
        return prev.filter(item => item.subject_id !== subjectId);
      } else {
        return [...prev, { subject_id: subjectId, type: 'lecture' }];
      }
    });
  }

  // Directly explicitly assign the specific string value
  function handleChangePivotType(subjectId, newType) {
    setAssignedSubjects(prev =>
      prev.map(item => (item.subject_id === subjectId ? { ...item, type: newType } : item))
    );
  }

  async function handleSaveSubjects(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch(`/api/lecturer/${selectedLecturer.id}/subjects`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjects: assignedSubjects })
      });
      const updatedLecturer = await res.json();

      if (res.ok) {
        // Inline update within local lecturer collection state
        setLecturers(prev => prev.map(l => l.id === selectedLecturer.id ? updatedLecturer : l));
        setView("main");
      } else {
        setFormError(updatedLecturer.message || "Грешка при съхранение на предмети.");
      }
    } catch {
      setFormError("Сървърът не отговаря.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!namesInput.trim() || !titlesInput.trim()) {
      setFormError("Моля, попълнете всички полета.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/lecturer/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: namesInput, titles: titlesInput })
      });
      const data = await res.json();

      if (res.ok) {
        setLecturers((prev) => [...prev, data]);
        resetForm();
        setView("main");
      } else {
        setFormError(data.message || "Грешка при създаване на преподавател.");
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
      const res = await fetch(`/api/lecturer/update/${selectedLecturer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names: namesInput, titles: titlesInput })
      });
      const data = await res.json();

      if (res.ok) {
        setLecturers((prev) =>
          prev.map((l) => (l.id === selectedLecturer.id ? data : l))
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

  async function handleDeleteLecturer() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/lecturer/delete/${selectedLecturer.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setLecturers((prev) => prev.filter((l) => l.id !== selectedLecturer.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при изтриване на преподавателя.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Live filter logic (Searches in names OR titles)
  const filteredLecturers = lecturers.filter((lecturer) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;
    return (
      lecturer.names?.toLowerCase().includes(query) ||
      lecturer.titles?.toLowerCase().includes(query)
    );
  });

  const mainBody = (
    <div className="w-[min(95vw,900px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
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
            placeholder="Търсене по имена или предмети"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setView('create')}
          className="w-fit shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed"
        >
          Добавяне
        </button>
      </div>

      {!loading && !error && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse bg-white text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold tracking-wider">
              <tr className="border-b border-slate-200">
                {/* <th scope="col" className="px-6 py-3 w-1">Титли</th> */}
                <th scope="col" className="px-6 py-3">Имена</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLecturers.length > 0 ? (
                filteredLecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-slate-50 transition-colors">
                    {/* <td className="px-6 py-4 font-semibold whitespace-nowrap text-slate-500">{lecturer.titles}</td> */}
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{lecturer.names}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedLecturer(lecturer);
                            setView("subjects");
                          }}
                          className="rounded-md bg-purple-50 px-2 py-1.5 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors"
                        >
                          Предмети
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLecturer(lecturer);
                            setView("edit");
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLecturer(lecturer);
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
                    Няма намерени преподаватели.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <tr>
                <td colSpan="3" className="px-6 py-3 font-medium">
                  Общо: {filteredLecturers.length} преподавател{filteredLecturers.length !== 1 ? "и" : ""}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );

  const createBody = (
    <div className="w-[min(95vw,600px)] p-3">
      <div className="flex mb-3">
        <button
          type="button" onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium transition"
        >
          ← Назад
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleCreateFormSubmit} className="space-y-4">
          {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Титли</label>
            <input
              type="text" required value={titlesInput} onChange={(e) => setTitlesInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Имена на преподавателя</label>
            <input
              type="text" required value={namesInput} onChange={(e) => setNamesInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
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

  // 🔍 Filter and Sort Logic for the Subjects Modal View
  const sortedAndFilteredSubjects = (() => {
    const query = subjectSearch.toLowerCase().trim();

    // 1. Filter by user search criteria
    const filtered = allSubjects.filter((subject) => {
      if (!query) return true;

      const nameMatches = subject.name?.toLowerCase().includes(query);
      const shortNameMatches = subject.short_name?.toLowerCase().includes(query);
      const codeMatches = subject.code?.toLowerCase().includes(query);
      const specialtyNameMatches = subject.specialty?.name?.toLowerCase().includes(query);
      const specialtyShortMatches = subject.specialty?.short_name?.toLowerCase().includes(query);

      return nameMatches || shortNameMatches || codeMatches || specialtyNameMatches || specialtyShortMatches;
    });

    // 2. Separate based strictly on what was ALREADY in the database
    const assignedAtStart = [];
    const unassignedAtStart = [];

    filtered.forEach((subject) => {
      const wasAssigned = dbAssignedIds.includes(subject.id);
      if (wasAssigned) {
        assignedAtStart.push(subject);
      } else {
        unassignedAtStart.push(subject);
      }
    });

    return { 
      assigned: assignedAtStart, 
      unassigned: unassignedAtStart 
    };
  })();

  // Replaced Component Section
  const subjectsBody = (
    <div className="w-[min(95vw,750px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex mb-3">
        <button
          type="button" onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium transition"
        >
          ← Назад
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900 mb-1">Управление на предмети и заетост за:</h3>
        <p className="text-sm text-blue-600 font-bold mb-4">{selectedLecturer?.names}</p>

        {/* 🔍 Dynamic Subject Search Bar */}
        <div className="relative mb-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            value={subjectSearch}
            onChange={(e) => setSubjectSearch(e.target.value)}
            placeholder="Търсене на предмет по име, съкращение или специалност..."
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          />
        </div>

        <form onSubmit={handleSaveSubjects} className="space-y-4">
          {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 max-h-96 overflow-y-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider sticky top-0 border-b border-slate-200 z-10">
                <tr>
                  <th className="px-4 py-2.5 w-1 text-center">Статус</th>
                  <th className="px-4 py-2.5">Предмет</th>
                  <th className="px-4 py-2.5">Специалност</th>
                  <th className="px-4 py-2.5 text-right pr-6">Тип заетост</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                
                {/* 📌 SECTION 1: ASSIGNED BEFORE OPENING MENU */}
                {sortedAndFilteredSubjects.assigned.length > 0 && (
                  <tr className="bg-slate-100/80 font-bold text-slate-600 text-xs uppercase tracking-wider sticky top-[37px] z-10 border-y border-slate-200">
                    <td colSpan="4" className="px-4 py-2">
                      Преподавани до момента ({sortedAndFilteredSubjects.assigned.length})
                    </td>
                  </tr>
                )}
                {sortedAndFilteredSubjects.assigned.map(subject => {
                  const currentAssignment = assignedSubjects.find(item => item.subject_id === subject.id);
                  const isAssigned = !!currentAssignment;

                  return (
                    <tr key={`db-assigned-${subject.id}`} className={`hover:bg-slate-50 transition-colors ${isAssigned ? "bg-purple-50/20" : "bg-rose-50/10 text-slate-400"}`}>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button" onClick={() => handleToggleSubjectAssignment(subject.id)}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition-all shadow-sm ${
                            isAssigned 
                              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                              : "bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-300"
                          }`}
                        >
                          {isAssigned ? "Избран" : "Премахнат"}
                        </button>
                      </td>
                      <td className={`px-4 py-3 font-medium ${isAssigned ? "text-slate-900" : "line-through text-slate-400"}`}>
                        {subject.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">
                        {subject.specialty ? `${subject.specialty.name} (${subject.specialty.short_name})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className={`inline-flex rounded-md shadow-sm border border-slate-200 bg-slate-50 p-0.5 transition-opacity ${!isAssigned ? "opacity-20 pointer-events-none" : ""}`}>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'lecture')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'lecture' ? "bg-purple-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Лекции
                          </button>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'exercise')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'exercise' ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Упражнения
                          </button>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'both')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'both' ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            И двете
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* 📌 SECTION 2: THE REST OF THE SUBJECTS */}
                {sortedAndFilteredSubjects.unassigned.length > 0 && (
                  <tr className="bg-slate-100/80 font-bold text-slate-600 text-xs uppercase tracking-wider sticky top-[37px] z-10 border-y border-slate-200">
                    <td colSpan="4" className="px-4 py-2">
                      Други предмети ({sortedAndFilteredSubjects.unassigned.length})
                    </td>
                  </tr>
                )}
                {sortedAndFilteredSubjects.unassigned.map(subject => {
                  const currentAssignment = assignedSubjects.find(item => item.subject_id === subject.id);
                  const isAssigned = !!currentAssignment;

                  return (
                    <tr key={`db-unassigned-${subject.id}`} className={`hover:bg-slate-50 transition-colors ${isAssigned ? "bg-emerald-50/20" : ""}`}>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          type="button" onClick={() => handleToggleSubjectAssignment(subject.id)}
                          className={`rounded px-2.5 py-1 text-xs font-bold transition-all shadow-sm ${
                            isAssigned 
                              ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300"
                          }`}
                        >
                          {isAssigned ? "Избран" : "Избери"}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {subject.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        {subject.specialty ? `${subject.specialty.name} (${subject.specialty.short_name})` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className={`inline-flex rounded-md shadow-sm border border-slate-200 bg-slate-50 p-0.5 transition-opacity ${!isAssigned ? "opacity-25 pointer-events-none" : ""}`}>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'lecture')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'lecture' ? "bg-purple-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Лекции
                          </button>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'exercise')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'exercise' ? "bg-indigo-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            Упражнения
                          </button>
                          <button
                            type="button" onClick={() => handleChangePivotType(subject.id, 'both')}
                            className={`rounded px-3 py-1 text-xs font-medium transition-all ${currentAssignment?.type === 'both' ? "bg-blue-600 text-white shadow-sm font-semibold" : "text-slate-600 hover:text-slate-900 hover:bg-white"}`}
                          >
                            И двете
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {/* Empty state fallback */}
                {sortedAndFilteredSubjects.assigned.length === 0 && sortedAndFilteredSubjects.unassigned.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 text-sm">
                      Няма намерени предмети по въведените критерии.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔘 Form Control Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button" onClick={() => setView("main")}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Отказ
            </button>
            <button
              type="submit" disabled={formLoading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-400 transition-colors"
            >
              {formLoading ? "Записване..." : "Запази заетостта"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const editBody = (
    <div className="w-[min(95vw,600px)] p-3">
      <div className="flex mb-3">
        <button
          type="button" onClick={() => setView("main")}
          className="rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium transition"
        >
          ← Назад
        </button>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {selectedLecturer ? (
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Титли</label>
              <input
                type="text" required value={titlesInput} onChange={(e) => setTitlesInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Имена</label>
              <input
                type="text" required value={namesInput} onChange={(e) => setNamesInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
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
          <p className="text-slate-500 text-sm">Няма избран преподавател.</p>
        )}
      </div>
    </div>
  );

  const deleteBody = (
    <div className="w-[min(95vw,500px)] p-3">
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        {selectedLecturer ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Изтриване на преподавател</h3>
              <p className="text-sm text-slate-500">
                Сигурни ли сте, че искате да изтриете <span className="font-semibold text-slate-800">{selectedLecturer.titles} {selectedLecturer.names}</span>?
              </p>
            </div>
            {deleteError && <div className="rounded-md bg-rose-50 p-2 text-xs text-rose-600 font-medium">{deleteError}</div>}
            <div className="flex items-center gap-3 justify-center">
              <button
                type="button" disabled={deleteLoading} onClick={() => setView("main")}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Отказ
              </button>
              <button
                type="button" disabled={deleteLoading} onClick={handleDeleteLecturer}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-rose-400"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избран преподавател.</p>
        )}
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "subjects") ? subjectsBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? "Преподаватели" :
                     (view === "create") ? "Добавяне на преподавател" :
                     (view === "subjects") ? "Прикачване на предмети" :
                     (view === "edit") ? "Редактиране на преподавател" :
                     (view === "delete") ? "Премахване на преподавател" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}