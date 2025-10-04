"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Strikethrough, List, ListOrdered, Heading2, Quote } from 'lucide-react';
import { useEffect } from 'react';

// Komponen Toolbar (tidak ada perubahan)
const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="border border-input bg-transparent rounded-t-md p-2 flex items-center flex-wrap gap-2">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <Bold className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <Italic className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <Strikethrough className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <Heading2 className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <List className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <ListOrdered className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-gray-200 p-2 rounded-lg' : 'p-2 rounded-lg hover:bg-gray-100'}>
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
};

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    readonly?: boolean;
}

const RichTextEditor = ({ value, onChange, readonly = false }: RichTextEditorProps) => {
    const editor = useEditor({
        // ✨ FIX: Tambahkan properti ini untuk mengatasi error SSR
        immediatelyRender: false,
        extensions: [StarterKit],
        content: value,
        editable: !readonly,
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none p-3 border-x border-b border-input rounded-b-md min-h-[150px] focus:outline-none',
            },
        },
        onUpdate({ editor }) {
            if (editor.getHTML() !== value) {
                onChange(editor.getHTML());
            }
        },
    });

    useEffect(() => {
        if (!editor || readonly) {
            return;
        }
        const isSame = editor.getHTML() === value;
        if (!isSame) {
            editor.commands.setContent(value, { emitUpdate: false }); // `emitUpdate: false` untuk mencegah trigger onUpdate lagi
        }
    }, [value, editor, readonly]);

    return (
        <div className="flex flex-col">
            {!readonly && <Toolbar editor={editor} />}
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;