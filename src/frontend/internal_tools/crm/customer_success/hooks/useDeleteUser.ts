import { useState } from 'react';

interface DeleteUserResult {
  success: boolean;
  message: string;
  deleted?: {
    company_users: number;
    profiles: number;
    users: number;
    auth_user: boolean;
  };
}

export const useDeleteUser = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteUser = async (email: string): Promise<DeleteUserResult | null> => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch('/api/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_email: email }),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.error || 'Erro ao deletar usuário';
        setDeleteError(errorMessage);
        console.error('Delete user error:', result);
        return null;
      }

      return result as DeleteUserResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setDeleteError(errorMessage);
      console.error('Delete user error:', error);
      return null;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteUser,
    isDeleting,
    deleteError,
  };
};