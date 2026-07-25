import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { User, FacultyUser, StudentUser, Role } from '../types';
import { DEFAULT_ADMIN } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  registerFaculty: (data: {
    employeeId: string;
    fullName: string;
    department: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => { success: boolean; error?: string };
  registerStudent: (data: {
    registerNumber: string;
    fullName: string;
    department: string;
    year: string;
    section: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  resetUserPassword: (userId: string, newPass: string) => { success: boolean; error?: string };
  switchUserRoleQuick: (user: User) => void;
  validatePassword: (password: string) => { isValid: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'studysync_users_v1';
const CURRENT_USER_STORAGE_KEY = 'studysync_current_user_v1';
const PASSWORDS_STORAGE_KEY = 'studysync_passwords_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed: User[] = JSON.parse(saved);
        const hasAdmin = parsed.some(u => u.role === 'Administrator' && u.email === DEFAULT_ADMIN.email);
        if (!hasAdmin) return [DEFAULT_ADMIN, ...parsed];
        return parsed;
      } catch {
        return [DEFAULT_ADMIN];
      }
    }
    return [DEFAULT_ADMIN];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const getPasswordStore = (): Record<string, string> => {
    const saved = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { [DEFAULT_ADMIN.email]: 'Admin@123' };
      }
    }
    return { [DEFAULT_ADMIN.email]: 'Admin@123' };
  };

  const savePasswordStore = (store: Record<string, string>) => {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(store));
  };

  // Real-time Firestore Sync for Users
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const remoteUsers: User[] = [];
      const passStore = getPasswordStore();

      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        const { password, ...userObj } = data;
        remoteUsers.push(userObj as User);
        if (password && userObj.email) {
          passStore[userObj.email.toLowerCase()] = password;
        }
      });

      // Ensure Admin always exists
      const hasAdmin = remoteUsers.some(u => u.role === 'Administrator' && u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase());
      if (!hasAdmin) {
        remoteUsers.unshift(DEFAULT_ADMIN);
        // Seed default admin to Firestore if absent
        setDoc(doc(db, 'users', DEFAULT_ADMIN.id), {
          ...DEFAULT_ADMIN,
          password: 'Admin@123'
        }).catch(() => {});
      }

      savePasswordStore(passStore);
      setUsers(remoteUsers);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(remoteUsers));
    }, (error) => {
      console.warn('Firestore users snapshot warning (falling back to offline local data):', error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const validateEmail = (email: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    return cleanEmail.endsWith('@studysync.com');
  };

  const validatePassword = (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number (0-9).' };
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one special character (e.g. @, #, $).' };
    }
    return { isValid: true };
  };

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    
    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Access denied: Only emails ending with @studysync.com are allowed.' };
    }

    const foundUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      return { success: false, error: 'No user account found with this email address.' };
    }

    const passwords = getPasswordStore();
    const storedPass = (foundUser as any).password || passwords[cleanEmail] || (foundUser.email === DEFAULT_ADMIN.email ? 'Admin@123' : null);

    if (storedPass && storedPass !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerFaculty = (data: {
    employeeId: string;
    fullName: string;
    department: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanEmpId = data.employeeId.trim().toUpperCase();

    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Email must strictly end with @studysync.com' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Password and Confirm Password do not match.' };
    }

    const passValidation = validatePassword(data.password);
    if (!passValidation.isValid) {
      return { success: false, error: passValidation.message };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const isEmpIdTaken = users.some(u => u.role === 'Faculty' && (u as FacultyUser).employeeId.toUpperCase() === cleanEmpId);
    if (isEmpIdTaken) {
      return { success: false, error: `Employee ID "${cleanEmpId}" is already registered.` };
    }

    const newFaculty: FacultyUser = {
      id: `fac_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: 'Faculty',
      employeeId: cleanEmpId,
      department: data.department,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const passwords = getPasswordStore();
    passwords[cleanEmail] = data.password;
    savePasswordStore(passwords);

    setUsers(prev => [...prev, newFaculty]);
    setCurrentUser(newFaculty);

    // Sync to Firestore for multi-device cross-user access
    setDoc(doc(db, 'users', newFaculty.id), {
      ...newFaculty,
      password: data.password
    }).catch(err => {
      console.error('Firestore save user error:', err);
    });

    return { success: true };
  };

  const registerStudent = (data: {
    registerNumber: string;
    fullName: string;
    department: string;
    year: string;
    section: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): { success: boolean; error?: string } => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanRegNo = data.registerNumber.trim().toUpperCase();

    if (!validateEmail(cleanEmail)) {
      return { success: false, error: 'Email must strictly end with @studysync.com' };
    }

    if (!data.department || !data.year || !data.section) {
      return { success: false, error: 'Department, Year, and Section are mandatory for students.' };
    }

    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Password and Confirm Password do not match.' };
    }

    const passValidation = validatePassword(data.password);
    if (!passValidation.isValid) {
      return { success: false, error: passValidation.message };
    }

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const isRegTaken = users.some(u => u.role === 'Student' && (u as StudentUser).registerNumber.toUpperCase() === cleanRegNo);
    if (isRegTaken) {
      return { success: false, error: `Register Number "${cleanRegNo}" is already registered.` };
    }

    const newStudent: StudentUser = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      role: 'Student',
      registerNumber: cleanRegNo,
      department: data.department,
      year: data.year,
      section: data.section,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const passwords = getPasswordStore();
    passwords[cleanEmail] = data.password;
    savePasswordStore(passwords);

    setUsers(prev => [...prev, newStudent]);
    setCurrentUser(newStudent);

    // Sync to Firestore for multi-device cross-user access
    setDoc(doc(db, 'users', newStudent.id), {
      ...newStudent,
      password: data.password
    }).catch(err => {
      console.error('Firestore save user error:', err);
    });

    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    if (target.role === 'Administrator') {
      return { success: false, error: 'Default Administrator account cannot be deleted.' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));

    deleteDoc(doc(db, 'users', userId)).catch(err => {
      console.error('Firestore delete user error:', err);
    });

    if (currentUser?.id === userId) {
      setCurrentUser(DEFAULT_ADMIN);
    }
    return { success: true };
  };

  const resetUserPassword = (userId: string, newPass: string): { success: boolean; error?: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    const val = validatePassword(newPass);
    if (!val.isValid) return { success: false, error: val.message };

    const passwords = getPasswordStore();
    passwords[target.email.toLowerCase()] = newPass;
    savePasswordStore(passwords);

    setDoc(doc(db, 'users', userId), { password: newPass }, { merge: true }).catch(err => {
      console.error('Firestore reset password error:', err);
    });

    return { success: true };
  };

  const switchUserRoleQuick = (user: User) => {
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        registerFaculty,
        registerStudent,
        deleteUser,
        resetUserPassword,
        switchUserRoleQuick,
        validatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
