'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Clock, Play, CheckCircle, MoreVertical, User } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'alta' | 'media' | 'baixa';
  dueDate: string;
  status: 'pendentes' | 'fazendo' | 'concluidas';
}

interface Column {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
}

const columns: Column[] = [
  {
    id: 'pendentes',
    title: 'Pendentes',
    icon: <Clock className="h-5 w-5" />,
    color: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50',
  },
  {
    id: 'fazendo',
    title: 'Fazendo',
    icon: <Play className="h-5 w-5" />,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50',
  },
  {
    id: 'concluidas',
    title: 'Concluídas',
    icon: <CheckCircle className="h-5 w-5" />,
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50',
  },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Revisar relatório financeiro',
    description: 'Analisar os números do último trimestre e preparar apresentação',
    assignee: 'João Silva',
    priority: 'alta',
    dueDate: '2025-01-25',
    status: 'pendentes',
  },
  {
    id: '2',
    title: 'Atualizar documentação',
    description: 'Revisar e atualizar a documentação do processo de onboarding',
    assignee: 'Maria Santos',
    priority: 'media',
    dueDate: '2025-01-28',
    status: 'pendentes',
  },
  {
    id: '3',
    title: 'Implementar nova funcionalidade',
    description: 'Desenvolver o sistema de notificações em tempo real',
    assignee: 'Pedro Costa',
    priority: 'alta',
    dueDate: '2025-01-30',
    status: 'fazendo',
  },
  {
    id: '4',
    title: 'Setup do ambiente de produção',
    description: 'Configurar servidores e deploy da aplicação',
    assignee: 'Ana Oliveira',
    priority: 'alta',
    dueDate: '2025-01-20',
    status: 'concluidas',
  },
  {
    id: '5',
    title: 'Treinamento da equipe',
    description: 'Conduzir sessão de treinamento sobre novos processos',
    assignee: 'Carlos Lima',
    priority: 'media',
    dueDate: '2025-01-18',
    status: 'concluidas',
  },
];

const TaskCard: React.FC<{ task: Task; isDragging?: boolean }> = ({ task, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta':
        return 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400';
      case 'media':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400';
      case 'baixa':
        return 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
    }
  };

  if (isDragging) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg rotate-2 opacity-90">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">
            {task.title}
          </h4>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isSortableDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2">
          {task.title}
        </h4>
        <button 
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
      
      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {new Date(task.dueDate).toLocaleDateString('pt-BR')}
        </span>
      </div>
      
      <div className="flex items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
        <User className="h-4 w-4 text-slate-400 mr-2" />
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {task.assignee}
        </span>
      </div>
    </div>
  );
};

const DroppableColumn: React.FC<{ column: Column; tasks: Task[] }> = ({ column, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-lg ${column.color}`}>
            {column.icon}
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-white">
              {column.title}
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
            </span>
          </div>
        </div>
      </div>
      
      <div
        ref={setNodeRef}
        className={`space-y-3 min-h-[200px] rounded-lg p-4 transition-colors ${
          isOver 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-300 dark:border-emerald-600' 
            : 'bg-slate-50 dark:bg-slate-900/50 border-2 border-transparent'
        }`}
      >
        <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-500">
            <div className="text-center">
              <p className="text-sm">Nenhuma tarefa</p>
              <p className="text-xs">em {column.title.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(task => task.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Find if we're dropping over a column or another task
    const isOverColumn = columns.some(col => col.id === overId);
    const targetColumn = isOverColumn ? overId : tasks.find(task => task.id === overId)?.status;

    if (!targetColumn) {
      setActiveTask(null);
      return;
    }

    setTasks(prevTasks => {
      return prevTasks.map(task => 
        task.id === activeTaskId 
          ? { ...task, status: targetColumn as Task['status'] }
          : task
      );
    });

    setActiveTask(null);
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg mr-3">
              <div className="text-emerald-600 dark:text-emerald-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Quadro de Ações
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gerencie suas tarefas e acompanhe o progresso
              </p>
            </div>
          </div>
          <button className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium">
            <Plus className="h-4 w-4 mr-2" />
            Nova Ação
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};