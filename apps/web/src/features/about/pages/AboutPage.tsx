import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Heart,
  Leaf,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { InfoPagesNav } from '@/features/content/components/InfoPagesNav';
import { PageHead } from '@/features/content/components/PageHead';
import { MarkdownProse } from '@/features/content/components/MarkdownProse';
import { FadeInSection } from '@/features/shared/components/FadeInSection';
import { GET_PAGE_ABOUT } from '@/graphql/queries';

const FALLBACK_MARKDOWN = `## Сайн байна уу

Бид **INCELLDERM Mongolia** — таны арьс болон гоо сайхны аялалд итгэлт түнш.

### Юу хийдэг вэ?

- Албан ёсны бүтээгдэхүүний *шинэчлэгдсэн* жагсаалт
- Танд тохирох зөвлөгөө, үнэн зөв мэдээлэл

> Чанар бол зөвхөн бүтээгдэхүүн биш — бидний амлалт юм.

### Холбоос

- [Бүтээгдэхүүн үзэх](/products)
- [Түгээмэл асуулт](/faq)

Жишээ код (хөгжүүлэгчдэд):

\`\`\`bash
# Сонирхолтой коллекц
curl -s https://example.com/health
\`\`\`
`;

const VALUES: Array<{
  icon: typeof Heart;
  title: string;
  body: string;
  accent: string;
}> = [
  {
    icon: Heart,
    title: 'Хэрэглэгч төвтэй',
    body: 'Таны сэтгэл ханамж, итгэл — бидний өдөр тутмын зорилго.',
    accent: 'from-primary-100/90 to-primary-50/50',
  },
  {
    icon: Shield,
    title: 'Итгэлцэл',
    body: 'Албан эх сурвалж, тодорхой үнэ, нээлттэй мэдээлэл.',
    accent: 'from-violet-100/80 to-fuchsia-50/40',
  },
  {
    icon: Leaf,
    title: 'Хариуцлага',
    body: 'Бүтээгдэхүүний сонголт, савлага зөвлөмжийг ухамсартайгаар.',
    accent: 'from-emerald-100/70 to-teal-50/40',
  },
];

export function AboutPage() {
  const { data, loading } = useQuery(GET_PAGE_ABOUT, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const page = data?.page;
  const title = page?.title?.trim() || 'Бидний тухай';
  const markdown = page?.content?.trim() || FALLBACK_MARKDOWN;

  return (
    <div className="mb-page pb-16 md:pb-24">
      <PageHead
        pageTitle={title}
        metaTitle={page?.metaTitle ?? undefined}
        metaDescription={page?.metaDescription ?? undefined}
        contentMarkdown={markdown}
        canonicalUrl={typeof window !== 'undefined' ? `${window.location.origin}/about` : undefined}
        ogType="article"
      />

      {/* Hero */}
      <header className="relative mb-12 overflow-hidden rounded-[1.85rem] border border-primary-100/80 bg-gradient-to-br from-primary-50 via-[#f3f8f5] to-[#e8e0f4] px-6 py-14 shadow-soft md:mb-16 md:px-12 md:py-20">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-pink-200/40 to-violet-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-100/50 to-primary-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-section-eyebrow text-primary-600/90"
          >
            INCELLDERM · Mongolia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="font-display text-3xl font-semibold tracking-tight text-stone-800 md:text-4xl lg:text-[2.65rem] lg:leading-tight"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-stone-600 md:text-lg"
          >
            Зөөлөн өнгө, цэвэрхий зай, таны өдөр тутамд зориулсан орчин үеийн дэлгүүр — гоо сайхны
            мэдлэгийг хялбар, ойлгомжтой хүргэнэ.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/products"
              className="mb-btn-primary group inline-flex items-center gap-2 px-7 py-3.5 text-[15px]"
            >
              Бүтээгдэхүүн үзэх
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-2xl border border-primary-200/80 bg-white/70 px-6 py-3.5 text-[15px] font-semibold text-stone-700 shadow-sm backdrop-blur-sm transition hover:border-primary-200 hover:bg-white hover:text-primary-700"
            >
              <Sparkles className="h-4 w-4 text-primary-500" />
              Түгээмэл асуулт
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Mission */}
      <FadeInSection className="mb-12 md:mb-16">
        <div className="mb-card-surface relative overflow-hidden p-6 md:p-10">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-primary-100/35 blur-2xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 shadow-inner ring-1 ring-primary-100/80">
              <Users className="h-8 w-8 text-primary-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="mb-section-eyebrow">Эрхэм зорилго</p>
              <h2 className="font-display text-xl font-semibold text-stone-800 md:text-2xl">
                Гоо сайхны мэдлэгийг хүн бүрт хүртээмжтэй болгох
              </h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600 md:text-base">
                Бид зөвхөн бүтээгдэхүүн борлуулах биш — таны арьсны хэрэгцээнд нийцсэн сонголт, үнэн
                мэдээллээр дэмжлэг үзүүлэхийг зорьдог. Таны итгэл бидний хамгийн үнэт зүйл.
              </p>
            </div>
          </div>
        </div>
      </FadeInSection>

      {/* Values */}
      <FadeInSection className="mb-12 md:mb-16" delay={0.06}>
        <p className="mb-section-eyebrow text-center">Бидний үнэ цэнэ</p>
        <h2 className="font-display mb-8 text-center text-xl font-semibold text-stone-800 md:text-2xl">
          Нэг алхам бүрт анхааралтай
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v) => (
            <li key={v.title}>
              <motion.article
                initial={false}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className={`mb-card-surface group h-full border border-primary-100/70 bg-gradient-to-br ${v.accent} p-6 transition-shadow duration-300 hover:shadow-md hover:shadow-primary-100/60`}
              >
                <div className="mb-4 inline-flex rounded-xl bg-white/80 p-2.5 text-primary-600 shadow-sm ring-1 ring-primary-100/60 transition group-hover:scale-105">
                  <v.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <h3 className="font-display text-lg font-semibold text-stone-800">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 md:text-[15px]">{v.body}</p>
              </motion.article>
            </li>
          ))}
        </ul>
      </FadeInSection>

      {/* Markdown story (CMS or fallback) */}
      <FadeInSection className="mb-10" delay={0.1}>
        <div className="mb-card-surface p-6 md:p-10">
          <div className="mb-6 flex flex-col gap-2 border-b border-primary-100/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-section-eyebrow">Түүхэн тойм</p>
              <h2 className="font-display text-xl font-semibold text-stone-800 md:text-2xl">
                Дэлгэрэнгүй мэдээлэл
              </h2>
            </div>
            {loading ? (
              <span className="text-xs font-medium text-stone-400">Ачаалж байна…</span>
            ) : page ? (
              <span className="text-xs text-stone-400">Админ панелаас засварлагдсан</span>
            ) : (
              <span className="text-xs text-amber-700/80">Анхны агуулга (хуудас олдсонгүй)</span>
            )}
          </div>
          <MarkdownProse markdown={markdown} />
        </div>
      </FadeInSection>

      {/* Bottom CTA */}
      <FadeInSection delay={0.12}>
        <div className="relative overflow-hidden rounded-[1.85rem] border border-primary-100/90 bg-gradient-to-r from-primary-500/95 via-primary-600 to-primary-700 px-6 py-10 text-center text-white shadow-lg shadow-primary-900/10 md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(255,255,255,0.25),transparent)]" />
          <div className="relative">
            <h2 className="font-display text-xl font-semibold md:text-2xl">Бэлэн үү?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-white/90 md:text-base">
              Коллекцаа үзэж, өөртөө тохирох бүтээгдэхүүнийг олоорой.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-[15px] font-semibold text-primary-700 shadow-md transition hover:bg-primary-50 hover:shadow-lg"
            >
              Дэлгүүр рүү
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection className="mt-12" delay={0.06}>
        <InfoPagesNav current="about" />
      </FadeInSection>
    </div>
  );
}
