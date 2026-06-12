import { useTranslations } from 'next-intl';
import styles from './preview.module.css';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AnimateOnScroll from '../AnimateOnScroll/AnimateOnScroll';

const PreviewSection = () => {
    const t = useTranslations('home');
    return (
        <div className={styles.container}>
            <AnimateOnScroll className={styles.start} variant="fadeLeft" delay={0.5}>
                <h1>{t('preview_heading')}</h1>
                <p>{t('preview_sub')} </p>
            </AnimateOnScroll>
            <AnimateOnScroll className={styles.end} variant="fadeRight" delay={0.8}>
                <Image src={'/iten.svg'} alt={''} width={1000} height={1000} />
            </AnimateOnScroll>
        </div>
    );
};

export default PreviewSection;
