interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="h-topbar-height fixed top-0 right-0 left-0 md:left-sidebar-width z-20 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline-variant flex justify-between items-center px-gutter w-full md:w-[calc(100%-var(--spacing-sidebar-width))]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-primary text-[16px]">payments</span>
          $1 = 36.50 Bs
        </div>
        <button className="text-on-surface-variant hover:text-primary transition-colors relative cursor-pointer">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
          <span className="material-symbols-outlined">help</span>
        </button>
        <div className="h-8 w-px bg-outline-variant mx-2"></div>
        <button className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors cursor-pointer">
          <img
            alt="Manager Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnpkkTUiXDAunU1ft8A4rQaYG3K3iakxbnNap_gmrZ1TI5vznT60okq3RCcCUO9Ok7M7-DbWoW3xWzpbQ9w1374FhNt6jSZ8uJEhwdxI9kMFfTrJDjre--oJhqexTh7KlKKfpqGPGa_9L8b4ue-3gmXhJZbUrSWr5qAmKLMfGTNomERMFVwPwoyFzHcJ80IBRfMYmtNI3H2c806CLKqm8lLTBuDk_WssFaDNREyeipjeRmOtslFa24-KgNhK6I2KRpJc49j1ull7Q"
          />
        </button>
      </div>
    </header>
  );
}