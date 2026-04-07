import { gql, useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, HelpCircle, Package, RotateCcw, Shield, Truck } from 'lucide-react';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { InfoPagesNav } from '../components/InfoPagesNav';
import { PageHead } from '../components/PageHead';
import { MarkdownProse } from '../components/MarkdownProse';
import { FadeInSection } from '@/features/shared/components/FadeInSection';

const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!) {
    page(slug: $slug) {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      updatedAt
    }
  }
`;

export type PolicyContentSlug = 'privacy' | 'shipping' | 'returns' | 'faq';

interface PolicyContentPageProps {
  slug: PolicyContentSlug;
}

const SLUG_UI: Record<
  PolicyContentSlug,
  {
    eyebrow: string;
    blurb: string;
    icon: LucideIcon;
    heroClass: string;
    blobA: string;
    blobB: string;
  }
> = {
  faq: {
    eyebrow: 'Тусламж',
    blurb: 'Түгээмэл асуулт, хариулт — хурдан ойлголцох зориулалттай.',
    icon: HelpCircle,
    heroClass:
      'border-rose-100/80 bg-gradient-to-br from-[#fff8fa] via-[#fce8f0] to-[#f3e8ff]',
    blobA: 'from-pink-200/45 to-rose-200/25',
    blobB: 'from-violet-200/35 to-fuchsia-100/25',
  },
  shipping: {
    eyebrow: 'Хүргэлт',
    blurb: 'Хүргэлтийн хугацаа, төлбөр, бүс нутаг — тодорхой мэдээлэл.',
    icon: Truck,
    heroClass:
      'border-sky-100/80 bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#fce7f3]',
    blobA: 'from-sky-200/50 to-cyan-100/30',
    blobB: 'from-amber-100/45 to-rose-100/30',
  },
  returns: {
    eyebrow: 'Буцаалт',
    blurb: 'Буцаалт, солилцох нөхцөл — таны эрх, бидний процесс.',
    icon: RotateCcw,
    heroClass:
      'border-amber-100/85 bg-gradient-to-br from-[#fffbeb] via-[#fef3c7] to-[#fce7f3]',
    blobA: 'from-amber-200/45 to-orange-100/30',
    blobB: 'from-rose-100/40 to-pink-100/25',
  },
  privacy: {
    eyebrow: 'Нууцлал',
    blurb: 'Өгөгдөл, аюулгүй байдал — ил тод, хариуцлагатай.',
    icon: Shield,
    heroClass:
      'border-violet-100/85 bg-gradient-to-br from-[#f5f3ff] via-[#ede9fe] to-[#fce7ec]',
    blobA: 'from-violet-200/40 to-indigo-100/30',
    blobB: 'from-fuchsia-100/35 to-rose-100/25',
  },
};

function ContentLoadingSkeleton() {
  return (
    <div className="mb-page pb-14">
      <div className="mb-8 h-48 animate-pulse rounded-[1.85rem] bg-gradient-to-br from-stone-100 to-rose-50/50 md:h-52" />
      <div className="mb-card-surface p-6 md:p-10">
        <div className="mb-6 h-9 w-2/3 max-w-md rounded-lg bg-stone-200/90" />
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-stone-200/80" />
          <div className="h-4 w-[92%] rounded bg-stone-200/80" />
          <div className="h-4 w-[88%] rounded bg-stone-200/80" />
          <div className="h-4 w-full rounded bg-stone-200/70" />
          <div className="h-4 w-3/4 rounded bg-stone-200/70" />
        </div>
      </div>
    </div>
  );
}

function ContentNotFound({ slug }: { slug: PolicyContentSlug }) {
  const ui = SLUG_UI[slug];
  return (
    <div className="mb-page pb-14">
      <div
        className={`mb-8 overflow-hidden rounded-[1.85rem] border px-6 py-12 text-center md:px-10 ${ui.heroClass}`}
      >
        <ui.icon className="mx-auto mb-4 h-12 w-12 text-primary-600/80" strokeWidth={1.5} />
        <h1 className="font-display text-2xl font-semibold text-stone-800">Хуудас олдсонгүй</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-stone-600">
          Энэ агуулга одоогоор системд бүртгэгдээгүй байна. Админ хэсгээс нэмж болно.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="mb-btn-primary px-6 py-3 text-[15px]">
            Нүүр хуудас
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-white/80 px-6 py-3 text-[15px] font-semibold text-stone-700 shadow-sm hover:bg-white"
          >
            Бүтээгдэхүүн
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <InfoPagesNav current={slug} />
    </div>
  );
}

function BottomCta({ slug }: { slug: PolicyContentSlug }) {
  if (slug === 'faq') {
    return (
      <FadeInSection className="mt-10" delay={0.08}>
        <div className="rounded-[1.35rem] border border-rose-100/90 bg-gradient-to-r from-rose-50/90 to-amber-50/50 px-6 py-8 text-center md:px-10">
          <Package className="mx-auto mb-3 h-9 w-9 text-primary-500" strokeWidth={1.5} />
          <p className="font-display text-lg font-semibold text-stone-800">Бүтээгдэхүүн сонгох уу?</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
            Коллекцаа үзэж, өөртөө тохирохыг олоорой.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-primary-900/10 transition hover:bg-primary-600"
          >
            Дэлгүүр рүү
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeInSection>
    );
  }
  if (slug === 'shipping' || slug === 'returns') {
    return (
      <FadeInSection className="mt-10" delay={0.08}>
        <div className="rounded-[1.35rem] border border-sky-100/80 bg-gradient-to-br from-sky-50/80 to-white px-6 py-8 text-center md:px-10">
          <p className="font-display text-lg font-semibold text-stone-800">Захиалгын төлөвөө үзэх</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
            Нэвтэрсэн үед захиалгаа хянах боломжтой.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl border border-rose-200/80 bg-white px-6 py-3 text-sm font-semibold text-stone-700 shadow-sm hover:bg-rose-50/80"
            >
              Нэвтрэх
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600"
            >
              FAQ
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </FadeInSection>
    );
  }
  return (
    <FadeInSection className="mt-10" delay={0.08}>
      <div className="rounded-[1.35rem] border border-violet-100/90 bg-gradient-to-br from-violet-50/60 to-white px-6 py-8 text-center md:px-10">
        <p className="font-display text-lg font-semibold text-stone-800">Асуулт байна уу?</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-600">
          Түгээмэл асуултаас хайж, эсвэл бидэнтэй холбогдоно уу.
        </p>
        <Link
          to="/faq"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary-500 px-7 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600"
        >
          FAQ үзэх
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </FadeInSection>
  );
}

/**
 * Shared layout for CMS-driven policy/help pages. Prefer route-level wrappers
 * (`FaqPage`, `ShippingPage`, …) so each URL is a separate lazy-loaded page.
 */
export function PolicyContentPage({ slug }: PolicyContentPageProps) {
  const ui = SLUG_UI[slug];
  const { data, loading, error, refetch } = useQuery(GET_PAGE_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (loading && !data?.page) {
    return <ContentLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="mb-page">
        <ErrorDisplay
          title="Агуулга ачаалахад алдаа гарлаа"
          message="Сүлжээ эсвэл серверт түр саатал гарсан байж магадгүй. Дахин оролдоно уу."
          showRam={false}
          showSearch={false}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  const page = data?.page;
  if (!page) {
    return <ContentNotFound slug={slug} />;
  }

  const canonicalPath = `/${slug}`;
  const canonicalUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : undefined;

  const updated = page.updatedAt ? new Date(page.updatedAt) : null;
  const updatedLabel =
    updated && !Number.isNaN(updated.getTime())
      ? updated.toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' })
      : null;

  return (
    <div className="mb-page pb-16 md:pb-20">
      <PageHead
        pageTitle={page.title}
        metaTitle={page.metaTitle}
        metaDescription={page.metaDescription}
        contentMarkdown={page.content}
        canonicalUrl={canonicalUrl}
        ogType="article"
      />

      <header
        className={`relative mb-8 overflow-hidden rounded-[1.85rem] border px-6 py-10 md:mb-10 md:px-10 md:py-12 ${ui.heroClass}`}
      >
        <div
          className={`pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-gradient-to-br ${ui.blobA} blur-3xl`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-gradient-to-tr ${ui.blobB} blur-3xl`}
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mb-4 flex flex-col items-center gap-3 md:flex-row md:items-start md:gap-5"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/75 p-3 shadow-sm ring-1 ring-white/80 md:h-16 md:w-16">
              <ui.icon className="h-full w-full text-primary-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-section-eyebrow text-primary-600/90">{ui.eyebrow}</p>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-stone-800 md:text-3xl lg:text-[2.1rem]">
                {page.title}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-stone-600 md:text-base">
                {ui.blurb}
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      <FadeInSection>
        <article className="mb-card-surface overflow-hidden p-6 md:p-10">
          <MarkdownProse markdown={page.content} />
          {updatedLabel ? (
            <p className="mt-10 border-t border-rose-100/80 pt-6 text-xs text-stone-400">
              Сүүлд шинэчилсэн: {updatedLabel}
            </p>
          ) : null}
        </article>
      </FadeInSection>

      <BottomCta slug={slug} />

      <FadeInSection delay={0.06}>
        <InfoPagesNav current={slug} />
      </FadeInSection>
    </div>
  );
}
