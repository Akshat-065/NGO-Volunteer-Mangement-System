import { createContext, useEffect, useMemo, useReducer } from "react";
import * as authService from "../services/authService";
import {
  clearAccessToken,
  registerSessionExpiredHandler
} from "../services/api";

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  isLoading: true
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return { ...state, user: action.user, isLoading: false };
    case "LOGIN":
      return { ...state, user: action.user };
    case "LOGOUT":
      return { ...state, user: null, isLoading: false };
    case "UPDATE_USER":
      return { ...state, user: action.user };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let isMounted = true;

    const handleSessionExpired = () => {
      clearAccessToken();

      if (isMounted) {
        dispatch({ type: "LOGOUT" });
      }
    };

    registerSessionExpiredHandler(handleSessionExpired);

    const initializeAuth = async () => {
      try {
        await authService.initializeSecurity();
        const session = await authService.restoreSession();

        if (isMounted) {
          dispatch({
            type: "INIT",
            user: session.user
          });
        }
      } catch (_error) {
        if (isMounted) {
          dispatch({ type: "INIT", user: null });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      registerSessionExpiredHandler(null);
    };
  }, []);

  const persistSession = (sessionUser) => {
    dispatch({ type: "LOGIN", user: sessionUser });
  };

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    persistSession(response.user);
    return response;
  };

  const register = (payload) => authService.register(payload);

  const logout = async () => {
    dispatch({ type: "LOGOUT" });
    await authService.logout();
  };

  const updateUser = (nextUser) => {
    dispatch({ type: "UPDATE_USER", user: nextUser });
  };

  const value = useMemo(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.user),
      isLoading: state.isLoading,
      login,
      register,
      logout,
      updateUser
    }),
    [state.isLoading, state.user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
