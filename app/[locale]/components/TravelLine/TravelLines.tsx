"use client";

import { motion } from "framer-motion";
import styles from "./TravelLines.module.css";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

const PATH_1 =
    "M-100 300 C150 100, 300 500, 500 200 S800 400, 1000 150 S1300 350, 1600 200";
const PATH_2 =
    "M-100 500 C200 300, 350 700, 600 400 S900 600, 1100 300 S1400 500, 1600 350";
const PATH_3 =
    "M-100 400 C1750 200, 325 600, 550 300 S700 500, 1050 225 S1200 425, 1600 275";

const DASH = 2400;
const GAP = 2400;

export default function TravelLines() {
    const { theme } = useContext(ThemeContext);
    return (
        <svg
            aria-hidden="true"
            className={styles.svg}
            viewBox="0 0 1600 700"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.path
                d={PATH_3}
                fill="none"
                stroke="#eb652b"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ strokeDashoffset: DASH }}
                animate={{ strokeDashoffset: -DASH }}
                transition={{
                    duration: 23,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                }}
            />

            <motion.path
                d={PATH_1}
                fill="none"
                stroke={theme === "light" ? "#000" : "#fff"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={`${DASH} ${GAP}`}
                initial={{ strokeDashoffset: DASH }}
                animate={{ strokeDashoffset: -DASH }}
                transition={{
                    duration: 23,
                    repeat: Infinity,
                    ease: "easeInOut",
                    repeatType: "loop",
                }}
            />

            {/* <motion.path
        d={PATH_2}
        fill="none"
        stroke="#eb652b"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray={`${DASH} ${GAP}`}
        initial={{ strokeDashoffset: DASH }}
        animate={{ strokeDashoffset: -DASH }}
        transition={{
          duration: 25,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatType: "loop",
        }}
      /> */}
        </svg>
    );
}
