'use client';

import React from 'react';
import { KanbanBoard } from '../components/KanbanBoard';

export const ActionsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <KanbanBoard />
    </div>
  );
};