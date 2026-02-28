import  { useEffect, useState } from 'react'
import type { Project } from '../types';
import {  Loader2,  PlusIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dummyProjects } from '../assets/assets';
import Footer from '../components/Footer';
import api from '@/configs/axios';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const MyProjects = () => {
  const [loading, setLoading] = useState(true); // This will indicate if the projects are still being fetched
  
  const [projects, setProjects] =useState<Project[]>([]); // This will hold the list of projects fetched from the server
  
  const navigate=useNavigate();

  const { data: session, isPending } = authClient.useSession();
  
  const fetchProjects = async () => {
  try {
    const { data } = await api.get('/api/user/projects');
    setProjects(data.projects);
  } catch (error: any) {
    console.log(error);
    toast.error(error?.response?.data?.message || error.message);
  } finally {
    setLoading(false);
  }
};

  const deleteProject=async (projectId:string)=>{
    // Here you would typically make an API call to delete the project from the server
    try {
      const confirm = window.confirm('Are you sure you want to delete this project?');
      if (!confirm) return;
      const {data}= await api.delete(`/api/project/${projectId}`);
      toast.success(data.message);
      fetchProjects();
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message);
    }
  }
  useEffect(() => {
  if (session?.user && !isPending) {
    fetchProjects();
  } else if (!session?.user && !isPending) {
    navigate('/');
    toast.error('Please sign in to view your projects');
  }
  }, [session?.user, isPending]);
  return (
    <>
        <div className='px-4 md:px-16 lg:px-24 xl:px-32'>
          {loading ?(
            <div className='flex items-center justify-center h-[80vh]'>
              <Loader2 className='size-7 animate-spin text-indigo-200'/>
            </div>
          ) : projects.length>0 ? (
            <div className='py-10 min-h-[80vh]'>
              <div className='flex items-center justify-between mb-12'>
                <h1 className='text-2xl font-medium text-white'>My Projects</h1>
                <button onClick={()=>navigate('/')} className='flex items-center gap-2 text-white px-3 sm:px-4 sm:py-2 rounded bg-linear-to-br from-indigo-500 to-indigo-600 hover:opacity-90 active:scale-95 transition'>
                  <PlusIcon size={18}/>Create New
                </button>
              </div>

              <div className='flex flex-wrap gap-3.5'>
                {projects.map((project)=>(                  
                  <div onClick={()=>navigate(`/projects/${project.id}`)} key={project.id} className='relative group w-72 max-sm:mx-auto cursor pointer bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden shadow-md group hover:shadow-indigo-700/30 hover:border-indigo-800/80 transition-all duration-300'>
                    {/* Desktop ki tarah jo preview hoga voh add krna hai */}
                    <div className='relative w-full h-40 bg-gray-900 overflow-hidden border-b border-gray-800'>
                      {project.current_code ? (
                        <iframe 
                        srcDoc={project.current_code}
                        className='absolute top-0 left-0 w-[1200px] h-[800px] origin-top-left pointer-events-none'
                        sandbox='allow-scripts allow-same-origin'
                        style={{transform: 'scale(0.25)'}} />
                      ):(
                        <div className='flex items-center justify-center h-full text-gray-500'>
                          <p>No Preview available</p>
                        </div>
                      )}
                    </div>
                    {/* Content of the project */}
                    <div>
                      <div className='p-4 text-white bg-linear-180 from-transparent group-hover:from-indigo-950 to-transparent transition colors'>
                        <div className='flex items-start justify-between'>
                          <h2 className='text-lg font-medium line-clamp-2'>{project.name}</h2>
                          <button className='px-2.5 py-0.5 mt-1 ml-2 text-xs bg-gray-800 border border-gray-700 rounded-full'>Website</button>
                        </div>
                        <p className='mt-1 text-sm text-gray-400 line-clamp-2'>{project.initial_prompt}</p>
                        <div onClick={(e)=>e.stopPropagation()} className='flex justify-between items-center mt-6'>
                          <span className='text-xs text-gray-500'>{new Date(project.createdAt).toLocaleDateString()}</span>
                          <div className='flex gap-3 text-white text-sm'>
                            <button onClick={()=>navigate(`/preview/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md-transition-all'>Preview</button>
                            <button onClick={()=>navigate(`/projects/${project.id}`)} className='px-3 py-1.5 bg-white/10 hover:bg-white/15 rounded-md-transition-all'>Open</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div onClick={e=>e.stopPropagation()}>
                      <TrashIcon onClick={()=>deleteProject(project.id)} className='absolute top-3 right-3 scale-0 group-hover:scale-100 bg-white p-1.5 size-7 rounded text-red-600 hover:text-red-700 cursor-pointer' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-[80vh]'>
              <p className='text-3xl font-semibold text-gray-300'>You have no projects yet.</p>
              <button onClick={()=>navigate('/')} className='text-white px-5 py-2 rounded mt-5 rounded-md bg-indigo-500 hover:bg-indigo-500 hover:bg-indigo-600 active:scale-95 transition-all'>
                Create Your First Project
              </button>
            </div>
          )}
        </div>
        <Footer/>
    </>
  )
}

export default MyProjects