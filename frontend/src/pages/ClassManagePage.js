import React, { useState } from 'react';
import NavBar from "../components/NavBar";

function ClassManagePage() {
  const [classes, setClasses] = useState([
    { id: 1, name: '一班', groups: [
      { id: 11, name: 'A组', students: ['张三', '李四'] },
      { id: 12, name: 'B组', students: ['王五'] }
    ] }
  ]);
  const [newClass, setNewClass] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newStudent, setNewStudent] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const handleAddClass = () => {
    if (!newClass) return;
    setClasses([...classes, { id: Date.now(), name: newClass, groups: [] }]);
    setNewClass('');
  };
  const handleSelectClass = (cls) => {
    setSelectedClass(cls);
    setSelectedGroup(null);
  };
  const handleAddGroup = () => {
    if (!newGroup || !selectedClass) return;
    setClasses(classes.map(cls =>
      cls.id === selectedClass.id
        ? { ...cls, groups: [...cls.groups, { id: Date.now(), name: newGroup, students: [] }] }
        : cls
    ));
    setNewGroup('');
  };
  const handleSelectGroup = (grp) => {
    setSelectedGroup(grp);
  };
  const handleAddStudent = () => {
    if (!newStudent || !selectedClass || !selectedGroup) return;
    setClasses(classes.map(cls =>
      cls.id === selectedClass.id
        ? { ...cls, groups: cls.groups.map(grp =>
            grp.id === selectedGroup.id
              ? { ...grp, students: [...grp.students, newStudent] }
              : grp
          ) }
        : cls
    ));
    setNewStudent('');
  };
  return (
    <div>
      <NavBar />
      <div className="w-full max-w-3xl mt-20 mb-8 px-2 sm:px-4 md:px-8">
        <h2 className="text-2xl font-bold mb-4">班级管理</h2>
        <div className="mb-6 flex gap-2">
          <input
            className="border px-2 py-1 rounded"
            placeholder="班级名称"
            value={newClass}
            onChange={e => setNewClass(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleAddClass}>添加班级</button>
        </div>
        <div className="mb-6">
          {classes.map(cls => (
            <div key={cls.id} className="mb-4">
              <h3 className="text-xl font-semibold mb-2">{cls.name}</h3>
              <button className="bg-green-500 text-white px-2 py-1 rounded mb-2" onClick={() => handleSelectClass(cls)}>选择班级</button>
              {selectedClass && selectedClass.id === cls.id && (
                <div className="ml-4">
                  <input
                    className="border px-2 py-1 rounded"
                    placeholder="组名"
                    value={newGroup}
                    onChange={e => setNewGroup(e.target.value)}
                  />
                  <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleAddGroup}>添加组</button>
                  {cls.groups.map(grp => (
                    <div key={grp.id} className="ml-4 mb-2">
                      <h4 className="text-lg font-medium">{grp.name}</h4>
                      <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => handleSelectGroup(grp)}>选择组</button>
                      {selectedGroup && selectedGroup.id === grp.id && (
                        <div className="ml-4">
                          <input
                            className="border px-2 py-1 rounded"
                            placeholder="学生姓名"
                            value={newStudent}
                            onChange={e => setNewStudent(e.target.value)}
                          />
                          <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={handleAddStudent}>添加学生</button>
                          <ul className="list-disc ml-6">
                            {grp.students.map(student => (
                              <li key={student}>{student}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ClassManagePage;