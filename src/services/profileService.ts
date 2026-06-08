import { API_BASE_URL, getCommonHeaders } from "./api.js";

export const getProfile = async () => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: getCommonHeaders(),
    });

    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
};

export const updateProfile = async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: getCommonHeaders({
            "Content-Type": "application/json",
        }),
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update profile");
    }
    return res.json();
};
