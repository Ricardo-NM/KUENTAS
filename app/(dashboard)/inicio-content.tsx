"use client";

import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/es";
import type { TFunction } from "i18next";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { Landmark } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const homeCards = [
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest" },
  {
    className: "bg-surface-container-lowest lg:col-span-2 lg:row-span-2",
    variant: "totalDue",
  },
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest" },
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
  const { t } = useTranslation();

  return (
    <section
      aria-label="Inicio"
      className="grid min-h-0 flex-1 grid-cols-1 auto-rows-[minmax(96px,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-4 lg:auto-rows-fr"
    >
      {homeCards.map((card, index) => {
        const cardClassName = `rounded-2xl shadow-[0_1px_3px_rgb(13_13_18/0.06),0_1px_2px_rgb(13_13_18/0.04)] ${card.className}`;

        if (card.variant === "calendar") {
          return (
            <article
              className={`${cardClassName} flex min-h-0 flex-col gap-2.5 overflow-hidden p-3`}
              key={`inicio-card-${index}`}
            >
              <button
                type="button"
                className="min-h-10 w-full rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_4px_6px_-1px_rgb(0_0_0/0.08),0_2px_4px_-2px_rgb(0_0_0/0.08)] transition-colors hover:bg-inverse-surface hover:text-inverse-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {t("inicio.pendingPayment")}
              </button>
              <HomePaymentCalendar />
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

const totalDueChartColors = [
  "var(--total-due-chart-1)",
  "var(--total-due-chart-2)",
  "var(--total-due-chart-3)",
  "var(--total-due-chart-4)",
  "var(--total-due-chart-5)",
] as const;

function HomeTotalDue() {
  const { i18n, t } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const locale = language === "es" ? "es-MX" : "en-US";
  const today = dayjs().locale(language);
  const totalDue = paidSummaryItems.reduce((total, item) => total + item.amount, 0);

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
      percent: number;
      strokeDashoffset: number;
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
        percent,
        strokeDashoffset: -previousPercent,
      },
    ];
  }, []);

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4">
        <h2 className="font-heading text-lg font-bold leading-6 text-on-surface sm:text-xl">
          {t("inicio.totalDue.title")}
        </h2>
        <p className="pt-1 text-right text-xs font-bold leading-5 text-on-surface sm:text-sm">
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
              role="img"
              viewBox="0 0 100 100"
            >
              <circle
                aria-hidden="true"
                className="stroke-surface-container-high"
                cx="50"
                cy="50"
                fill="none"
                pathLength={100}
                r="38"
                strokeWidth="20"
              />
              {totalDueItems.map(({ color, item, percent, strokeDashoffset }) => {
                return (
                  <circle
                    aria-hidden="true"
                    cx="50"
                    cy="50"
                    fill="none"
                    key={item.titleKey}
                    pathLength={100}
                    r="38"
                    stroke={color}
                    strokeDasharray={`${percent} ${100 - percent}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeWidth="20"
                    transform="rotate(-90 50 50)"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-heading text-lg font-bold leading-6 text-on-surface sm:text-xl">
                ${compactAmountFormatter.format(totalDue)}
              </p>
            </div>
          </div>
        </div>

        <table className="w-full table-fixed border-collapse pr-1 text-sm text-on-surface md:pr-3">
          <caption className="sr-only">{t("inicio.totalDue.tableCaption")}</caption>
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

              return (
                <tr className="border-b border-border last:border-b-0" key={item.titleKey}>
                  <td className="w-[44%] py-2.5 pr-3 text-left align-middle">
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
                  <td className="w-[32%] px-2 py-2.5 text-center align-middle text-sm font-semibold leading-5 tabular-nums text-on-surface">
                    ${amountFormatter.format(item.amount)}
                  </td>
                  <td className="w-[24%] py-2.5 pl-3 pr-1 text-right align-middle text-sm font-medium leading-5 tabular-nums text-on-surface-variant md:pr-2">
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
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="font-heading text-base font-bold leading-6 text-on-surface sm:text-lg">
          {t("inicio.totalPaid.title")}
        </h2>
        <p className="pt-1 text-right text-xs font-bold leading-5 text-on-surface sm:text-sm">
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

  const amountFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
  });

  return (
    <>
      <div className="mb-3 flex items-start justify-between gap-4">
        <h2 className="font-heading text-base font-bold leading-6 text-on-surface sm:text-lg">
          {t("inicio.upcomingPayments.title")}
        </h2>
        <p className="max-w-[48%] pt-0.5 text-right text-xs font-bold leading-5 text-on-surface sm:text-sm">
          {formatCurrentWeek(today, language, t)}
        </p>
      </div>

      <ul className="flex min-h-0 flex-1 flex-col justify-between gap-2">
        {upcomingPaymentItems.map((payment) => {
          const dueDate = today.add(payment.dueInDays, "day").toDate();

          return (
            <li
              className="grid min-h-[48px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
              key={payment.titleKey}
            >
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                <Landmark className="size-5" strokeWidth={2.4} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-5 text-on-surface">
                  {t(payment.titleKey)}
                </p>
                <p className="truncate text-sm font-bold leading-5 text-on-surface">
                  ${amountFormatter.format(payment.amount)}
                </p>
              </div>

              <div className="min-w-[92px] text-right">
                <p className="text-xs font-medium leading-5 text-on-surface sm:text-sm">
                  {t("inicio.upcomingPayments.dueDate", {
                    date: dateFormatter.format(dueDate),
                  })}
                </p>
                <span className="inline-flex min-w-20 justify-center rounded-md border border-warning/15 bg-warning-container px-3 py-0.5 text-xs font-semibold leading-5 text-on-warning-container dark:border-transparent dark:bg-tertiary-container dark:text-on-tertiary-container">
                  {t("inicio.upcomingPayments.status.pending")}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
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
