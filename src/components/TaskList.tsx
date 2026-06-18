import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View, Text } from 'react-native';
import TaskItem from './TaskItem';
import { useTaskStore, Task } from '../store/useTaskStore';

interface TaskListProps {
  tasks?: Task[];
  filter?: 'all' | 'completed' | 'pending';
  onUpdate: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks: tasksProp, filter = 'all', onUpdate, onDelete }) => {
  const storeTasks = useTaskStore((state) => state.tasks);
  const tasks = tasksProp ?? storeTasks;

  const sections = useMemo(() => {
    const filteredTasks = tasks.filter((task) => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    });

    const completedTasks = filteredTasks.filter((task) => task.completed);
    const pendingTasks = filteredTasks.filter((task) => !task.completed);

    return [
      { title: '✅ Concluídas', data: completedTasks },
      { title: '📋 Pendentes', data: pendingTasks },
    ];
  }, [tasks, filter]);

  return (
    <View style={styles.listContainer}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item._id)}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => (
          <TaskItem task={item} updateMode={() => onUpdate(item)} onDelete={onDelete ? () => onDelete(String(item._id)) : undefined} />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <Text style={styles.emptySectionText}>Nenhuma tarefa nesta categoria.</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  emptySectionText: {
    padding: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  }
});

export default TaskList;
