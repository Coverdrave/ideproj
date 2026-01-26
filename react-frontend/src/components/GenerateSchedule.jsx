import { useEffect, useReducer, useRef, useState } from "react";
import ScheduleGrid from "./ScheduleGrid";

export default function App({}) {
    const options = Object.entries({
        "every_week": {
            "description": 'Всяка седмица',
            "defaultChecked": true
        },
    });

    const [menuStage, setMenuStage] = useState(1);
    function decrementMenu() {
        setMenuStage(menuStage-1);
    }
    function incrementMenu() {
        setMenuStage(menuStage+1);
    }

    const [subjects, setSubjects] = useState([]);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [openedSubjectOptionsMenu, setOpenedSubjectOptionsMenu] = useState();
    const [generatedSchedule, setGeneratedSchedule] = useState([]);

    const subjectsOptions = useRef([]);

    async function GenerateSchedule(requestBody) {
        const res = await fetch("/api/schedule/generate", {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody)
        });

        const data = await res.json();

        if (res.ok) {
            setGeneratedSchedule(data);
        }
    }

    async function GetAllSubjects() {
        const res = await fetch("/api/subject/all");
        const data = await res.json();
        if (res.ok) {
            setSubjects(data);
        }
    }

    useEffect(() => {
        GetAllSubjects();
    }, []);

    return (
        <div className="mx-auto min-w-max">
            <div className="flex justify-center gap-5 mb-2">
                <button 
                    className={`${menuStage === 1 ? 'bg-gray-500' : 'bg-blue-500'} px-2 text-white rounded shadow`} 
                    disabled={menuStage === 1}
                    onClick={decrementMenu}
                >
                    Назад
                </button>
                <div className="flex gap-3 my-auto">
                    <span className="h-5 w-5 bg-slate-300 rounded-[50%] inline-block">
                        {menuStage === 1 && (
                            <span className="h-3 w-3 bg-blue-500 rounded-[50%] block relative top-1 left-1"/>
                        )}
                    </span>
                    <span className="h-5 w-5 bg-slate-300 rounded-[50%] inline-block">
                        {menuStage === 2 && (
                            <span className="h-3 w-3 bg-blue-500 rounded-[50%] block relative top-1 left-1"/>
                        )}
                    </span>
                    <span className="h-5 w-5 bg-slate-300 rounded-[50%] inline-block">
                        {menuStage === 3 && (
                            <span className="h-3 w-3 bg-blue-500 rounded-[50%] block relative top-1 left-1"/>
                        )}
                    </span>
                </div>
                <button 
                    className={`${menuStage === 3 || selectedSubjects.length === 0 ? 'bg-gray-500' : 'bg-blue-500'} px-2 text-white rounded shadow`} 
                    disabled={menuStage === 3 || selectedSubjects.length === 0}
                    onClick={() => {
                        if (menuStage === 1) {
                            selectedSubjects.sort();

                            subjects.map((subject) => {
                                let sid = subject.id;
                                let isSelected = selectedSubjects.includes(sid);
                                let optionsExist = subjectsOptions.current[sid];

                                if (!isSelected && optionsExist) {
                                    delete subjectsOptions.current[sid];
                                }
                                else if (isSelected && !optionsExist) {
                                    subjectsOptions.current = {
                                        ...subjectsOptions.current,
                                        [sid]: {
                                            lecture: {'every_week': true},
                                            exercise: {'every_week': true}
                                        }
                                    }
                                }
                            });

                            console.log(subjectsOptions.current);
                        }
                        else if (menuStage === 2) {
                            GenerateSchedule({
                                subgroups: [
                                    'А', 'Б'
                                ],
                                subjects_options: subjectsOptions.current
                            });

                            console.log(subjectsOptions.current);
                        }

                        incrementMenu();
                    }}
                >
                    Напред
                </button>
            </div>

            {/* pick subjects */}
            {menuStage === 1 && 
            <div>
                {subjects.map((subject, _) => (<>
                    <label htmlFor={subject.name}>
                        <input 
                            type="checkbox"
                            className="mr-2"
                            id={subject.name}
                            name={subject.name}
                            value={subject.id} 
                            checked={selectedSubjects.includes(subject.id)}
                            onChange={(e)=> {
                                if (selectedSubjects.indexOf(subject.id) >= 0) {
                                    setSelectedSubjects(prev => prev.filter(x => x !== subject.id))
                                }
                                else {
                                    setSelectedSubjects(prev => [...prev, subject.id])
                                } 
                            }}
                        />
                        {subject.name}
                    </label>
                    <br/>
                </>))}
            </div>}

            {/* subject options */}
            {menuStage === 2 && 
            <div>
                {selectedSubjects.map((subjectId) => (<>
                    <div className="rounded shadow mt-2 px-2">
                        <div className="cursor-pointer" onClick={(e) => {
                            setOpenedSubjectOptionsMenu((openedSubjectOptionsMenu === subjectId) ? null : subjectId);
                        }}>
                            <span className={`font-semibold text-2xl mr-2 inline-block 
                                ${openedSubjectOptionsMenu === subjectId && 'rotate-90'}`}
                            >{'>'}</span>
                            {subjects.find((subject) => subject.id === subjectId).name}
                        </div>
                        
                        {openedSubjectOptionsMenu === subjectId && 
                        <div className="mt-1 grid grid-cols-3 gap-x-2">
                            <div></div>
                            <div>Лекция</div>
                            <div>Упражнение</div>

                            {options.map(([optionKey, optionVals]) => (<>
                                <div>{optionVals.description}</div>
                                <div>
                                    <input type="checkbox" 
                                        className=""
                                        name={subjectId+'_'+optionKey+'lect'} 
                                        defaultChecked={subjectsOptions.current[subjectId].lecture[optionKey]}
                                        id=""
                                        onChange={(e)=> {
                                            subjectsOptions.current[subjectId].lecture[optionKey] = e.target.checked;
                                        }}
                                    />
                                </div>
                                <div>
                                    <input type="checkbox" 
                                        className=""
                                        name={subjectId+'_'+optionKey+'exer'} 
                                        defaultChecked={subjectsOptions.current[subjectId].exercise[optionKey]} 
                                        id=""
                                        onChange={(e)=> {
                                            subjectsOptions.current[subjectId].exercise[optionKey] = e.target.checked;
                                        }}
                                    />
                                </div>
                            </>))}
                        </div>}
                    </div>
                </>))}
            </div>}

            {/* generate */}
            {menuStage === 3 && generatedSchedule.groupInfo &&
            <div className="min-w-max max-w-min mx-auto">
                <ScheduleGrid apiData={generatedSchedule}/>
            </div>}
        </div>
    );
}


