import create from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '../utils/axios-config';

export type Task = {
  _id: number | string;
  userId?: number | null;
  text: string;
  dueDate?: string | null;
  completed?: boolean;
};

type TaskState = {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (text: string, dueDate?: string | null) => Promise<Task | null>;
  updateTask: (id: number | string, updates: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: number | string) => Promise<boolean>;
  setTasks: (tasks: Task[]) => void;
  clearTasks: () => void;
};

export const useTaskStore = create<TaskState>()(
  devtools((set, get) => ({
    tasks: [],
    loading: false,

    setTasks: (tasks: Task[]) => set({ tasks }),

    clearTasks: () => set({ tasks: [] }),

    fetchTasks: async () => {
      set({ loading: true });
      try {
        const res = await apiClient.get<Task[]>('/');
        const data = res.data.map((t) => ({ ...t, completed: !!t.completed }));
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
        await apiClient.post('/update', { _id: Number(id), ...updates });
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
  }))
);
