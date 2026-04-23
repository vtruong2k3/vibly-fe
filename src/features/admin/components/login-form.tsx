"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "@/app/admin/styles/login.module.css";
import adminAxios from "@/lib/api/admin-axios";
import { useAdminAuthStore } from "@/store/admin-auth.store";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginForm() {
    const router = useRouter();
    const setAdmin = useAdminAuthStore((state) => state.setAdmin);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            setIsLoading(true);
            setErrorMsg("");
            const response = await adminAxios.post("/admin/auth/login", data);

            const payload = response.data.data || response.data;
            const { accessToken, requireTotp, tempToken, admin } = payload;

            if (requireTotp) {
                // TODO: Implement TOTP Verify Flow
                setErrorMsg("2FA is required but not yet implemented in UI.");
            } else if (accessToken && admin) {
                setAdmin(admin, accessToken);
                router.push("/admin");
            }
        } catch (error: any) {
            console.error("Login failed:", error);
            setErrorMsg(error?.response?.data?.message || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className={styles.form + " relative"} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.loginLabel}>Login</div>

            <div className="flex flex-col gap-1 w-full">
                <input
                    {...register("email")}
                    className={styles.formContent}
                    type="email"
                    placeholder="Email Address"
                    disabled={isLoading}
                />
                {errors.email && (
                    <span className="text-red-400 text-xs px-2">{errors.email.message}</span>
                )}
            </div>

            <div className="flex flex-col gap-1 w-full">
                <input
                    {...register("password")}
                    className={styles.formContent}
                    type="password"
                    placeholder="PassWord"
                    disabled={isLoading}
                />
                {errors.password && (
                    <span className="text-red-400 text-xs px-2">{errors.password.message}</span>
                )}
            </div>

            {errorMsg && (
                <div className="text-red-400 text-xs text-center font-medium bg-red-950/50 py-2 rounded">
                    {errorMsg}
                </div>
            )}

            <button
                type="submit"
                className={`${styles.formButton} ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isLoading}
            >
                {isLoading ? "Authenticating..." : "Continue"}
            </button>
        </form>
    );
}
