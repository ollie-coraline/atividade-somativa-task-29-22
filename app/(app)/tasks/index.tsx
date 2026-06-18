import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, View, Text, TouchableOpacity, Pressable, Modal, StatusBar as RNStatusBar, Platform, Image, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import TaskList from '../../../src/components/TaskList';
import AboutScreen from '../../../src/components/AboutScreen';
import TaskModal from '../../../src/components/TaskModal';
import { getSessionToken, removeSessionToken } from '../../../src/utils/storage';
import { useTaskStore } from '../../../src/store/useTaskStore';
import { globalStyles } from '../../../src/styles/global';

export default function TasksPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [initialTask, setInitialTask] = useState<any>(null);
  const [logoError, setLogoError] = useState(false);

  const tasks = useTaskStore((state) => state.tasks);
  const loading = useTaskStore((state) => state.loading);
  const fetchTasks = useTaskStore((state) => state.fetchTasks);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const clearTasks = useTaskStore((state) => state.clearTasks);

  useEffect(() => {
    const checkToken = async () => {
      const token = await getSessionToken();
      if (!token) {
        router.replace('/login');
        return;
      }
      await fetchTasks();
      setSessionChecked(true);
    };

    checkToken();
  }, [fetchTasks, router]);

  const handleLogout = async () => {
    await removeSessionToken();
    clearTasks();
    router.replace('/login');
  };

  const resetForm = () => {
    setInitialTask(null);
    setModalVisible(false);
  };

  const updateMode = (task: any) => {
    setInitialTask(task);
    setModalVisible(true);
  };
  const handleSave = async (payload: any) => {
    if (payload.isUpdating) {
      await updateTask(payload.id, { text: payload.text, completed: payload.completed, dueDate: payload.dueDate });
    } else {
      await addTask(payload.text, payload.dueDate);
    }
    resetForm();
  };

  if (!sessionChecked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Verificando sessão...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Tarefas' }} />
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {logoError ? (
            <Text style={styles.header}>Gerenciador de Tarefas</Text>
          ) : (
            <Image
              source={require('../../../assets/task-app-banner.png')}
              style={styles.logo}
              onError={() => setLogoError(true)}
            />
          )}
          {!logoError && <Text style={styles.header}>Tarefas</Text>}
        </View>

        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Total de Tarefas: {tasks.length}</Text>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' ? styles.filterButtonActive : styles.filterButtonInactive]}
            onPress={() => setFilter('all')}
          >
            <Text style={filter === 'all' ? styles.filterTextActive : styles.filterTextInactive}>Todas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' ? styles.filterButtonActive : styles.filterButtonInactive]}
            onPress={() => setFilter('completed')}
          >
            <Text style={filter === 'completed' ? styles.filterTextActive : styles.filterTextInactive}>Concluídas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'pending' ? styles.filterButtonActive : styles.filterButtonInactive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={filter === 'pending' ? styles.filterTextActive : styles.filterTextInactive}>Pendentes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonAdd,
              pressed && styles.actionButtonAddPressed,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>Nova Tarefa</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={clearTasks}
          >
            <Text style={styles.actionButtonText}>Excluir todas</Text>
          </Pressable>
        </View>

        <View style={styles.aboutButtonContainer}>
          <TouchableOpacity style={styles.infoButton} onPress={() => setAboutModalVisible(true)}>
            <Text style={styles.infoButtonText}>Sobre o App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <TaskList filter={filter} onUpdate={updateMode} />

        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
      </View>

      {/* Reusable modal component for create/update tasks */}
      {/** Importing lazily to keep file changes minimal. */}
      <TaskModal visible={modalVisible} onClose={resetForm} initialTask={initialTask} onSave={handleSave} />

      <Modal visible={aboutModalVisible} animationType="slide" onRequestClose={() => setAboutModalVisible(false)}>
        <AboutScreen onClose={() => setAboutModalVisible(false)} />
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterContainer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: globalStyles.bodyFontSize,
    color: '#666',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  filterTextActive: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterTextInactive: {
    color: '#000',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  aboutButtonContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flex: 1,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  actionButtonAdd: {
    backgroundColor: globalStyles.primaryColor,
    shadowColor: globalStyles.primaryColor,
  },
  actionButtonAddPressed: {
    backgroundColor: '#333',
    transform: [{ scale: 0.98 }],
    elevation: 1,
    shadowOpacity: 0.1,
  },
  deleteButton: {
    backgroundColor: '#ff4d4d',
    shadowColor: '#ff0000',
  },
  deleteButtonPressed: {
    backgroundColor: '#d9363e',
    transform: [{ scale: 0.98 }],
    elevation: 1,
    shadowOpacity: 0.1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInputContainer: {
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  checkboxContainer: {
    marginLeft: 16,
  },
  priorityContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  priorityTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#333',
    fontWeight: 'bold',
  },
  modalSaveBtn: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSaveBtnDisabled: {
    opacity: 0.6,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
