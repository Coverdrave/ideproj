import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function StudentGroups({ closeModal }) {
  const [view, setView] = useState("main"); // main, create, edit, delete

  const [groups, setGroups] = useState([]);
  const [specialties, setSpecialties] = useState([]); // Loaded to populate select dropdown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form Inputs matching migration fields
  const [groupNumberInput, setGroupNumberInput] = useState("");
  const [specialtyIdInput, setSpecialtyIdInput] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Load both Student Groups and Specialties on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [groupsRes, specialtiesRes] = await Promise.all([
          fetch("/api/student_group/all"),
          fetch("/api/specialty/all")
        ]);

        const groupsData = await groupsRes.json();
        const specialtiesData = await specialtiesRes.json();

        if (groupsRes.ok && specialtiesRes.ok) {
          setGroups(groupsData);
          setSpecialties(specialtiesData);
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

  // Hydrate fields on edit view
  useEffect(() => {
    if (selectedGroup && view === "edit") {
      setGroupNumberInput(selectedGroup.group_number);
      setSpecialtyIdInput(selectedGroup.specialty_id);
      setFormError("");
    }
  }, [selectedGroup, view]);

  function resetForm() {
    setGroupNumberInput("");
    setSpecialtyIdInput("");
    setFormError("");
  }

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!groupNumberInput || !specialtyIdInput) {
      setFormError("Моля, попълнете всички полета.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/student_group/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_number: parseInt(groupNumberInput),
          specialty_id: parseInt(specialtyIdInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setGroups((prev) => [...prev, data]);
        resetForm();
        setView("main");
      } else {
        setFormError(data.message || "Грешка при създаване на група.");
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
      const res = await fetch(`/api/student_group/update/${selectedGroup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          group_number: parseInt(groupNumberInput),
          specialty_id: parseInt(specialtyIdInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setGroups((prev) =>
          prev.map((g) => (g.id === selectedGroup.id ? data : g))
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

  async function handleDeleteGroup() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/student_group/delete/${selectedGroup.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g.id !== selectedGroup.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при изтриване на групата.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // 🔍 Filter Logic: Group number, Specialty name OR Specialty short name
  const filteredGroups = groups.filter((group) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const numMatches = group.group_number?.toString().includes(query);
    const specNameMatches = group.specialty?.name?.toLowerCase().includes(query);
    const specShortMatches = group.specialty?.short_name?.toLowerCase().includes(query);

    return numMatches || specNameMatches || specShortMatches;
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
            placeholder="Търсене по група или специалност"
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
          Добави
        </button>
      </div>

      {!loading && !error && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse bg-white text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold tracking-wider">
              <tr className="border-b border-slate-200">
                <th scope="col" className="px-6 py-3 w-1/4">Група</th>
                <th scope="col" className="px-6 py-3">Специалност</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{group.group_number}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {group.specialty?.name} <span className="text-xs text-slate-400 font-normal">({group.specialty?.short_name})</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
                            setView("edit");
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGroup(group);
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
                    Няма намерени студентски групи.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <tr>
                <td colSpan="3" className="px-6 py-3 font-medium">
                  Общо: {filteredGroups.length} груп{filteredGroups.length !== 1 ? "и" : "а"}
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">Номер на групата</label>
            <input
              type="number" required min="1" max="32767" value={groupNumberInput} onChange={(e) => setGroupNumberInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Специалност</label>
            <select
              required value={specialtyIdInput} onChange={(e) => setSpecialtyIdInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Изберете специалност --</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name} ({spec.short_name})
                </option>
              ))}
            </select>
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
        {selectedGroup ? (
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Номер на групата</label>
              <input
                type="number" required min="1" max="32767" value={groupNumberInput} onChange={(e) => setGroupNumberInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Специалност</label>
              <select
                required value={specialtyIdInput} onChange={(e) => setSpecialtyIdInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Изберете специалност --</option>
                {specialties.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name} ({spec.short_name})
                  </option>
                ))}
              </select>
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
          <p className="text-slate-500 text-sm">Няма избрана група.</p>
        )}
      </div>
    </div>
  );

  const deleteBody = (
    <div className="w-[min(95vw,500px)] p-3">
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        {selectedGroup ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Изтриване на студентска група</h3>
              <p className="text-sm text-slate-500">
                Сигурни ли сте, че искате да изтриете студентска група <span className="font-bold text-slate-800">{selectedGroup.group_number}</span>?
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
                type="button" disabled={deleteLoading} onClick={handleDeleteGroup}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-rose-400"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избрана група.</p>
        )}
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? "Студентски групи" :
                     (view === "create") ? "Добавяне на студентска група" :
                     (view === "edit") ? "Редактиране на студентска група" :
                     (view === "delete") ? "Премахване на студентска група" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}