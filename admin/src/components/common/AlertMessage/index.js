import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertMessage = ({ message, type = "error" }) => {
    if (!message) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`alert alert-${type === "error" ? "danger" : type} mb-3`}
                role="alert"
            >
                {message}
            </motion.div>
        </AnimatePresence>
    );
};

export default AlertMessage;
