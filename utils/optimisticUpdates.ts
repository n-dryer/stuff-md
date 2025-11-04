export function withOptimisticAdd<T>(
  items: T[],
  newItem: T,
  setItems: (updater: (prev: T[]) => T[]) => void,
  onError: (error: Error) => void
): {
  applyOptimistic: () => void;
  rollback: (error: unknown) => void;
} {
  const applyOptimistic = () => {
    setItems(prev => [newItem, ...prev]);
  };

  const rollback = (error: unknown) => {
    setItems(prev => prev.filter(item => item !== newItem));
    if (error instanceof Error) {
      onError(error);
    }
  };

  return { applyOptimistic, rollback };
}

export function withOptimisticUpdate<T extends { id: string }>(
  items: T[],
  itemId: string,
  updates: Partial<T>,
  setItems: (updater: (prev: T[]) => T[]) => void,
  onError: (error: Error) => void,
  refetch: () => Promise<void>
): {
  applyOptimistic: () => void;
  rollback: (error: unknown) => Promise<void>;
} {
  const applyOptimistic = () => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, ...updates } : item))
    );
  };

  const rollback = async (error: unknown) => {
    await refetch();
    if (error instanceof Error) {
      onError(error);
    }
  };

  return { applyOptimistic, rollback };
}

export function withOptimisticDelete<T extends { id: string }>(
  items: T[],
  itemIds: string[],
  setItems: (updater: (prev: T[]) => T[]) => void,
  onError: (error: Error) => void
): {
  applyOptimistic: () => T[];
  rollback: (deletedItems: T[], error: unknown) => void;
} {
  const applyOptimistic = () => {
    const deletedItems = items.filter(item => itemIds.includes(item.id));
    setItems(prev => prev.filter(item => !itemIds.includes(item.id)));
    return deletedItems;
  };

  const rollback = (deletedItems: T[], error: unknown) => {
    if (deletedItems.length > 0) {
      setItems(prev => [...prev, ...deletedItems]);
    }
    if (error instanceof Error) {
      onError(error);
    }
  };

  return { applyOptimistic, rollback };
}

export function withOptimisticReplace<T extends { id: string }>(
  items: T[],
  itemId: string,
  replacement: T,
  setItems: (updater: (prev: T[]) => T[]) => void,
  onError: (error: Error) => void
): {
  applyOptimistic: () => T | undefined;
  rollback: (originalItem: T | undefined, error: unknown) => void;
} {
  const applyOptimistic = () => {
    const originalItem = items.find(item => item.id === itemId);
    setItems(prev =>
      prev.map(item => (item.id === itemId ? replacement : item))
    );
    return originalItem;
  };

  const rollback = (originalItem: T | undefined, error: unknown) => {
    if (originalItem) {
      setItems(prev =>
        prev.map(item => (item.id === itemId ? originalItem : item))
      );
    }
    if (error instanceof Error) {
      onError(error);
    }
  };

  return { applyOptimistic, rollback };
}
