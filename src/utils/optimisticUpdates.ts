type Undo = () => void;

export function applyOptimisticUpdate<T extends { id: string }>(
  setItems: (items: T[]) => void,
  currentItems: T[],
  item: T | T[],
  isDelete: boolean = false
): Undo {
  const items = Array.isArray(item) ? item : [item];
  const previousItems = [...currentItems];

  if (isDelete) {
    const idsToRemove = items.map(i => i.id);
    setItems(currentItems.filter(p => !idsToRemove.includes(p.id)));
  } else {
    setItems([...currentItems, ...items]);
  }

  return () => setItems(previousItems);
}

export function revertOptimisticUpdate(undo: Undo): void {
  undo();
}
