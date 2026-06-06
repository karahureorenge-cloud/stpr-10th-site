"use client"

import { useRef, useState } from "react"
import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import { Color } from "@tiptap/extension-color"
import { uploadImage } from "@/app/admin/upload-actions"

type Props = {
  name?: string // フォーム送信名（hidden input）。非制御モードで使用
  table: string // 画像アップロードのパス用
  initialValue?: string // 既存 HTML
  /** 制御モード（repeater 行内など）。指定時は hidden input を出さず onChange で親へ通知する。 */
  onChange?: (html: string) => void
}

/**
 * Tiptap リッチテキストエディタ（admin の PROJECT.description / イベントのカスタムセクション用）。
 * - ツールバー: 見出し(H1/H2/H3)・太字・斜体・下線・取り消し線・リスト・リンク・画像・配置
 * - 画像は Supabase Storage（uploadImage）へアップロードし URL を挿入
 * - 非制御モード: 編集内容を HTML 文字列として hidden input(name) に書き出し DB に保存
 * - 制御モード: onChange で HTML を親へ通知（repeater の JSON へまとめて保存）
 * StarterKit v3 は Link / Underline を内蔵するため重複回避で無効化し、個別拡張を追加する。
 */
export default function RichTextEditor({ name, table, initialValue, onChange }: Props) {
  const [html, setHtml] = useState(initialValue ?? "")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content: initialValue ?? "",
    onUpdate: ({ editor }) => {
      const next = editor.getHTML()
      setHtml(next)
      onChange?.(next)
    },
    editorProps: {
      attributes: {
        class: "rte-content min-h-[220px] rounded-b-xl border border-t-0 border-gold-200 bg-white px-4 py-3 outline-none",
      },
    },
  })

  /** 同フォームの slug を使って画像をアップロードし、本文に差し込む。 */
  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    setError(null)
    setUploading(true)
    const form = wrapperRef.current?.closest("form")
    const slugEl = form?.elements.namedItem("slug") as HTMLInputElement | null
    const fd = new FormData()
    fd.set("table", table)
    fd.set("slug", slugEl?.value?.trim() ?? "")
    fd.set("file", file)
    try {
      const res = await uploadImage(fd)
      if (res.error) setError(res.error)
      else if (res.url) editor.chain().focus().setImage({ src: res.url }).run()
    } catch {
      setError("アップロード中にエラーが発生しました。")
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  function setLink() {
    if (!editor) return
    const prev = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("リンク先 URL（空でリンク解除）", prev ?? "")
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div ref={wrapperRef} className="flex flex-col">
      {editor && <Toolbar editor={editor} onImage={() => fileRef.current?.click()} onLink={setLink} uploading={uploading} />}
      <EditorContent editor={editor} />

      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
      {/* DB 保存値（HTML）。制御モード（name 未指定）では親が保存するため出力しない。 */}
      {name && <input type="hidden" name={name} value={html} />}

      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  )
}

/* ===== ツールバー ===== */

function Toolbar({
  editor,
  onImage,
  onLink,
  uploading,
}: {
  editor: Editor
  onImage: () => void
  onLink: () => void
  uploading: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-xl border border-gold-200 bg-gold-50/60 p-1.5">
      <Btn active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </Btn>
      <Btn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </Btn>
      <Btn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </Btn>
      <Sep />
      <Btn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </Btn>
      <Btn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </Btn>
      <Btn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <span className="underline">U</span>
      </Btn>
      <Btn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <span className="line-through">S</span>
      </Btn>
      <Sep />
      <Btn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • リスト
      </Btn>
      <Btn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1. リスト
      </Btn>
      <Sep />
      <Btn active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        左
      </Btn>
      <Btn active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        中央
      </Btn>
      <Btn active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        右
      </Btn>
      <Sep />
      <Btn active={editor.isActive("link")} onClick={onLink}>
        リンク
      </Btn>
      <Btn active={false} onClick={onImage}>
        {uploading ? "画像…" : "画像"}
      </Btn>
    </div>
  )
}

function Btn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        active ? "bg-gold-400 text-white" : "bg-white text-[#6a5570] hover:bg-gold-100"
      }`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-gold-200" aria-hidden />
}
