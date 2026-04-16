"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [name, setName] = useState('');
  const [scores, setScores] = useState<any>({ quiz: '', lab: '', assign: '', atten: '', exam: '' });
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
      assignment: Number(scores.assign), 
      attendance: Number(scores.atten), 
      major_exam: Number(scores.exam) 
    }]);
    if (!error) { setName(''); setScores({ quiz: '', lab: '', assign: '', atten: '', exam: '' }); fetchRecords(); }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#70e1ca] via-[#a8b8f3] to-[#70e1ca] p-4 md:p-10 text-black font-sans">
      <div className="max-w-6xl mx-auto text-center">
        
        <h1 className="text-xl md:text-3xl font-bold uppercase mb-8 md:mb-12">
          BSIT Students Grading System
        </h1>

        {/* RESPONSIVE INPUT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto mb-8">
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Quiz" type="number" value={scores.quiz} onChange={(e) => setScores({...scores, quiz: e.target.value})} />
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Laboratory" type="number" value={scores.lab} onChange={(e) => setScores({...scores, lab: e.target.value})} />
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Assignment" type="number" value={scores.assign} onChange={(e) => setScores({...scores, assign: e.target.value})} />
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Attendance" type="number" value={scores.atten} onChange={(e) => setScores({...scores, atten: e.target.value})} />
          <input className="bg-white/50 border border-black/20 rounded-md p-3 outline-none focus:bg-white transition-all shadow-inner" placeholder="Major Exam" type="number" value={scores.exam} onChange={(e) => setScores({...scores, exam: e.target.value})} />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
          <button onClick={addStudent} className="bg-[#2d2d2d] text-white px-8 py-3 rounded font-bold uppercase hover:bg-black transition-all shadow-md active:scale-95 text-sm">
            Add Student
          </button>
          <button onClick={fetchRecords} className="bg-[#2d2d2d] text-white px-8 py-3 rounded font-bold uppercase hover:bg-black transition-all shadow-md active:scale-95 text-sm">
            Calculate All Grades
          </button>
        </div>

        {/* RESPONSIVE TABLE CONTAINER */}
        <div className="overflow-x-auto bg-white border border-black rounded-sm shadow-xl">
          <table className="w-full text-center border-collapse min-w-[800px]">
            <thead className="bg-gray-50 border-b border-black">
              <tr className="text-[11px] md:text-xs font-black uppercase">
                <th className="p-4 border-r border-black">Name</th>
                <th className="p-4 border-r border-black">Quiz (20%)</th>
                <th className="p-4 border-r border-black">Lab (30%)</th>
                <th className="p-4 border-r border-black">Assign (10%)</th>
                <th className="p-4 border-r border-black">Atten (10%)</th>
                <th className="p-4 border-r border-black">Exam (30%)</th>
                <th className="p-4 border-r border-black bg-blue-50">Total</th>
                <th className="p-4 bg-yellow-50">Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const totalRaw = Number(r.quiz || 0) + Number(r.laboratory || 0) + Number(r.assignment || 0) + Number(r.attendance || 0) + Number(r.major_exam || 0);
                return (
                  <tr key={r.id} className="border-b border-black/10 hover:bg-gray-50 text-sm">
                    <td className="p-4 border-r border-black font-bold uppercase">{r.student_name}</td>
                    <td className="p-4 border-r border-black">{r.quiz}</td>
                    <td className="p-4 border-r border-black">{r.laboratory}</td>
                    <td className="p-4 border-r border-black">{r.assignment}</td>
                    <td className="p-4 border-r border-black">{r.attendance}</td>
                    <td className="p-4 border-r border-black">{r.major_exam}</td>
                    <td className="p-4 border-r border-black font-bold text-gray-600 bg-blue-50/30">{totalRaw}</td>
                    <td className="p-4 font-black text-blue-700 bg-yellow-50/30">
                      {Number(r.final_grade || 0).toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}