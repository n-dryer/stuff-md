/**
 * Request queue utility for concurrency limiting
 * Limits the number of concurrent async operations to prevent overwhelming APIs
 */

/**
 * Executes an array of async tasks with a concurrency limit
 * @param tasks Array of async functions to execute
 * @param limit Maximum number of concurrent executions (default: 5)
 * @param signal Optional AbortSignal to cancel operations
 * @returns Promise resolving to array of results in same order as tasks (null for failed tasks)
 */
export const withConcurrencyLimit = async <T>(
  tasks: (() => Promise<T | null>)[],
  limit: number = 5,
  signal?: AbortSignal
): Promise<(T | null)[]> => {
  // If signal is already aborted, return empty array
  if (signal?.aborted) {
    return tasks.map(() => null);
  }

  const results: (T | null)[] = new Array(tasks.length);
  const executing: Promise<void>[] = [];
  let currentIndex = 0;

  const executeTask = async (index: number): Promise<void> => {
    // Check if aborted before executing
    if (signal?.aborted) {
      results[index] = null;
      return;
    }

    try {
      const result = await tasks[index]();
      // Check if aborted after execution
      if (signal?.aborted) {
        results[index] = null;
        return;
      }
      results[index] = result;
    } catch {
      // Task failed, store null (will be filtered out by caller)
      results[index] = null;
    }
  };

  // Process tasks with concurrency limit
  while (currentIndex < tasks.length) {
    // Check if aborted
    if (signal?.aborted) {
      // Fill remaining results with null
      while (currentIndex < tasks.length) {
        results[currentIndex] = null;
        currentIndex++;
      }
      break;
    }

    // Wait for a slot to be available if we're at the limit
    if (executing.length >= limit) {
      await Promise.race(executing);
    }

    // Start next task
    const taskPromise = executeTask(currentIndex).finally(() => {
      // Remove this promise from executing array when done
      const index = executing.indexOf(taskPromise);
      if (index > -1) {
        executing.splice(index, 1);
      }
    });

    executing.push(taskPromise);
    currentIndex++;
  }

  // Wait for all remaining tasks to complete
  await Promise.all(executing);

  return results;
};

