import { BookOpen, Lamp, Laptop, Coffee, Watch, Palette, Monitor, Gift } from 'lucide-react';
import type { Category } from '@/types';
import type { LucideIcon } from 'lucide-react';

export const categoryIcons: Record<string, LucideIcon> = {
  'goc-hoc-tap': BookOpen,
  'decor-phong': Lamp,
  'cong-nghe': Laptop,
  'doi-song': Coffee,
  'phu-kien': Watch,
  'ca-nhan-hoa': Palette,
  'setup-ban': Monitor,
  'qua-tang': Gift,
};

export const categories: Category[] = [
  { id: '1', slug: 'goc-hoc-tap', name: 'Góc học tập', icon: 'BookOpen', description: 'Sách, vở, bút, dụng cụ học tập essential' },
  { id: '2', slug: 'decor-phong', name: 'Decor phòng', icon: 'Lamp', description: 'Trang trí phòng trọ, ký túc xá' },
  { id: '3', slug: 'cong-nghe', name: 'Công nghệ', icon: 'Laptop', description: 'Tai nghe, sạc, phụ kiện công nghệ' },
  { id: '4', slug: 'doi-song', name: 'Đời sống', icon: 'Coffee', description: 'Đồ dùng sinh hoạt hằng ngày' },
  { id: '5', slug: 'phu-kien', name: 'Phụ kiện', icon: 'Watch', description: 'Túi, ví, đồng hồ và phụ kiện thời trang' },
  { id: '6', slug: 'ca-nhan-hoa', name: 'Cá nhân hóa', icon: 'Palette', description: 'Quà tặng khắc tên, in hình cá nhân' },
  { id: '7', slug: 'setup-ban', name: 'Setup bàn', icon: 'Monitor', description: 'Tạo góc học tập và làm việc lý tưởng' },
  { id: '8', slug: 'qua-tang', name: 'Quà tặng', icon: 'Gift', description: 'Quà tặng ý nghĩa cho bạn bè, người thân' },
];
