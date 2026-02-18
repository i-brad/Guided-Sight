import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@/context/ThemeContext';
import { useLibrary } from '@/context/LibraryContext';
import { useImport } from '@/context/ImportContext';
import { HeaderBar } from '@/components/HeaderBar';
import { Toast } from '@/components/Toast';

type ImportTab = 'paste' | 'url' | 'file';

export default function ImportScreen() {
  const router = useRouter();
  const { colors, settings } = useTheme();
  const { addItem } = useLibrary();
  const { startImport, status: importStatus } = useImport();
  const [activeTab, setActiveTab] = useState<ImportTab>('paste');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [docFile, setDocFile] = useState<{ name: string; uri: string; mimeType: string } | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => setToast(msg);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setDocFile({ name: file.name, uri: file.uri, mimeType: file.mimeType || '' });
      }
    } catch {
      showToast('Failed to select file');
    }
  };

  const handleSaveAndRead = () => {
    if (activeTab === 'paste') {
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
      return;
    }

    if (!settings.openaiApiKey) {
      showToast('Add your OpenAI API key in Settings first');
      return;
    }

    if (importStatus === 'importing') {
      showToast('An import is already running');
      return;
    }

    if (activeTab === 'url') {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        showToast('Enter a URL');
        return;
      }
      if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        showToast('URL must start with http:// or https://');
        return;
      }

      startImport({ type: 'url', url: trimmedUrl, apiKey: settings.openaiApiKey });
      router.back();
      return;
    }

    if (activeTab === 'file') {
      if (!docFile) {
        showToast('Select a file first');
        return;
      }

      const isDocx = docFile.name.toLowerCase().endsWith('.docx') ||
        docFile.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const mimeType = isDocx
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' as const
        : 'application/pdf' as const;
      const itemType = isDocx ? 'DOCX' as const : 'PDF' as const;

      startImport({
        type: 'file',
        fileUri: docFile.uri,
        fileName: docFile.name,
        mimeType,
        itemType,
        apiKey: settings.openaiApiKey,
      });
      router.back();
    }
  };

  const isReady =
    (activeTab === 'paste' && text.trim().length > 0) ||
    (activeTab === 'url' && url.trim().length > 0) ||
    (activeTab === 'file' && docFile !== null);

  const tabs: { key: ImportTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'paste', label: 'Paste', icon: 'clipboard-outline' },
    { key: 'url', label: 'URL', icon: 'link-outline' },
    { key: 'file', label: 'File', icon: 'document-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderBar title="New Import" showBack />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.text }]}>Add Content</Text>
        <Text style={[styles.subtitle, { color: colors.mutedText }]}>Paste text, enter a URL, or pick a file.</Text>

        {/* Tabs */}
        <View style={[styles.tabRow, { borderColor: colors.cardBorder }]}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  active && { backgroundColor: colors.cardBackground },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={active ? colors.text : colors.mutedText}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? colors.text : colors.mutedText },
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tab Content */}
        <View style={[styles.inputArea, { borderColor: colors.cardBorder, backgroundColor: colors.cardBackground }]}>
          {activeTab === 'paste' && (
            <>
              <TextInput
                style={[styles.input, styles.titleInput, { color: colors.text, borderBottomColor: colors.cardBorder }]}
                placeholder="Title (optional)"
                placeholderTextColor={colors.mutedText}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.text }]}
                placeholder="Paste or type your text here..."
                placeholderTextColor={colors.mutedText}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
              />
            </>
          )}

          {activeTab === 'url' && (
            <>
              <Ionicons
                name="globe-outline"
                size={32}
                color={colors.mutedText}
                style={{ alignSelf: 'center', marginBottom: 16 }}
              />
              <TextInput
                style={[styles.input, styles.urlInput, { color: colors.text, borderColor: colors.cardBorder }]}
                placeholder="https://example.com/article"
                placeholderTextColor={colors.mutedText}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />
              <Text style={[styles.hint, { color: colors.mutedText }]}>
                Content will be extracted in the background.
              </Text>
            </>
          )}

          {activeTab === 'file' && (
            <Pressable
              style={({ pressed }) => [
                styles.fileZone,
                { opacity: pressed ? 0.7 : 1, borderColor: colors.cardBorder },
                docFile && styles.fileZoneSelected,
              ]}
              onPress={handlePickFile}
            >
              {docFile ? (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={32}
                    color={colors.accent || '#4CAF50'}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                    {docFile.name}
                  </Text>
                  <Text style={[styles.hint, { color: colors.mutedText }]}>Tap to choose a different file</Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={32}
                    color={colors.mutedText}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={[styles.filePrompt, { color: colors.text }]}>
                    Tap to select a PDF or DOCX
                  </Text>
                  <Text style={[styles.hint, { color: colors.mutedText }]}>Text will be extracted in the background.</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelBtn,
              {
                borderColor: colors.cardBorder,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: colors.accent,
                opacity: isReady ? 1 : 0.4,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
            onPress={handleSaveAndRead}
            disabled={!isReady}
          >
            <Text style={[styles.saveBtnText, { color: colors.background }]}>Save & Read</Text>
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
    marginBottom: 24,
  },
  tabRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputArea: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 180,
  },
  input: {
    fontSize: 14,
  },
  titleInput: {
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 120,
    lineHeight: 22,
  },
  urlInput: {
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  hint: {
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  fileZone: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  fileZoneSelected: {
    borderStyle: 'solid',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  filePrompt: {
    fontSize: 14,
    fontWeight: '500',
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
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 14,
  },
});
