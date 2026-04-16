"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
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
    setName(''); 
    setEditingId(null);
    setScores({
      quiz: { score: '', over: 100 }, 
      lab: { score: '', over: 100 },
      assign: { score: '', over: 100 }, 
      atten: { score: '', over: 100 }, 
      exam: { score: '', over: 100 },
    });
  };

  const addStudent = async () => {
    if (!name.trim()) return alert("Enter Student Name");
    
    // Calculate raw percentage for each category
    const getVal = (item: any) => (item.over > 0 ? (Number(item.score || 0) / item.over) * 100 : 0);

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

    resetForm(); 
    fetchRecords();
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
    if (confirm("Delete this student record?")) {
      await supabase.from('student4_grades').delete().eq('id', id);
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#70e1ca] to-[#a8b8f3] p-4 md:p-10 text-black font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black uppercase text-center mb-10 tracking-tighter">
          BSIT Students Grading System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT FORM */}
          <div className="lg:col-span-4 bg-white/40 backdrop-blur-md p-6 rounded-xl border border-white shadow-xl h-fit">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-60 tracking-widest">Entry Terminal</h2>
            <div className="space-y-4">
              <input className="w-full p-3 rounded border border-black/10 bg-white outline-none font-bold" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} />
              <div className="space-y-2">
                {Object.keys(scores).map((key) => (
                  <div key={key} className="flex items-center gap-2 bg-white/60 p-2 rounded border border-white/20">
                    <span className="text-[9px] font-black uppercase w-20">
                        {key === 'assign' ? 'Assignment' : key === 'atten' ? 'Attendance' : key === 'lab' ? 'Laboratory' : key}
                    </span>
                    <input type="number" placeholder="Score" className="w-full bg-transparent text-right outline-none font-bold" value={scores[key].score} onChange={(e) => setScores({...scores, [key]: {...scores[key], score: e.target.value}})} />
                    <span className="font-bold text-black/20">/</span>
                    <input type="number" placeholder="Total" className="w-16 bg-transparent outline-none font-bold text-gray-500" value={scores[key].over} onChange={(e) => setScores({...scores, [key]: {...scores[key], over: e.target.value}})} />
                  </div>
                ))}
              </div>
              <button onClick={addStudent} className="w-full bg-[#2d2d2d] text-white py-4 rounded font-black uppercase text-xs hover:bg-black transition-all">
                {editingId ? 'Update Record' : 'Save Record'}
              </button>
              {editingId && <button onClick={resetForm} className="w-full text-[10px] font-bold uppercase text-gray-600 mt-2">Cancel</button>}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="lg:col-span-8 bg-white border border-black shadow-2xl overflow-hidden rounded-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[1000px]">
                <thead className="bg-gray-100 border-b border-black text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4 border-r border-black text-left">Student Name</th>
                    <th className="p-4 border-r border-black">Quiz (20%)</th>
                    <th className="p-4 border-r border-black">Laboratory (30%)</th>
                    <th className="p-4 border-r border-black">Assignment (10%)</th>
                    <th className="p-4 border-r border-black">Attendance (10%)</th>
                    <th className="p-4 border-r border-black">Major Exam (30%)</th>
                    <th className="p-4 border-r border-black bg-blue-50">Average Grade</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/10">
                  {records.map((r) => {
                    // Weighted Calculation
                    const avg = (Number(r.quiz||0) * 0.20) + 
                                (Number(r.laboratory||0) * 0.30) + 
                                (Number(r.assignment||0) * 0.10) + 
                                (Number(r.attendance||0) * 0.10) + 
                                (Number(r.major_exam||0) * 0.30);
                    
                    return (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors text-sm">
                        <td className="p-4 border-r border-black font-bold uppercase text-left">{r.student_name}</td>
                        <td className="p-4 border-r border-black">{Number(r.quiz).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.laboratory).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.assignment).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.attendance).toFixed(0)}</td>
                        <td className="p-4 border-r border-black">{Number(r.major_exam).toFixed(0)}</td>
                        <td className="p-4 border-r border-black font-black text-blue-700 bg-blue-50/20">
                          {avg.toFixed(1)}%
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => handleEdit(r)} className="text-[10px] font-black text-emerald-600 uppercase hover:underline">Edit</button>
                            <button onClick={() => deleteRecord(r.id)} className="text-[10px] font-black text-red-600 uppercase hover:underline">Delete</button>
                          </div>
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