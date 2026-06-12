import { useEffect } from 'react';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { DayPicker, DateRange, getDefaultClassNames, Chevron } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isBefore, startOfDay } from 'date-fns';
import styles from './date.module.css';
import NumberInput from '../../NumberInput/NumberInput';
import { fr, enUS, ar } from 'date-fns/locale';

interface DatesAndTravelersValue {
    dates: DateRange | undefined;
    adults: number;
    children: number;
}

interface DatesAndTravelersProps {
    value: DatesAndTravelersValue;
    onChange: (value: DatesAndTravelersValue) => void;
}

const DatesAndTravelers = ({ value, onChange }: DatesAndTravelersProps) => {
    const t = useTranslations("quiz.dates");
    const defaultClassNames = getDefaultClassNames();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const today = startOfDay(new Date());
    const locale = useLocale();
    const [calendarLocale, setCalendarLocale] = useState(enUS);

    useEffect(() => {
        if (locale === 'fr') {
            setCalendarLocale(fr);
        } else if (locale === 'ar') {
            setCalendarLocale(ar);
        } else {
            setCalendarLocale(enUS);
        }
    }, [locale]);

    const handleDatesChange = (range: DateRange | undefined) => {
        onChange({ ...value, dates: range });
    };

    const handleAdultsChange = (adults: number) => {
        onChange({ ...value, adults });
    };

    const handleChildrenChange = (children: number) => {
        onChange({ ...value, children });
    };

    return (
        <div className={styles.container}>
            <div className={styles.dateContainer} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <h2 className={styles.title}>{t("title")}</h2>
                <DayPicker
                    mode={'range'}
                    selected={value.dates}
                    onSelect={handleDatesChange}
                    numberOfMonths={isMobile ? 1 : 2}
                    disabled={{ before: today }}
                    showOutsideDays
                    locale={calendarLocale}
                    components={{
                        Chevron: (props) => <Chevron {...props} className="fill-[#eb662b]" />,
                    }}
                    modifiersClassNames={{
                        today: 'text-[#eb662b]',
                        table: 'border-separate border-spacing-y-2',
                        selected: `border-none `,
                        range_start: 'bg-[#eb662b] text-white border-none rounded-s-lg',
                        range_end: 'bg-[#eb662b] text-white border-none rounded-e-lg',
                        range_middle: 'bg-[#eb652baf] text-white font-semibold',
                        disabled: 'text-gray-400',
                    }}
                />
            </div>
            <div className={styles.travelersContainer}>
                <h2 className={styles.title}>{t("travelers_title")}</h2>
                <div className={styles.travelersInput}>
                    <div className={styles.adults}>
                        <label className={styles.label}>{t("adults_label")}</label>
                        <NumberInput
                            value={value.adults}
                            onChange={handleAdultsChange}
                        />
                    </div>
                    <div className={styles.children}>
                        <label className={styles.label}>{t("children_label")}</label>
                        <NumberInput
                            value={value.children}
                            onChange={handleChildrenChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatesAndTravelers;
