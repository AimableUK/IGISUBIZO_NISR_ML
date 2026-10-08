"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List } from "lucide-react";
import { useId } from "react";

/** Small rich-text field (Tiptap). Emits plain text so nothing executable ever reaches the API. */
export default function RichTextField({ label, onChange, placeholder }: { label: string; onChange: (plain: string) => void; placeholder?: string }) {
  const id = useId();
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false })],
    immediatelyRender: false,
    editorProps: { attributes: { id, role: "textbox", "aria-multiline": "true", "aria-label": label, "data-placeholder": placeholder ?? "" } },
    onUpdate: ({ editor }) => onChange(editor.getText({ blockSeparator: "\n" })),
  });
  const B = ({ on, act, Icon, name }: { on: boolean; act: () => void; Icon: typeof Bold; name: string }) => (
    <button type="button" className="btn-sm" aria-pressed={on} aria-label={name} onClick={act}><Icon className="h-4 w-4" aria-hidden /></button>
  );
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div className="mb-1 flex gap-1" role="toolbar" aria-label="Text formatting">
        <B on={!!editor?.isActive("bold")} act={() => editor?.chain().focus().toggleBold().run()} Icon={Bold} name="Bold" />
        <B on={!!editor?.isActive("italic")} act={() => editor?.chain().focus().toggleItalic().run()} Icon={Italic} name="Italic" />
        <B on={!!editor?.isActive("bulletList")} act={() => editor?.chain().focus().toggleBulletList().run()} Icon={List} name="Bullet list" />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
