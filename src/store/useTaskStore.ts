import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { apiClient } from '../utils/axios-config';

export type Task = {
  _id: number | string;
  userId?: number | null;
  text: string;
  dueDate?: string | null;
  completed?: boolean;
};

export type TaskState = {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (text: string, dueDate?: string | null) => Promise<Task | null>;
  updateTask: (id: number | string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: number | string) => Promise<boolean>;
  clearTasks: () => void;
};

export const useTaskStore = create<TaskState>()(
  devtools(
    persist<TaskState>(
      (set, get) => ({
        tasks: [],
        loading: false,

              clearTasks: async () => {
                const currentTasks = (get() as any).tasks as Task[];
                if (!currentTasks || currentTasks.length === 0) {
                  set({ tasks: [] });
                  return;
                }

                try {
                  // Try batch delete endpoint first (if backend provides it)
                  await apiClient.post('/deleteAll');
                } catch (err) {
                  // Fallback: delete tasks one by one
                  try {
                    await Promise.all(
                      currentTasks.map((t) => apiClient.post('/delete', { _id: Number(t._id) }))
                    );
                  } catch (err2) {
                    console.error('Erro ao deletar tasks no backend:', err2);
                  }
                }

                set({ tasks: [] });
              },

        fetchTasks: async () => {
          set({ loading: true });
          try {
            const res = await apiClient.get<any>('/');
            // Aceita diferentes formatos de resposta do backend:
            // - Array direto: [ {..}, ... ]
            // - Objeto com chave `tasks`: { tasks: [ ... ] }
            // - Objeto com chave `data`: { data: [ ... ] }
            const raw = Array.isArray(res.data)
              ? res.data
              : res.data?.tasks ?? res.data?.data ?? [];
            const data = raw.map((t: any) => ({ ...t, completed: !!t.completed }));
            set({ tasks: data });
          } catch (err) {
            console.error('Erro ao buscar tasks:', err);
          } finally {
            set({ loading: false });
          }
        },

        addTask: async (text: string, dueDate: string | null = null) => {
          try {
            const res = await apiClient.post('/save', { text, dueDate, completed: false });
            const task: Task = { ...res.data, completed: !!res.data.completed };
            set((state) => ({ tasks: [task, ...state.tasks] }));
            return task;
          } catch (err) {
            console.error('Erro ao adicionar task:', err);
            return null;
          }
        },

        updateTask: async (id: number | string, updates: Partial<Task>) => {
          try {
            // Ensure we don't send null/undefined for required fields (like `text`).
            const current = (get() as any).tasks.find((t: Task) => t._id === id) as Task | undefined;
            const payload: any = { _id: Number(id) };
            if (current) {
              payload.text = updates.text ?? current.text;
              payload.dueDate = updates.dueDate ?? current.dueDate;
              payload.completed = updates.completed ?? current.completed;
            } else {
              Object.assign(payload, updates);
            }

            await apiClient.post('/update', payload);
            set((state) => ({
              tasks: state.tasks.map((t) => (t._id === id ? { ...t, ...updates } : t)),
            }));
            return true;
          } catch (err) {
            console.error('Erro ao atualizar task:', err);
            return false;
          }
        },

        deleteTask: async (id: number | string) => {
          try {
            await apiClient.post('/delete', { _id: Number(id) });
            set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) }));
            return true;
          } catch (err) {
            console.error('Erro ao deletar task:', err);
            return false;
          }
        },
      }),
      {
        name: 'tasks-storage',
        storage: createJSONStorage<Pick<TaskState, 'tasks'>>(() => AsyncStorage),
        partialize: (state) => ({ tasks: state.tasks }),
      }
    ),
    { name: 'task-store' }
  )
);
