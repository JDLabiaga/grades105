"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState<any>({ quiz: '', lab: '', assignment: '', attendance: '', exam: '' });
  const [records, setRecords] = useState<any[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase.from('student4_grades').select('*').order('created_at', { ascending: false });
    setRecords(data || []);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Name");
    const { error } = await supabase.from('student4_grades').insert([{ 
      student_name: name, 
      quiz: Number(scores.quiz), 
      laboratory: Number(scores.lab), 
      assignment: Number(scores.assignment), 
      attendance: Number(scores.attendance), 
      major_exam: Number(scores.exam) 
    }]);
    if (!error) { setName(''); setScores({ quiz: '', lab: '', assignment: '', attendance: '', exam: '' }); fetchRecords(); }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#70e1ca] via-[#a8b8f3] to-[#70e1ca] p-8 text-black">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold uppercase mb-10">BSIT STUDENTS GRADING SYSTEM</h1>

        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Quiz" value={scores.quiz} onChange={(e) => setScores({...scores, quiz: e.target.value})} />
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Laboratory" value={scores.lab} onChange={(e) => setScores({...scores, lab: e.target.value})} />
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Assignment" value={scores.assignment} onChange={(e) => setScores({...scores, assignment: e.target.value})} />
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Attendance" value={scores.attendance} onChange={(e) => setScores({...scores, attendance: e.target.value})} />
          <input className="p-3 rounded-lg border border-gray-300 outline-none" placeholder="Major Exam" value={scores.exam} onChange={(e) => setScores({...scores, exam: e.target.value})} />
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <button onClick={addStudent} className="bg-[#2d2d2d] text-white px-8 py-3 rounded-md font-bold uppercase">Add Student</button>
          <button onClick={fetchRecords} className="bg-[#2d2d2d] text-white px-8 py-3 rounded-md font-bold uppercase">Calculate All Grades</button>
        </div>

        <div className="bg-white border border-black overflow-hidden rounded-sm">
          <table className="w-full text-center border-collapse">
            <thead className="border-b border-black">
              <tr className="text-sm font-bold">
                <th className="p-4 border-r border-black">Name</th>
                <th className="p-4 border-r border-black">Quiz (20%)</th>
                <th className="p-4 border-r border-black">Laboratory (30%)</th>
                <th className="p-4 border-r border-black">Assignment (10%)</th>
                <th className="p-4 border-r border-black">Attendance (10%)</th>
                <th className="p-4 border-r border-black">Major Exam (30%)</th>
                <th className="p-4 bg-gray-100">Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-200">
                  <td className="p-4 border-r border-black font-semibold uppercase">{r.student_name}</td>
                  <td className="p-4 border-r border-black">{r.quiz}</td>
                  <td className="p-4 border-r border-black">{r.laboratory}</td>
                  <td className="p-4 border-r border-black">{r.assignment}</td>
                  <td className="p-4 border-r border-black">{r.attendance}</td>
                  <td className="p-4 border-r border-black">{r.major_exam}</td>
                  <td className="p-4 font-bold text-blue-800">{Number(r.final_grade || 0).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}