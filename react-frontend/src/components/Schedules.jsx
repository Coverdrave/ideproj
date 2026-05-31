import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Schedules({ closeModal }) {
  const [view, setView] = useState("main");

  const [schedules, setSchedules] = useState([]);
  const [groups, setGroups] = useState([]); // To populate the dropdown select
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Form Inputs
  const [groupIdInput, setGroupIdInput] = useState("");
  const [subgroupInput, setSubgroupInput] = useState("");
  const [semesterInput, setSemesterInput] = useState("");

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const semesterToTerm = (semester) => (semester % 2 === 1 ? "зимен" : "летен");
  const semesterToCourse = (semester) => Math.ceil(semester / 2);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const [schedulesRes, groupsRes] = await Promise.all([
          fetch("/api/schedule/all"),
          fetch("/api/student_group/all")
        ]);

        const schedulesData = await schedulesRes.json();
        const groupsData = await groupsRes.json();

        if (schedulesRes.ok && groupsRes.ok) {
          setSchedules(schedulesData);
          setGroups(groupsData);
        } else {
          setError("Неуспешно зареждане на разписанията.");
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
    if (selectedSchedule && view === "edit") {
      setGroupIdInput(selectedSchedule.student_group_id);
      setSubgroupInput(selectedSchedule.subgroup);
      setSemesterInput(selectedSchedule.semester);
      setFormError("");
    }
  }, [selectedSchedule, view]);

  function resetForm() {
    setGroupIdInput("");
    setSubgroupInput("");
    setSemesterInput("");
    setFormError("");
  }

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!groupIdInput || !subgroupInput.trim() || !semesterInput) {
      setFormError("Моля, попълнете всички полета.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/schedule/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_group_id: parseInt(groupIdInput),
          subgroup: subgroupInput.trim().toUpperCase(),
          semester: parseInt(semesterInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSchedules((prev) => [...prev, data]);
        resetForm();
        setView("main");
      } else {
        setFormError(data.message || "Грешка при създаване на разписание.");
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
      const res = await fetch(`/api/schedule/update/${selectedSchedule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_group_id: parseInt(groupIdInput),
          subgroup: subgroupInput.trim().toUpperCase(),
          semester: parseInt(semesterInput)
        })
      });
      const data = await res.json();

      if (res.ok) {
        setSchedules((prev) =>
          prev.map((s) => (s.id === selectedSchedule.id ? data : s))
        );
        setView("main");
      } else {
        setFormError(data.message || "Грешка при обновяване на разписанието.");
      }
    } catch {
      setFormError("Сървърът не отговаря.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDeleteSchedule() {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/schedule/delete/${selectedSchedule.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setSchedules((prev) => prev.filter((s) => s.id !== selectedSchedule.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при изтриване на разписанието.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // 🔍 Nested Live Filter Engine
  const filteredSchedules = schedules.filter((schedule) => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return true;

    const groupNum = schedule.student_group?.group_number?.toString();
    const specName = schedule.student_group?.specialty?.name?.toLowerCase();
    const specShort = schedule.student_group?.specialty?.short_name?.toLowerCase();

    return (
      groupNum?.includes(query) ||
      specName?.includes(query) ||
      specShort?.includes(query)
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
                <th scope="col" className="px-6 py-3">Специалност</th>
                <th scope="col" className="px-6 py-3 w-1">Група</th>
                <th scope="col" className="px-6 py-3 w-1">Подгрупа</th>
                <th scope="col" className="px-6 py-3">Семестър</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.length > 0 ? (
                filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {schedule.student_group?.specialty?.name} <span className="text-xs text-slate-400">({schedule.student_group?.specialty?.short_name})</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{schedule.student_group?.group_number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-500 text-center sm:text-left">{schedule.subgroup}</td>
                    <td className="px-6 py-4 font-medium ">
                      {semesterToCourse(schedule.semester)} курс<br/>{semesterToTerm(schedule.semester)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setView("edit");
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
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
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-sm">
                    Няма намерени разписания.
                  </td>
                </tr>
              )}
            </tbody>
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">Група</label>
            <select
              required value={groupIdInput} onChange={(e) => setGroupIdInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">-- Изберете група --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  Група {g.group_number} — {g.specialty?.short_name || g.specialty?.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Подгрупа</label>
              <input
                type="text" required maxLength="1" value={subgroupInput} onChange={(e) => setSubgroupInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none placeholder:text-slate-300"
                placeholder="А, Б..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Семестър</label>
              <input
                type="number" required min="1" max="12" value={semesterInput} onChange={(e) => setSemesterInput(e.target.value)}
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
        {selectedSchedule ? (
          <form onSubmit={handleEditFormSubmit} className="space-y-4">
            {formError && <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">{formError}</div>}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Студентска група</label>
              <select
                required value={groupIdInput} onChange={(e) => setGroupIdInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Изберете група --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    Група {g.group_number} — {g.specialty?.short_name || g.specialty?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Подгрупа буква</label>
                <input
                  type="text" required maxLength="1" value={subgroupInput} onChange={(e) => setSubgroupInput(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Семестър</label>
                <input
                  type="number" required min="1" max="12" value={semesterInput} onChange={(e) => setSemesterInput(e.target.value)}
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
          <p className="text-slate-500 text-sm">Няма избрано разписание.</p>
        )}
      </div>
    </div>
  );

  const deleteBody = (
    <div className="w-[min(95vw,500px)] p-3">
      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        {selectedSchedule ? (
          <div className="space-y-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Изтриване на разписание</h3>
              <p className="text-sm text-slate-500">
                Сигурни ли сте, че искате да изтриете разписанието за <span className="font-bold text-slate-800">Група {selectedSchedule.student_group?.group_number}, подгрупа "{selectedSchedule.subgroup}"</span> за семестър <span className="font-semibold text-slate-800">{selectedSchedule.semester}</span>?
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
                type="button" disabled={deleteLoading} onClick={handleDeleteSchedule}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:bg-rose-400"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избрано разписание.</p>
        )}
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? "Разписания" :
                     (view === "create") ? "Създаване на разписание" :
                     (view === "edit") ? "Редактиране на разписание" :
                     (view === "delete") ? "Премахване на разписание" : "";

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}