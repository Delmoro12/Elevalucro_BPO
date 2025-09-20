import { useState, useEffect } from 'react';
import { BpoUser, UserFilters } from '../types/users';
import { getBpoUsers, updateBpoUser, deleteBpoUser } from '../services/users.api';

export const useUsers = () => {
  const [users, setUsers] = useState<BpoUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchUsers = async (filters: UserFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await getBpoUsers(filters);
      setUsers(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, data: any): Promise<boolean> => {
    try {
      const success = await updateBpoUser(userId, data);
      if (success) {
        // Atualizar lista local
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, ...data } : user
        ));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      return false;
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      const success = await deleteBpoUser(userId);
      if (success) {
        // Atualizar status na lista local
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_active: false, status: 'inactive' } : user
        ));
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    total,
    fetchUsers,
    updateUser,
    deleteUser,
  };
};