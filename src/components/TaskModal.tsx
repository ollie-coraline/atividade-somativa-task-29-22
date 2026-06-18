import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';
import { Task } from '../store/useTaskStore';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialTask?: Partial<Task> & { _id?: string | number } | null;
  onSave: (payload: { text: string; dueDate: string | null; completed: boolean; priority?: string; isUpdating: boolean; id?: string | number }) => Promise<void>;
};

export default function TaskModal({ visible, onClose, initialTask, onSave }: Props) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Baixa');
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState<string | number | undefined>(undefined);

  useEffect(() => {
    if (initialTask) {
      setIsUpdating(true);
      setTaskId(initialTask._id);
      setText(initialTask.text ?? '');
      setCompleted(!!initialTask.completed);
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate) : null);
      setPriority((initialTask as any).priority ?? 'Baixa');
    } else {
      setIsUpdating(false);
      setTaskId(undefined);
      setText('');
      setCompleted(false);
      setDueDate(null);
      setPriority('Baixa');
    }
  }, [initialTask, visible]);

  const resetForm = () => {
    setText('');
    setCompleted(false);
    setDueDate(null);
    setPriority('Baixa');
    setIsUpdating(false);
    setTaskId(undefined);
    onClose();
  };

  const handleSave = async () => {
    const formattedDate = dueDate ? dueDate.toISOString() : null;
    await onSave({ text, dueDate: formattedDate, completed, priority, isUpdating, id: taskId });
    resetForm();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={resetForm}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{isUpdating ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>

          <Text style={styles.modalLabel}>Nome da tarefa</Text>
          <View style={styles.modalInputContainer}>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome da tarefa..."
              value={text}
              maxLength={50}
              onChangeText={setText}
            />
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Data limite:</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                onChange={(e: any) => {
                  const val = e.target.value;
                  if (val) {
                    const parts = val.split('-');
                    setDueDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                  } else {
                    setDueDate(null);
                  }
                }}
                style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', flex: 1, marginLeft: 16 }}
              />
            ) : (
              <View style={{ flex: 1, marginLeft: 16, alignItems: 'flex-start' }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                  <Text>{dueDate ? dueDate.toLocaleDateString() : 'Selecionar Data'}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker value={dueDate || new Date()} mode="date" display="default" onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDueDate(selectedDate);
                  }} />
                )}
              </View>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Concluída:</Text>
            <View style={styles.checkboxContainer}>
              <Checkbox value={completed} onValueChange={setCompleted} color={completed ? '#000' : undefined} />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Prioridade:</Text>
            <View style={styles.priorityContainer}>
              {['Baixa', 'Média', 'Alta'].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    priority === p && {
                      backgroundColor: p === 'Baixa' ? '#4caf50' : p === 'Média' ? '#ff9800' : '#f44336',
                      borderColor: p === 'Baixa' ? '#4caf50' : p === 'Média' ? '#ff9800' : '#f44336',
                    },
                  ]}
                  onPress={() => setPriority(p as any)}
                >
                  <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={resetForm}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalSaveBtn, !text.trim() && styles.modalSaveBtnDisabled]} onPress={handleSave} disabled={!text.trim()}>
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  modalInputContainer: { marginBottom: 16 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  checkboxContainer: { marginLeft: 16 },
  priorityContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', marginLeft: 16 },
  priorityButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: '#999', alignItems: 'center' },
  priorityText: { fontSize: 14, color: '#333', fontWeight: '600' },
  priorityTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalCancelBtn: { flex: 1, marginRight: 8, backgroundColor: '#ddd', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalCancelText: { color: '#333', fontWeight: 'bold' },
  modalSaveBtn: { flex: 1, marginLeft: 8, backgroundColor: '#007AFF', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  modalSaveBtnDisabled: { opacity: 0.6 },
  modalSaveText: { color: '#fff', fontWeight: 'bold' },
});
