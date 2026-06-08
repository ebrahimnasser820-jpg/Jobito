import React from 'react';
import { usePermissions, Action, Entity } from '../hooks/usePermissions';

interface CanProps {
  do: Action;
  on: Entity;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ do: action, on: entity, children }) => {
  const { can } = usePermissions();

  if (can(action, entity)) {
    return <>{children}</>;
  }

  return null;
};
