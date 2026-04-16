"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scores, setScores] = useState<any>({ quiz: '', lab: '', assign: '', atten: '', exam: '' });
  const [records, setRecords] = useState<any[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase.from('student4_grades').select('*').order('created_at', { ascending: false });
    setRecords(data || []);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const resetForm = () => {
    setName(''); setEditingId(null);
    setScores({ quiz: '', lab: '', assign: '', atten: '', exam: '' });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Name");
    const payload = { 
      student_name: name, 
      quiz: Number(scores.quiz), laboratory: Number(scores.lab), 
      assignment: Number(scores.assign), attendance: Number(scores.atten), 
      major_exam: Number(scores.exam) 
    };

    if (editingId) await supabase.from('student4_grades').update(payload).eq('id', editingId);
    else await supabase.from('student4_grades').insert([payload]);

    resetForm(); fetchRecords();
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({ quiz: r.quiz, lab: r.laboratory, assign: r.assignment, atten: r.attendance, exam: r.major_exam });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Confirm Deletion?")) {
      await supabase.from('student4_grades').delete().eq('id', id);
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#70e1ca] to-[#a8b8f3] p-4 md:p-10 text-black">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-bold uppercase mb-10">BSIT Students Grading System</h1>

        {/* RESPONSIVE INPUT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Quiz" type="number" value={scores.quiz} onChange={(e) => setScores({...scores, quiz: e.target.value})} />
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Laboratory" type="number" value={scores.lab} onChange={(e) => setScores({...scores, lab: e.target.value})} />
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Assignment" type="number" value={scores.assign} onChange={(e) => setScores({...scores, assign: e.target.value})} />
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Attendance" type="number" value={scores.atten} onChange={(e) => setScores({...scores, atten: e.target.value})} />
          <input className="p-3 border border-black/20 rounded bg-white/50 outline-none focus:bg-white transition-all" placeholder="Major Exam" type="number" value={scores.exam} onChange={(e) => setScores({...scores, exam: e.target.value})} />
        </div>

        <div className="flex justify-center gap-4 mb-12">
          <button onClick={addStudent} className="bg-[#2d2d2d] text-white px-8 py-3 rounded font-bold uppercase hover:bg-black transition-all">
            {editingId ? 'Update Record' : 'Add Student'}
          </button>
          {editingId && <button onClick={resetForm} className="text-xs font-bold uppercase text-gray-700 underline">Cancel</button>}
        </div>

        {/* FINAL TABLE WITH TOTAL AND ACTION */}
        <div className="overflow-x-auto bg-white border border-black shadow-lg">
          <table className="w-full text-center border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-black text-sm font-bold">
                <th className="p-4 border-r border-black">Name</th>
                <th className="p-4 border-r border-black">Quiz (20%)</th>
                <th className="p-4 border-r border-black">Lab (30%)</th>
                <th className="p-4 border-r border-black">Assign (10%)</th>
                <th className="p-4 border-r border-black">Atten (10%)</th>
                <th className="p-4 border-r border-black">Exam (30%)</th>
                <th className="p-4 border-r border-black bg-blue-50">Total</th>
                <th className="p-4 bg-gray-50">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const total = Number(r.quiz||0) + Number(r.laboratory||0) + Number(r.assignment||0) + Number(r.attendance||0) + Number(r.major_exam||0);
                return (
                  <tr key={r.id} className="border-b border-black/10 hover:bg-gray-50">
                    <td className="p-4 border-r border-black font-semibold uppercase">{r.student_name}</td>
                    <td className="p-4 border-r border-black">{r.quiz}</td>
                    <td className="p-4 border-r border-black">{r.laboratory}</td>
                    <td className="p-4 border-r border-black">{r.assignment}</td>
                    <td className="p-4 border-r border-black">{r.attendance}</td>
                    <td className="p-4 border-r border-black">{r.major_exam}</td>
                    <td className="p-4 border-r border-black font-bold text-blue-600 bg-blue-50/20">{total}</td>
                    <td className="p-4 space-x-3">
                      <button onClick={() => handleEdit(r)} className="text-emerald-600 font-bold text-xs uppercase hover:underline">Edit</button>
                      <button onClick={() => deleteRecord(r.id)} className="text-red-600 font-bold text-xs uppercase hover:underline">Delete</button>
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