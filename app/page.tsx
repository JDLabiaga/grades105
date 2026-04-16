"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // State to hold both the raw score and the total/base for each category
  const [scores, setScores] = useState<any>({
    quiz: { score: '', over: 100 },
    lab: { score: '', over: 100 },
    assign: { score: '', over: 100 },
    atten: { score: '', over: 100 },
    exam: { score: '', over: 100 },
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
      quiz: { score: '', over: 100 }, lab: { score: '', over: 100 },
      assign: { score: '', over: 100 }, atten: { score: '', over: 100 }, exam: { score: '', over: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    
    // Helper to calculate the raw percentage
    const getVal = (item: any) => (item.over > 0 ? (Number(item.score) / item.over) * 100 : 0);

    const payload = { 
      student_name: name, 
      quiz: getVal(scores.quiz), 
      laboratory: getVal(scores.lab), 
      assignment: getVal(scores.assign), 
      attendance: getVal(scores.atten), 
      major_exam: getVal(scores.exam) 
    };

    if (editingId) await supabase.from('student4_grades').update(payload).eq('id', editingId);
    else await supabase.from('student4_grades').insert([payload]);

    resetForm(); fetchRecords();
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.student_name);
    setScores({
      quiz: { score: r.quiz, over: 100 },
      lab: { score: r.laboratory, over: 100 },
      assign: { score: r.assignment, over: 100 },
      atten: { score: r.attendance, over: 100 },
      exam: { score: r.major_exam, over: 100 },
    });
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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold uppercase text-center mb-10">BSIT Students Grading System</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INPUT SECTION */}
          <div className="lg:col-span-4 bg-white/40 backdrop-blur-md p-6 rounded-xl border border-white shadow-xl">
            <h2 className="text-xs font-black uppercase mb-4 opacity-60">Entry Terminal</h2>
            <div className="space-y-4">
              <input className="w-full p-3 rounded border border-black/10 bg-white outline-none font-bold" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} />
              
              <div className="space-y-3">
                {Object.keys(scores).map((key) => (
                  <div key={key} className="flex items-center gap-2 bg-white/60 p-2 rounded border border-white/20">
                    <span className="text-[9px] font-black uppercase w-16">{key}</span>
                    <input type="number" placeholder="Score" className="w-full bg-transparent text-right outline-none font-bold" value={scores[key].score} onChange={(e) => setScores({...scores, [key]: {...scores[key], score: e.target.value}})} />
                    <span className="font-bold text-black/20">/</span>
                    <input type="number" placeholder="Total" className="w-16 bg-transparent outline-none font-bold text-gray-500" value={scores[key].over} onChange={(e) => setScores({...scores, [key]: {...scores[key], over: e.target.value}})} />
                  </div>
                ))}
              </div>

              <button onClick={addStudent} className="w-full bg-black text-white py-4 rounded font-black uppercase text-xs tracking-widest hover:opacity-80 transition-all">
                {editingId ? 'Update Record' : 'Save Student'}
              </button>
              {editingId && <button onClick={resetForm} className="w-full text-[10px] font-bold uppercase py-2">Cancel</button>}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="lg:col-span-8 bg-white border border-black shadow-2xl rounded-sm overflow-hidden h-fit">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[900px]">
                <thead className="bg-gray-100 border-b border-black text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4 border-r border-black">Name</th>
                    <th className="p-4 border-r border-black">Q (20%)</th>
                    <th className="p-4 border-r border-black">L (30%)</th>
                    <th className="p-4 border-r border-black">A (10%)</th>
                    <th className="p-4 border-r border-black">At (10%)</th>
                    <th className="p-4 border-r border-black">E (30%)</th>
                    <th className="p-4 border-r border-black bg-blue-50">Total</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10 text-sm">
                  {records.map((r) => {
                    const total = Number(r.quiz||0) + Number(r.laboratory||0) + Number(r.assignment||0) + Number(r.attendance||0) + Number(r.major_exam||0);
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 border-r border-black font-bold uppercase text-left">{r.student_name}</td>
                        <td className="p-4 border-r border-black">{Number(r.quiz).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.laboratory).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.assignment).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.attendance).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.major_exam).toFixed(0)}</td>
                        <td className="p-4 border-r border-black font-black text-blue-600 bg-blue-50/30">{total}</td>
                        <td className="p-4 space-x-3">
                          <button onClick={() => handleEdit(r)} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Edit</button>
                          <button onClick={() => deleteRecord(r.id)} className="text-[10px] font-black text-red-600 uppercase hover:underline">Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}