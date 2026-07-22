"use client";

import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/es";
import type { TFunction } from "i18next";
import Link from "next/link";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import {
  ArrowUpRightIcon,
  type ArrowUpRightIconHandle,
} from "lucide-animated";
import {
  Calendar1,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CircleCheck,
  Landmark,
  ListTodo,
  Percent,
  SquareChartGantt,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const homeCards = [
  {
    className: "",
    variant: "dueToday",
  },
  {
    className: "",
    variant: "dueWeek",
  },
  {
    className: "bg-surface-container-lowest lg:col-span-2 lg:row-span-2",
    variant: "totalDue",
  },
  {
    className: "",
    variant: "dueMonth",
  },
  {
    className: "",
    variant: "pendingProgress",
  },
  {
    className: "bg-surface-container-lowest lg:row-span-2",
    variant: "totalPaid",
  },
  {
    className: "bg-surface-container-lowest lg:col-span-2 lg:row-span-2",
    variant: "upcomingPayments",
  },
  {
    className: "bg-surface-container-lowest lg:row-span-2",
    variant: "calendar",
  },
];

export function InicioContent() {
  return (
    <section
      aria-label="Inicio"
      className="grid min-h-0 flex-1 grid-cols-1 auto-rows-auto gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-4 lg:auto-rows-fr"
    >
      {homeCards.map((card, index) => {
        const cardClassName = `rounded-2xl shadow-[0_1px_3px_rgb(13_13_18/0.06),0_1px_2px_rgb(13_13_18/0.04)] ${card.className}`;

        if (
          card.variant === "dueToday" ||
          card.variant === "dueWeek" ||
          card.variant === "dueMonth"
        ) {
          const summaryCard = dueSummaryCards[card.variant];

          return (
            <article
              className={`${cardClassName} relative isolate flex min-h-[172px] flex-col justify-between overflow-hidden p-4 sm:p-5 lg:min-h-0`}
              key={`inicio-card-${index}`}
              style={{
                backgroundColor: `var(${summaryCard.backgroundVar})`,
                color: `var(${summaryCard.foregroundVar})`,
              }}
            >
              <HomeDueSummaryCard variant={card.variant} />
            </article>
          );
        }

        if (card.variant === "pendingProgress") {
          return (
            <article
              className={`${cardClassName} flex min-h-[172px] flex-col justify-between overflow-hidden p-4 sm:p-5 lg:min-h-0`}
              key={`inicio-card-${index}`}
              style={{
                backgroundColor: "var(--inicio-card-4)",
                color: "var(--inicio-card-4-fg)",
              }}
            >
              <HomePendingProgress />
            </article>
          );
        }

        if (card.variant === "calendar") {
          return (
            <article
              className={`${cardClassName} flex min-h-0 flex-col overflow-hidden p-4 sm:p-5`}
              key={`inicio-card-${index}`}
            >
              <HomeCalendarCard />
            </article>
          );
        }

        if (card.variant === "totalDue") {
          return (
            <article
              className={`${cardClassName} flex min-h-[340px] flex-col overflow-hidden p-5 sm:min-h-[320px] sm:p-6 lg:min-h-0`}
              key={`inicio-card-${index}`}
            >
              <HomeTotalDue />
            </article>
          );
        }

        if (card.variant === "totalPaid") {
          return (
            <article
              className={`${cardClassName} flex min-h-0 flex-col overflow-hidden p-4 sm:p-5`}
              key={`inicio-card-${index}`}
            >
              <HomeTotalPaid />
            </article>
          );
        }

        if (card.variant === "upcomingPayments") {
          return (
            <article
              className={`${cardClassName} flex min-h-0 flex-col overflow-hidden p-4 sm:p-5`}
              key={`inicio-card-${index}`}
            >
              <HomeUpcomingPayments />
            </article>
          );
        }

        return (
          <article
            aria-hidden="true"
            className={cardClassName}
            key={`inicio-card-${index}`}
          />
        );
      })}
    </section>
  );
}

const paidSummaryItems = [
  {
    amount: 12500,
    paidPercent: 70,
    titleKey: "inicio.totalPaid.items.housing",
  },
  {
    amount: 2200,
    paidPercent: 65,
    titleKey: "inicio.totalPaid.items.services",
  },
  {
    amount: 1850,
    paidPercent: 50,
    titleKey: "inicio.totalPaid.items.insurance",
  },
  {
    amount: 1200,
    paidPercent: 60,
    titleKey: "inicio.totalPaid.items.subscriptions",
  },
  {
    amount: 4800,
    paidPercent: 55,
    titleKey: "inicio.totalPaid.items.education",
  },
] as const;

const dueSummaryCards = {
  dueToday: {
    amount: 8450,
    backgroundVar: "--inicio-card-1",
    foregroundVar: "--inicio-card-1-fg",
    icon: Calendar1,
    labelKey: "inicio.summaryCards.today.label",
    showMonth: true,
    valueKind: "today",
  },
  dueWeek: {
    amount: 11650.5,
    backgroundVar: "--inicio-card-2",
    foregroundVar: "--inicio-card-2-fg",
    icon: CalendarRange,
    labelKey: "inicio.summaryCards.week.label",
    showMonth: true,
    valueKind: "week",
  },
  dueMonth: {
    amount: 22550,
    backgroundVar: "--inicio-card-3",
    foregroundVar: "--inicio-card-3-fg",
    icon: CalendarClock,
    labelKey: "inicio.summaryCards.month.label",
    showMonth: false,
    valueKind: "month",
  },
} as const satisfies Record<
  "dueMonth" | "dueToday" | "dueWeek",
  {
    amount: number;
    backgroundVar: string;
    foregroundVar: string;
    icon: LucideIcon;
    labelKey: string;
    showMonth: boolean;
    valueKind: "month" | "today" | "week";
  }
>;

function HomeDueSummaryCard({
  variant,
}: {
  variant: keyof typeof dueSummaryCards;
}) {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const card = dueSummaryCards[variant];
  const Icon = card.icon;
  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const monthLabel = formatCurrentMonth(today, language);
  const periodValue =
    card.valueKind === "today"
      ? formatCurrentDay(today, language, t)
      : card.valueKind === "week"
        ? formatShortCurrentWeek(today, t)
        : formatCurrentMonthName(today, language);

  const cardBackground = `var(${card.backgroundVar})`;
  const cardForeground = `var(${card.foregroundVar})`;

  return (
    <>
      <DueSummaryDecorativeShape variant={variant} />

      <div className="relative z-10 flex items-start justify-between gap-2">
        <h2 className="font-heading text-base font-bold leading-6 sm:text-lg">
          {t("inicio.totalDue.title")}
        </h2>
        {card.showMonth ? (
          <p className="pt-1 text-right text-xs font-bold leading-5 sm:text-sm">
            {monthLabel}
          </p>
        ) : null}
      </div>

      <div className="relative z-10 flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-xl lg:size-10"
          style={{
            backgroundColor: cardForeground,
            color: cardBackground,
          }}
        >
          <Icon className="size-7 lg:size-6" strokeWidth={2.6} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase leading-4 opacity-90">
            {t(card.labelKey)}
          </p>
          <p className="truncate font-heading text-xl font-bold leading-7 lg:text-lg lg:leading-6">
            {periodValue}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex justify-end">
        <span
          className="inline-flex max-w-full rounded-full px-3 py-1 font-heading text-base font-bold leading-5 tabular-nums lg:px-2.5 lg:py-0.5"
          style={{
            backgroundColor: cardForeground,
            color: cardBackground,
          }}
        >
          ${amountFormatter.format(card.amount)}
        </span>
      </div>
    </>
  );
}

function DueSummaryDecorativeShape({
  variant,
}: {
  variant: keyof typeof dueSummaryCards;
}) {
  const opacityClassName =
    variant === "dueToday"
      ? "opacity-[0.14] dark:opacity-[0.16]"
      : variant === "dueWeek"
        ? "opacity-[0.06] dark:opacity-[0.09]"
        : "opacity-[0.08] dark:opacity-[0.1]";

  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-2 right-4 z-0 size-36 rotate-[10deg] select-none bg-[#ffffff] dark:bg-[#07090b] ${opacityClassName}`}
      style={{
        WebkitMaskImage: "url('/graphics/due-summary-coins.svg')",
        WebkitMaskPosition: "center",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskImage: "url('/graphics/due-summary-coins.svg')",
        maskPosition: "center",
        maskRepeat: "no-repeat",
        maskSize: "contain",
      }}
    />
  );
}

function HomePendingProgress() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const totalDue = 22550;
  const pendingAmount = 8085;
  const progress = Math.round((pendingAmount / totalDue) * 100);
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const progressBoundaryAngle = 180 - (clampedProgress / 100) * 180;
  const trackArcPath = describeSemiCircleArc(120, 104, 92, 180, 0);
  const progressArcPath =
    clampedProgress > 0
      ? describeSemiCircleArc(120, 104, 92, 180, progressBoundaryAngle)
      : null;
  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-heading text-base font-bold leading-6 sm:text-lg">
          {t("inicio.summaryCards.progress.title")}
        </h2>
        <p className="max-w-[44%] pt-1 text-right text-xs font-bold leading-5 sm:text-sm">
          {formatCurrentMonth(today, language)}
        </p>
      </div>

      <div className="relative -mx-3 mt-auto h-[132px] sm:-mx-4 sm:h-[148px] lg:-mx-5 lg:h-[120px]">
        <svg
          aria-label={t("inicio.summaryCards.progress.ariaLabel", {
            percent: progress,
          })}
          className="mx-auto h-full w-full max-w-[320px]"
          role="img"
          viewBox="0 0 240 132"
        >
          <path
            aria-hidden="true"
            d={trackArcPath}
            fill="none"
            stroke="var(--inicio-card-progress-track)"
            strokeLinecap="round"
            strokeWidth="18"
          />
          {progressArcPath ? (
            <path
              aria-hidden="true"
              d={progressArcPath}
              fill="none"
              stroke="var(--inicio-card-progress-fill)"
              strokeLinecap="round"
              strokeWidth="18"
            />
          ) : null}
          <text
            className="text-[13px] font-bold"
            fill="var(--inicio-card-4-fg)"
            textAnchor="middle"
            x="28"
            y="128"
          >
            0
          </text>
          <text
            className="text-[13px] font-bold"
            fill="var(--inicio-card-4-fg)"
            textAnchor="middle"
            x="212"
            y="128"
          >
            100
          </text>
          <text
            className="font-heading text-[20px] font-bold"
            fill="var(--inicio-card-4-fg)"
            textAnchor="middle"
            x="120"
            y="78"
          >
            ${amountFormatter.format(pendingAmount)}
          </text>
          <text
            className="text-[13px] font-semibold"
            fill="var(--inicio-card-4-fg)"
            textAnchor="middle"
            x="120"
            y="96"
          >
            {t("inicio.summaryCards.progress.pending")}
          </text>
        </svg>
      </div>
    </>
  );
}

const totalDueChartColors = [
  "var(--total-due-chart-1)",
  "var(--total-due-chart-2)",
  "var(--total-due-chart-3)",
  "var(--total-due-chart-4)",
  "var(--total-due-chart-5)",
] as const;

function getDonutPoint(radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;

  return {
    x: 50 + radius * Math.cos(angleInRadians),
    y: 50 + radius * Math.sin(angleInRadians),
  };
}

function getDonutSegmentPath(startPercent: number, endPercent: number) {
  const startAngle = startPercent * 3.6 - 90;
  const endAngle = endPercent * 3.6 - 90;
  const outerRadius = 48;
  const innerRadius = 28;
  const largeArcFlag = endPercent - startPercent > 50 ? 1 : 0;
  const outerStart = getDonutPoint(outerRadius, startAngle);
  const outerEnd = getDonutPoint(outerRadius, endAngle);
  const innerEnd = getDonutPoint(innerRadius, endAngle);
  const innerStart = getDonutPoint(innerRadius, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function HomeTotalDue() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const detailsIconRef = useRef<ArrowUpRightIconHandle>(null);
  const [hoveredDueCategory, setHoveredDueCategory] = useState<string | null>(
    null,
  );
  const totalDue = paidSummaryItems.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const compactAmountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  });
  const percentFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
    style: "percent",
  });
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });
  const totalDueItems = paidSummaryItems.reduce<
    Array<{
      color: string;
      item: (typeof paidSummaryItems)[number];
      path: string;
      percent: number;
    }>
  >((items, item, index) => {
    const percent = (item.amount / totalDue) * 100;
    const previousPercent = items.reduce(
      (total, current) => total + current.percent,
      0,
    );

    return [
      ...items,
      {
        color: totalDueChartColors[index] ?? "var(--total-due-chart-1)",
        item,
        path: getDonutSegmentPath(previousPercent, previousPercent + percent),
        percent,
      },
    ];
  }, []);

  useEffect(() => {
    if (hoveredDueCategory === null) {
      return;
    }

    function clearOnOutsidePress(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Element &&
        target.closest("[data-total-due-segment='true']")
      ) {
        return;
      }

      setHoveredDueCategory(null);
    }

    document.addEventListener("pointerdown", clearOnOutsidePress);

    return () => {
      document.removeEventListener("pointerdown", clearOnOutsidePress);
    };
  }, [hoveredDueCategory]);

  return (
    <>
      <div className="mb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 pt-1">
            <SquareChartGantt
              aria-hidden="true"
              className="size-5 shrink-0 text-on-surface sm:size-6"
              strokeWidth={2.3}
            />
            <h2 className="font-heading text-lg font-bold leading-6 text-on-surface sm:text-xl">
              {t("inicio.totalDue.distributionTitle")}
            </h2>
          </div>

          <Link
            href="/estadisticas"
            onMouseEnter={() => detailsIconRef.current?.startAnimation()}
            onMouseLeave={() => detailsIconRef.current?.stopAnimation()}
            onFocus={() => detailsIconRef.current?.startAnimation()}
            onBlur={() => detailsIconRef.current?.stopAnimation()}
            className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-[11px] font-semibold leading-none text-primary-foreground shadow-[0_3px_5px_-1px_rgb(0_0_0/0.08),0_1px_3px_-2px_rgb(0_0_0/0.08)] transition-[background-color,box-shadow] hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-7 sm:px-3"
          >
            <span>{t("inicio.detailsCta")}</span>
            <ArrowUpRightIcon
              ref={detailsIconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="shrink-0"
              size={13}
            />
          </Link>
        </div>

        <div aria-hidden="true" className="mt-3 h-px w-full bg-border" />

        <p className="mt-2 text-left text-xs font-bold leading-5 text-on-surface sm:text-sm">
          {monthFormatter.format(today.toDate())}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-center gap-5 md:grid-cols-[minmax(210px,0.72fr)_minmax(320px,1fr)] lg:gap-5">
        <div className="flex min-h-0 items-center justify-center md:justify-start">
          <div className="relative aspect-square w-full max-w-[210px] sm:max-w-[230px] lg:max-w-[248px]">
            <svg
              aria-label={t("inicio.totalDue.chartLabel", {
                total: amountFormatter.format(totalDue),
              })}
              className="size-full"
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setHoveredDueCategory(null);
                }
              }}
              role="img"
              viewBox="0 0 100 100"
            >
              <circle
                aria-hidden="true"
                className="stroke-surface-container-high"
                cx="50"
                cy="50"
                fill="none"
                r="38"
                strokeWidth="20"
              />
              {totalDueItems.map(({ color, item, path }) => {
                return (
                  <path
                    aria-hidden="true"
                    className="cursor-pointer transition-opacity duration-700 ease-in-out hover:opacity-90"
                    data-total-due-segment="true"
                    d={path}
                    fill={color}
                    key={item.titleKey}
                    onPointerDown={() => setHoveredDueCategory(item.titleKey)}
                    onPointerEnter={() => setHoveredDueCategory(item.titleKey)}
                  />
                );
              })}
              <circle
                aria-hidden="true"
                cx="50"
                cy="50"
                fill="transparent"
                onPointerDown={() => setHoveredDueCategory(null)}
                onPointerEnter={() => setHoveredDueCategory(null)}
                r="28"
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
              <p className="font-heading text-lg font-bold leading-6 text-on-surface sm:text-xl">
                ${compactAmountFormatter.format(totalDue)}
              </p>
              <p className="max-w-20 text-[10px] font-semibold leading-3 text-on-surface-variant sm:max-w-24 sm:text-xs sm:leading-4">
                {t("inicio.totalDue.sumLabel")}
              </p>
            </div>
          </div>
        </div>

        <table className="w-full table-fixed border-collapse pr-1 text-sm text-on-surface md:pr-3">
          <caption className="sr-only">
            {t("inicio.totalDue.tableCaption")}
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t("inicio.totalDue.columns.category")}</th>
              <th scope="col">{t("inicio.totalDue.columns.amount")}</th>
              <th scope="col">{t("inicio.totalDue.columns.percent")}</th>
            </tr>
          </thead>
          <tbody>
            {totalDueItems.map(({ color, item }) => {
              const percent = item.amount / totalDue;
              const rowIsDimmed =
                hoveredDueCategory !== null &&
                hoveredDueCategory !== item.titleKey;
              const rowFadeClass = rowIsDimmed
                ? "opacity-30 blur-[1px]"
                : "opacity-100 blur-0";

              return (
                <tr
                  className="border-b border-border last:border-b-0"
                  key={item.titleKey}
                >
                  <td
                    className={`w-[44%] py-2.5 pr-3 text-left align-middle transition-[filter,opacity] duration-700 ease-in-out ${rowFadeClass}`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="min-w-0 truncate font-medium leading-5">
                        {t(item.titleKey)}
                      </span>
                    </span>
                  </td>
                  <td
                    className={`w-[32%] px-2 py-2.5 text-center align-middle text-sm font-semibold leading-5 tabular-nums text-on-surface transition-[filter,opacity] duration-700 ease-in-out ${rowFadeClass}`}
                  >
                    ${amountFormatter.format(item.amount)}
                  </td>
                  <td
                    className={`w-[24%] py-2.5 pl-3 pr-1 text-right align-middle text-sm font-medium leading-5 tabular-nums text-on-surface-variant transition-[filter,opacity] duration-700 ease-in-out md:pr-2 ${rowFadeClass}`}
                  >
                    {percentFormatter.format(percent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function HomeTotalPaid() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const detailsIconRef = useRef<ArrowUpRightIconHandle>(null);

  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Percent
              aria-hidden="true"
              className="size-5 shrink-0 text-on-surface"
              strokeWidth={2.3}
            />
            <h2 className="min-w-0 font-heading text-base font-bold leading-6 text-on-surface sm:text-lg">
              {t("inicio.totalPaid.title")}
            </h2>
          </div>

          <Link
            href="/estadisticas"
            onMouseEnter={() => detailsIconRef.current?.startAnimation()}
            onMouseLeave={() => detailsIconRef.current?.stopAnimation()}
            onFocus={() => detailsIconRef.current?.startAnimation()}
            onBlur={() => detailsIconRef.current?.stopAnimation()}
            className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-[11px] font-semibold leading-none text-primary-foreground shadow-[0_3px_5px_-1px_rgb(0_0_0/0.08),0_1px_3px_-2px_rgb(0_0_0/0.08)] transition-[background-color,box-shadow] hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-7 sm:px-3"
          >
            <span>{t("inicio.detailsCta")}</span>
            <ArrowUpRightIcon
              ref={detailsIconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="shrink-0"
              size={13}
            />
          </Link>
        </div>

        <div aria-hidden="true" className="mt-2 h-px w-full bg-border" />

        <p className="mt-1.5 text-left text-xs font-bold leading-5 text-on-surface sm:text-sm">
          {monthFormatter.format(today.toDate())}
        </p>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col justify-between gap-2.5">
        {paidSummaryItems.map((item) => {
          const pendingAmount = item.amount * ((100 - item.paidPercent) / 100);

          return (
            <li className="min-w-0" key={item.titleKey}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-medium leading-5 text-on-surface">
                  {t(item.titleKey)}
                </p>
                <p className="shrink-0 text-right text-xs font-bold leading-5 text-on-surface sm:text-sm">
                  ${amountFormatter.format(item.amount)}
                </p>
              </div>

              <div
                aria-label={t("inicio.totalPaid.progressLabel", {
                  category: t(item.titleKey),
                  percent: item.paidPercent,
                })}
                aria-valuemax={100}
                aria-valuemin={0}
                aria-valuenow={item.paidPercent}
                className="relative h-3 overflow-hidden rounded-full bg-surface-container-high"
                role="progressbar"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 flex items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground"
                  style={{ width: `${item.paidPercent}%` }}
                >
                  <span className="text-[0.58rem] font-bold leading-none">
                    {item.paidPercent}%
                  </span>
                </span>
                <span
                  className="absolute inset-y-0 right-0 flex items-center justify-center overflow-hidden text-on-surface"
                  style={{ left: `${item.paidPercent}%` }}
                >
                  <span className="text-[0.58rem] font-bold leading-none">
                    ${amountFormatter.format(pendingAmount)}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

const upcomingPaymentItems = [
  {
    amount: 8450,
    dueInDays: 2,
    titleKey: "inicio.upcomingPayments.items.creditCard",
  },
  {
    amount: 3200.5,
    dueInDays: 4,
    titleKey: "inicio.upcomingPayments.items.personalLoan",
  },
  {
    amount: 12750,
    dueInDays: 5,
    titleKey: "inicio.upcomingPayments.items.autoLoan",
  },
  {
    amount: 18900.75,
    dueInDays: 7,
    titleKey: "inicio.upcomingPayments.items.mortgage",
  },
  {
    amount: 975.25,
    dueInDays: 8,
    titleKey: "inicio.upcomingPayments.items.storeCredit",
  },
] as const;

function HomeUpcomingPayments() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const detailsIconRef = useRef<ArrowUpRightIconHandle>(null);
  const [checkedPayments, setCheckedPayments] = useState<
    Record<string, boolean>
  >({});

  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  });
  const visibleUpcomingPaymentItems = upcomingPaymentItems.slice(0, 4);

  const togglePaymentChecked = (paymentKey: string) => {
    setCheckedPayments((current) => ({
      ...current,
      [paymentKey]: !current[paymentKey],
    }));
  };

  return (
    <>
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <ListTodo
              aria-hidden="true"
              className="size-5 shrink-0 text-on-surface"
              strokeWidth={2.3}
            />
            <h2 className="min-w-0 font-heading text-base font-bold leading-6 text-on-surface sm:text-lg">
              {t("inicio.upcomingPayments.title")}
            </h2>
          </div>

          <Link
            href="/pagos"
            onMouseEnter={() => detailsIconRef.current?.startAnimation()}
            onMouseLeave={() => detailsIconRef.current?.stopAnimation()}
            onFocus={() => detailsIconRef.current?.startAnimation()}
            onBlur={() => detailsIconRef.current?.stopAnimation()}
            className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-[11px] font-semibold leading-none text-primary-foreground shadow-[0_3px_5px_-1px_rgb(0_0_0/0.08),0_1px_3px_-2px_rgb(0_0_0/0.08)] transition-[background-color,box-shadow] hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-7 sm:px-3"
          >
            <span>{t("inicio.detailsCta")}</span>
            <ArrowUpRightIcon
              ref={detailsIconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="shrink-0"
              size={13}
            />
          </Link>
        </div>

        <div aria-hidden="true" className="mt-2 h-px w-full bg-border" />

        <p className="mt-1.5 text-left text-xs font-bold leading-5 text-on-surface sm:text-sm">
          {formatCurrentWeek(today, language, t)}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <table className="h-full w-full table-auto border-collapse">
          <caption className="sr-only">
            {t("inicio.upcomingPayments.title")}
          </caption>
          <tbody>
            {visibleUpcomingPaymentItems.map((payment) => {
              const dueDate = today.add(payment.dueInDays, "day").toDate();
              const paymentName = t(payment.titleKey);
              const isChecked = Boolean(checkedPayments[payment.titleKey]);

              return (
                <tr
                  className={`border-b border-border transition-[filter,opacity] duration-200 last:border-b-0 ${
                    isChecked ? "opacity-45 grayscale" : "opacity-100"
                  }`}
                  key={payment.titleKey}
                >
                  <td className="w-[1%] whitespace-nowrap py-2 pr-3 align-middle">
                    <span className="inline-flex w-max min-w-max items-center gap-2.5 rounded-full bg-surface-container-high py-1 pl-2 pr-4 text-on-surface">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                      >
                        <Landmark className="size-4" strokeWidth={2.4} />
                      </span>
                      <span className="shrink-0 whitespace-nowrap">
                        <span className="block text-xs font-semibold leading-4 text-on-surface">
                          {paymentName}
                        </span>
                        <span className="block text-xs font-bold leading-4 text-on-surface tabular-nums">
                          ${amountFormatter.format(payment.amount)}
                        </span>
                      </span>
                    </span>
                  </td>

                  <td className="w-36 px-3 py-2 align-middle">
                    <span className="mx-auto block w-fit text-center text-xs font-semibold leading-4 text-on-surface sm:text-sm">
                      {dateFormatter.format(dueDate)}
                    </span>
                  </td>

                  <td className="w-32 px-3 py-2 align-middle">
                    <span className="mx-auto inline-flex h-5 min-w-16 items-center justify-center rounded-md border border-border bg-surface-container-high px-2 text-[11px] font-semibold leading-none text-on-surface">
                      {t("inicio.upcomingPayments.status.pending")}
                    </span>
                  </td>

                  <td className="w-8 py-2 pl-2 text-right align-middle">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      aria-label={t("inicio.upcomingPayments.toggleLabel", {
                        payment: paymentName,
                      })}
                      onClick={() => togglePaymentChecked(payment.titleKey)}
                      className={`inline-grid size-6 cursor-pointer place-items-center rounded-full border transition-[background-color,border-color,color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        isChecked
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_3px_6px_-2px_rgb(0_0_0/0.18)]"
                          : "border-outline bg-surface-container text-on-surface/50 hover:border-primary hover:bg-surface-container-highest hover:text-primary"
                      }`}
                    >
                      <CircleCheck
                        aria-hidden="true"
                        className={`size-4 transition-[opacity,transform] duration-150 ${
                          isChecked
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0"
                        }`}
                        strokeWidth={2.5}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function formatCurrentDay(date: Dayjs, language: "en" | "es", t: TFunction) {
  const weekday = new Intl.DateTimeFormat(
    language === "es" ? "es-MX" : "en-US",
    {
      weekday: "long",
    },
  ).format(date.toDate());

  return t("inicio.summaryCards.today.value", {
    day: date.format("D"),
    weekday: capitalizeLocalized(weekday),
  });
}

function formatShortCurrentWeek(date: Dayjs, t: TFunction) {
  const { end, start } = getMondayWeekRange(date);

  return t("inicio.summaryCards.week.value", {
    endDay: end.format("D"),
    startDay: start.format("D"),
  });
}

function formatCurrentMonth(date: Dayjs, language: "en" | "es") {
  return new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(date.toDate());
}

function formatCurrentMonthName(date: Dayjs, language: "en" | "es") {
  const month = new Intl.DateTimeFormat(language === "es" ? "es-MX" : "en-US", {
    month: "long",
  }).format(date.toDate());

  return capitalizeLocalized(month);
}

function getMondayWeekRange(date: Dayjs) {
  const daysFromMonday = (date.day() + 6) % 7;
  const start = date.subtract(daysFromMonday, "day");

  return {
    end: start.add(6, "day"),
    start,
  };
}

function capitalizeLocalized(value: string) {
  return value.length > 0
    ? value.charAt(0).toLocaleUpperCase() + value.slice(1)
    : value;
}

function describeSemiCircleArc(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = getSemiCirclePoint(centerX, centerY, radius, startAngle);
  const end = getSemiCirclePoint(centerX, centerY, radius, endAngle);
  const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function getSemiCirclePoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
) {
  const angleInRadians = (angle * Math.PI) / 180;

  return {
    x: roundSvgValue(centerX + radius * Math.cos(angleInRadians)),
    y: roundSvgValue(centerY - radius * Math.sin(angleInRadians)),
  };
}

function roundSvgValue(value: number) {
  return Number(value.toFixed(3));
}

function formatCurrentWeek(date: Dayjs, language: "en" | "es", t: TFunction) {
  const start = date.startOf("week");
  const end = date.endOf("week");
  const sameMonth = start.isSame(end, "month");
  const sameYear = start.isSame(end, "year");

  if (sameMonth) {
    return t("inicio.upcomingPayments.weekRange.sameMonth", {
      endDay: end.format("D"),
      month: start.locale(language).format("MMMM"),
      startDay: start.format("D"),
      year: end.format("YYYY"),
    });
  }

  if (sameYear) {
    return t("inicio.upcomingPayments.weekRange.sameYear", {
      endDay: end.format("D"),
      endMonth: end.locale(language).format("MMMM"),
      startDay: start.format("D"),
      startMonth: start.locale(language).format("MMMM"),
      year: end.format("YYYY"),
    });
  }

  return t("inicio.upcomingPayments.weekRange.crossYear", {
    endDay: end.format("D"),
    endMonth: end.locale(language).format("MMMM"),
    endYear: end.format("YYYY"),
    startDay: start.format("D"),
    startMonth: start.locale(language).format("MMMM"),
    startYear: start.format("YYYY"),
  });
}

function HomeCalendarCard() {
  const { t } = useTranslation();
  const detailsIconRef = useRef<ArrowUpRightIconHandle>(null);

  return (
    <>
      <div className="mb-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <CalendarDays
              aria-hidden="true"
              className="size-5 shrink-0 text-on-surface"
              strokeWidth={2.3}
            />
            <h2 className="min-w-0 font-heading text-base font-bold leading-6 text-on-surface sm:text-lg">
              {t("dashboard.navigation.calendario")}
            </h2>
          </div>

          <Link
            href="/calendario"
            onMouseEnter={() => detailsIconRef.current?.startAnimation()}
            onMouseLeave={() => detailsIconRef.current?.stopAnimation()}
            onFocus={() => detailsIconRef.current?.startAnimation()}
            onBlur={() => detailsIconRef.current?.stopAnimation()}
            className="inline-flex h-6 shrink-0 items-center justify-center gap-1 rounded-md bg-primary px-2.5 text-[11px] font-semibold leading-none text-primary-foreground shadow-[0_3px_5px_-1px_rgb(0_0_0/0.08),0_1px_3px_-2px_rgb(0_0_0/0.08)] transition-[background-color,box-shadow] hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:h-7 sm:px-3"
          >
            <span>{t("inicio.detailsCta")}</span>
            <ArrowUpRightIcon
              ref={detailsIconRef}
              aria-hidden="true"
              animateOnHover={false}
              className="shrink-0"
              size={13}
            />
          </Link>
        </div>

        <div aria-hidden="true" className="mt-2 h-px w-full bg-border" />
      </div>

      <HomePaymentCalendar />
    </>
  );
}

function HomePaymentCalendar() {
  const { i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(() => dayjs());
  const adapterLocale = i18n.language?.startsWith("es") ? "es" : "en";

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale={adapterLocale}
    >
      <DateCalendar
        fixedWeekNumber={6}
        onChange={(newValue) => setSelectedDate(newValue)}
        showDaysOutsideCurrentMonth
        value={selectedDate}
        slots={{
          day: HomeCalendarDay,
        }}
        sx={{
          "--PickerDay-size": "31px",
          "--PickerDay-horizontalMargin": "0px",
          color: "var(--on-surface)",
          display: "flex",
          flex: 1,
          flexDirection: "column",
          fontFamily: "var(--font-inter), Arial, Helvetica, sans-serif",
          height: "100%",
          maxHeight: "none",
          maxWidth: "100%",
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
          "&, & *": {
            scrollbarWidth: "none",
          },
          "& *::-webkit-scrollbar": {
            display: "none",
          },
          "& .MuiPickersFadeTransitionGroup-root, & .MuiPickersCalendarHeader-switchViewButton":
            {
              color: "var(--on-surface)",
            },
          "& .MuiPickersCalendarHeader-root": {
            margin: "2px 0 6px",
            minHeight: "28px",
            paddingLeft: 0,
            paddingRight: 0,
          },
          "& .MuiPickersCalendarHeader-label": {
            color: "var(--on-surface)",
            fontSize: "0.92rem",
            fontWeight: 700,
            lineHeight: 1.25,
          },
          "& .MuiPickersArrowSwitcher-root": {
            columnGap: "2px",
          },
          "& .MuiPickersArrowSwitcher-button": {
            color: "var(--on-surface-variant)",
            padding: "3px",
            transition: "background-color 180ms ease, color 180ms ease",
            "&:hover": {
              backgroundColor: "var(--surface-container-highest)",
              color: "var(--on-surface)",
            },
          },
          "& .MuiDayCalendar-header": {
            justifyContent: "space-between",
          },
          "& .MuiDayCalendar-root": {
            display: "flex",
            flex: 1,
            flexDirection: "column",
            minHeight: 0,
          },
          "& .MuiDayCalendar-slideTransition, & .MuiPickersSlideTransition-root":
            {
              flex: 1,
              minHeight: "214px",
              overflow: "hidden",
            },
          "& .MuiDayCalendar-monthContainer": {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: "space-between",
            minHeight: "214px",
            overflow: "hidden",
          },
          "& .MuiDayCalendar-weekContainer": {
            flexShrink: 0,
            justifyContent: "space-between",
            margin: "0",
          },
          "& .MuiDayCalendar-weekContainer:last-of-type": {
            marginBottom: 0,
          },
          "& .MuiDayCalendar-focusableDay": {
            overflow: "hidden",
          },
          "& .MuiDayCalendar-weekDayLabel": {
            color: "var(--on-surface-variant)",
            fontSize: "0.72rem",
            fontWeight: 700,
            height: "25px",
            width: "31px",
          },
          "& .MuiYearCalendar-root, & .MuiMonthCalendar-root": {
            color: "var(--on-surface)",
            flex: 1,
            minHeight: 0,
            width: "100%",
          },
          "& .MuiYearCalendar-root button.Mui-selected, & .MuiMonthCalendar-root button.Mui-selected":
            {
              backgroundColor: "var(--primary) !important",
              color: "var(--primary-foreground) !important",
              "&:focus, &:hover": {
                backgroundColor: "var(--primary) !important",
              },
            },
          "& .MuiPickersYear-yearButton, & .MuiYearCalendar-button, & .MuiPickersMonth-monthButton, & .MuiMonthCalendar-button":
            {
              color: "var(--on-surface)",
              fontFamily: "var(--font-inter), Arial, Helvetica, sans-serif",
              fontWeight: 500,
              "&:hover": {
                backgroundColor: "var(--surface-container-highest)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--primary) !important",
                color: "var(--primary-foreground) !important",
                "&:focus, &:hover": {
                  backgroundColor: "var(--primary) !important",
                },
              },
            },
        }}
      />
    </LocalizationProvider>
  );
}

function HomeCalendarDay(props: PickerDayProps) {
  return (
    <PickerDay
      {...props}
      sx={{
        color: props.outsideCurrentMonth
          ? "var(--outline) !important"
          : "var(--on-surface) !important",
        fontSize: "0.76rem",
        fontWeight: 700,
        height: "31px",
        opacity: props.outsideCurrentMonth ? 0.5 : 1,
        transition: "background-color 180ms ease, color 180ms ease",
        width: "31px",
        "&:hover": {
          backgroundColor: "var(--surface-container-highest)",
        },
        "&.Mui-selected": {
          backgroundColor: "var(--primary) !important",
          color: "var(--primary-foreground) !important",
          opacity: 1,
          "&:focus, &:hover": {
            backgroundColor: "var(--primary) !important",
          },
        },
        "&.MuiPickersDay-today": {
          borderColor: "var(--outline)",
        },
      }}
    />
  );
}
