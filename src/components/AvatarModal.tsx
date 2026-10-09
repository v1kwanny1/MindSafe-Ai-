import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AvatarStudio } from "./AvatarStudio";
import { AvatarConfig } from "../types/avatar";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onSave?: (config: AvatarConfig) => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl z-10 max-h-[92vh] overflow-hidden"
          >
            <AvatarStudio
              currentUser={currentUser}
              onClose={onClose}
              isModal={true}
              onSave={(saved) => {
                if (onSave) onSave(saved);
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
