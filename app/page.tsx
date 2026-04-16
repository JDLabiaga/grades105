"use client";
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase'; 

export default function Home() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  
  // Scoring state
  const [scores, setScores] = useState<any>({
    quiz: { score: '', over: 100 },
    lab: { score: '', over: 100 },
    assign: { score: '', over: 100 },
    atten: { score: '', over: 100 },
    exam: { score: '', over: 100 },
  });
  
  const [records, setRecords] = useState<any[]>([]);

  // UPDATED: Points to student5_grades
  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from('student5_grades') 
      .select('*')
      .order('created_at', { ascending: false });
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
    
    // Calculate raw percentage for each category before sending to SQL
    const getVal = (item: any) => (item.over > 0 ? (Number(item.score || 0) / item.over) * 100 : 0);

    const payload = { 
      student_name: name, 
      quiz: getVal(scores.quiz), 
      laboratory: getVal(scores.lab), 
      assignment: getVal(scores.assign), 
      attendance: getVal(scores.atten), 
      major_exam: getVal(scores.exam) 
    };

    // UPDATED: Points to student5_grades
    if (editingId) {
        await supabase.from('student5_grades').update(payload).eq('id', editingId);
    } else {
        await supabase.from('student5_grades').insert([payload]);
    }

    resetForm(); 
    fetchRecords();
  };

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setName(r.student_name);
    // Note: Since SQL stores the percentage, we set 'over' to 100 for easy editing
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
      await supabase.from('student5_grades').delete().eq('id', id);
      fetchRecords();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-r from-[#1e293b] to-[#0f172a] p-4 md:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-black uppercase text-center mb-10 tracking-tighter text-blue-400">
          Grading System Terminal v5.0
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* INPUT FORM */}
          <div className="lg:col-span-4 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl h-fit">
            <h2 className="text-[10px] font-black uppercase mb-4 opacity-60 tracking-widest text-blue-300">Data Entry</h2>
            <div className="space-y-4">
              <input className="w-full p-4 rounded-xl border border-white/10 bg-slate-900 text-white outline-none font-bold focus:border-blue-500 transition-all" placeholder="Student Name" value={name} onChange={(e) => setName(e.target.value)} />
              
              <div className="space-y-2">
                {Object.keys(scores).map((key) => (
                  <div key={key} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-black uppercase w-20 text-blue-400">
                        {key === 'assign' ? 'Assignment' : key === 'atten' ? 'Attendance' : key === 'lab' ? 'Laboratory' : key}
                    </span>
                    <input type="number" className="w-full bg-transparent text-right outline-none font-black text-white" placeholder="0" value={scores[key].score} onChange={(e) => setScores({...scores, [key]: {...scores[key], score: e.target.value}})} />
                    <span className="font-bold text-white/10">/</span>
                    <input type="number" className="w-12 bg-transparent outline-none font-bold text-slate-500 text-sm" value={scores[key].over} onChange={(e) => setScores({...scores, [key]: {...scores[key], over: e.target.value}})} />
                  </div>
                ))}
              </div>

              <button onClick={addStudent} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
                {editingId ? 'Update Student' : 'Save to Student5'}
              </button>
              {editingId && <button onClick={resetForm} className="w-full text-[10px] font-bold uppercase text-slate-400 mt-2 hover:text-white transition-colors">Cancel Edit</button>}
            </div>
          </div>

          {/* TABLE SECTION */}
          <div className="lg:col-span-8 bg-slate-900/50 border border-white/10 shadow-2xl overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse min-w-[1000px]">
                <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-slate-400">
                  <tr>
                    <th className="p-5 text-left">Student Name</th>
                    <th className="p-5">Quiz (20%)</th>
                    <th className="p-5">Lab (30%)</th>
                    <th className="p-5">Assign (10%)</th>
                    <th className="p-5">Atten (10%)</th>
                    <th className="p-5">Exam (30%)</th>
                    <th className="p-5 bg-blue-500/10 text-blue-400 font-black">Final Grade</th>
                    <th className="p-5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-white/5 transition-colors text-sm">
                      <td className="p-5 font-bold uppercase text-left text-white">{r.student_name}</td>
                      <td className="p-5 text-slate-400">{Number(r.quiz).toFixed(0)}</td>
                      <td className="p-5 text-slate-400">{Number(r.laboratory).toFixed(0)}</td>
                      <td className="p-5 text-slate-400">{Number(r.assignment).toFixed(0)}</td>
                      <td className="p-5 text-slate-400">{Number(r.attendance).toFixed(0)}</td>
                      <td className="p-5 text-slate-400">{Number(r.major_exam).toFixed(0)}</td>
                      <td className="p-5 font-black text-blue-400 bg-blue-500/5">
                        {/* We use r.final_grade directly from the SQL generated column */}
                        {Number(r.final_grade || 0).toFixed(1)}%
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-4">
                          <button onClick={() => handleEdit(r)} className="text-[10px] font-black text-blue-400 uppercase hover:text-white transition-colors">Edit</button>
                          <button onClick={() => deleteRecord(r.id)} className="text-[10px] font-black text-red-500 uppercase hover:text-red-300 transition-colors">Delete</button>
                        </div>
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