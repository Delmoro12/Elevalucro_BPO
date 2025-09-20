import { useState, useCallback, useEffect } from 'react';
import { 
  CreateRoutineData, 
  UpdateRoutineData, 
  RoutineTemplate,
  createCompanyRoutine,
  updateCompanyRoutine,
  deleteCompanyRoutine,
  getCompanyRoutineById,
  getRoutineTemplates,
  getAvailableUsers
} from '../services/routinesCrud';

export interface UseRoutineCRUDReturn {
  // Modal state
  isOpen: boolean;
  mode: 'create' | 'edit';
  
  // Delete confirmation modal state
  deleteModalOpen: boolean;
  routineToDelete: { id: string; name: string } | null;
  
  // Data
  routineData: any | null;
  templates: RoutineTemplate[];
  users: Array<{id: string, name: string, email: string}>;
  
  // Loading states
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  templatesLoading: boolean;
  usersLoading: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  openCreateModal: () => Promise<void>;
  openEditModal: (routineId: string) => Promise<void>;
  closeModal: () => void;
  saveRoutine: (data: CreateRoutineData | UpdateRoutineData) => Promise<boolean>;
  
  // Delete actions
  openDeleteModal: (routineId: string, routineName: string) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<boolean>;
  
  // Utilities
  refreshTemplates: () => Promise<void>;
  refreshUsers: () => Promise<void>;
}

export function useRoutineCRUD(): UseRoutineCRUDReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit'>('create');
  
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const [routineData, setRoutineData] = useState<any | null>(null);
  const [templates, setTemplates] = useState<RoutineTemplate[]>([]);
  const [users, setUsers] = useState<Array<{id: string, name: string, email: string}>>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTemplates = useCallback(async () => {
    setTemplatesLoading(true);
    try {
      const templateData = await getRoutineTemplates();
      setTemplates(templateData);
    } catch (err) {
      console.error('Erro ao carregar templates:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar templates');
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const userData = await getAvailableUsers();
      setUsers(userData);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const openCreateModal = useCallback(async () => {
    setMode('create');
    setIsOpen(true);
    setRoutineData(null);
    setError(null);
    
    // Load templates and users in parallel
    await Promise.all([
      refreshTemplates(),
      refreshUsers()
    ]);
  }, [refreshTemplates, refreshUsers]);

  const openEditModal = useCallback(async (routineId: string) => {
    console.log('🔍 openEditModal chamado com ID:', routineId);
    setMode('edit');
    setIsOpen(true);
    setLoading(true);
    setError(null);
    
    try {
      // Load routine data, templates, and users in parallel
      console.log('🔍 Chamando getCompanyRoutineById para ID:', routineId);
      const [routine] = await Promise.all([
        getCompanyRoutineById(routineId),
        refreshTemplates(),
        refreshUsers()
      ]);
      
      console.log('✅ Rotina carregada:', routine);
      setRoutineData(routine);
    } catch (err) {
      console.error('❌ Erro ao carregar rotina:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar rotina');
    } finally {
      setLoading(false);
    }
  }, [refreshTemplates, refreshUsers]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setRoutineData(null);
    setError(null);
    setMode('create');
  }, []);

  const saveRoutine = useCallback(async (data: CreateRoutineData | UpdateRoutineData): Promise<boolean> => {
    setSaving(true);
    setError(null);
    
    try {
      if (mode === 'create') {
        await createCompanyRoutine(data as CreateRoutineData);
      } else {
        await updateCompanyRoutine(data as UpdateRoutineData);
      }
      
      return true;
    } catch (err) {
      console.error('Erro ao salvar rotina:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar rotina');
      return false;
    } finally {
      setSaving(false);
    }
  }, [mode]);

  const openDeleteModal = useCallback((routineId: string, routineName: string) => {
    setRoutineToDelete({ id: routineId, name: routineName });
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setRoutineToDelete(null);
    setError(null);
  }, []);

  const confirmDelete = useCallback(async (): Promise<boolean> => {
    console.log('🎯 confirmDelete chamado, routineToDelete:', routineToDelete);
    if (!routineToDelete) return false;
    
    setDeleting(true);
    setError(null);
    
    try {
      console.log('🎯 Chamando deleteCompanyRoutine com ID:', routineToDelete.id);
      await deleteCompanyRoutine(routineToDelete.id);
      console.log('🎯 Delete realizado com sucesso');
      closeDeleteModal();
      return true;
    } catch (err) {
      console.error('🎯 Erro ao deletar rotina:', err);
      setError(err instanceof Error ? err.message : 'Erro ao deletar rotina');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [routineToDelete, closeDeleteModal]);

  return {
    // Modal state
    isOpen,
    mode,
    
    // Delete modal state
    deleteModalOpen,
    routineToDelete,
    
    // Data
    routineData,
    templates,
    users,
    
    // Loading states
    loading,
    saving,
    deleting,
    templatesLoading,
    usersLoading,
    
    // Error state
    error,
    
    // Actions
    openCreateModal,
    openEditModal,
    closeModal,
    saveRoutine,
    
    // Delete actions
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    
    // Utilities
    refreshTemplates,
    refreshUsers
  };
}