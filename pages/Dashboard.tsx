import React, { useEffect, useState } from 'react';
import { db } from '../services/mockService';
import { Project, ProjectStatus } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  MoreHorizontal,
  Calendar,
  FileText
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    db.getProjects().then(setProjects);
  }, []);

  // Calculate Stats
  const total = projects.length;
  const delayed = projects.filter(p => p.isDelayed).length;
  const completed = projects.filter(p => p.status === 'Completed').length;
  const onTrack = projects.filter(p => p.status === 'On Track').length;

  const getStatusColor = (status: ProjectStatus, isDelayed: boolean) => {
    if (status === 'Completed') return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (isDelayed || status === 'Needs Attention') return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    if (status === 'On Hold') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const chartData = [
    { name: '월', tasks: 4 },
    { name: '화', tasks: 3 },
    { name: '수', tasks: 7 },
    { name: '목', tasks: 5 },
    { name: '금', tasks: 8 },
    { name: '토', tasks: 2 },
    { name: '일', tasks: 1 },
  ];

  const handleNewProject = () => {
    // Navigate to projects page with a query param to open the modal
    navigate('/projects?create=true');
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">대시보드</h1>
        <button 
          onClick={handleNewProject}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-lg font-semibold shadow-lg shadow-primary/30 transition-all"
        >
          <PlusCircle size={18} />
          새 프로젝트
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column (Main Content) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Status Cards */}
          <div>
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">프로젝트 현황</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* On Track Card */}
                <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">진행 중</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{total}</h3>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                      <CheckCircle2 size={24} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${(onTrack / total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{onTrack}개 프로젝트 정상 진행 중</p>
                </div>

                {/* Delayed Card */}
                <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">지연 / 이슈</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{delayed}</h3>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                      <AlertCircle size={24} />
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(delayed / total) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{delayed}개 프로젝트 확인 필요</p>
                </div>
             </div>
          </div>

          {/* Ongoing Projects Table */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">진행 중인 프로젝트</h2>
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">프로젝트명</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">진행률</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">팀</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                    {projects.slice(0, 5).map((project) => (
                      <tr 
                        key={project.id} 
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{project.name}</span>
                            <span className="text-xs text-gray-500">{project.orderNumber} • {project.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status, project.isDelayed)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center gap-3">
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex -space-x-2">
                            {project.team.slice(0,3).map((avatar, i) => (
                              <img key={i} className="h-8 w-8 rounded-full border-2 border-white dark:border-dark-surface" src={avatar} alt="" />
                            ))}
                            {project.team.length > 3 && (
                              <div className="h-8 w-8 rounded-full border-2 border-white dark:border-dark-surface bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                +{project.team.length - 3}
                              </div>
                            )}
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

        {/* Right Column (Side Widgets) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* Deadlines Widget */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">다가오는 마감일</h3>
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">마케팅 브리프 확정</h4>
                      <p className="text-xs text-gray-500 mt-1">3일 남음 • 알파 캠페인</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="size-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                      <Calendar size={20} />
                   </div>
                   <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">V2 와이어프레임 제출</h4>
                      <p className="text-xs text-gray-500 mt-1">7일 남음 • 웹사이트 리디자인</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Activity Chart (using Recharts to satisfy requirement) */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">주간 업무량</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} stroke="#6B7280" />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#1C2433', color: '#fff' }}
                  />
                  <Bar dataKey="tasks" fill="#135bec" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-dark-surface p-5 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">최근 활동</h3>
             <div className="space-y-4">
                <div className="flex gap-3">
                  <img src="https://i.pravatar.cc/150?u=10" className="w-8 h-8 rounded-full" alt="User" />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                      <span className="font-bold">Anna Carter</span>님이 <span className="text-primary font-medium">"final_logo.svg"</span>를 업로드했습니다.
                    </p>
                    <span className="text-xs text-gray-500 block mt-1">2시간 전</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <img src="https://i.pravatar.cc/150?u=11" className="w-8 h-8 rounded-full" alt="User" />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                      <span className="font-bold">Ben Miller</span>님이 <span className="text-primary font-medium">웹사이트 리디자인</span> 업무를 완료했습니다.
                    </p>
                    <span className="text-xs text-gray-500 block mt-1">어제</span>
                  </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;