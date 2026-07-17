"use client";

import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/es";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { PickerDay, type PickerDayProps } from "@mui/x-date-pickers/PickerDay";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const homeCards = [
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest lg:col-span-2 lg:row-span-2" },
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest" },
  { className: "bg-surface-container-lowest lg:row-span-2" },
  { className: "bg-surface-container-lowest lg:col-span-2 lg:row-span-2" },
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
      className="grid min-h-0 flex-1 grid-cols-1 auto-rows-[minmax(96px,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-4 lg:auto-rows-fr"
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
