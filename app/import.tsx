import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { extractText } from 'expo-pdf-text-extract';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { HeaderBar } from '@/components/HeaderBar';
import { Toast } from '@/components/Toast';

export default function ImportScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addItem } = useLibrary();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => setToast(msg);

  const handlePdfUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setLoading(true);
        showToast('Extracting text...');

        try {
          const extractedText = await extractText(file.uri);

          if (!extractedText.trim()) {
            showToast('No text found in PDF');
            setLoading(false);
            return;
          }

          const newId = addItem({
            type: 'PDF',
            title: file.name.replace('.pdf', ''),
            content: extractedText.trim(),
          });
          setLoading(false);
          router.replace(`/reader?id=${newId}`);
        } catch {
          setLoading(false);
          showToast('Failed to extract text from PDF');
        }
      }
    } catch {
      setLoading(false);
      showToast('Failed to select file');
    }
  };

  const handleSaveAndRead = () => {
    if (!text.trim()) {
      showToast('Enter some text');
      return;
    }
    const newId = addItem({
      type: 'TEXT',
      title: title.trim() || 'Untitled Import',
      content: text.trim(),
    });
    router.replace(`/reader?id=${newId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="New Import" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>New Import</Text>
        <Text style={styles.subtitle}>Select a method to add content.</Text>

        {/* PDF Upload */}
        <Pressable
          style={({ pressed }) => [
            styles.uploadZone,
            { opacity: pressed || loading ? 0.7 : 1 },
          ]}
          onPress={handlePdfUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text} style={{ marginBottom: 12 }} />
          ) : (
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color="rgba(128,128,128,0.3)"
              style={{ marginBottom: 12 }}
            />
          )}
          <Text style={[styles.uploadTitle, { color: colors.text }]}>
            {loading ? 'Processing...' : 'Upload PDF'}
          </Text>
          <Text style={styles.uploadHint}>
            {loading ? 'Extracting text from PDF' : 'Tap to browse'}
          </Text>
        </Pressable>

        {/* URL Input */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <Text style={styles.groupLabel}>Paste Web URL</Text>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="https://article-link.com/..."
            placeholderTextColor="rgba(128,128,128,0.3)"
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Pressable onPress={() => showToast('URL Parser coming soon')}>
            <Text style={styles.fetchBtn}>FETCH CONTENT</Text>
          </Pressable>
        </View>

        {/* Manual Entry */}
        <View style={[styles.group, { borderColor: colors.cardBorder }]}>
          <Text style={styles.groupLabel}>Manual Entry</Text>
          <TextInput
            style={[styles.input, styles.titleInput, { color: colors.text }]}
            placeholder="Document Title"
            placeholderTextColor="rgba(128,128,128,0.3)"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text }]}
            placeholder="Paste your text here..."
            placeholderTextColor="rgba(128,128,128,0.3)"
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              {
                borderColor: 'rgba(255,255,255,0.1)',
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.text }]}>
              Cancel
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
            onPress={handleSaveAndRead}
          >
            <Text style={styles.saveBtnText}>Save & Read</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Toast message={toast} visible={!!toast} onHide={() => setToast('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 110,
    paddingHorizontal: 24,
    paddingBottom: 60,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(128,128,128,0.4)',
    marginBottom: 32,
  },
  uploadZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.03)',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: 12,
    color: 'rgba(128,128,128,0.3)',
    marginTop: 4,
  },
  group: {
    backgroundColor: 'rgba(128,128,128,0.05)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  groupLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: 'rgba(128,128,128,0.3)',
    marginBottom: 16,
  },
  input: {
    fontSize: 14,
  },
  titleInput: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 100,
    lineHeight: 22,
  },
  fetchBtn: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(128,128,128,0.6)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
    opacity: 0.6,
  },
  cancelBtnText: {
    fontWeight: '500',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 14,
  },
});
