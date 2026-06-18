import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTaskStore } from '../../../src/store/useTaskStore';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import TaskModal from '../../../src/components/TaskModal';

export default function TaskDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const task = useTaskStore((state) => state.tasks.find((item) => String(item._id) === String(id)));
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const [modalVisible, setModalVisible] = useState(false);

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Tarefa não encontrada</Text>
      </SafeAreaView>
    );
  }

  const handleToggleComplete = async () => {
    if (!task) return;
    await updateTask(task._id, { completed: !task.completed });
  };

  const handleSave = async (payload: any) => {
    if (!task) return;
    await updateTask(task._id, { text: payload.text, completed: payload.completed, dueDate: payload.dueDate });
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    await deleteTask(task._id);
    router.replace('/tasks');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerWrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>{task.text}</Text>

          <View style={styles.rowTop}>
            <View style={[styles.badge, task.completed ? styles.badgeDone : styles.badgePending]}>
              <Text style={styles.badgeText}>{task.completed ? 'Concluída' : 'Pendente'}</Text>
            </View>
            {task.dueDate ? (
              <Text style={styles.dueDate}>Até: {new Date(task.dueDate).toLocaleDateString()}</Text>
            ) : null}
          </View>

          {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => { setModalVisible(true); }} accessibilityRole="button">
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.toggleButton]} onPress={handleToggleComplete} accessibilityRole="button">
              <Text style={styles.buttonText}>{task.completed ? 'Marcar como Pendente' : 'Marcar como Concluída'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete} accessibilityRole="button">
              <Text style={styles.buttonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <StatusBar style="auto" />
      <TaskModal visible={modalVisible} onClose={() => setModalVisible(false)} initialTask={task} onSave={handleSave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f6f7fb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#212121',
  },
  label: {
    fontSize: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  backText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  badgeDone: {
    backgroundColor: '#43a047',
  },
  badgePending: {
    backgroundColor: '#e53935',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
  },
  dueDate: {
    color: '#616161',
    fontWeight: '600',
  },
  description: {
    color: '#424242',
    marginTop: 8,
    lineHeight: 20,
  },
  centerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginTop: 8,
  },
  buttonsRow: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  editButton: {
    backgroundColor: '#1976d2',
  },
  saveButton: {
    backgroundColor: '#00796b',
  },
  toggleButton: {
    backgroundColor: '#6a1b9a',
  },
  deleteButton: {
    backgroundColor: '#e53935',
  },
});
