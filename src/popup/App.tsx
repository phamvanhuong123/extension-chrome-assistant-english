import { useState, type ReactNode } from 'react'
import { Sun, Moon, Settings, Languages, GraduationCap, Sparkles, Database, ShieldAlert, BookOpen } from 'lucide-react'
import { PopupLayout, Tooltip } from '@/shared/ui'
import layoutStyles from '@/shared/ui/layout/layout.module.css'
import { useTheme } from '@/shared/ui/theme'

interface PopupOptionCategory {
  id: string
  label: string
  icon: ReactNode
}

const POPUP_OPTIONS: PopupOptionCategory[] = [
  { id: 'learning', label: 'Ôn tập & Thẻ', icon: <GraduationCap size={18} /> },
  { id: 'vocabulary', label: 'Từ vựng đã lưu', icon: <BookOpen size={18} /> },
  { id: 'translate', label: 'Tra từ & Đọc', icon: <Languages size={18} /> },
  { id: 'ai', label: 'Trợ lý AI', icon: <Sparkles size={18} /> },
  { id: 'data', label: 'Quản lý dữ liệu', icon: <Database size={18} /> },
  { id: 'excluded-sites', label: 'Trang web loại trừ', icon: <ShieldAlert size={18} /> }
]

const OPTION_INFO: Record<string, { title: string; description: string }> = {
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
    description: 'Mục tiêu số từ ôn tập mỗi ngày và chuỗi ngày học liên tục.'
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

export default function PopupApp() {
  const [activeOption, setActiveOption] = useState<string>('learning')
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const openOptions = () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.openOptionsPage) {
        chrome.runtime.openOptionsPage(() => {
          if (chrome.runtime?.lastError) {
            const url = chrome.runtime.getURL
              ? chrome.runtime.getURL('src/options/index.html')
              : '/src/options/index.html'
            window.open(url, '_blank')
          }
        })
      } else if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
        window.open(chrome.runtime.getURL('src/options/index.html'), '_blank')
      } else {
        window.open('/src/options/index.html', '_blank')
      }
    } catch {
      window.open('/src/options/index.html', '_blank')
    }
  }

  const currentInfo = OPTION_INFO[activeOption] ?? {
    title: 'Cài đặt',
    description: ''
  }

  return (
    <PopupLayout
      title='English Reading Assistant'
      headerActions={
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tooltip
            content={resolvedTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            align='end'
            position='bottom'
          >
            <button
              type='button'
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease'
              }}
              aria-label='Toggle theme'
            >
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </Tooltip>
          <Tooltip content='Mở trang Cài đặt đầy đủ (Tab mới)' align='end' position='bottom'>
            <button
              type='button'
              onClick={openOptions}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease'
              }}
              aria-label='Open options in new tab'
            >
              <Settings size={16} />
            </button>
          </Tooltip>
        </div>
      }
      navBar={
        <ul className={layoutStyles.popupNavList}>
          {POPUP_OPTIONS.map((opt, index) => {
            const isActive = opt.id === activeOption
            const align = index === 0 ? 'start' : index === POPUP_OPTIONS.length - 1 ? 'end' : 'center'
            return (
              <li key={opt.id} className={layoutStyles.popupNavListItem}>
                <Tooltip content={opt.label} align={align} position='bottom'>
                  <button
                    type='button'
                    className={`${layoutStyles.popupNavItem} ${isActive ? layoutStyles.popupNavItemActive : ''}`.trim()}
                    onClick={(e) => {
                      setActiveOption(opt.id)
                      e.currentTarget.blur()
                    }}
                    aria-label={opt.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {opt.icon}
                  </button>
                </Tooltip>
              </li>
            )
          })}
        </ul>
      }
    >
      {/* 1. Mục Ôn tập & Thẻ (Hiển thị khối Hôm nay) */}
      {activeOption === 'learning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: 'var(--space-3)',
              background: 'var(--color-surface-sunken)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ marginBottom: '4px' }}>
              <span style={{ font: 'var(--text-section)', color: 'var(--color-text-primary)' }}>Hôm nay</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ font: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                0 tra · 0 lưu · 0 ôn · 0 ngày liên tiếp
              </span>
            </div>
            <button
              type='button'
              style={{
                width: '100%',
                height: '36px',
                padding: '0 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                font: 'var(--text-body)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, color 0.2s ease'
              }}
            >
              Hôm nay đã xong
            </button>
          </div>
        </div>
      )}

      {/* 2. Mục Từ vựng đã lưu (Hiển thị khối Từ gần đây) */}
      {activeOption === 'vocabulary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ font: 'var(--text-section)', color: 'var(--color-text-primary)' }}>Từ gần đây</span>
          </div>
          <div
            style={{
              padding: 'var(--space-6) var(--space-4)',
              border: '1px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              background: 'var(--color-surface-sunken)',
              transition: 'background-color 0.25s ease, border-color 0.25s ease'
            }}
          >
            <p style={{ margin: 0, font: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>Chưa có từ nào</p>
            <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              Bôi đen một từ trên trang web để tra và lưu từ vựng.
            </p>
          </div>
        </div>
      )}

      {/* 3. Các mục Cài đặt khác: General, Translate, AI, Data, Excluded-sites (Chưa viết form chi tiết theo đúng cam kết) */}
      {activeOption !== 'learning' && activeOption !== 'vocabulary' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <h3 style={{ margin: 0, font: 'var(--text-lead)', color: 'var(--color-text-primary)' }}>
              {currentInfo.title}
            </h3>
            {currentInfo.description && (
              <p
                style={{
                  margin: 'var(--space-1) 0 0',
                  font: 'var(--text-secondary)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {currentInfo.description}
              </p>
            )}
          </div>

          <div
            style={{
              padding: 'var(--space-5) var(--space-4)',
              border: '1px dashed var(--color-border-strong)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-sunken)',
              textAlign: 'center'
            }}
          >
            <p style={{ margin: 0, font: 'var(--text-body)', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              Khung hiển thị của mục {currentInfo.title}
            </p>
            <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              Nội dung cài đặt chi tiết sẽ được triển khai ở bước tiếp theo theo kế hoạch.
            </p>
          </div>
        </div>
      )}
    </PopupLayout>
  )
}
