import React from 'react';
import styles from './solutions.module.css';
import { useTranslations } from 'next-intl';

const SolutionSection = () => {
    const t = useTranslations('home');
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('solution_heading')}</h1>
            <div className={styles.solutions}>
                <div className={styles.solution}>
                    <span className={styles.number}>
                        <p>1</p>
                    </span>
                    <h2>{t('solution1')}</h2>
                    <p>{t('solution1_desc')}</p>
                </div>
                <div className={styles.solution}>
                    <span className={styles.number}>
                        <p>2</p>
                    </span>
                    <h2>{t('solution2')}</h2>
                    <p>{t('solution2_desc')}</p>
                </div>
                <div className={styles.solution}>
                    <span className={styles.number}>
                        <p>3</p>
                    </span>
                    <h2>{t('solution3')}</h2>
                    <p>{t('solution3_desc')}</p>
                </div>
            </div>
        </div>
    );
};

export default SolutionSection;
