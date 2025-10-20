import { useEffect, useState } from "react";

export const AUTH_TOKEN_STORAGE_KEY = "remnawave-admin-access-token";
const AUTH_EVENT = "remnawave-admin-auth-change";

const readTokenPresence = () => Boolean(localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));

export const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(readTokenPresence);

  useEffect(() => {
    const handleChange = () => setIsAuthenticated(readTokenPresence());

    window.addEventListener("storage", handleChange);
    window.addEventListener(AUTH_EVENT, handleChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      window.removeEventListener(AUTH_EVENT, handleChange);
    };
  }, []);

  return { isAuthenticated };
};
