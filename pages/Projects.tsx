import React, { useState, useEffect } from 'react';
import { db } from '../services/mockService';
import { Project, ProjectType } from '../types';
import { Search, Plus, ChevronRight, X, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filterType, setFilterType] = useState<'All' | 'Sample' | 'Main'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Create Project Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newOrderNumber, setNewOrderNumber] = useState('');
  const [newProjectType, setNewProjectType] = useState<ProjectType>('Main');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = db.getCurrentUser();

  useEffect(() => {
    loadProjects();

    // Check query param to open modal automatically
    const params = new URLSearchParams(location.search);
    if (params.get('create') === 'true' && user?.permissions.write) {
      setIsModalOpen(true);
    }
  }, [location, user]);

  const loadProjects = () => {
      db.getProjects().then(setProjects);
  }

  const filteredProjects = projects.filter(p => {
    const matchesType = filterType === 'All' || p.type === filterType;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newOrderNumber || !newDueDate) return;
    setIsCreating(true);

    try {
        const newProject = await db.addProject({
            name: newProjectName,
            orderNumber: newOrderNumber,
            type: newProjectType,
            dueDate: newDueDate,
            team: [user?.avatar || 'https://i.pravatar.cc/150?u=default'],
            startDate: new Date().toISOString().split('T')[0]
        });

        // Add locally immediately or reload all
        setProjects([newProject, ...projects]);
        setIsModalOpen(false);
        
        // Reset Form
        setNewProjectName('');
        setNewOrderNumber('');
        setNewDueDate('');
        
        // Clear query param
        navigate('/projects', { replace: true });
    } catch (error) {
        console.error(error);
        alert("Failed to create project");
    } finally {
        setIsCreating(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/projects', { replace: true });
  }

  return (
    <div className="animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">프로젝트</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">모든 샘플 및 메인 오더를 관리하고 추적하세요.</p>
        </div>
        {user?.permissions.write && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
          >
            <Plus size={18} />
            프로젝트 추가
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg w-full md:w-80">
          <Search size={18} className="text-gray-500" />
          <input 
            type="text" 
            placeholder="이름 또는 오더 번호 검색..." 
            className="bg-transparent border-none outline-none text-sm w-full dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <button 
            onClick={() => setFilterType('All')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'All' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            전체
          </button>
          <button 
            onClick={() => setFilterType('Main')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'Main' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            메인 오더
          </button>
          <button 
            onClick={() => setFilterType('Sample')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterType === 'Sample' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            샘플 오더
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400">표시할 프로젝트가 없습니다.</p>
          </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            className="group bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer relative"
          >
            {project.isDelayed && (
              <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            )}
            
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${project.type === 'Main' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'}`}>
                {project.type}
              </span>
              <span className="text-xs text-gray-500 font-mono">{project.orderNumber}</span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">마감일: {project.dueDate}</p>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">진행률</span>
                <span className="font-bold text-gray-900 dark:text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
              <div className="flex -space-x-2">
                {project.team.slice(0, 3).map((avatar, i) => (
                   <img key={i} className="h-6 w-6 rounded-full border border-white dark:border-dark-surface" src={avatar} alt="" />
                ))}
              </div>
              <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                상세보기 <ChevronRight size={16} />
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeModal}></div>
           <div className="relative bg-white dark:bg-dark-surface w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">새 프로젝트 생성</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                   <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">프로젝트명</label>
                   <input 
                      type="text" 
                      required
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      placeholder="예: FW24 신상품 개발"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">오더 번호</label>
                    <input 
                        type="text" 
                        required
                        value={newOrderNumber}
                        onChange={(e) => setNewOrderNumber(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="예: MO-123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">오더 타입</label>
                    <select 
                        value={newProjectType}
                        onChange={(e) => setNewProjectType(e.target.value as ProjectType)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    >
                        <option value="Main">메인 오더</option>
                        <option value="Sample">샘플 오더</option>
                    </select>
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">마감일</label>
                   <input 
                      type="date" 
                      required
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                   />
                </div>

                <div className="pt-4">
                   <button 
                      type="submit"
                      disabled={isCreating}
                      className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg shadow-lg shadow-primary/30 transition-all flex justify-center gap-2 items-center"
                   >
                      {isCreating && <Loader2 size={18} className="animate-spin" />}
                      {isCreating ? '생성 중...' : '프로젝트 생성'}
                   </button>
                </div>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Projects;