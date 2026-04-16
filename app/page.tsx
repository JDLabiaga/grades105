"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Empty scores by default
  const [scores, setScores] = useState<any>({
    quiz: { score: '', total: 100 },
    lab: { score: '', total: 100 },
    assign: { score: '', total: 100 },
    atten: { score: '', total: 100 },
    exam: { score: '', total: 100 },
  });
  
  const [records, setRecords] = useState<any[]>([]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase.from('student4_grades').select('*').order('created_at', { ascending: false });
    setRecords(data || []);
  }, []);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const resetForm = () => {
    setName(''); setEditingId(null);
    setScores({
      quiz: { score: '', total: 100 }, lab: { score: '', total: 100 },
      assign: { score: '', total: 100 }, atten: { score: '', total: 100 }, exam: { score: '', total: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    const calc = (part: any) => (part.total > 0 ? (Number(part.score) / part.total) * 100 : 0);
    
    const payload = { 
      student_name: name, 
      quiz: calc(scores.quiz), 
      laboratory: calc(scores.lab), 
      assignment: calc(scores.assign), 
      attendance: calc(scores.atten), 
      major_exam: calc(scores.exam) 
    };

    if (editingId) await supabase.from('student4_grades').update(payload).eq('id', editingId);
    else await supabase.from('student4_grades').insert([payload]);

    resetForm(); fetchRecords();
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({
      quiz: { score: r.quiz, total: 100 },
      lab: { score: r.laboratory, total: 100 },
      assign: { score: r.assignment, total: 100 },
      atten: { score: r.attendance, total: 100 },
      exam: { score: r.major_exam, total: 100 },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteRecord = async (id: string) => {
    if (confirm("Delete this record?")) {
      await supabase.from('student4_grades').delete().eq('id', id);
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#70e1ca] to-[#a8b8f3] p-4 md:p-8 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-black text-center uppercase mb-10">BSIT Students Grading System</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* INPUT TERMINAL */}
          <div className="lg:w-1/3 bg-white/60 backdrop-blur-md p-6 rounded-xl border border-white shadow-xl h-fit">
            <h2 className="text-xs font-black uppercase mb-6 text-gray-600 tracking-widest">
              {editingId ? 'Updating Record' : 'New Entry'}
            </h2>
            <div className="space-y-4">
              <input className="w-full p-3 rounded-lg border border-black/10 bg-white outline-none font-bold" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} />
              
              <div className="space-y-2">
                {Object.keys(scores).map((k) => (
                  <div key={k} className="flex items-center gap-2 bg-white/40 p-2 rounded-lg border border-white/20">
                    <span className="text-[9px] font-black uppercase w-12">{k}</span>
                    <input type="number" className="w-full bg-transparent text-right font-bold outline-none" placeholder="Score" value={scores[k].score} onChange={(e) => setScores({...scores, [k]: {...scores[k], score: e.target.value}})} />
                    <span className="font-bold text-gray-400">/</span>
                    <input type="number" className="w-16 bg-transparent font-bold text-gray-500 outline-none" value={scores[k].total} onChange={(e) => setScores({...scores, [k]: {...scores[k], total: e.target.value}})} />
                  </div>
                ))}
              </div>

              <button onClick={addStudent} className="w-full bg-black text-white font-black py-4 rounded-lg uppercase text-xs tracking-widest hover:bg-gray-800 transition-all">
                {editingId ? 'Update Data' : 'Save Student'}
              </button>
              {editingId && <button onClick={resetForm} className="w-full text-[10px] font-bold text-gray-500 uppercase">Cancel Edit</button>}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="lg:w-2/3 bg-white rounded-xl border border-black overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[900px]">
                <thead className="bg-gray-100 border-b border-black">
                  <tr className="text-[10px] font-black uppercase">
                    <th className="p-4 border-r border-black">Identity</th>
                    <th className="p-4 border-r border-black">Scores (Matrix)</th>
                    <th className="p-4 border-r border-black">Final %</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-all">
                      <td className="p-4 border-r border-black text-left">
                        <p className="font-black text-sm uppercase">{r.student_name}</p>
                        <p className="text-[8px] text-gray-400 font-bold">NODE_{r.id.substring(0,6)}</p>
                      </td>
                      <td className="p-4 border-r border-black">
                        <div className="flex justify-center gap-1">
                          {['quiz', 'laboratory', 'assignment', 'attendance', 'major_exam'].map(key => (
                            <div key={key} className="bg-gray-100 px-2 py-1 rounded border border-black/5 text-[9px] font-bold">
                              <span className="text-gray-400 mr-1">{key.substring(0,1).toUpperCase()}</span>
                              {Number(r[key] || 0).toFixed(0)}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 border-r border-black">
                        <span className="bg-blue-100 px-3 py-1 rounded-full font-black text-blue-700 text-xs">
                          {Number(r.final_grade || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-4 space-x-2">
                        <button onClick={() => handleEdit(r)} className="p-2 hover:bg-blue-500 hover:text-white rounded border border-black/10 transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button onClick={() => deleteRecord(r.id)} className="p-2 hover:bg-red-500 hover:text-white rounded border border-black/10 transition-all">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}