import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#20221F] rounded-2xl border border-[#E8E7E0] dark:border-[#2E302B] shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto transform transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-xl font-bold text-[#262626] dark:text-[#F3F3F0] tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-[#747474] dark:text-[#A0A09B] mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#747474] dark:text-[#A0A09B] hover:text-[#262626] dark:hover:text-white hover:bg-[#F5F5F2] dark:hover:bg-[#292B28] transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF7058] focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};
