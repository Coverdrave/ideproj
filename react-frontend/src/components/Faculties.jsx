import { useEffect, useState } from "react";
import PopupModal from "./_PopupModal.jsx";

export default function Faculties({ closeModal }) {
  const [view, setView] = useState("main");

  const [faculties, setFaculties] = useState([]);
  const [facultiesLoading, setFacultiesLoading] = useState(true);
  const [facultiesError, setFacultiesError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedFaculty, setSelectedFaculty] = useState(null);

  const [nameInput, setNameInput] = useState("");
  const [shortNameInput, setShortNameInput] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function loadFaculties() {
      setFacultiesLoading(true);
      setFacultiesError("");

      try {
        const res = await fetch("/api/faculty/all");
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
    if (selectedFaculty && view === "edit") {
      setNameInput(selectedFaculty.name);
      setShortNameInput(selectedFaculty.short_name);
      setCreateError("");
    }
  }, [selectedFaculty, view]);

  async function handleCreateFormSubmit(e) {
    e.preventDefault();
    if (!nameInput.trim() || !shortNameInput.trim()) {
      setCreateError("Моля, попълнете всички полета.");
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch("/api/faculty/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          short_name: shortNameInput
        })
      });
      const data = await res.json();

      if (res.ok) {
        setNameInput("");
        setShortNameInput("");
        setFaculties((prev) => [...prev, data]); 
        setView("main");
      } else {
        setCreateError(data.message || "Грешка при запис на данните.");
      }
    } catch {
      setCreateError("Сървърът не отговаря.");
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleDeleteFaculty(e) {
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const res = await fetch(`/api/faculty/delete/${selectedFaculty.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setFaculties((prev) => prev.filter((f) => f.id !== selectedFaculty.id));
        setView("main");
      } else {
        const data = await res.json();
        setDeleteError(data.message || "Грешка при опит за изтриване на факултета.");
      }
    } catch {
      setDeleteError("Сървърът не отговаря.");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleEditFormSubmit(e) {
    e.preventDefault();
    if (!nameInput.trim() || !shortNameInput.trim()) {
      setCreateError("Моля, попълнете всички полета.");
      return;
    }

    setCreateLoading(true);
    setCreateError("");

    try {
      const res = await fetch(`/api/faculty/update/${selectedFaculty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput,
          short_name: shortNameInput
        })
      });
      const data = await res.json();

      if (res.ok) {
        setFaculties((prev) => 
          prev.map((f) => f.id === selectedFaculty.id ? data : f)
        );
        setView("main");
      } else {
        setCreateError(data.message || "Грешка при обновяване на данните.");
      }
    } catch {
      setCreateError("Сървърът не отговаря.");
    } finally {
      setCreateLoading(false);
    }
  }

  const filteredFaculties = faculties.filter((faculty) => {
    const searchLower = searchTerm.toLowerCase().trim();
    return (
      faculty.name.toLowerCase().includes(searchLower) ||
      faculty.short_name.toLowerCase().includes(searchLower)
    );
  });

  const mainBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      {facultiesLoading && <p className="text-slate-500 text-center py-4">Зареждане...</p>}
      {facultiesError && <p className="text-red-500 text-center py-4">{facultiesError}</p>}

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
            placeholder="Търсене по име или абревиатура"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
          />
        </div>

        <button
          type="button"
          onClick={() => setView('create')}
          className="w-fit shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed"
        >
          Създаване
        </button>
      </div>

      {!facultiesLoading && !facultiesError && (
        <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse bg-white text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 font-semibold tracking-wider">
              <tr className="border-b border-slate-200">
                <th scope="col" className="px-6 py-3">Име</th>
                <th scope="col" className="px-6 py-3 w-1/4">Абревиатура</th>
                <th scope="col" className="px-6 py-3 w-1 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaculties.length > 0 ? (
                filteredFaculties.map((faculty) => (
                  <tr key={faculty.id || faculty.name} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{faculty.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap uppercase font-semibold text-slate-500">{faculty.short_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-3 justify-end">
                        <button
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setView("edit");
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          Редактиране
                        </button>

                        <button
                          onClick={() => {
                            setSelectedFaculty(faculty);
                            setView("delete");
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          Изтриване
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-400 italic">
                    Няма намерени факултети, отговарящи на критериите.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <tr>
                <td colSpan="3" className="px-6 py-3 font-medium">
                  Показване на {filteredFaculties.length} резултат{filteredFaculties.length !== 1 && 'а'}
                  {searchTerm && ` (филтрирани от общо ${faculties.length})`}
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
          onClick={() => {
            setView('main');
            setCreateError('');
          }}
          className="w-fit shrink-0 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
        <form 
          onSubmit={handleCreateFormSubmit}
          className="space-y-5 w-full max-w-md mx-auto"
        >
          {createError && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">
              {createError}
            </div>
          )}

          <div>
            <label htmlFor="faculty-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Пълно име на факултета
            </label>
            <input
              id="faculty-name"
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
            />
          </div>

          <div>
            <label htmlFor="faculty-short" className="block text-sm font-semibold text-slate-700 mb-1.5">
              Абревиатура
            </label>
            <input
              id="faculty-short"
              type="text"
              required
              value={shortNameInput}
              onChange={(e) => setShortNameInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={createLoading}
              className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
            >
              {createLoading ? "Записване..." : "Създай"}
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
          type="button"
          onClick={() => {
            setView('main');
            setCreateError('');
          }}
          className="w-fit shrink-0 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        {selectedFaculty ? (
          <form 
            onSubmit={handleEditFormSubmit}
            className="space-y-5 w-full max-w-md mx-auto"
          >
            {createError && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium">
                {createError}
              </div>
            )}

            <div>
              <label htmlFor="edit-faculty-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Пълно име на факултета
              </label>
              <input
                id="edit-faculty-name"
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
              />
            </div>

            <div>
              <label htmlFor="edit-faculty-short" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Абревиатура / Съкращение
              </label>
              <input
                id="edit-faculty-short"
                type="text"
                required
                value={shortNameInput}
                onChange={(e) => setShortNameInput(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-colors"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={createLoading}
                className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
              >
                {createLoading ? "Записване..." : "Запази промените"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-slate-500 text-sm">Няма избран факултет.</p>
        )}
      </div>
    </div>
  );

  const deleteBody = (
    <div className="w-[min(95vw,1100px)] max-h-[min(85vh,calc(100vh-4rem))] overflow-y-auto p-3">
      <div className="flex">
        <button
          type="button"
          onClick={() => {
            setView('main');
            setDeleteError('');
          }}
          className="w-fit shrink-0 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium shadow-sm transition"
        >
          ← Назад
        </button>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[300px]">
        {selectedFaculty ? (
          <div className="max-w-md w-full space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
              <svg className="h-7 w-7 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Изтриване на факултет
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Сигурни ли сте, че искате да изтриете факултет <span className="font-semibold text-slate-800">"{selectedFaculty.name}" ({selectedFaculty.short_name})</span>? 
              </p>
              <p className="text-xs text-rose-600 font-medium bg-rose-50 rounded p-2 border border-rose-100">
                ⚠️ Внимание: Това действие е необратимо и ще премахне свързаните към него специалности и групи!
              </p>
            </div>

            {deleteError && (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-600 font-medium text-left">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 justify-center pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setView('main');
                  setDeleteError('');
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition disabled:opacity-50"
              >
                Отказ
              </button>
              
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteFaculty}
                className="w-full rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-rose-400 disabled:cursor-not-allowed transition"
              >
                {deleteLoading ? "Изтриване..." : "Да, изтрий"}
              </button>
            </div>

          </div>
        ) : (
          <p className="text-slate-500 text-sm">Няма избран факултет.</p>
        )}
      </div>
    </div>
  );

  const body = (view === "main") ? mainBody :
               (view === "create") ? createBody :
               (view === "edit") ? editBody :
               (view === "delete") ? deleteBody : (<></>);

  const headerText = (view === "main") ? 'Факултети' :
                     (view === "create") ? 'Създаване на факултет' :
                     (view === "edit") ? 'Редактиране на факултет' :
                     (view === "delete") ? 'Изтриване на факултет' : '';

  return <PopupModal close={closeModal} headerText={headerText} body={body} />;
}