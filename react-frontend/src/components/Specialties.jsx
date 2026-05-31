import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Specialties({ closeModal }) {
  const [view, setView] = useState("main");

  const [specialties, setSpecialties] = useState([]);
  const [faculties, setFaculties] = useState([]); // 💡 Loaded to fill the dropdown select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const [nameInput, setNameInput] = useState("");
  const [shortNameInput, setShortNameInput] = useState("");
  const [facultyIdInput, setFacultyIdInput] = useState("");
  const [durationInput, setDurationInput] = useState("8");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [specRes, facRes] = await Promise.all([
          fetch("/api/specialty/all"),
          fetch("/api/faculty/all")
        ]);

        const specData = await specRes.json();
        const facData = await facRes.json();

        if (specRes.ok && facRes.ok) {
          setSpecialties(specData);
          setFaculties(facData);
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
    if (selectedSpecialty && view === "edit") {
      setNameInput(selectedSpecialty.name);
      setShortNameInput(selectedSpecialty.short_name);
      setFacultyIdInput(selectedSpecialty.faculty_id);
      setDurationInput(selectedSpecialty.duration_semester.toString());
      setFormError("");
    }
  }, [selectedSpecialty, view]);

  function resetForm() {
    setNameInput("");
    setShortNameInput("");
    setFacultyIdInput(faculties[0]?.id || "");
    setDurationInput("8");
    setFormError("");
  }

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!nameInput.trim() || !shortNameInput.trim() || !facultyIdInput) {
      setFormError("Моля, попълнете всички задължителни полета.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/specialty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          short_name: shortNameInput,
          faculty_id: Number(facultyIdInput),
          degree_level: "bachelor", // Fixed payload variable
          duration_semester: Number(durationInput),
          is_part_time: false // Fixed payload variable
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSpecialties((prev) => [...prev, data]);
        resetForm();
        setView("main");
      } else {
        setFormError(data.message || "Грешка при създаване на специалността.");
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
      const res = await fetch(`/api/specialty/update/${selectedSpecialty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          short_name: shortNameInput,
          faculty_id: Number(facultyIdInput),
          degree_level: "bachelor", // Fixed payload variable
          duration_semester: Number(durationInput),
          is_part_time: false // Fixed payload variable
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSpecialties((prev) =>
          prev.map((s) => (s.id === selectedSpecialty.id ? data : s))
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

  async function handleDeleteSpecialty() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/specialty/delete/${selectedSpecialty.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setSpecialties((prev) => prev.filter((s) => s.id !== selectedSpecialty.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при изтриване на специалността.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDegree(level) {
    const mapping = { bachelor: "Бакалавър", master: "Магистър", phd: "Докторант" };
    return mapping[level] || level;
  }

  const filteredSpecialties = specialties.filter((specialty) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const facultyShort = specialty.faculty?.short_name?.toLowerCase() || "";

    return (
      specialty.name.toLowerCase().includes(searchLower) ||
      specialty.short_name.toLowerCase().includes(searchLower) ||
      facultyShort.includes(searchLower)
    );
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
            placeholder="Търсене по име, съкращение или факултет"
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
                <th scope="col" className="px-6 py-3">Име</th>
                <th scope="col" className="px-6 py-3">Съкращение</th>
                <th scope="col" className="px-6 py-3">Факултет</th>
                <th scope="col" className="px-6 py-3">Степен</th>
                <th scope="col" className="px-6 py-3">Семестри</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map((specialty) => (
                  <tr key={specialty.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{specialty.name}</td>
                    <td className="px-6 py-4 uppercase font-semibold text-slate-500">{specialty.short_name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800 uppercase">
                        {specialty.faculty?.short_name || `ID: ${specialty.faculty_id}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDegree(specialty.degree_level)}</td>
                    <td className="px-6 py-4 text-center">{specialty.duration_semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedSpecialty(specialty);
                            setView("edit");
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSpecialty(specialty);
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
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-slate-400 italic">
                    Няма намерени специалности, отговарящи на критериите.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <tr>
                <td colSpan="6" className="px-6 py-3 font-medium">
                  Показване на {filteredSpecialties.length} резултат{filteredSpecialties.length !== 1 && "а"}
                  {searchTerm && ` (филтрирани от общо ${specialties.length})`}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Име на специалността</label>
              <input
                type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Абревиатура</label>
              <input
                type="text" required value={shortNameInput} onChange={(e) => setShortNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Прилежащ Факултет</label>
              <select
                value={facultyIdInput} required onChange={(e) => setFacultyIdInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>Изберете факултет...</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} ({f.short_name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Продължителност (Семестри)</label>
              <input
                type="number" min="1" max="12" required value={durationInput} onChange={(e) => setDurationInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
        {selectedSpecialty ? (
          <form onSubmit={handleEditFormSubmit} className="space-y-4 w-full max-w-xl mx-auto">
            {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Име на специалността</label>
                <input
                  type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Абревиатура</label>
                <input
                  type="text" required value={shortNameInput} onChange={(e) => setShortNameInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Прилежащ Факултет</label>
                <select
                  value={facultyIdInput} required onChange={(e) => setFacultyIdInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {faculties.map((f) => (
                    <option key={f.id} value={f.id}>{f.name} ({f.short_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Продължителност (Семестри)</label>
                <input
                  type="number" min="1" max="12" required value={durationInput} onChange={(e) => setDurationInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          <p className="text-slate-500 text-sm">Няма избрана специалност.</p>
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
        {selectedSpecialty ? (
          <div className="max-w-md w-full space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Изтриване на специалност</h3>
              <p className="text-sm text-slate-500">
                Сигурни ли сте, че искате да изтриете специалност <span className="font-semibold text-slate-800">"{selectedSpecialty.name}"</span>?
              </p>
              <p className="text-xs text-rose-600 font-medium bg-rose-50 rounded p-2 border border-rose-100">
                ⚠️ Внимание: Това автоматично ще премахне всички прилежащие академични групи и разписи към нея!
              </p>
            </div>

            {deleteError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium text-left">{deleteError}</div>}

            <div className="flex items-center gap-3 justify-center">
              <button
                type="button" disabled={deleteLoading} onClick={() => setView("main")}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Отказ
              </button>
              <button
                type="button" disabled={deleteLoading} onClick={handleDeleteSpecialty}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 disabled:bg-rose-400"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избрана специалност.</p>
        )}
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
                (view === "create") ? createBody :
                (view === "edit") ? editBody :
                (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? "Специалности" :
                       (view === "create") ? "Създаване на специалност" :
                       (view === "edit") ? "Редактиране на специалност" :
                       (view === "delete") ? "Изтриване на специалност" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}