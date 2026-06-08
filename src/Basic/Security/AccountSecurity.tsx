import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./AccountSecurity.module.css";
import { useJobitoAuth } from "../../context/LinkContxt";
import { useToast } from "../../context/ToastContext";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function AccountSecurity() {
  const { user, apiFetch, logout } = useJobitoAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(user?.email || "");
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);

  // Deletion state
  const [deletionStatus, setDeletionStatus] = useState<{
    scheduled: boolean;
    daysLeft?: number;
    permanentDeleteAt?: string;
  }>({ scheduled: false });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchDeletionStatus = async () => {
      try {
        const res = await apiFetch(`${API_BASE_URL}/users/me/deletion-status`);
        if (res.ok) {
          const data = await res.json();
          setDeletionStatus(data);
        }
      } catch { /* ignore */ }
    };
    fetchDeletionStatus();
  }, [apiFetch]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingEmail(true);
      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("فشل في تحديث البريد الإلكتروني.");
      showToast("تم تحديث البريد الإلكتروني بنجاح!", "success");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      showToast("Passwords do not match!", "error");
      return;
    }
    try {
      setIsSavingPass(true);
      const res = await apiFetch(`${API_BASE_URL}/users/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (!res.ok)
        throw new Error("فشل في تحديث كلمة المرور. تأكد من كلمة المرور الحالية.");
      showToast("تم تحديث كلمة المرور بنجاح!", "success");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setIsSavingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("فشل في طلب حذف الحساب");
      const data = await res.json();
      showToast(data.message || "تم جدولة حذف الحساب خلال يومين", "success");
      setShowDeleteConfirm(false);
      logout(); // Force logout so they go through the proper flow next time
      window.location.href = "/"; // Force redirect to home
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setIsCancelling(true);
    try {
      const res = await apiFetch(`${API_BASE_URL}/users/me/cancel-deletion`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error("فشل في إلغاء طلب الحذف");
      showToast("تم إلغاء طلب حذف الحساب بنجاح!", "success");
      setDeletionStatus({ scheduled: false });
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Error", "error");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Account Security</h1>
          <p>
            Manage your email address and password to keep your account secure.
          </p>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionInfo}>
            <h2>Email Address</h2>
            <p>
              Update your email address to receive notifications and recover
              your account.
            </p>
          </div>
          <form className={styles.form} onSubmit={handleUpdateEmail}>
            <div className={styles.field}>
              <label>Current Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
              />
            </div>
            <div className={styles.formFooter}>
              <motion.button
                type="submit"
                className={styles.saveBtn}
                disabled={isSavingEmail}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSavingEmail ? "Updating..." : "Update Email"}
              </motion.button>
            </div>
          </form>
        </section>

        <div className={styles.divider} />

        <section className={styles.section}>
          <div className={styles.sectionInfo}>
            <h2>Change Password</h2>
            <p>
              We recommend using a strong password that you don't use elsewhere.
            </p>
          </div>
          <form className={styles.form} onSubmit={handleUpdatePassword}>
            <div className={styles.field}>
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                placeholder="••••••••"
                required
              />
            </div>
            <div className={styles.formFooter}>
              <motion.button
                type="submit"
                className={styles.saveBtn}
                disabled={isSavingPass}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSavingPass ? "Updating..." : "Update Password"}
              </motion.button>
            </div>
          </form>
        </section>

        <div className={styles.divider} />

        {/* ─── Danger Zone: Delete Account ─── */}
        <section className={styles.section}>
          <div className={styles.sectionInfo}>
            <h2 className={styles.dangerTitle}>Delete Account</h2>
            <p>
              {deletionStatus.scheduled
                ? `Your account is scheduled for permanent deletion in ${deletionStatus.daysLeft ?? "?"} days. You can cancel this anytime before then.`
                : "Once you request deletion, your account will be permanently deleted after 2 days. This action can be cancelled within that period."}
            </p>
          </div>
          <div className={styles.form}>
            {deletionStatus.scheduled ? (
              <div className={styles.deletionWarningBox}>
                <div className={styles.warningIcon}>⚠️</div>
                <p className={styles.warningText}>
                  Account deletion in progress — <strong>{deletionStatus.daysLeft} days remaining</strong>
                </p>
                <motion.button
                  className={styles.cancelDeleteBtn}
                  onClick={handleCancelDeletion}
                  disabled={isCancelling}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Deletion"}
                </motion.button>
              </div>
            ) : !showDeleteConfirm ? (
              <div className={styles.formFooter}>
                <motion.button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setShowDeleteConfirm(true)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete My Account
                </motion.button>
              </div>
            ) : (
              <div className={styles.confirmDeleteBox}>
                <p className={styles.confirmText}>
                  Are you sure? Your account will be permanently deleted after 2 days.
                </p>
                <div className={styles.confirmActions}>
                  <motion.button
                    className={styles.confirmDeleteBtn}
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isDeleting ? "Processing..." : "Yes, Delete Account"}
                  </motion.button>
                  <motion.button
                    className={styles.cancelBtn}
                    onClick={() => setShowDeleteConfirm(false)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
