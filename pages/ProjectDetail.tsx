import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../services/mockService';
import { Project, WorkflowStep, Attachment } from '../types';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  AlertTriangle,
  MessageSquare,
  Send,
  X,
  FileText,
  Download,
  Upload,
  Loader2
} from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [user, setUser] = useState(db.getCurrentUser());
  const [uploading, setUploading] = useState(false);
  
  // Detail Modal State
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  useEffect(() => {
    if (id) {
      db.getProjectById(id).then(setProject);
    }
  }, [id]);

  if (!project) return <div className="p-8 text-center text-gray-500">프로젝트 불러오는 중...</div>;

  const owners = ['Donau Sports', 'GTS', 'Factory', 'Shipping'];
  
  // Helper to check if step matches owner for swimlane
  const getStepsByOwner = (owner: string) => {
    return project.steps.filter(s => s.owner === owner);
  };

  const handleStepClick = (step: WorkflowStep) => {
     setSelectedStep(step);
  };

  const closeStepModal = () => {
      setSelectedStep(null);
  }

  // Real Firebase File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0 || !selectedStep || !project) return;
      const file = e.target.files[0];
      setUploading(true);
      
      try {
          // This uploads to Storage AND updates Firestore
          await db.addFileToStep(project.id, selectedStep.id, file);

          // Update Local State to reflect change immediately
          // (In a real-time app with onSnapshot, this might happen automatically, but we do manual refresh for now)
          const updatedProject = await db.getProjectById(project.id);
          if (updatedProject) {
              setProject(updatedProject);
              // Find the updated step to update modal view
              const updatedStep = updatedProject.steps.find(s => s.id === selectedStep.id);
              if (updatedStep) setSelectedStep(updatedStep);
          }
      } catch (error) {
          console.error("Upload failed", error);
          alert("파일 업로드 실패");
      } finally {
          setUploading(false);
      }
  };

  const handleDownload = (file: Attachment) => {
      // Open URL in new tab to trigger browser download behavior
      window.open(file.url, '_blank');
  };

  const handleStatusChange = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
      if (!selectedStep || !project) return;
      
      const updatedSteps = project.steps.map(s => 
        s.id === selectedStep.id ? { ...s, status: newStatus } : s
      );

      // Optimistic update
      setProject({ ...project, steps: updatedSteps });
      setSelectedStep({ ...selectedStep, status: newStatus });

      // Persist
      await db.updateProject(project.id, { steps: updatedSteps });
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-2xl font-black text-gray-900 dark:text-white">{project.name}</h1>
             <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
               {project.orderNumber}
             </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
             {project.type} 오더 • 마감일 {project.dueDate}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
            {project.hasIssue && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium">
                    <AlertTriangle size={16} />
                    이슈 발생
                </div>
            )}
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium shadow-sm hover:bg-primary-hover transition-colors">
                프로젝트 편집
            </button>
        </div>
      </div>

      {/* Workflow Visualizer (Swimlane Imitation) */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border shadow-sm p-6 mb-6 overflow-x-auto">
        <h2 className="text-lg font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">워크플로우 상태</h2>
        
        <div className="min-w-[800px] flex flex-col gap-8 relative">
          {/* Connecting Line Background (Simplified visual) */}
          <div className="absolute left-32 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 z-0"></div>

          {owners.map((owner) => {
             const steps = getStepsByOwner(owner);
             if (steps.length === 0) return null; // Skip empty rows if any

             return (
               <div key={owner} className="flex items-start relative z-10">
                 {/* Owner Label */}
                 <div className="w-32 flex-shrink-0 pt-2 pr-4">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold text-white ${
                        owner === 'Donau Sports' ? 'bg-slate-500' :
                        owner === 'GTS' ? 'bg-slate-700' :
                        'bg-red-400' // Factory
                    }`}>
                        {owner}
                    </span>
                 </div>

                 {/* Steps Grid */}
                 <div className="flex-1 flex flex-wrap gap-4 items-center">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                            {idx > 0 && <div className="w-8 h-0.5 bg-gray-300 dark:bg-gray-600 mx-2"></div>}
                            
                            <button 
                                onClick={() => handleStepClick(step)}
                                className={`
                                    relative flex flex-col items-center justify-center w-40 p-3 rounded-lg border-2 transition-all
                                    ${step.status === 'completed' 
                                        ? 'bg-primary/10 border-primary text-primary' 
                                        : step.status === 'in-progress' 
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 text-yellow-600'
                                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400'
                                    }
                                    hover:scale-105 active:scale-95 cursor-pointer
                                `}
                            >
                                <div className="mb-1">
                                    {step.status === 'completed' ? <CheckCircle size={20} /> : <Circle size={20} />}
                                </div>
                                <span className="text-xs font-bold text-center leading-tight break-keep">{step.label}</span>
                                {step.status === 'in-progress' && <span className="text-[10px] mt-1 animate-pulse">진행 중</span>}
                                {step.files.length > 0 && (
                                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white dark:border-dark-surface">
                                        {step.files.length}
                                    </div>
                                )}
                            </button>
                        </div>
                    ))}
                 </div>
               </div>
             );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Info */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
           <h3 className="font-bold text-lg mb-4">프로젝트 상세</h3>
           <div className="space-y-4">
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                   <span className="text-gray-500 text-sm">시작일</span>
                   <span className="font-medium">{project.startDate}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                   <span className="text-gray-500 text-sm">완료 예정일</span>
                   <span className="font-medium">{project.dueDate}</span>
               </div>
               <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                   <span className="text-gray-500 text-sm">전체 진행률</span>
                   <span className="font-medium text-primary">{project.progress}%</span>
               </div>
               <div className="pt-2">
                   <span className="text-gray-500 text-sm block mb-2">팀 멤버</span>
                   <div className="flex gap-2">
                       {project.team.map((avatar, i) => (
                           <img key={i} src={avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="Team" />
                       ))}
                   </div>
               </div>
           </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 flex flex-col h-96">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> 
                댓글 및 업데이트
            </h3>
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 pr-2">
                {/* Mock Comments */}
                <div className="flex gap-3">
                    <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg rounded-tl-none text-sm">
                        <p className="font-bold text-xs mb-1">프로젝트 매니저</p>
                        <p>샘플 오더 TDS 업데이트 부탁드립니다.</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">어제 오전 10:00</span>
                    </div>
                </div>
                 <div className="flex gap-3 flex-row-reverse">
                    <img src={user?.avatar} className="w-8 h-8 rounded-full flex-shrink-0" alt="" />
                    <div className="bg-primary/10 text-gray-900 dark:text-gray-100 p-3 rounded-lg rounded-tr-none text-sm">
                        <p className="font-bold text-xs mb-1 text-right">나</p>
                        <p>확인했습니다. 파일 섹션에 업로드 완료했습니다.</p>
                        <span className="text-[10px] text-gray-400 mt-1 block text-right">오늘 오전 9:15</span>
                    </div>
                </div>
            </div>
            
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="댓글 작성..." 
                    className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-lg py-3 px-4 pr-12 focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                />
                <button className="absolute right-2 top-2 p-1 text-primary hover:bg-primary/10 rounded">
                    <Send size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Step Detail Modal */}
      {selectedStep && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeStepModal}></div>
              <div className="relative bg-white dark:bg-dark-surface w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                      <div>
                          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedStep.owner} 단계</p>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStep.label}</h2>
                      </div>
                      <button onClick={closeStepModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          <X size={24} />
                      </button>
                  </div>

                  {/* Status Control */}
                  <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">진행 상태</label>
                      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                          {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                              <button
                                  key={status}
                                  onClick={() => handleStatusChange(status)}
                                  disabled={!user?.permissions.write}
                                  className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${
                                      selectedStep.status === status
                                          ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                  }`}
                              >
                                  {status === 'pending' ? '대기' : status === 'in-progress' ? '진행 중' : '완료'}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* File Attachments */}
                  <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">첨부 파일</label>
                        {user?.permissions.write && (
                            <label className={`cursor-pointer text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                                {uploading ? '업로드 중...' : '파일 추가'}
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        )}
                      </div>
                      
                      {selectedStep.files.length === 0 ? (
                          <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                              <p className="text-sm text-gray-500">첨부된 파일이 없습니다.</p>
                          </div>
                      ) : (
                          <ul className="space-y-2">
                              {selectedStep.files.map((file) => (
                                  <li key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600">
                                              <FileText size={18} />
                                          </div>
                                          <div className="min-w-0">
                                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                              <p className="text-xs text-gray-500">{file.size} • {file.uploadedBy}</p>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => handleDownload(file)}
                                        className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                      >
                                          <Download size={18} />
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      )}
                  </div>

                  <div className="flex justify-end">
                      <button 
                        onClick={closeStepModal}
                        className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:opacity-90 transition-opacity"
                      >
                          닫기
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default ProjectDetail;