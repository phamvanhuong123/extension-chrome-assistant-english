import { useState } from 'react'
import { Settings, Languages, GraduationCap, Sparkles, Database, ShieldAlert, BookOpen, Sun, Moon } from 'lucide-react'
import { OptionsLayout, type OptionCategoryItem } from '@/shared/ui/layout'
import { useTheme } from '@/shared/ui/theme'

const CATEGORIES: OptionCategoryItem[] = [
  { id: 'general', label: 'Cài đặt chung', icon: <Settings size={16} /> },
  { id: 'translate', label: 'Tra từ & Đọc', icon: <Languages size={16} /> },
  { id: 'learning', label: 'Ôn tập & Thẻ', icon: <GraduationCap size={16} /> },
  { id: 'ai', label: 'Trợ lý AI', icon: <Sparkles size={16} /> },
  { id: 'data', label: 'Quản lý dữ liệu', icon: <Database size={16} /> },
  { id: 'excluded-sites', label: 'Trang web loại trừ', icon: <ShieldAlert size={16} /> },
  { id: 'vocabulary', label: 'Từ vựng đã lưu', icon: <BookOpen size={16} /> }
]

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  general: {
    title: 'Cài đặt chung & Giao diện',
    description: 'Tùy chỉnh ngôn ngữ hiển thị và chế độ sáng/tối cho tiện ích.'
  },
  translate: {
    title: 'Tra từ & Đọc văn bản',
    description: 'Cấu hình cách hiển thị tooltip, ngôn ngữ nguồn/đích và phím tắt.'
  },
  learning: {
    title: 'Ôn tập & Thẻ ghi nhớ (Flashcards)',
    description: 'Thiết lập mục tiêu số từ ôn tập mỗi ngày và thuật ngữ lặp lại ngắt quãng (SRS).'
  },
  ai: {
    title: 'Trợ lý AI Tóm tắt',
    description: 'Cấu hình nhà cung cấp AI, nhập API Key và chọn ngôn ngữ tóm tắt.'
  },
  data: {
    title: 'Quản lý Dữ liệu & Sao lưu',
    description: 'Xuất file sao lưu, nhập lại dữ liệu hoặc xóa toàn bộ lịch sử học tập.'
  },
  'excluded-sites': {
    title: 'Danh sách Trang web loại trừ',
    description: 'Vô hiệu hóa tính năng bôi đen tra từ trên các trang web cụ thể.'
  },
  vocabulary: {
    title: 'Danh sách Từ vựng đã lưu',
    description: 'Xem toàn bộ từ vựng đã lưu cùng câu ví dụ và tiến độ ôn tập.'
  }
}

export default function OptionsApp() {
  const [activeCategory, setActiveCategory] = useState<string>('general')
  const { resolvedTheme, setTheme } = useTheme()

  const currentInfo = CATEGORY_INFO[activeCategory] ?? {
    title: 'Cài đặt',
    description: ''
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <OptionsLayout
      title='Cài đặt — English Reading Assistant'
      description='Tùy chỉnh trải nghiệm học tập và đọc tiếng Anh của bạn.'
      categories={CATEGORIES}
      activeCategory={activeCategory}
      onSelectCategory={setActiveCategory}
      headerActions={
        <button
          type='button'
          onClick={toggleTheme}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            font: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
          title={resolvedTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          aria-label='Toggle theme'
        >
          {resolvedTheme === 'dark' ? (
            <>
              <Sun size={14} /> Chế độ sáng
            </>
          ) : (
            <>
              <Moon size={14} /> Chế độ tối
            </>
          )}
        </button>
      }
    >
      <div>
        <div
          style={{
            marginBottom: 'var(--space-6)',
            paddingBottom: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)'
          }}
        >
          <h2 style={{ margin: 0, font: 'var(--text-lead)', color: 'var(--color-text-primary)' }}>
            {currentInfo.title}
          </h2>
          {currentInfo.description && (
            <p
              style={{
                margin: 'var(--space-2) 0 0',
                font: 'var(--text-secondary)',
                color: 'var(--color-text-secondary)'
              }}
            >
              {currentInfo.description}
            </p>
          )}
        </div>

        {/* Khung Placeholder cho nội dung options - Không viết form hay logic bên trong */}
        <div
          style={{
            padding: 'var(--space-8)',
            border: '1px dashed var(--color-border-strong)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-surface-sunken)',
            textAlign: 'center'
          }}
        >
          <p style={{ margin: 0, font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
            Khung hiển thị của mục <strong>{currentInfo.title}</strong>
          </p>
          <p style={{ margin: 'var(--space-2) 0 0', font: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Nội dung chi tiết và các tùy chọn của danh mục này sẽ được triển khai ở bước tiếp theo theo kế hoạch.
          </p>
        </div>
      </div>
    </OptionsLayout>
  )
}
