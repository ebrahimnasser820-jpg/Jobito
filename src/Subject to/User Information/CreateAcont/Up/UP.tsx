import { SignUpPage } from "../Customer Account/SignUpPage";
import { CompanyRegister } from "../CustomerAccount/CompanyRegister";
import { motion, AnimatePresence } from "framer-motion";

interface UIProps {
  setShowLogin: (value: boolean) => void;
  isCustomer: boolean;
  setIsCustomer: (value: boolean) => void;
}

export default function UI({ isCustomer }: UIProps) {

  return (
    <AnimatePresence mode="wait">
      {isCustomer ? (
        <motion.div
          key="signup"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <SignUpPage />
        </motion.div>
      ) : (
        <motion.div
          key="company"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.5 }}
          className="w-full h-full"
        >
          <CompanyRegister />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
