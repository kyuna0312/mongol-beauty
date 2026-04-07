import { ErrorDisplay } from '@/components/ErrorDisplay';

export function NotFoundPage() {
  return (
    <ErrorDisplay
      title="Хуудас олдсонгүй"
      message="Таны нээсэн хаяг буруу эсвэл хуудас зөөгдсөн байж магадгүй."
      actionLabel="Нүүр хуудас руу очих"
      showRem={false}
      showRam={false}
      showSearch={true}
      showBack={true}
      showRetry={false}
      searchPlaceholder="Бүтээгдэхүүн хайх..."
    />
  );
}
